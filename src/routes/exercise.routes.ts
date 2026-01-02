/**
 * Exercise management routes.
 */
import { Router } from 'express';
import * as exerciseController from '../controllers/exercise.controller';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { validate, commonSchemas } from '../middleware/validation';
import { exerciseUpload, submissionUpload } from '../utils/upload';
import Joi from 'joi';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Exercise CRUD routes
router.get(
    '/',
    validate({
        query: Joi.object({
            ...commonSchemas.pagination,
            course: commonSchemas.objectId.optional(),
            createdBy: commonSchemas.objectId.optional(),
            isActive: Joi.boolean().optional(),
            search: Joi.string().optional(),
        }),
    }),
    asyncHandler(exerciseController.listExercises)
);

router.post(
    '/',
    validate({
        body: Joi.object({
            course: commonSchemas.objectId,
            title: Joi.string().min(3).required(),
            description: Joi.string().required(),
            instructions: Joi.string().optional().allow(''),
            dueDate: Joi.date().iso().required(),
            maxScore: Joi.number().min(1).max(100).optional(),
        }),
    }),
    asyncHandler(exerciseController.createExercise)
);

router.get(
    '/:id',
    validate({ params: Joi.object({ id: commonSchemas.objectId }) }),
    asyncHandler(exerciseController.getExercise)
);

router.put(
    '/:id',
    validate({
        params: Joi.object({ id: commonSchemas.objectId }),
        body: Joi.object({
            title: Joi.string().min(3).optional(),
            description: Joi.string().optional(),
            instructions: Joi.string().optional().allow(''),
            dueDate: Joi.date().iso().optional(),
            maxScore: Joi.number().min(1).max(100).optional(),
            isActive: Joi.boolean().optional(),
        }),
    }),
    asyncHandler(exerciseController.updateExercise)
);

router.delete(
    '/:id',
    validate({ params: Joi.object({ id: commonSchemas.objectId }) }),
    asyncHandler(exerciseController.deleteExercise)
);

// File upload for exercise attachments
router.post(
    '/:id/upload-attachment',
    validate({ params: Joi.object({ id: commonSchemas.objectId }) }),
    exerciseUpload,
    asyncHandler(exerciseController.uploadAttachment)
);

// Submission routes
router.post(
    '/:id/submit',
    validate({
        params: Joi.object({ id: commonSchemas.objectId }),
        body: Joi.object({
            submittedText: Joi.string().optional().allow(''),
        }),
    }),
    submissionUpload,
    asyncHandler(exerciseController.submitExercise)
);

router.get(
    '/:id/submissions',
    validate({ params: Joi.object({ id: commonSchemas.objectId }) }),
    asyncHandler(exerciseController.getSubmissions)
);

router.get(
    '/:id/my-submission',
    validate({ params: Joi.object({ id: commonSchemas.objectId }) }),
    asyncHandler(exerciseController.getMySubmission)
);

router.put(
    '/:exerciseId/submissions/:submissionId/grade',
    validate({
        params: Joi.object({
            exerciseId: commonSchemas.objectId,
            submissionId: commonSchemas.objectId,
        }),
        body: Joi.object({
            score: Joi.number().min(0).required(),
            feedback: Joi.string().optional().allow(''),
        }),
    }),
    asyncHandler(exerciseController.gradeSubmission)
);

export default router;
