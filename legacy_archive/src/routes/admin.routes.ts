/**
 * Admin-only routes.
 * Requires `requireAuth` and `requireRoles('admin')`.
 */
import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { UserModel } from '../models/User';
import { CourseModel } from '../models/Course';
import { GradeModel } from '../models/Grade';
import { AttendanceModel } from '../models/Attendance';
import { AnnouncementModel } from '../models/Announcement';
import { asyncHandler } from '../middleware/errorHandler';
import { createError } from '../middleware/errorHandler';

const router = Router();

router.use(authenticate, authorize(['admin']));

/** Lists all users without password hashes. */
router.get(
	'/users',
	asyncHandler(async (req: Request, res: Response) => {
		const {
			page = 1,
			limit = 10,
			sortBy = 'createdAt',
			sortOrder = 'desc',
			role,
			search,
		} = req.query as any;

		const filter: any = {};
		if (role) filter.role = role;
		if (search) {
			filter.$or = [
				{ fullName: { $regex: search, $options: 'i' } },
				{ email: { $regex: search, $options: 'i' } },
			];
		}

		const skip = (Number(page) - 1) * Number(limit);
		const sort: any = { [String(sortBy)]: sortOrder === 'desc' ? -1 : 1 };

		const [users, total] = await Promise.all([
			UserModel.find(filter, { passwordHash: 0 })
				.sort(sort)
				.skip(skip)
				.limit(Number(limit)),
			UserModel.countDocuments(filter),
		]);

		return res.json({
			users,
			pagination: {
				page: Number(page),
				limit: Number(limit),
				total,
				pages: Math.ceil(total / Number(limit)),
			},
		});
	})
);

