/**
 * Attendance controllers.
 */
import { Request, Response } from 'express';
import { AttendanceModel } from '../models/Attendance';
import { CourseModel } from '../models/Course';
import { UserModel } from '../models/User';
import { createError } from '../middleware/errorHandler';

export async function listAttendance(req: Request, res: Response) {
	const { page = 1, limit = 10, sortBy = 'date', sortOrder = 'desc', student, course, date, startDate, endDate, status } = req.query as any;

	const filter: any = {};

	if (req.user!.role === 'student') {
		filter.student = req.user!._id;
	} else if (req.user!.role === 'teacher') {
		const teacherCourses = await CourseModel.find({ teacher: req.user!._id }).select('_id');
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
	const sort: any = { [String(sortBy)]: sortOrder === 'desc' ? -1 : 1 };

	const [attendance, total] = await Promise.all([
		AttendanceModel.find(filter)
			.populate('student', 'fullName email')
			.populate('course', 'title code')
			.populate('recordedBy', 'fullName')
			.sort(sort)
			.skip(skip)
			.limit(Number(limit)),
		AttendanceModel.countDocuments(filter)
	]);

	return res.json({
		attendance,
		pagination: {
			page: Number(page),
			limit: Number(limit),
			total,
			pages: Math.ceil(total / Number(limit))
		}
	});
}

export async function getAttendance(req: Request, res: Response) {
	const record = await AttendanceModel.findById(req.params.id)
		.populate('student', 'fullName email')
		.populate('course', 'title code')
		.populate('recordedBy', 'fullName');
	if (!record) {
		throw createError('Attendance record not found', 404);
	}
	if (req.user!.role === 'student' && record.student.toString() !== req.user!._id.toString()) {
		throw createError('Not authorized to view this attendance record', 403);
	}
	return res.json(record);
}

export async function recordAttendance(req: Request, res: Response) {
	const { studentId, courseId, date, status, notes } = req.body as { studentId: string; courseId: string; date: string; status: string; notes?: string };

	const course = await CourseModel.findById(courseId);
	if (!course) {
		throw createError('Course not found', 404);
	}
	if (req.user!.role !== 'admin' && course.teacher.toString() !== req.user!._id.toString()) {
		throw createError('Not authorized to record attendance for this course', 403);
	}
	if (!course.students.map(id => id.toString()).includes(studentId)) {
		throw createError('Student is not enrolled in this course', 400);
	}

	const existingAttendance = await AttendanceModel.findOne({ student: studentId, course: courseId, date: new Date(date) });
	if (existingAttendance) {
		throw createError('Attendance already recorded for this student on this date', 409);
	}

	const record = new AttendanceModel({
		student: studentId,
		course: courseId,
		date: new Date(date),
		status,
		notes,
		recordedBy: req.user!._id
	});
	await record.save();
	await record.populate(['student', 'course', 'recordedBy']);
	return res.status(201).json(record);
}

export async function recordBulkAttendance(req: Request, res: Response) {
	const { courseId, date, attendance: attendanceData } = req.body as any;

	const course = await CourseModel.findById(courseId);
	if (!course) {
		throw createError('Course not found', 404);
	}
	if (req.user!.role !== 'admin' && course.teacher.toString() !== req.user!._id.toString()) {
		throw createError('Not authorized to record attendance for this course', 403);
	}

	const studentIds = attendanceData.map((a: any) => a.studentId);
	const enrolledStudents = course.students.map(id => id.toString());
	const invalidStudents = studentIds.filter((id: string) => !enrolledStudents.includes(id));
	if (invalidStudents.length > 0) {
		return res.status(400).json({ message: 'Some students are not enrolled in this course', invalidStudents });
	}

	await AttendanceModel.deleteMany({ course: courseId, date: new Date(date) });

	const attendanceRecords = attendanceData.map((a: any) => ({
		student: a.studentId,
		course: courseId,
		date: new Date(date),
		status: a.status,
		notes: a.notes,
		recordedBy: req.user!._id
	}));

	const savedAttendance = await AttendanceModel.insertMany(attendanceRecords);
	await AttendanceModel.populate(savedAttendance, [
		{ path: 'student', select: 'fullName email' },
		{ path: 'course', select: 'title code' },
		{ path: 'recordedBy', select: 'fullName' }
	]);

	return res.status(201).json({ message: 'Bulk attendance recorded successfully', attendance: savedAttendance });
}

export async function updateAttendance(req: Request, res: Response) {
	const attendance = await AttendanceModel.findById(req.params.id);
	if (!attendance) {
		throw createError('Attendance record not found', 404);
	}
	const course = await CourseModel.findById(attendance.course);
	if (!course) {
		throw createError('Course not found', 404);
	}
	if (req.user!.role !== 'admin' && course.teacher.toString() !== req.user!._id.toString()) {
		throw createError('Not authorized to update this attendance record', 403);
	}
	Object.assign(attendance, req.body);
	await attendance.save();
	await attendance.populate(['student', 'course', 'recordedBy']);
	return res.json(attendance);
}

export async function deleteAttendance(req: Request, res: Response) {
	const attendance = await AttendanceModel.findById(req.params.id);
	if (!attendance) {
		throw createError('Attendance record not found', 404);
	}
	const course = await CourseModel.findById(attendance.course);
	if (!course) {
		throw createError('Course not found', 404);
	}
	if (req.user!.role !== 'admin' && course.teacher.toString() !== req.user!._id.toString()) {
		throw createError('Not authorized to delete this attendance record', 403);
	}
	await AttendanceModel.findByIdAndDelete(req.params.id);
	return res.json({ message: 'Attendance record deleted successfully' });
}

export async function attendanceStats(req: Request, res: Response) {
	const { courseId } = req.params as any;
	const { startDate, endDate } = req.query as any;

	const course = await CourseModel.findById(courseId);
	if (!course) {
		throw createError('Course not found', 404);
	}
	if (req.user!.role !== 'admin' && course.teacher.toString() !== req.user!._id.toString()) {
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
		{ $group: { _id: '$_id.student', attendance: { $push: { status: '$_id.status', count: '$count' } }, totalRecords: { $sum: '$count' } } }
	]);

	const studentIds = stats.map(s => s._id);
	const students = await UserModel.find({ _id: { $in: studentIds } }).select('fullName email');
	const statsWithStudents = stats.map(stat => {
		const student = students.find(s => s._id.toString() === stat._id.toString());
		return { student: { _id: stat._id, fullName: student?.fullName, email: student?.email }, attendance: stat.attendance, totalRecords: stat.totalRecords };
	});

	return res.json(statsWithStudents);
}


