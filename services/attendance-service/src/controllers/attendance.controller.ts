/**
 * Attendance Controllers with Blockchain Integration
 */
import { Request, Response } from 'express';
import { AttendanceModel } from '../models/Attendance';
import { CourseModel } from '../models/Course';
import { UserModel } from '../models/User';
import { blockchainClient } from '../services/blockchain.client';
import { createError } from '../middleware/errorHandler';
import { Types } from 'mongoose';

function getUserFromHeaders(req: Request) {
	const userId = req.headers['x-user-id'] as string;
	const userRole = req.headers['x-user-role'] as string;
	if (!userId) throw createError('Unauthorized', 401);
	return { userId, userRole };
}

export async function recordAttendance(req: Request, res: Response) {
	const user = getUserFromHeaders(req);
	const { studentId, courseId, date, status, notes } = req.body;

	const course = await CourseModel.findById(courseId);
	if (!course) throw createError('Course not found', 404);
	if (user.userRole !== 'admin' && course.teacher.toString() !== user.userId) {
		throw createError('Not authorized to record attendance for this course', 403);
	}
	if (!course.students.map(id => id.toString()).includes(studentId)) {
		throw createError('Student is not enrolled in this course', 400);
	}

	const existing = await AttendanceModel.findOne({
		student: studentId,
		course: courseId,
		date: new Date(date),
	});
	if (existing) {
		throw createError('Attendance already recorded for this student on this date', 409);
	}

	const record = new AttendanceModel({
		student: new Types.ObjectId(studentId),
		course: new Types.ObjectId(courseId),
		date: new Date(date),
		status,
		notes,
		recordedBy: new Types.ObjectId(user.userId),
	});
	await record.save();

	// Store on blockchain
	try {
		const transactionHash = await blockchainClient.storeRecord({
			recordType: 'attendance',
			recordId: record._id.toString(),
			data: {
				student: record.student.toString(),
				course: record.course.toString(),
				date: record.date,
				status: record.status,
				recordedBy: record.recordedBy.toString(),
			},
			metadata: { studentId: record.student, courseId: record.course },
		});
		record.blockchainHash = transactionHash;
		await record.save();
	} catch (error) {
		console.error('Failed to store attendance on blockchain:', error);
	}

	await record.populate(['student', 'course', 'recordedBy']);
	return res.status(201).json(record);
}

export async function recordBulkAttendance(req: Request, res: Response) {
	const user = getUserFromHeaders(req);
	const { courseId, date, attendance: attendanceData } = req.body;

	const course = await CourseModel.findById(courseId);
	if (!course) throw createError('Course not found', 404);
	if (user.userRole !== 'admin' && course.teacher.toString() !== user.userId) {
		throw createError('Not authorized to record attendance for this course', 403);
	}

	const studentIds = attendanceData.map((a: any) => a.studentId);
	const enrolledStudents = course.students.map(id => id.toString());
	const invalidStudents = studentIds.filter((id: string) => !enrolledStudents.includes(id));
	if (invalidStudents.length > 0) {
		return res.status(400).json({
			message: 'Some students are not enrolled in this course',
			invalidStudents,
		});
	}

	await AttendanceModel.deleteMany({ course: courseId, date: new Date(date) });

	const records = attendanceData.map((a: any) => ({
		student: new Types.ObjectId(a.studentId),
		course: new Types.ObjectId(courseId),
		date: new Date(date),
		status: a.status,
		notes: a.notes,
		recordedBy: new Types.ObjectId(user.userId),
	}));

	const saved = await AttendanceModel.insertMany(records);

	// Store on blockchain
	for (const record of saved) {
		try {
			const transactionHash = await blockchainClient.storeRecord({
				recordType: 'attendance',
				recordId: record._id.toString(),
				data: {
					student: record.student.toString(),
					course: record.course.toString(),
					date: record.date,
					status: record.status,
				},
				metadata: { studentId: record.student, courseId: record.course },
			});
			record.blockchainHash = transactionHash;
			await record.save();
		} catch (error) {
			console.error('Failed to store attendance on blockchain:', error);
		}
	}

	await AttendanceModel.populate(saved, ['student', 'course', 'recordedBy']);
	return res.status(201).json({ message: 'Bulk attendance recorded', attendance: saved });
}

export async function listAttendance(req: Request, res: Response) {
	const user = getUserFromHeaders(req);
	const { page = 1, limit = 10, student, course, date, startDate, endDate, status } = req.query as any;

	const filter: any = {};
	if (user.userRole === 'student') {
		filter.student = new Types.ObjectId(user.userId);
	} else if (user.userRole === 'teacher') {
		const teacherCourses = await CourseModel.find({ teacher: new Types.ObjectId(user.userId) }).select('_id');
		filter.course = { $in: teacherCourses.map(c => c._id) };
	}
	if (student) filter.student = student;
	if (course) filter.course = course;
	if (date) filter.date = new Date(String(date));
	if (startDate || endDate) {
		filter.date = {};
		if (startDate) filter.date.$gte = new Date(String(startDate));
		if (endDate) filter.date.$lte = new Date(String(endDate));
	}
	if (status) filter.status = status;

	const skip = (Number(page) - 1) * Number(limit);
	const [attendance, total] = await Promise.all([
		AttendanceModel.find(filter)
			.populate('student', 'fullName email')
			.populate('course', 'title code')
			.populate('recordedBy', 'fullName')
			.sort({ date: -1 })
			.skip(skip)
			.limit(Number(limit)),
		AttendanceModel.countDocuments(filter),
	]);

	return res.json({ attendance, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } });
}

export async function getAttendance(req: Request, res: Response) {
	const record = await AttendanceModel.findById(req.params.id)
		.populate('student', 'fullName email')
		.populate('course', 'title code')
		.populate('recordedBy', 'fullName');
	if (!record) throw createError('Attendance record not found', 404);

	let verified = false;
	if (record.blockchainHash) {
		verified = await blockchainClient.verifyRecord(record._id.toString(), 'attendance');
	}

	return res.json({ ...record.toObject(), blockchainVerified: verified });
}

export async function attendanceStats(req: Request, res: Response) {
	const user = getUserFromHeaders(req);
	const { courseId } = req.params;
	const { startDate, endDate } = req.query as any;

	const course = await CourseModel.findById(courseId);
	if (!course) throw createError('Course not found', 404);
	if (user.userRole !== 'admin' && course.teacher.toString() !== user.userId) {
		throw createError('Not authorized to view statistics for this course', 403);
	}

	const filter: any = { course: courseId };
	if (startDate || endDate) {
		filter.date = {};
		if (startDate) filter.date.$gte = new Date(String(startDate));
		if (endDate) filter.date.$lte = new Date(String(endDate));
	}

	const stats = await AttendanceModel.aggregate([
		{ $match: filter },
		{ $group: { _id: { student: '$student', status: '$status' }, count: { $sum: 1 } } },
		{ $group: { _id: '$_id.student', attendance: { $push: { status: '$_id.status', count: '$count' } }, totalRecords: { $sum: '$count' } } },
	]);

	const studentIds = stats.map(s => s._id);
	const students = await UserModel.find({ _id: { $in: studentIds } }).select('fullName email');
	const statsWithStudents = stats.map(stat => {
		const student = students.find(s => s._id.toString() === stat._id.toString());
		return { student: { _id: stat._id, fullName: student?.fullName, email: student?.email }, attendance: stat.attendance, totalRecords: stat.totalRecords };
	});

	return res.json(statsWithStudents);
}

