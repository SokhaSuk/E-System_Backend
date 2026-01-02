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
			nameKh: Joi.string().optional().allow(''),
			gender: Joi.string().optional().allow(''),
			dateOfBirth: Joi.date().optional(),
			placeOfBirth: Joi.string().optional().allow(''),
			phone: Joi.string().optional().allow(''),
			occupation: Joi.string().optional().allow(''),
			address: Joi.string().optional().allow(''),
			studyShift: Joi.string().optional().allow(''),
			avatar: Joi.string().optional().allow(''),
			nationality: Joi.string().optional().allow(''),
			studentId: Joi.string().optional().allow(''),
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
			nameKh: Joi.string().optional().allow(''),
			gender: Joi.string().optional().allow(''),
			dateOfBirth: Joi.date().optional(),
			placeOfBirth: Joi.string().optional().allow(''),
			phone: Joi.string().optional().allow(''),
			occupation: Joi.string().optional().allow(''),
			address: Joi.string().optional().allow(''),
			studyShift: Joi.string().optional().allow(''),
			avatar: Joi.string().optional().allow(''),
			nationality: Joi.string().optional().allow(''),
			studentId: Joi.string().optional().allow(''),
		}),
	}),
	asyncHandler(userController.updateUser)
);
router.delete(
	'/:id',
	validate({ params: Joi.object({ id: commonSchemas.objectId }) }),
	asyncHandler(userController.deleteUser)
);
router.put(
	'/:id/change_password',
	validate({
		params: Joi.object({ id: commonSchemas.objectId }),
		body: Joi.object({
			currentPassword: Joi.string().optional(),
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
			nameKh: Joi.string().optional().allow(''),
			gender: Joi.string().optional().allow(''),
			dateOfBirth: Joi.date().optional(),
			placeOfBirth: Joi.string().optional().allow(''),
			phone: Joi.string().optional().allow(''),
			occupation: Joi.string().optional().allow(''),
			address: Joi.string().optional().allow(''),
			studyShift: Joi.string().optional().allow(''),
			avatar: Joi.string().optional().allow(''),
			nationality: Joi.string().optional().allow(''),
			studentId: Joi.string().optional().allow(''),
		}),
	}),
	asyncHandler(userController.updateUserProfile)
);
router.put(
	'/profile/me/change-password',
	validate({
		body: Joi.object({
			currentPassword: Joi.string().required(),
			newPassword: commonSchemas.password,
		}),
	}),
	asyncHandler(userController.changeUserProfilePassword)
);

export default router;
