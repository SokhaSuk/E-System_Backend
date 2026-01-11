/**
 * Grade management routes for school system.
 */
import { Router } from 'express';
// Update the import path if the file is named differently or located elsewhere
import * as gradeController from '../controllers/grade.controller';
// If the file is missing, create '../controllers/grade.controller.ts' with the required exports
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { validate, commonSchemas } from '../middleware/validation';
import Joi from 'joi';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Grade management routes
router.get(
	'/',
	validate({
		query: Joi.object({
			...commonSchemas.pagination,
			student: commonSchemas.objectId.optional(),
			course: commonSchemas.objectId.optional(),
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
			search: Joi.string().optional(),
		}),
	}),
	asyncHandler(gradeController.listGrades)
);

router.post(
	'/',
	authorize(['teacher', 'admin']),
	validate({
		body: Joi.object({
			studentId: commonSchemas.objectId,
			courseId: commonSchemas.objectId,
			gradeType: Joi.string()
				.valid(
					'assignment',
					'quiz',
					'exam',
					'project',
					'participation',
					'final'
				)
				.required(),
			title: Joi.string().min(1).required(),
			score: Joi.number().min(0).max(Joi.ref('maxScore')).required(),
			maxScore: Joi.number().min(1).required(),
			comments: Joi.string().allow('').optional(),
			submittedAt: Joi.date().optional(),
		}),
	}),
	asyncHandler(gradeController.createGrade)
);

router.get(
	'/:id',
	validate({ params: Joi.object({ id: commonSchemas.objectId }) }),
	asyncHandler(gradeController.getGrade)
);

router.put(
	'/:id',
	authorize(['teacher', 'admin']),
	validate({
		params: Joi.object({ id: commonSchemas.objectId }),
		body: Joi.object({
			title: Joi.string().min(1).optional(),
			score: Joi.number().min(0).optional(),
			maxScore: Joi.number().min(1).optional(),
			comments: Joi.string().allow('').optional(),
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
			submittedAt: Joi.date().optional(),
		})
			.custom((value, helpers) => {
			if (
				value.score !== undefined &&
				value.maxScore !== undefined &&
				Number(value.score) > Number(value.maxScore)
			) {
				return helpers.error('any.custom');
			}
			return value;
			})
			.messages({
				'any.custom': '"score" must be less than or equal to "maxScore"',
			}),
	}),
	asyncHandler(gradeController.updateGrade)
);

router.delete(
	'/:id',
	authorize(['teacher', 'admin']),
	validate({ params: Joi.object({ id: commonSchemas.objectId }) }),
	asyncHandler(gradeController.deleteGrade)
);

// Student-specific routes
router.get(
	'/student/:studentId',
	validate({ params: Joi.object({ studentId: commonSchemas.objectId }) }),
	asyncHandler(gradeController.getStudentGrades)
);
router.get(
	'/student/:studentId/gpa',
	validate({ params: Joi.object({ studentId: commonSchemas.objectId }) }),
	asyncHandler(gradeController.calculateStudentGPA)
);

// Course-specific routes
router.get(
	'/course/:courseId',
	validate({ params: Joi.object({ courseId: commonSchemas.objectId }) }),
	asyncHandler(gradeController.getCourseGrades)
);

export default router;
