/**
 * ScoreRecord routes for managing student semester scores.
 */
import { Router } from 'express';
import * as scoreRecordController from '../controllers/scorerecord.controller';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { validate, commonSchemas } from '../middleware/validation';
import Joi from 'joi';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Semester validation schema
const semesterSchema = Joi.object({
    name: Joi.string().required(),
    attendance: Joi.number().min(0).max(100).default(0),
    assignment: Joi.number().min(0).max(100).default(0),
    midterm: Joi.number().min(0).max(100).default(0),
    final: Joi.number().min(0).max(100).default(0),
});

// Get all score records with pagination and filters
router.get(
    '/',
    validate({
        query: Joi.object({
            ...commonSchemas.pagination,
            student: commonSchemas.objectId.optional(),
            course: commonSchemas.objectId.optional(),
        }),
    }),
    asyncHandler(scoreRecordController.getAllScoreRecords)
);

// Create a new score record
router.post(
    '/',
    authorize(['teacher', 'admin']),
    validate({
        body: Joi.object({
            student: commonSchemas.objectId.required(),
            course: commonSchemas.objectId.required(),
            semesters: Joi.array().items(semesterSchema).optional(),
        }),
    }),
    asyncHandler(scoreRecordController.createScoreRecord)
);

// Get a specific score record by ID
router.get(
    '/:id',
    validate({
        params: Joi.object({
            id: commonSchemas.objectId,
        }),
    }),
    asyncHandler(scoreRecordController.getScoreRecordById)
);

// Update a score record
router.put(
    '/:id',
    authorize(['teacher', 'admin']),
    validate({
        params: Joi.object({
            id: commonSchemas.objectId,
        }),
        body: Joi.object({
            student: commonSchemas.objectId.optional(),
            course: commonSchemas.objectId.optional(),
            semesters: Joi.array().items(semesterSchema).optional(),
        }),
    }),
    asyncHandler(scoreRecordController.updateScoreRecord)
);

// Delete a score record
router.delete(
    '/:id',
    authorize(['teacher', 'admin']),
    validate({
        params: Joi.object({
            id: commonSchemas.objectId,
        }),
    }),
    asyncHandler(scoreRecordController.deleteScoreRecord)
);

// Add a semester to a score record
router.post(
    '/:id/semesters',
    authorize(['teacher', 'admin']),
    validate({
        params: Joi.object({
            id: commonSchemas.objectId,
        }),
        body: semesterSchema,
    }),
    asyncHandler(scoreRecordController.addSemester)
);

// Update a specific semester
router.put(
    '/:id/semesters/:semesterId',
    authorize(['teacher', 'admin']),
    validate({
        params: Joi.object({
            id: commonSchemas.objectId,
            semesterId: commonSchemas.objectId,
        }),
        body: Joi.object({
            name: Joi.string().optional(),
            attendance: Joi.number().min(0).max(100).optional(),
            assignment: Joi.number().min(0).max(100).optional(),
            midterm: Joi.number().min(0).max(100).optional(),
            final: Joi.number().min(0).max(100).optional(),
        }),
    }),
    asyncHandler(scoreRecordController.updateSemester)
);

// Delete a specific semester
router.delete(
    '/:id/semesters/:semesterId',
    authorize(['teacher', 'admin']),
    validate({
        params: Joi.object({
            id: commonSchemas.objectId,
            semesterId: commonSchemas.objectId,
        }),
    }),
    asyncHandler(scoreRecordController.deleteSemester)
);

export default router;
