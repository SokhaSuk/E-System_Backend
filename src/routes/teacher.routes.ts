/**
 * Teacher routes.
 * Accessible by users with roles: teacher, admin.
 */
import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth';
// import { validate, commonSchemas } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { CourseModel } from '../models/Course';
import { GradeModel } from '../models/Grade';
import { AttendanceModel } from '../models/Attendance';
import { UserModel } from '../models/User';
import { createError } from '../middleware/errorHandler';
// import Joi from 'joi';

const router = Router();

router.use(authenticate, authorize(['teacher', 'admin']));

/** Get teacher's courses/classes */
router.get(
	'/courses',
	asyncHandler(async (req: Request, res: Response) => {
		const {
			page = 1,
			limit = 10,
			sortBy = 'createdAt',
			sortOrder = 'desc',
			semester,
			academicYear,
			isActive,
			search,
		} = req.query as any;

		const filter: any = { teacher: req.user!._id };
		if (semester) filter.semester = semester;
		if (academicYear) filter.academicYear = academicYear;
		if (isActive !== undefined) filter.isActive = isActive;
		if (search) {
			filter.$or = [
				{ title: { $regex: search, $options: 'i' } },
				{ description: { $regex: search, $options: 'i' } },
				{ code: { $regex: search, $options: 'i' } },
			];
		}

		const skip = (Number(page) - 1) * Number(limit);
		const sort: any = { [String(sortBy)]: sortOrder === 'desc' ? -1 : 1 };

		const [courses, total] = await Promise.all([
			CourseModel.find(filter)
				.populate('students', 'fullName email')
				.sort(sort)
				.skip(skip)
				.limit(Number(limit)),
			CourseModel.countDocuments(filter),
		]);

		return res.json({
			courses,
			pagination: {
				page: Number(page),
				limit: Number(limit),
				total,
				pages: Math.ceil(total / Number(limit)),
			},
		});
	})
);

/** Get course details with student list */
router.get(
	'/courses/:courseId',
	asyncHandler(async (req: Request, res: Response) => {
		const { courseId } = req.params;

		const course = await CourseModel.findOne({
			_id: courseId,
			teacher: req.user!._id,
		}).populate('students', 'fullName email');

		if (!course) {
			throw createError('Course not found or not authorized', 404);
		}

		return res.json(course);
	})
);

/** Get students in a specific course */
router.get(
	'/courses/:courseId/students',
	asyncHandler(async (req: Request, res: Response) => {
		const { courseId } = req.params;
		const {
			page = 1,
			limit = 10,
			sortBy = 'fullName',
			sortOrder = 'asc',
			search,
		} = req.query as any;

		const course = await CourseModel.findOne({
			_id: courseId,
			teacher: req.user!._id,
		});

		if (!course) {
			throw createError('Course not found or not authorized', 404);
		}

		const filter: any = { _id: { $in: course.students } };
		if (search) {
			filter.$or = [
				{ fullName: { $regex: search, $options: 'i' } },
				{ email: { $regex: search, $options: 'i' } },
			];
		}

		const skip = (Number(page) - 1) * Number(limit);
		const sort: any = { [String(sortBy)]: sortOrder === 'desc' ? -1 : 1 };

		const [students, total] = await Promise.all([
			UserModel.find(filter, { passwordHash: 0 })
				.sort(sort)
				.skip(skip)
				.limit(Number(limit)),
			UserModel.countDocuments(filter),
		]);

		return res.json({
			students,
			pagination: {
				page: Number(page),
				limit: Number(limit),
				total,
				pages: Math.ceil(total / Number(limit)),
			},
		});
	})
);

/** Get student progress in a course */
router.get(
	'/courses/:courseId/students/:studentId/progress',
	asyncHandler(async (req: Request, res: Response) => {
		const { courseId, studentId } = req.params;

		// Verify course and teacher authorization
		const course = await CourseModel.findOne({
			_id: courseId,
			teacher: req.user!._id,
		});

		if (!course) {
			throw createError('Course not found or not authorized', 404);
		}

		// Check if student is enrolled in the course
		if (!course.students.map(id => id.toString()).includes(studentId)) {
			throw createError('Student is not enrolled in this course', 400);
		}

		// Get student's grades for this course
		const grades = await GradeModel.find({
			student: studentId,
			course: courseId,
		}).populate('course', 'title code');

		// Get student's attendance for this course
		const attendance = await AttendanceModel.find({
			student: studentId,
			course: courseId,
		}).populate('course', 'title code');

		// Calculate attendance percentage
		const totalAttendance = attendance.length;
		const presentAttendance = attendance.filter(
			a => a.status === 'present'
		).length;
		const attendancePercentage =
			totalAttendance > 0 ? (presentAttendance / totalAttendance) * 100 : 0;

		// Calculate average grade
		const totalGrades = grades.length;
		const averagePercentage =
			totalGrades > 0
				? grades.reduce((sum, grade) => sum + grade.percentage, 0) / totalGrades
				: 0;

		return res.json({
			student: {
				_id: studentId,
				course: course.title,
				grades,
				attendance: {
					records: attendance,
					total: totalAttendance,
					present: presentAttendance,
					percentage: Math.round(attendancePercentage * 100) / 100,
				},
				academic: {
					totalGrades,
					averagePercentage: Math.round(averagePercentage * 100) / 100,
				},
			},
		});
	})
);

