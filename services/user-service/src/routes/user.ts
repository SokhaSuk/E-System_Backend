/**
 * User Routes
 */
import { Router } from 'express';
import Joi from 'joi';
import { validate } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import {
	listUsers,
	getUser,
	createUser,
	updateUser,
	changePassword,
	deleteUser,
	getUserProfile,
	updateUserProfile,
} from '../controllers/user.controller';

export const userRouter = Router();

const objectIdSchema = Joi.string().regex(/^[0-9a-fA-F]{24}$/);

userRouter.get(
	'/',
	validate({
		query: Joi.object({
			page: Joi.number().integer().min(1).optional(),
			limit: Joi.number().integer().min(1).max(100).optional(),
			sortBy: Joi.string().optional(),
			sortOrder: Joi.string().valid('asc', 'desc').optional(),
			role: Joi.string().valid('admin', 'teacher', 'student').optional(),
			search: Joi.string().optional(),
		}),
	}),
	asyncHandler(listUsers)
);

userRouter.post(
	'/',
	validate({
		body: Joi.object({
			fullName: Joi.string().min(2).required(),
			email: Joi.string().email().required(),
			password: Joi.string().min(6).required(),
			role: Joi.string().valid('admin', 'teacher', 'student').optional(),
		}),
	}),
	asyncHandler(createUser)
);

userRouter.get(
	'/:id',
	validate({ params: Joi.object({ id: objectIdSchema }) }),
	asyncHandler(getUser)
);

userRouter.put(
	'/:id',
	validate({
		params: Joi.object({ id: objectIdSchema }),
		body: Joi.object({
			fullName: Joi.string().min(2).optional(),
			email: Joi.string().email().optional(),
			role: Joi.string().valid('admin', 'teacher', 'student').optional(),
		}),
	}),
	asyncHandler(updateUser)
);

userRouter.delete(
	'/:id',
	validate({ params: Joi.object({ id: objectIdSchema }) }),
	asyncHandler(deleteUser)
);

userRouter.post(
	'/:id/change-password',
	validate({
		params: Joi.object({ id: objectIdSchema }),
		body: Joi.object({
			currentPassword: Joi.string().min(6).optional(),
			newPassword: Joi.string().min(6).required(),
		}),
	}),
	asyncHandler(changePassword)
);

userRouter.get('/profile/me', asyncHandler(getUserProfile));
userRouter.put(
	'/profile/me',
	validate({
		body: Joi.object({
			fullName: Joi.string().min(2).optional(),
			email: Joi.string().email().optional(),
		}),
	}),
	asyncHandler(updateUserProfile)
);

export default userRouter;

