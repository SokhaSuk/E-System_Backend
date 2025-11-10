/**
 * Authentication routes
 */
import { Router } from 'express';
import Joi from 'joi';
import { validate } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { login, profile, register } from '../controllers/auth.controller';

export const authRouter = Router();

const registerSchema = Joi.object({
	fullName: Joi.string().min(2).required(),
	email: Joi.string().email().required(),
	password: Joi.string().min(6).required(),
	role: Joi.string().valid('admin', 'teacher', 'student').optional(),
	adminCode: Joi.string().optional(),
});

const loginSchema = Joi.object({
	email: Joi.string().email().required(),
	password: Joi.string().min(6).required(),
});

authRouter.post(
	'/register',
	validate({ body: registerSchema }),
	asyncHandler(register)
);
authRouter.post('/login', validate({ body: loginSchema }), asyncHandler(login));
authRouter.get('/profile', asyncHandler(profile));

export default authRouter;

