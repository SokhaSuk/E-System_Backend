/**
 * Authentication routes.
 *
 * - POST /auth/register: Register a new user
 * - POST /auth/login: Log a user in and return a JWT
 */
import { Router } from 'express';
import Joi from 'joi';
import { validate } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticate } from '../middleware/auth';
import { login, profile, register } from '../controllers/auth.controller';

const router = Router();

/**
 * Registers a new user account.
 * Body: { fullName, email, password, role?, adminCode? }
 */

// Validation schemas
const registerSchema = Joi.object({
	fullName: Joi.string().min(2).required(),
	email: Joi.string().email().required(),
	password: Joi.string().min(6).required(),
	role: Joi.string().valid('admin', 'teacher', 'student').optional(),
	adminCode: Joi.string().optional(),
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
});

const loginSchema = Joi.object({
	email: Joi.string().email().required(),
	password: Joi.string().min(6).required(),
});

// Routes under /api/auth in server.ts
router.post(
	'/register',
	validate({ body: registerSchema }),
	asyncHandler(register)
);
router.post('/login', validate({ body: loginSchema }), asyncHandler(login));
router.get('/profile', authenticate, asyncHandler(profile));

/**
 * Authenticates an existing user and returns a signed JWT.
 * Body: { email, password }
 */
// Note: actual controller handlers are defined in controllers/auth.controller.ts

export default router;
