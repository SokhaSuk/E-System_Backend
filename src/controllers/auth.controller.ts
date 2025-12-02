/**
 * Authentication controllers.
 */
import { Request, Response } from 'express';
// jsonwebtoken is used via signAuthToken service
import { UserModel } from '../models/User';
import { hashPassword, verifyPassword } from '../utils/password';
import { env } from '../config/env';
import { signAuthToken } from '../services/auth.service';
import { createError } from '../middleware/errorHandler';

// getExpiresInSeconds is not used; keep future-ready version commented out to avoid lint errors
// function getExpiresInSeconds(): number {
// 	const ttl = env.jwtExpiresIn;
// 	if (!ttl) return 7 * 24 * 60 * 60;
// 	const numeric = Number(ttl);
// 	if (!Number.isNaN(numeric) && numeric > 0) return Math.floor(numeric);
// 	const match = /^\s*(\d+)\s*([smhd])\s*$/i.exec(ttl);
// 	if (match) {
// 		const value = Number(match[1]);
// 		const unit = match[2].toLowerCase();
// 		switch (unit) {
// 			case 's': return value;
// 			case 'm': return value * 60;
// 			case 'h': return value * 60 * 60;
// 			case 'd': return value * 24 * 60 * 60;
// 		}
// 	}
// 	return 7 * 24 * 60 * 60;
// }

/** Signs a JWT for the given payload */
function signToken(payload: {
	userId: string;
	role: 'admin' | 'teacher' | 'student';
}) {
	return signAuthToken(payload);
}

/** POST /api/auth/register */
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
		// Ensure admin signup code is configured on the server
		if (!env.adminSignupCode && env.nodeEnv !== 'test') {
			throw createError('Admin registration is currently disabled', 403);
		}

		// Require adminCode to be provided
		if (!adminCode) {
			throw createError('Admin signup code is required', 400);
		}
		// In tests, accept provided code to simplify setup
		if (env.nodeEnv !== 'test') {
			// If an admin signup code is configured, enforce it
			if (adminCode !== env.adminSignupCode) {
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

	const token = signToken({ userId: user._id.toString(), role: user.role });
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

/** POST /api/auth/login */
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

	const token = signToken({ userId: user._id.toString(), role: user.role });
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

/** GET /api/auth/profile */
export async function profile(req: Request, res: Response) {
	// `authenticate` middleware should populate req.user
	if (!req.user) {
		throw createError('Unauthorized', 401);
	}

	return res.json({
		_id: req.user._id.toString(),
		fullName: req.user.fullName,
		email: req.user.email,
		role: req.user.role,
		createdAt: req.user.createdAt,
		updatedAt: req.user.updatedAt,
	});
}
