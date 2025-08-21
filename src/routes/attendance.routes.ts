/**
 * Attendance management routes.
 */
import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { validate, commonSchemas } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { AttendanceModel, AttendanceStatus } from '../models/Attendance';
import { CourseModel } from '../models/Course';
import { UserModel } from '../models/User';
import Joi from 'joi';

const router = Router();

// Validation schemas
const recordAttendanceSchema = {
	body: Joi.object({
		studentId: commonSchemas.objectId,
		courseId: commonSchemas.objectId,
		date: Joi.date().required(),
		status: Joi.string().valid('present', 'absent', 'late', 'excused').required(),
		notes: Joi.string().optional()
	})
};

const bulkAttendanceSchema = {
	body: Joi.object({
		courseId: commonSchemas.objectId,
		date: Joi.date().required(),
		attendance: Joi.array().items(
			Joi.object({
				studentId: commonSchemas.objectId,
				status: Joi.string().valid('present', 'absent', 'late', 'excused').required(),
				notes: Joi.string().optional()
			})
		).required()
	})
};

// Get attendance records (with filtering)
router.get('/',
	authenticate,
	validate({
		query: Joi.object({
			...commonSchemas.pagination,
			student: commonSchemas.objectId.optional(),
			course: commonSchemas.objectId.optional(),
			date: Joi.date().optional(),
			startDate: Joi.date().optional(),
			endDate: Joi.date().optional(),
			status: Joi.string().valid('present', 'absent', 'late', 'excused').optional()
		})
	}),
	asyncHandler(async (req, res) => {
		const { page = 1, limit = 10, sortBy = 'date', sortOrder = 'desc', student, course, date, startDate, endDate, status } = req.query;
		
		const filter: any = {};
		
		// Apply role-based filtering
		if (req.user.role === 'student') {
			filter.student = req.user._id;
		} else if (req.user.role === 'teacher') {
			// Teachers can only see attendance for their courses
			const teacherCourses = await CourseModel.find({ teacher: req.user._id }).select('_id');
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
		const sort = { [String(sortBy)]: sortOrder === 'desc' ? -1 : 1 };

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

		res.json({
			attendance,
			pagination: {
				page: Number(page),
				limit: Number(limit),
				total,
				pages: Math.ceil(total / Number(limit))
			}
		});
	})
);

// Get attendance by ID
router.get('/:id',
	authenticate,
	validate({
		params: Joi.object({
			id: commonSchemas.objectId
		})
	}),
	asyncHandler(async (req, res) => {
		const attendance = await AttendanceModel.findById(req.params.id)
			.populate('student', 'fullName email')
			.populate('course', 'title code')
			.populate('recordedBy', 'fullName');

		if (!attendance) {
			return res.status(404).json({ message: 'Attendance record not found' });
		}

		// Check authorization
		if (req.user.role === 'student' && attendance.student.toString() !== req.user._id.toString()) {
			return res.status(403).json({ message: 'Not authorized to view this attendance record' });
		}

		res.json(attendance);
	})
);

// Record single attendance
router.post('/',
	authenticate,
	authorize(['teacher', 'admin']),
	validate(recordAttendanceSchema),
	asyncHandler(async (req, res) => {
		const { studentId, courseId, date, status, notes } = req.body;

		// Check if course exists and user is authorized
		const course = await CourseModel.findById(courseId);
		if (!course) {
			return res.status(404).json({ message: 'Course not found' });
		}

		if (req.user.role !== 'admin' && course.teacher.toString() !== req.user._id.toString()) {
			return res.status(403).json({ message: 'Not authorized to record attendance for this course' });
		}

		// Check if student is enrolled in the course
		if (!course.students.includes(studentId)) {
			return res.status(400).json({ message: 'Student is not enrolled in this course' });
		}

		// Check if attendance already exists for this student, course, and date
		const existingAttendance = await AttendanceModel.findOne({
			student: studentId,
			course: courseId,
			date: new Date(date)
		});

		if (existingAttendance) {
			return res.status(409).json({ message: 'Attendance already recorded for this student on this date' });
		}

		const attendance = new AttendanceModel({
			student: studentId,
			course: courseId,
			date: new Date(date),
			status,
			notes,
			recordedBy: req.user._id
		});

		await attendance.save();
		await attendance.populate(['student', 'course', 'recordedBy']);

		res.status(201).json(attendance);
	})
);

// Record bulk attendance
router.post('/bulk',
	authenticate,
	authorize(['teacher', 'admin']),
	validate(bulkAttendanceSchema),
	asyncHandler(async (req, res) => {
		const { courseId, date, attendance: attendanceData } = req.body;

		// Check if course exists and user is authorized
		const course = await CourseModel.findById(courseId);
		if (!course) {
			return res.status(404).json({ message: 'Course not found' });
		}

		if (req.user.role !== 'admin' && course.teacher.toString() !== req.user._id.toString()) {
			return res.status(403).json({ message: 'Not authorized to record attendance for this course' });
		}

		// Check if all students are enrolled
		const studentIds = attendanceData.map((a: any) => a.studentId);
		const enrolledStudents = course.students.map(id => id.toString());
		const invalidStudents = studentIds.filter((id: string) => !enrolledStudents.includes(id));
		
		if (invalidStudents.length > 0) {
			return res.status(400).json({ 
				message: 'Some students are not enrolled in this course',
				invalidStudents 
			});
		}

		// Remove existing attendance records for this date and course
		await AttendanceModel.deleteMany({
			course: courseId,
			date: new Date(date)
		});

		// Create new attendance records
		const attendanceRecords = attendanceData.map((a: any) => ({
			student: a.studentId,
			course: courseId,
			date: new Date(date),
			status: a.status,
			notes: a.notes,
			recordedBy: req.user._id
		}));

		const savedAttendance = await AttendanceModel.insertMany(attendanceRecords);
		await AttendanceModel.populate(savedAttendance, ['student', 'course', 'recordedBy']);

		res.status(201).json({
			message: 'Bulk attendance recorded successfully',
			attendance: savedAttendance
		});
	})
);

// Update attendance record
router.put('/:id',
	authenticate,
	authorize(['teacher', 'admin']),
	validate({
		body: Joi.object({
			status: Joi.string().valid('present', 'absent', 'late', 'excused').required(),
			notes: Joi.string().optional()
		})
	}),
	asyncHandler(async (req, res) => {
		const attendance = await AttendanceModel.findById(req.params.id);
		
		if (!attendance) {
			return res.status(404).json({ message: 'Attendance record not found' });
		}

		// Check authorization
		const course = await CourseModel.findById(attendance.course);
		if (!course) {
			return res.status(404).json({ message: 'Course not found' });
		}

		if (req.user.role !== 'admin' && course.teacher.toString() !== req.user._id.toString()) {
			return res.status(403).json({ message: 'Not authorized to update this attendance record' });
		}

		Object.assign(attendance, req.body);
		await attendance.save();
		await attendance.populate(['student', 'course', 'recordedBy']);

		res.json(attendance);
	})
);

// Delete attendance record
router.delete('/:id',
	authenticate,
	authorize(['teacher', 'admin']),
	validate({
		params: Joi.object({
			id: commonSchemas.objectId
		})
	}),
	asyncHandler(async (req, res) => {
		const attendance = await AttendanceModel.findById(req.params.id);
		
		if (!attendance) {
			return res.status(404).json({ message: 'Attendance record not found' });
		}

		// Check authorization
		const course = await CourseModel.findById(attendance.course);
		if (!course) {
			return res.status(404).json({ message: 'Course not found' });
		}

		if (req.user.role !== 'admin' && course.teacher.toString() !== req.user._id.toString()) {
			return res.status(403).json({ message: 'Not authorized to delete this attendance record' });
		}

		await AttendanceModel.findByIdAndDelete(req.params.id);

		res.json({ message: 'Attendance record deleted successfully' });
	})
);

// Get attendance statistics
router.get('/stats/:courseId',
	authenticate,
	authorize(['teacher', 'admin']),
	validate({
		params: Joi.object({
			courseId: commonSchemas.objectId
		}),
		query: Joi.object({
			startDate: Joi.date().optional(),
			endDate: Joi.date().optional()
		})
	}),
	asyncHandler(async (req, res) => {
		const { courseId } = req.params;
		const { startDate, endDate } = req.query;

		// Check authorization
		const course = await CourseModel.findById(courseId);
		if (!course) {
			return res.status(404).json({ message: 'Course not found' });
		}

		if (req.user.role !== 'admin' && course.teacher.toString() !== req.user._id.toString()) {
			return res.status(403).json({ message: 'Not authorized to view statistics for this course' });
		}

		const filter: any = { course: courseId };
		if (startDate || endDate) {
			filter.date = {};
			if (startDate) filter.date.$gte = new Date(String(startDate));
			if (endDate) filter.date.$lte = new Date(String(endDate));
		}

		const stats = await AttendanceModel.aggregate([
			{ $match: filter },
			{
				$group: {
					_id: {
						student: '$student',
						status: '$status'
					},
					count: { $sum: 1 }
				}
			},
			{
				$group: {
					_id: '$_id.student',
					attendance: {
						$push: {
							status: '$_id.status',
							count: '$count'
						}
					},
					totalRecords: { $sum: '$count' }
				}
			}
		]);

		// Populate student information
		const studentIds = stats.map(s => s._id);
		const students = await UserModel.find({ _id: { $in: studentIds } }).select('fullName email');

		const statsWithStudents = stats.map(stat => {
			const student = students.find(s => s._id.toString() === stat._id.toString());
			return {
				student: {
					_id: stat._id,
					fullName: student?.fullName,
					email: student?.email
				},
				attendance: stat.attendance,
				totalRecords: stat.totalRecords
			};
		});

		res.json(statsWithStudents);
	})
);

export default router;
