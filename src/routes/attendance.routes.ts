/**
 * Attendance management routes.
 */
import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { validate, commonSchemas } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import {
	listAttendance,
	getAttendance,
	recordAttendance,
	recordBulkAttendance,
	updateAttendance,
	deleteAttendance,
	attendanceStats,
} from '../controllers/attendance.controller';
import Joi from 'joi';

const router = Router();

// Validation schemas
const recordAttendanceSchema = {
	body: Joi.object({
		studentId: commonSchemas.objectId,
		courseId: commonSchemas.objectId,
		date: Joi.date().required(),
		status: Joi.string()
			.valid('present', 'absent', 'late', 'excused')
			.required(),
		notes: Joi.string().optional(),
	}),
};

const bulkAttendanceSchema = {
	body: Joi.object({
		courseId: commonSchemas.objectId,
		date: Joi.date().required(),
		attendance: Joi.array()
			.items(
				Joi.object({
					studentId: commonSchemas.objectId,
					status: Joi.string()
						.valid('present', 'absent', 'late', 'excused')
						.required(),
					notes: Joi.string().optional(),
				})
			)
			.required(),
	}),
};

// Get attendance records (with filtering)
router.get(
	'/',
	authenticate,
	validate({
		query: Joi.object({
			...commonSchemas.pagination,
			student: commonSchemas.objectId.optional(),
			course: commonSchemas.objectId.optional(),
			date: Joi.date().optional(),
			startDate: Joi.date().optional(),
			endDate: Joi.date().optional(),
			status: Joi.string()
				.valid('present', 'absent', 'late', 'excused')
				.optional(),
		}),
	}),
	asyncHandler(listAttendance)
);

// Get attendance by ID
router.get(
	'/:id',
	authenticate,
	validate({
		params: Joi.object({
			id: commonSchemas.objectId,
		}),
	}),
	asyncHandler(getAttendance)
);

// Record single attendance
router.post(
	'/',
	authenticate,
	authorize(['teacher', 'admin']),
	validate(recordAttendanceSchema),
	asyncHandler(recordAttendance)
);

// Record bulk attendance
router.post(
	'/bulk',
	authenticate,
	authorize(['teacher', 'admin']),
	validate(bulkAttendanceSchema),
	asyncHandler(recordBulkAttendance)
);

// Update attendance record
router.put(
	'/:id',
	authenticate,
	authorize(['teacher', 'admin']),
	validate({
		body: Joi.object({
			status: Joi.string()
				.valid('present', 'absent', 'late', 'excused')
				.required(),
			notes: Joi.string().optional(),
		}),
	}),
	asyncHandler(updateAttendance)
);

// Delete attendance record
router.delete(
	'/:id',
	authenticate,
	authorize(['teacher', 'admin']),
	validate({
		params: Joi.object({
			id: commonSchemas.objectId,
		}),
	}),
	asyncHandler(deleteAttendance)
);

// Get attendance statistics
router.get(
	'/stats/:courseId',
	authenticate,
	authorize(['teacher', 'admin']),
	validate({
		params: Joi.object({
			courseId: commonSchemas.objectId,
		}),
		query: Joi.object({
			startDate: Joi.date().optional(),
			endDate: Joi.date().optional(),
		}),
	}),
	asyncHandler(attendanceStats)
);

export default router;
