/**
 * Grade Routes
 */
import { Router } from 'express';
import Joi from 'joi';
import { validate } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import {
	createGrade,
	getGrades,
	getGrade,
	updateGrade,
	deleteGrade,
} from '../controllers/grade.controller';

export const gradeRouter = Router();

const createGradeSchema = Joi.object({
	student: Joi.string().required(),
	course: Joi.string().required(),
	gradeType: Joi.string()
		.valid('assignment', 'quiz', 'exam', 'project', 'participation', 'final')
		.required(),
	title: Joi.string().required(),
	score: Joi.number().min(0).required(),
	maxScore: Joi.number().min(1).required(),
	comments: Joi.string().optional(),
});

const updateGradeSchema = Joi.object({
	score: Joi.number().min(0).optional(),
	maxScore: Joi.number().min(1).optional(),
	comments: Joi.string().optional(),
});

gradeRouter.post(
	'/',
	validate({ body: createGradeSchema }),
	asyncHandler(createGrade)
);
gradeRouter.get('/', asyncHandler(getGrades));
gradeRouter.get('/:id', asyncHandler(getGrade));
gradeRouter.put(
	'/:id',
	validate({ body: updateGradeSchema }),
	asyncHandler(updateGrade)
);
gradeRouter.delete('/:id', asyncHandler(deleteGrade));

export default gradeRouter;