/** Get course statistics */
router.get(
	'/courses/:courseId/stats',
	asyncHandler(async (req: Request, res: Response) => {
		const { courseId } = req.params;
		const { startDate, endDate } = req.query as any;

		// Verify course and teacher authorization
		const course = await CourseModel.findOne({
			_id: courseId,
			teacher: req.user!._id,
		});

		if (!course) {
			throw createError('Course not found or not authorized', 404);
		}

		const filter: any = { course: courseId };
		if (startDate || endDate) {
			filter.date = {};
			if (startDate) filter.date.$gte = new Date(String(startDate));
			if (endDate) filter.date.$lte = new Date(String(endDate));
		}

		// Get grade statistics
		const gradeStats = await GradeModel.aggregate([
			{ $match: { course: course._id } },
			{
				$group: {
					_id: null,
					totalGrades: { $sum: 1 },
					averageScore: { $avg: '$score' },
					averagePercentage: { $avg: '$percentage' },
					gradeDistribution: {
						$push: '$letterGrade',
					},
				},
			},
		]);

		// Get attendance statistics
		const attendanceStats = await AttendanceModel.aggregate([
			{ $match: filter },
			{
				$group: {
					_id: '$status',
					count: { $sum: 1 },
				},
			},
		]);

		// Calculate grade distribution
		const gradeDistribution =
			gradeStats[0]?.gradeDistribution.reduce((acc: any, grade: string) => {
				acc[grade] = (acc[grade] || 0) + 1;
				return acc;
			}, {}) || {};

		return res.json({
			course: {
				_id: course._id,
				title: course.title,
				code: course.code,
				totalStudents: course.students.length,
			},
			grades: gradeStats[0] || {
				totalGrades: 0,
				averageScore: 0,
				averagePercentage: 0,
			},
			attendance: attendanceStats.reduce(
				(acc, stat) => ({ ...acc, [stat._id]: stat.count }),
				{}
			),
			gradeDistribution,
		});
	})
);

/** Get grades for a specific course */
router.get(
	'/courses/:courseId/grades',
	asyncHandler(async (req: Request, res: Response) => {
		const { courseId } = req.params;
		const {
			page = 1,
			limit = 10,
			sortBy = 'createdAt',
			sortOrder = 'desc',
			student,
			gradeType,
			search,
		} = req.query as any;

		// Verify course and teacher authorization
		const course = await CourseModel.findOne({
			_id: courseId,
			teacher: req.user!._id,
		});

		if (!course) {
			throw createError('Course not found or not authorized', 404);
		}

		const filter: any = { course: courseId };
		if (student) filter.student = student;
		if (gradeType) filter.gradeType = gradeType;
		if (search) {
			filter.$or = [
				{ title: { $regex: search, $options: 'i' } },
				{ letterGrade: { $regex: search, $options: 'i' } },
			];
		}

		const skip = (Number(page) - 1) * Number(limit);
		const sort: any = { [String(sortBy)]: sortOrder === 'desc' ? -1 : 1 };

		const [grades, total] = await Promise.all([
			GradeModel.find(filter)
				.populate('student', 'fullName email')
				.populate('gradedBy', 'fullName')
				.sort(sort)
				.skip(skip)
				.limit(Number(limit)),
			GradeModel.countDocuments(filter),
		]);

		return res.json({
			grades,
			pagination: {
				page: Number(page),
				limit: Number(limit),
				total,
				pages: Math.ceil(total / Number(limit)),
			},
		});
	})
);

/** Get attendance for a specific course */
router.get(
	'/courses/:courseId/attendance',
	asyncHandler(async (req: Request, res: Response) => {
		const { courseId } = req.params;
		const {
			page = 1,
			limit = 10,
			sortBy = 'date',
			sortOrder = 'desc',
			student,
			date,
			startDate,
			endDate,
			status,
		} = req.query as any;

		// Verify course and teacher authorization
		const course = await CourseModel.findOne({
			_id: courseId,
			teacher: req.user!._id,
		});

		if (!course) {
			throw createError('Course not found or not authorized', 404);
		}

		const filter: any = { course: courseId };
		if (student) filter.student = student;
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
				.populate('recordedBy', 'fullName')
				.sort(sort)
				.skip(skip)
				.limit(Number(limit)),
			AttendanceModel.countDocuments(filter),
		]);

		return res.json({
			attendance,
			pagination: {
				page: Number(page),
				limit: Number(limit),
				total,
				pages: Math.ceil(total / Number(limit)),
			},
		});
	})
);

/** Get teacher's dashboard/summary */
router.get(
	'/dashboard',
	asyncHandler(async (req: Request, res: Response) => {
		const teacherId = req.user!._id;

		// Get teacher's courses
		const courses = await CourseModel.find({ teacher: teacherId }).select(
			'title code students semester'
		);

		// Get total students across all courses
		const totalStudents = courses.reduce(
			(total, course) => total + course.students.length,
			0
		);

		// Get recent grades (last 30 days)
		const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
		const recentGrades = await GradeModel.countDocuments({
			course: { $in: courses.map(c => c._id) },
			createdAt: { $gte: thirtyDaysAgo },
		});

		// Get recent attendance records (last 7 days)
		const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
		const recentAttendance = await AttendanceModel.countDocuments({
			course: { $in: courses.map(c => c._id) },
			date: { $gte: sevenDaysAgo },
		});

		// Get courses by semester
		const coursesBySemester = await CourseModel.aggregate([
			{ $match: { teacher: teacherId } },
			{
				$group: {
					_id: '$semester',
					count: { $sum: 1 },
					totalStudents: { $sum: { $size: '$students' } },
				},
			},
		]);

		return res.json({
			summary: {
				totalCourses: courses.length,
				totalStudents,
				recentGrades,
				recentAttendance,
			},
			courses: courses.map(c => ({
				_id: c._id,
				title: c.title,
				code: c.code,
				studentsCount: c.students.length,
				semester: c.semester,
			})),
			coursesBySemester,
		});
	})
);

export default router;
