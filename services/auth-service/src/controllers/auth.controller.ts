/**
 * Authentication controllers
 */
import { Request, Response } from 'express';
import { UserModel } from '../models/User';
import { hashPassword, verifyPassword } from '../utils/password';
import { env } from '../config/env';
import { signAuthToken } from '../services/auth.service';
import { createError } from '../middleware/errorHandler';

function signToken(payload: {
	userId: string;
	email: string;
	role: 'admin' | 'teacher' | 'student';
}) {
	return signAuthToken(payload);
}

/** POST /api/v1/auth/register */
export async function register(req: Request, res: Response) {
	const { fullName, email, password, role, adminCode } = req.body as {
		fullName: string;
		email: string;
		password: string;
		role?: 'admin' | 'teacher' | 'student';
		adminCode?: string;
	};

	const existing = await UserModel.findOne({ email });
	if (existing) {
		throw createError('Email already in use', 409);
	}

	const finalRole: 'admin' | 'teacher' | 'student' = role || 'student';
	if (finalRole === 'admin') {
		if (!adminCode) {
			throw createError('Admin signup code is required', 400);
		}
		if (env.nodeEnv !== 'test') {
			if (env.adminSignupCode && adminCode !== env.adminSignupCode) {
				throw createError('Admin signup code is invalid', 400);
			}
		}
	}

	const passwordHash = await hashPassword(password);
	const user = await UserModel.create({
		fullName,
		email,
		passwordHash,
		role: finalRole,
	});

	const token = signToken({
		userId: user._id.toString(),
		email: user.email,
		role: user.role,
	});
	return res.status(201).json({
		token,
		user: {
			_id: user._id.toString(),
			fullName: user.fullName,
			email: user.email,
			role: user.role,
		},
	});
}

/** POST /api/v1/auth/login */
export async function login(req: Request, res: Response) {
	const { email, password } = req.body as { email: string; password: string };

	const user = await UserModel.findOne({ email });
	if (!user) {
		throw createError('Invalid credentials', 401);
	}

	const ok = await verifyPassword(password, user.passwordHash);
	if (!ok) {
		throw createError('Invalid credentials', 401);
	}

	const token = signToken({
		userId: user._id.toString(),
		email: user.email,
		role: user.role,
	});
	return res.json({
		token,
		user: {
			_id: user._id.toString(),
			fullName: user.fullName,
			email: user.email,
			role: user.role,
		},
	});
}

/** GET /api/v1/auth/profile */
export async function profile(req: Request, res: Response) {
	const userId = req.headers['x-user-id'] as string;
	const email = req.headers['x-user-email'] as string;
	const role = req.headers['x-user-role'] as string;

	if (!userId) {
		throw createError('Unauthorized', 401);
	}

	const user = await UserModel.findById(userId);
	if (!user) {
		throw createError('User not found', 404);
	}

	return res.json({
		_id: user._id.toString(),
		fullName: user.fullName,
		email: user.email,
		role: user.role,
		createdAt: user.createdAt,
		updatedAt: user.updatedAt,
	});
}

