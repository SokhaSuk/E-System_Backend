import { Router, Request, Response } from 'express';
import Joi from 'joi';
import { authenticate, authorize } from '../middleware/auth';
import { validate, commonSchemas } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { createError } from '../middleware/errorHandler';
import { CourseModel } from '../models/Course';
import { GradeModel } from '../models/Grade';
import { AttendanceModel } from '../models/Attendance';
import { AnnouncementModel } from '../models/Announcement';

const router = Router();

router.use(authenticate, authorize(['student', 'admin']));

// Get current student's profile (or admin's current user details)
router.get(
	'/me',
	asyncHandler(async (req: Request, res: Response) => {
		const user = req.user!;
		return res.json({
			_id: user._id,
			fullName: user.fullName,
			email: user.email,
			role: user.role,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt,
		});
	})
);

// Get enrolled courses for the student
router.get(
	'/courses',
	validate({
		query: Joi.object({
			...commonSchemas.pagination,
			studentId: commonSchemas.objectId.optional(),
			semester: Joi.string().valid('Fall', 'Spring', 'Summer').optional(),
			academicYear: Joi.string().optional(),
		}),
	}),
	asyncHandler(async (req: Request, res: Response) => {
		const { page = 1, limit = 10, semester, academicYear } = req.query as any;
		const skip = (Number(page) - 1) * Number(limit);

		// For students, always use own id; for admins, allow querying a specific student
		const studentId =
			req.user!.role === 'student'
				? req.user!._id
				: (req.query as any).studentId;
		if (req.user!.role === 'admin' && !studentId) {
			return res
				.status(400)
				.json({ message: 'studentId is required for admin requests' });
		}

		const filter: any = { students: studentId };
		if (semester) filter.semester = semester;
		if (academicYear) filter.academicYear = academicYear;

		const [courses, total] = await Promise.all([
			CourseModel.find(filter)
				.populate('teacher', 'fullName email')
				.sort({ createdAt: -1 })
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

// Get student's grades for all courses or specific course
router.get(
	'/grades',
	validate({
		query: Joi.object({
			...commonSchemas.pagination,
			courseId: commonSchemas.objectId.optional(),
			gradeType: Joi.string()
				.valid(
					'assignment',
					'quiz',
					'exam',
					'project',
					'participation',
					'final'
				)
				.optional(),
			semester: Joi.string().valid('Fall', 'Spring', 'Summer').optional(),
		}),
	}),
	asyncHandler(async (req: Request, res: Response) => {
		const {
			page = 1,
			limit = 10,
			courseId,
			gradeType,
			semester,
		} = req.query as any;
		const skip = (Number(page) - 1) * Number(limit);

		// For students, always use own id; for admins, allow querying a specific student
		const studentId =
			req.user!.role === 'student'
				? req.user!._id
				: (req.query as any).studentId;
		if (req.user!.role === 'admin' && !studentId) {
			return res
				.status(400)
				.json({ message: 'studentId is required for admin requests' });
		}

		const filter: any = { student: studentId };
		if (courseId) filter.course = courseId;
		if (gradeType) filter.gradeType = gradeType;
		if (semester) {
			// Find courses in the semester and filter grades by those courses
			const coursesInSemester = await CourseModel.find({ semester }).select(
				'_id'
			);
			filter.course = { $in: coursesInSemester.map(c => c._id) };
		}

		const [grades, total] = await Promise.all([
			GradeModel.find(filter)
				.populate('course', 'title code semester academicYear')
				.populate('gradedBy', 'fullName')
				.sort({ createdAt: -1 })
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

// Get student's attendance records
router.get(
	'/attendance',
	validate({
		query: Joi.object({
			...commonSchemas.pagination,
			courseId: commonSchemas.objectId.optional(),
			startDate: Joi.date().optional(),
			endDate: Joi.date().optional(),
			status: Joi.string()
				.valid('present', 'absent', 'late', 'excused')
				.optional(),
		}),
	}),
	asyncHandler(async (req: Request, res: Response) => {
		const {
			page = 1,
			limit = 10,
			courseId,
			startDate,
			endDate,
			status,
		} = req.query as any;
		const skip = (Number(page) - 1) * Number(limit);

		// For students, always use own id; for admins, allow querying a specific student
		const studentId =
			req.user!.role === 'student'
				? req.user!._id
				: (req.query as any).studentId;
		if (req.user!.role === 'admin' && !studentId) {
			return res
				.status(400)
				.json({ message: 'studentId is required for admin requests' });
		}

		const filter: any = { student: studentId };
		if (courseId) filter.course = courseId;
		if (startDate || endDate) {
			filter.date = {};
			if (startDate) filter.date.$gte = new Date(String(startDate));
			if (endDate) filter.date.$lte = new Date(String(endDate));
		}
		if (status) filter.status = status;

		const [attendance, total] = await Promise.all([
			AttendanceModel.find(filter)
				.populate('course', 'title code')
				.populate('recordedBy', 'fullName')
				.sort({ date: -1 })
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

// Get student's academic transcript/GPA
router.get(
	'/transcript',
	validate({
		query: Joi.object({
			semester: Joi.string().valid('Fall', 'Spring', 'Summer').optional(),
			academicYear: Joi.string().optional(),
		}),
	}),
	asyncHandler(async (req: Request, res: Response) => {
		const { semester, academicYear } = req.query as any;

		// For students, always use own id; for admins, allow querying a specific student
		const studentId =
			req.user!.role === 'student'
				? req.user!._id
				: (req.query as any).studentId;
		if (req.user!.role === 'admin' && !studentId) {
			return res
				.status(400)
				.json({ message: 'studentId is required for admin requests' });
		}

		// Build filter for courses
		const courseFilter: any = { students: studentId };
		if (semester) courseFilter.semester = semester;
		if (academicYear) courseFilter.academicYear = academicYear;

		// Get all courses for the student
		const courses = await CourseModel.find(courseFilter)
			.populate('teacher', 'fullName')
			.sort({ semester: 1, academicYear: 1 });

		if (courses.length === 0) {
			return res.json({
				student: { _id: studentId },
				courses: [],
				overallGPA: 0,
				totalCredits: 0,
			});
		}

		// Get grades for all courses
		const courseIds = courses.map(c => c._id);
		const grades = await GradeModel.find({
			student: studentId,
			course: { $in: courseIds },
		});

		// Calculate GPA for each course
		const courseGrades = courses.map(course => {
			const courseGradeRecords = grades.filter(
				g => g.course.toString() === course._id.toString()
			);
			const averagePercentage =
				courseGradeRecords.length > 0
					? courseGradeRecords.reduce((sum, g) => sum + g.percentage, 0) /
						courseGradeRecords.length
					: 0;

			return {
				course: {
					_id: course._id,
					title: course.title,
					code: course.code,
					credits: course.credits,
					semester: course.semester,
					academicYear: course.academicYear,
					teacher: course.teacher,
				},
				grades: courseGradeRecords,
				averagePercentage: Math.round(averagePercentage * 100) / 100,
				gpa: calculateGPAFromPercentage(averagePercentage),
			};
		});

		// Calculate overall GPA
		const totalWeightedGPA = courseGrades.reduce(
			(sum, cg) => sum + cg.gpa * cg.course.credits,
			0
		);
		const totalCredits = courseGrades.reduce(
			(sum, cg) => sum + cg.course.credits,
			0
		);
		const overallGPA =
			totalCredits > 0
				? Math.round((totalWeightedGPA / totalCredits) * 100) / 100
				: 0;

		return res.json({
			student: { _id: studentId },
			courses: courseGrades,
			overallGPA,
			totalCredits,
		});
	})
);

// Get student's dashboard/summary
router.get(
	'/dashboard',
	asyncHandler(async (req: Request, res: Response) => {
		const studentId =
			req.user!.role === 'student'
				? req.user!._id
				: (req.query as any).studentId;
		if (req.user!.role === 'admin' && !studentId) {
			return res
				.status(400)
				.json({ message: 'studentId is required for admin requests' });
		}

		// Get enrolled courses count
		const enrolledCourses = await CourseModel.countDocuments({
			students: studentId,
		});

		// Get recent grades (last 30 days)
		const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
		const recentGrades = await GradeModel.countDocuments({
			student: studentId,
			createdAt: { $gte: thirtyDaysAgo },
		});

		// Get recent attendance (last 7 days)
		const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
		const recentAttendance = await AttendanceModel.countDocuments({
			student: studentId,
			date: { $gte: sevenDaysAgo },
		});

		// Get current semester courses
		const currentDate = new Date();
		const currentYear = currentDate.getFullYear();
		const currentMonth = currentDate.getMonth() + 1;

		let currentSemester = 'Spring';
		if (currentMonth >= 8 && currentMonth <= 12) {
			currentSemester = 'Fall';
		} else if (currentMonth >= 1 && currentMonth <= 5) {
			currentSemester = 'Spring';
		} else {
			currentSemester = 'Summer';
		}

		const currentSemesterCourses = await CourseModel.find({
			students: studentId,
			semester: currentSemester,
			academicYear: currentYear.toString(),
		}).populate('teacher', 'fullName');

		return res.json({
			summary: {
				enrolledCourses,
				recentGrades,
				recentAttendance,
				currentSemester,
				currentYear: currentYear.toString(),
			},
			currentCourses: currentSemesterCourses,
		});
	})
);

// Get announcements for students
router.get(
	'/announcements',
	validate({
		query: Joi.object({
			...commonSchemas.pagination,
			type: Joi.string()
				.valid('general', 'course', 'academic', 'emergency')
				.optional(),
			courseId: commonSchemas.objectId.optional(),
		}),
	}),
	asyncHandler(async (req: Request, res: Response) => {
		const { page = 1, limit = 10, type, courseId } = req.query as any;
		const skip = (Number(page) - 1) * Number(limit);

		const filter: any = {
			isActive: true,
			$or: [{ targetAudience: 'all' }, { targetAudience: 'student' }],
		};

		if (type) filter.type = type;
		if (courseId) filter.course = courseId;

		// Check if announcement is not expired
		filter.$or.push({
			$or: [
				{ expiresAt: { $exists: false } },
				{ expiresAt: { $gt: new Date() } },
			],
		});

		const [announcements, total] = await Promise.all([
			AnnouncementModel.find(filter)
				.populate('author', 'fullName email')
				.populate('course', 'title code')
				.sort({ publishedAt: -1 })
				.skip(skip)
				.limit(Number(limit)),
			AnnouncementModel.countDocuments(filter),
		]);

		return res.json({
			announcements,
			pagination: {
				page: Number(page),
				limit: Number(limit),
				total,
				pages: Math.ceil(total / Number(limit)),
			},
		});
	})
);

// Get course details with grades and attendance summary
router.get(
	'/courses/:courseId',
	validate({
		params: Joi.object({
			courseId: commonSchemas.objectId,
		}),
	}),
	asyncHandler(async (req: Request, res: Response) => {
		const { courseId } = req.params;

		// For students, always use own id; for admins, allow querying a specific student
		const studentId =
			req.user!.role === 'student'
				? req.user!._id
				: (req.query as any).studentId;
		if (req.user!.role === 'admin' && !studentId) {
			return res
				.status(400)
				.json({ message: 'studentId is required for admin requests' });
		}

		const course = await CourseModel.findOne({
			_id: courseId,
			students: studentId,
		}).populate('teacher', 'fullName email');

		if (!course) {
			throw createError('Course not found or not enrolled', 404);
		}

		// Get student's grades for this course
		const grades = await GradeModel.find({
			student: studentId,
			course: courseId,
		}).sort({ createdAt: -1 });

		// Get student's attendance for this course
		const attendance = await AttendanceModel.find({
			student: studentId,
			course: courseId,
		}).sort({ date: -1 });

		// Calculate attendance percentage
		const totalAttendance = attendance.length;
		const presentAttendance = attendance.filter(
			a => a.status === 'present'
		).length;
		const attendancePercentage =
			totalAttendance > 0 ? (presentAttendance / totalAttendance) * 100 : 0;

		return res.json({
			course,
			grades,
			attendance: {
				records: attendance,
				total: totalAttendance,
				present: presentAttendance,
				percentage: Math.round(attendancePercentage * 100) / 100,
			},
		});
	})
);

function calculateGPAFromPercentage(percentage: number): number {
	if (percentage >= 93) return 4.0;
	if (percentage >= 90) return 3.7;
	if (percentage >= 87) return 3.3;
	if (percentage >= 83) return 3.0;
	if (percentage >= 80) return 2.7;
	if (percentage >= 77) return 2.3;
	if (percentage >= 73) return 2.0;
	if (percentage >= 70) return 1.7;
	if (percentage >= 67) return 1.3;
	if (percentage >= 63) return 1.0;
	if (percentage >= 60) return 0.7;
	return 0.0;
}

export default router;
