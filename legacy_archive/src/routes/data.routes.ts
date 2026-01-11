/**
 * Admin-only generic data explorer.
 * GET /api/v1/data/:collection
 * Supports pagination, sorting, and simple filtering.
 */
import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { validate, commonSchemas } from '../middleware/validation';
import { asyncHandler, createError } from '../middleware/errorHandler';
import Joi from 'joi';
import { UserModel } from '../models/User';
import { CourseModel } from '../models/Course';
import { GradeModel } from '../models/Grade';
import { AttendanceModel } from '../models/Attendance';
import { AnnouncementModel } from '../models/Announcement';

const router = Router();

router.use(authenticate, authorize(['admin']));

const collectionToModel: Record<string, any> = {
	users: UserModel,
	courses: CourseModel,
	grades: GradeModel,
	attendances: AttendanceModel,
	announcements: AnnouncementModel,
};

router.get(
	'/:collection',
	validate({
		params: Joi.object({
			collection: Joi.string()
				.valid('users', 'courses', 'grades', 'attendances', 'announcements')
				.required(),
		}),
		query: Joi.object({
			...commonSchemas.pagination,
			sortBy: Joi.string().default('createdAt'),
			sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
			search: Joi.string().optional(),
		}),
	}),
	asyncHandler(async (req: Request, res: Response) => {
		const { collection } = req.params as any;
		const {
			page = 1,
			limit = 10,
			sortBy = 'createdAt',
			sortOrder = 'desc',
			search,
		} = req.query as any;

		const Model = collectionToModel[collection];
		if (!Model) throw createError('Unknown collection', 400);

		const filter: any = {};
		if (search) {
			if (collection === 'users') {
				filter.$or = [
					{ fullName: { $regex: search, $options: 'i' } },
					{ email: { $regex: search, $options: 'i' } },
				];
			} else if (collection === 'courses') {
				filter.$or = [
					{ title: { $regex: search, $options: 'i' } },
					{ description: { $regex: search, $options: 'i' } },
					{ code: { $regex: search, $options: 'i' } },
				];
			} else if (collection === 'announcements') {
				filter.$or = [
					{ title: { $regex: search, $options: 'i' } },
					{ content: { $regex: search, $options: 'i' } },
				];
			}
		}

		const skip = (Number(page) - 1) * Number(limit);
		const sort: any = { [String(sortBy)]: sortOrder === 'desc' ? -1 : 1 };

		const [items, total] = await Promise.all([
			Model.find(filter).sort(sort).skip(skip).limit(Number(limit)),
			Model.countDocuments(filter),
		]);

		return res.json({
			items,
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
