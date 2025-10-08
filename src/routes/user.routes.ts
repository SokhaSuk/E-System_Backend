/**
 * User management routes for school system.
 */
import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { validate, commonSchemas } from '../middleware/validation';
import Joi from 'joi';

const router = Router();

// All routes require authentication
router.use(authenticate);

// User management routes (admin only)
router.get(
	'/',
	validate({
		query: Joi.object({
			...commonSchemas.pagination,
			role: Joi.string().valid('admin', 'teacher', 'student').optional(),
			search: Joi.string().optional(),
		}),
	}),
	asyncHandler(userController.listUsers)
);
router.post(
	'/',
	validate({
		body: Joi.object({
			fullName: Joi.string().min(2).required(),
			email: commonSchemas.email,
			password: commonSchemas.password,
			role: Joi.string().valid('admin', 'teacher', 'student').optional(),
		}),
	}),
	asyncHandler(userController.createUser)
);
router.get(
	'/:id',
	validate({ params: Joi.object({ id: commonSchemas.objectId }) }),
	asyncHandler(userController.getUser)
);
router.put(
	'/:id',
	validate({
		params: Joi.object({ id: commonSchemas.objectId }),
		body: Joi.object({
			fullName: Joi.string().min(2).optional(),
			email: commonSchemas.email.optional(),
			role: Joi.string().valid('admin', 'teacher', 'student').optional(),
		}),
	}),
	asyncHandler(userController.updateUser)
);
router.delete(
	'/:id',
	validate({ params: Joi.object({ id: commonSchemas.objectId }) }),
	asyncHandler(userController.deleteUser)
);
router.post(
	'/:id/change-password',
	validate({
		params: Joi.object({ id: commonSchemas.objectId }),
		body: Joi.object({
			currentPassword: Joi.string().min(6).optional(),
			newPassword: commonSchemas.password,
		}),
	}),
	asyncHandler(userController.changePassword)
);

// Profile routes (for current user)
router.get('/profile/me', asyncHandler(userController.getUserProfile));
router.put(
	'/profile/me',
	validate({
		body: Joi.object({
			fullName: Joi.string().min(2).optional(),
			email: commonSchemas.email.optional(),
		}),
	}),
	asyncHandler(userController.updateUserProfile)
);

export default router;
