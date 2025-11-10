/**
 * Course Routes
 */
import { Router } from 'express';
import Joi from 'joi';
import { validate } from '../middleware/validation';
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

export const courseRouter = Router();

const objectIdSchema = Joi.string().regex(/^[0-9a-fA-F]{24}$/);

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
		title: Joi.string().min(3).max(100).optional(),
		description: Joi.string().min(10).optional(),
		code: Joi.string().min(2).max(10).uppercase().optional(),
		credits: Joi.number().integer().min(1).max(6).optional(),
		semester: Joi.string().valid('Fall', 'Spring', 'Summer').optional(),
		academicYear: Joi.string().optional(),
		isActive: Joi.boolean().optional(),
	}),
};

const enrollStudentSchema = {
	body: Joi.object({
		studentId: objectIdSchema,
	}),
};

courseRouter.get(
	'/',
	validate({
		query: Joi.object({
			page: Joi.number().integer().min(1).optional(),
			limit: Joi.number().integer().min(1).max(100).optional(),
			teacher: objectIdSchema.optional(),
			semester: Joi.string().valid('Fall', 'Spring', 'Summer').optional(),
			academicYear: Joi.string().optional(),
			isActive: Joi.boolean().optional(),
			search: Joi.string().optional(),
		}),
	}),
	asyncHandler(listCourses)
);

courseRouter.get(
	'/:id',
	validate({
		params: Joi.object({
			id: objectIdSchema,
		}),
	}),
	asyncHandler(getCourse)
);

courseRouter.post(
	'/',
	validate(createCourseSchema),
	asyncHandler(createCourse)
);

courseRouter.put(
	'/:id',
	validate(updateCourseSchema),
	asyncHandler(updateCourse)
);

courseRouter.post(
	'/:id/enroll',
	validate(enrollStudentSchema),
	asyncHandler(enrollStudent)
);

courseRouter.delete(
	'/:id/enroll/:studentId',
	validate({
		params: Joi.object({
			id: objectIdSchema,
			studentId: objectIdSchema,
		}),
	}),
	asyncHandler(removeStudent)
);

courseRouter.delete(
	'/:id',
	validate({
		params: Joi.object({
			id: objectIdSchema,
		}),
	}),
	asyncHandler(deleteCourse)
);

export default courseRouter;

