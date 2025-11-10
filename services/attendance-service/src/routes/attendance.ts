import { Router } from 'express';
import Joi from 'joi';
import { validate } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { recordAttendance, recordBulkAttendance, listAttendance, getAttendance, attendanceStats } from '../controllers/attendance.controller';

export const attendanceRouter = Router();
const objectIdSchema = Joi.string().regex(/^[0-9a-fA-F]{24}$/);

attendanceRouter.post(
	'/',
	validate({
		body: Joi.object({
			studentId: objectIdSchema.required(),
			courseId: objectIdSchema.required(),
			date: Joi.date().required(),
			status: Joi.string().valid('present', 'absent', 'late', 'permission').required(),
			notes: Joi.string().optional(),
		}),
	}),
	asyncHandler(recordAttendance)
);

attendanceRouter.post(
	'/bulk',
	validate({
		body: Joi.object({
			courseId: objectIdSchema.required(),
			date: Joi.date().required(),
			attendance: Joi.array().items(
				Joi.object({
					studentId: objectIdSchema.required(),
					status: Joi.string().valid('present', 'absent', 'late', 'permission').required(),
					notes: Joi.string().optional(),
				})
			).required(),
		}),
	}),
	asyncHandler(recordBulkAttendance)
);

attendanceRouter.get('/', asyncHandler(listAttendance));
attendanceRouter.get('/:id', asyncHandler(getAttendance));
attendanceRouter.get('/stats/:courseId', asyncHandler(attendanceStats));

export default attendanceRouter;