/** Get system statistics */
router.get(
	'/stats',
	asyncHandler(async (_req: Request, res: Response) => {
		const [
			userStats,
			courseStats,
			gradeStats,
			attendanceStats,
			announcementStats,
		] = await Promise.all([
			// User statistics
			UserModel.aggregate([
				{
					$group: {
						_id: '$role',
						count: { $sum: 1 },
					},
				},
			]),
			// Course statistics
			CourseModel.aggregate([
				{
					$group: {
						_id: null,
						totalCourses: { $sum: 1 },
						activeCourses: {
							$sum: { $cond: ['$isActive', 1, 0] },
						},
						totalStudents: { $sum: { $size: '$students' } },
					},
				},
			]),
			// Grade statistics
			GradeModel.aggregate([
				{
					$group: {
						_id: null,
						totalGrades: { $sum: 1 },
						averageScore: { $avg: '$score' },
						averagePercentage: { $avg: '$percentage' },
					},
				},
			]),
			// Attendance statistics
			AttendanceModel.aggregate([
				{
					$group: {
						_id: '$status',
						count: { $sum: 1 },
					},
				},
			]),
			// Announcement statistics
			AnnouncementModel.aggregate([
				{
					$group: {
						_id: null,
						totalAnnouncements: { $sum: 1 },
						activeAnnouncements: {
							$sum: { $cond: ['$isActive', 1, 0] },
						},
					},
				},
			]),
		]);

		return res.json({
			users: userStats.reduce(
				(acc, stat) => ({ ...acc, [stat._id]: stat.count }),
				{}
			),
			courses: courseStats[0] || {
				totalCourses: 0,
				activeCourses: 0,
				totalStudents: 0,
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
			announcements: announcementStats[0] || {
				totalAnnouncements: 0,
				activeAnnouncements: 0,
			},
		});
	})
);

/** Get all courses with detailed information */
router.get(
	'/courses',
	asyncHandler(async (req: Request, res: Response) => {
		const {
			page = 1,
			limit = 10,
			sortBy = 'createdAt',
			sortOrder = 'desc',
			teacher,
			semester,
			academicYear,
			isActive,
			search,
		} = req.query as any;

		const filter: any = {};
		if (teacher) filter.teacher = teacher;
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
				.populate('teacher', 'fullName email')
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

/** Create user (admin only) */
router.post(
	'/users',
	asyncHandler(async (req: Request, res: Response) => {
		const { fullName, email, password, role = 'student' } = req.body;

		// Validate required fields
		if (!fullName || !email || !password) {
			throw createError('Full name, email, and password are required', 400);
		}

		// Validate role
		const validRoles = ['admin', 'teacher', 'student'];
		if (!validRoles.includes(role)) {
			throw createError('Invalid role', 400);
		}

		// Check if user already exists
		const existingUser = await UserModel.findOne({
			email: email.toLowerCase(),
		});
		if (existingUser) {
			throw createError('User with this email already exists', 409);
		}

		// Hash password
		const bcrypt = require('bcryptjs');
		const saltRounds = 10;
		const passwordHash = await bcrypt.hash(password, saltRounds);

		const user = new UserModel({
			fullName,
			email: email.toLowerCase(),
			passwordHash,
			role,
		});

		await user.save();

	// Return user without password hash
	const { passwordHash: _, ...userResponse } = user.toObject();

	return res.status(201).json(userResponse);
	})
);

/** Update user (admin only) */
router.put(
	'/users/:id',
	asyncHandler(async (req: Request, res: Response) => {
		const { id } = req.params;
		const { fullName, email, role } = req.body;

		const user = await UserModel.findById(id);
		if (!user) {
			throw createError('User not found', 404);
		}

		// Validate role if provided
		if (role && !['admin', 'teacher', 'student'].includes(role)) {
			throw createError('Invalid role', 400);
		}

		// Check if email is already taken by another user
		if (email && email.toLowerCase() !== user.email) {
			const existingUser = await UserModel.findOne({
				email: email.toLowerCase(),
			});
			if (existingUser) {
				throw createError('Email already taken by another user', 409);
			}
		}

		// Update user fields
		if (fullName) user.fullName = fullName;
		if (email) user.email = email.toLowerCase();
		if (role) user.role = role;

		await user.save();

	// Return user without password hash
	const { passwordHash: _, ...userResponse } = user.toObject();

	return res.json(userResponse);
	})
);

/** Delete user (admin only) */
router.delete(
	'/users/:id',
	asyncHandler(async (req: Request, res: Response) => {
		const { id } = req.params;

		const user = await UserModel.findByIdAndDelete(id);
		if (!user) {
			throw createError('User not found', 404);
		}

		return res.json({ message: 'User deleted successfully' });
	})
);

/** Get all grades with detailed information */
router.get(
	'/grades',
	asyncHandler(async (req: Request, res: Response) => {
		const {
			page = 1,
			limit = 10,
			sortBy = 'createdAt',
			sortOrder = 'desc',
			student,
			course,
			gradeType,
			search,
		} = req.query as any;

		const filter: any = {};
		if (student) filter.student = student;
		if (course) filter.course = course;
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
				.populate('course', 'title code')
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

/** Get attendance records with detailed information */
router.get(
	'/attendance',
	asyncHandler(async (req: Request, res: Response) => {
		const {
			page = 1,
			limit = 10,
			sortBy = 'date',
			sortOrder = 'desc',
			student,
			course,
			date,
			startDate,
			endDate,
			status,
		} = req.query as any;

		const filter: any = {};
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

/** Get all announcements */
router.get(
	'/announcements',
	asyncHandler(async (req: Request, res: Response) => {
		const {
			page = 1,
			limit = 10,
			sortBy = 'publishedAt',
			sortOrder = 'desc',
			type,
			course,
			author,
			targetAudience,
			isActive,
			search,
		} = req.query as any;

		const filter: any = {};
		if (type) filter.type = type;
		if (course) filter.course = course;
		if (author) filter.author = author;
		if (targetAudience) filter.targetAudience = targetAudience;
		if (isActive !== undefined) filter.isActive = isActive;
		if (search) {
			filter.$or = [
				{ title: { $regex: search, $options: 'i' } },
				{ content: { $regex: search, $options: 'i' } },
			];
		}

		const skip = (Number(page) - 1) * Number(limit);
		const sort: any = { [String(sortBy)]: sortOrder === 'desc' ? -1 : 1 };

		const [announcements, total] = await Promise.all([
			AnnouncementModel.find(filter)
				.populate('author', 'fullName email')
				.populate('course', 'title code')
				.sort(sort)
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

export default router;
