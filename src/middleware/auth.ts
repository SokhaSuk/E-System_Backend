/**
 * Authentication and authorization middlewares.
 *
 * - `requireAuth` validates a JWT bearer token and attaches `req.auth`
 * - `requireRoles` ensures the authenticated user has one of the allowed roles
 */
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { UserModel, UserDocument } from '../models/User';

/** Shape of JWT payload used by the API. */
export interface AuthPayload {
	userId: string;
	role: 'admin' | 'teacher' | 'student';
}

declare global {
	namespace Express {
		interface Request {
			auth?: AuthPayload;
			user?: UserDocument;
		}
	}
}

/**
 * Validates the Authorization header and decodes the JWT.
 *
 * On success attaches `req.auth` and calls `next()`; otherwise replies with 401.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
	const authHeader = req.headers.authorization;
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return res.status(401).json({ message: 'Missing or invalid Authorization header' });
	}
	const token = authHeader.split(' ')[1];
	try {
		const payload = jwt.verify(token, env.jwtSecret) as AuthPayload;
		req.auth = payload;
		return next();
	} catch {
		return res.status(401).json({ message: 'Invalid token' });
	}
}

/**
 * Factory that returns a middleware authorizing by role.
 *
 * Example: `router.use(requireAuth, requireRoles('admin'))`
 */
export function requireRoles(...roles: Array<AuthPayload['role']>) {
	return (req: Request, res: Response, next: NextFunction) => {
		if (!req.auth) {
			return res.status(401).json({ message: 'Unauthorized' });
		}
		if (!roles.includes(req.auth.role)) {
			return res.status(403).json({ message: 'Forbidden' });
		}
		return next();
	};
}

/**
 * Validates JWT token and attaches user to request.
 * Alias for requireAuth with user population.
 */
export async function authenticate(req: Request, res: Response, next: NextFunction) {
	const authHeader = req.headers.authorization;
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return res.status(401).json({ message: 'Missing or invalid Authorization header' });
	}
	const token = authHeader.split(' ')[1];
	try {
		const payload = jwt.verify(token, env.jwtSecret) as AuthPayload;
		req.auth = payload;
		
		// Fetch user from database
		const user = await UserModel.findById(payload.userId);
		if (!user) {
			return res.status(401).json({ message: 'User not found' });
		}
		
		req.user = user;
		return next();
	} catch {
		return res.status(401).json({ message: 'Invalid token' });
	}
}

/**
 * Factory that returns a middleware authorizing by role.
 * Alias for requireRoles.
 */
export function authorize(roles: Array<AuthPayload['role']>) {
	return (req: Request, res: Response, next: NextFunction) => {
		if (!req.user) {
			return res.status(401).json({ message: 'Unauthorized' });
		}
		if (!roles.includes(req.user.role)) {
			return res.status(403).json({ message: 'Forbidden' });
		}
		return next();
	};
}


