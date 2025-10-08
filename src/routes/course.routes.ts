/**
 * Course management routes.
 */
import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { validate, commonSchemas } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import {
	listCourses,
	getCourse,
	createCourse,
	updateCourse,
	enrollStudent,
	removeStudent,
	deleteCourse,
} from '../controllers/course.controller';
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
		academicYear: Joi.string().required(),
	}),
};

const updateCourseSchema = {
	body: Joi.object({
		title: Joi.string().min(3).max(100),
		description: Joi.string().min(10),
		code: Joi.string().min(2).max(10).uppercase(),
		credits: Joi.number().integer().min(1).max(6),
		semester: Joi.string().valid('Fall', 'Spring', 'Summer'),
		academicYear: Joi.string(),
		isActive: Joi.boolean(),
	}),
};

const enrollStudentSchema = {
	body: Joi.object({
		studentId: commonSchemas.objectId,
	}),
};

// Get all courses (with pagination and filtering)
router.get(
	'/',
	authenticate,
	validate({
		query: Joi.object({
			...commonSchemas.pagination,
			teacher: commonSchemas.objectId.optional(),
			semester: Joi.string().valid('Fall', 'Spring', 'Summer').optional(),
			academicYear: Joi.string().optional(),
			isActive: Joi.boolean().optional(),
			search: Joi.string().optional(),
		}),
	}),
	asyncHandler(listCourses)
);

// Get course by ID
router.get(
	'/:id',
	authenticate,
	validate({
		params: Joi.object({
			id: commonSchemas.objectId,
		}),
	}),
	asyncHandler(getCourse)
);

// Create new course (teachers and admins only)
router.post(
	'/',
	authenticate,
	authorize(['teacher', 'admin']),
	validate(createCourseSchema),
	asyncHandler(createCourse)
);

// Update course (teacher who created it or admin)
router.put(
	'/:id',
	authenticate,
	authorize(['teacher', 'admin']),
	validate(updateCourseSchema),
	asyncHandler(updateCourse)
);

// Enroll student in course
router.post(
	'/:id/enroll',
	authenticate,
	authorize(['teacher', 'admin']),
	validate(enrollStudentSchema),
	asyncHandler(enrollStudent)
);

// Remove student from course
router.delete(
	'/:id/enroll/:studentId',
	authenticate,
	authorize(['teacher', 'admin']),
	validate({
		params: Joi.object({
			id: commonSchemas.objectId,
			studentId: commonSchemas.objectId,
		}),
	}),
	asyncHandler(removeStudent)
);

// Delete course (admin only)
router.delete(
	'/:id',
	authenticate,
	authorize(['admin']),
	validate({
		params: Joi.object({
			id: commonSchemas.objectId,
		}),
	}),
	asyncHandler(deleteCourse)
);

export default router;
