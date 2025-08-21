/**
 * Course management routes.
 */
import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { validate, commonSchemas } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { CourseModel } from '../models/Course';
import { UserModel } from '../models/User';
import Joi from 'joi';

const router = Router();

// Validation schemas
const createCourseSchema = {
	body: Joi.object({
		title: Joi.string().required().min(3).max(100),
		description: Joi.string().required().min(10),
		code: Joi.string().required().min(2).max(10).uppercase(),
		credits: Joi.number().integer().min(1).max(6).required(),
		semester: Joi.string().valid('Fall', 'Spring', 'Summer').required(),
		academicYear: Joi.string().required()
	})
};

const updateCourseSchema = {
	body: Joi.object({
		title: Joi.string().min(3).max(100),
		description: Joi.string().min(10),
		code: Joi.string().min(2).max(10).uppercase(),
		credits: Joi.number().integer().min(1).max(6),
		semester: Joi.string().valid('Fall', 'Spring', 'Summer'),
		academicYear: Joi.string(),
		isActive: Joi.boolean()
	})
};

const enrollStudentSchema = {
	body: Joi.object({
		studentId: commonSchemas.objectId
	})
};

// Get all courses (with pagination and filtering)
router.get('/', 
	authenticate,
	validate({
		query: Joi.object({
			...commonSchemas.pagination,
			teacher: commonSchemas.objectId.optional(),
			semester: Joi.string().valid('Fall', 'Spring', 'Summer').optional(),
			academicYear: Joi.string().optional(),
			isActive: Joi.boolean().optional(),
			search: Joi.string().optional()
		})
	}),
	asyncHandler(async (req, res) => {
		const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', teacher, semester, academicYear, isActive, search } = req.query;
		
		const filter: any = {};
		if (teacher) filter.teacher = teacher;
		if (semester) filter.semester = semester;
		if (academicYear) filter.academicYear = academicYear;
		if (isActive !== undefined) filter.isActive = isActive;
		if (search) {
			filter.$or = [
				{ title: { $regex: search, $options: 'i' } },
				{ description: { $regex: search, $options: 'i' } },
				{ code: { $regex: search, $options: 'i' } }
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
			CourseModel.countDocuments(filter)
		]);

		res.json({
			courses,
			pagination: {
				page: Number(page),
				limit: Number(limit),
				total,
				pages: Math.ceil(total / Number(limit))
			}
		});
	})
);

// Get course by ID
router.get('/:id',
	authenticate,
	validate({
		params: Joi.object({
			id: commonSchemas.objectId
		})
	}),
	asyncHandler(async (req, res) => {
		const course = await CourseModel.findById(req.params.id)
			.populate('teacher', 'fullName email')
			.populate('students', 'fullName email');

		if (!course) {
			return res.status(404).json({ message: 'Course not found' });
		}

		res.json(course);
	})
);

// Create new course (teachers and admins only)
router.post('/',
	authenticate,
	authorize(['teacher', 'admin']),
	validate(createCourseSchema),
	asyncHandler(async (req, res) => {
		const { title, description, code, credits, semester, academicYear } = req.body;
		
		// Check if course code already exists
		const existingCourse = await CourseModel.findOne({ code });
		if (existingCourse) {
			return res.status(409).json({ message: 'Course code already exists' });
		}

		const course = new CourseModel({
			title,
			description,
			code,
			credits,
			teacher: req.user._id,
			semester,
			academicYear
		});

		await course.save();
		await course.populate('teacher', 'fullName email');

		res.status(201).json(course);
	})
);

// Update course (teacher who created it or admin)
router.put('/:id',
	authenticate,
	authorize(['teacher', 'admin']),
	validate(updateCourseSchema),
	asyncHandler(async (req, res) => {
		const course = await CourseModel.findById(req.params.id);
		
		if (!course) {
			return res.status(404).json({ message: 'Course not found' });
		}

		// Check if user is the teacher or admin
		if (req.user.role !== 'admin' && course.teacher.toString() !== req.user._id.toString()) {
			return res.status(403).json({ message: 'Not authorized to update this course' });
		}

		Object.assign(course, req.body);
		await course.save();
		await course.populate('teacher', 'fullName email');

		res.json(course);
	})
);

// Enroll student in course
router.post('/:id/enroll',
	authenticate,
	authorize(['teacher', 'admin']),
	validate(enrollStudentSchema),
	asyncHandler(async (req, res) => {
		const { studentId } = req.body;
		const course = await CourseModel.findById(req.params.id);
		
		if (!course) {
			return res.status(404).json({ message: 'Course not found' });
		}

		// Check if user is the teacher or admin
		if (req.user.role !== 'admin' && course.teacher.toString() !== req.user._id.toString()) {
			return res.status(403).json({ message: 'Not authorized to enroll students in this course' });
		}

		// Check if student exists and is actually a student
		const student = await UserModel.findById(studentId);
		if (!student || student.role !== 'student') {
			return res.status(400).json({ message: 'Invalid student ID' });
		}

		// Check if student is already enrolled
		if (course.students.includes(studentId)) {
			return res.status(409).json({ message: 'Student is already enrolled in this course' });
		}

		course.students.push(studentId);
		await course.save();
		await course.populate('students', 'fullName email');

		res.json(course);
	})
);

// Remove student from course
router.delete('/:id/enroll/:studentId',
	authenticate,
	authorize(['teacher', 'admin']),
	validate({
		params: Joi.object({
			id: commonSchemas.objectId,
			studentId: commonSchemas.objectId
		})
	}),
	asyncHandler(async (req, res) => {
		const course = await CourseModel.findById(req.params.id);
		
		if (!course) {
			return res.status(404).json({ message: 'Course not found' });
		}

		// Check if user is the teacher or admin
		if (req.user.role !== 'admin' && course.teacher.toString() !== req.user._id.toString()) {
			return res.status(403).json({ message: 'Not authorized to remove students from this course' });
		}

		course.students = course.students.filter(id => id.toString() !== req.params.studentId);
		await course.save();
		await course.populate('students', 'fullName email');

		res.json(course);
	})
);

// Delete course (admin only)
router.delete('/:id',
	authenticate,
	authorize(['admin']),
	validate({
		params: Joi.object({
			id: commonSchemas.objectId
		})
	}),
	asyncHandler(async (req, res) => {
		const course = await CourseModel.findByIdAndDelete(req.params.id);
		
		if (!course) {
			return res.status(404).json({ message: 'Course not found' });
		}

		res.json({ message: 'Course deleted successfully' });
	})
);

export default router;
