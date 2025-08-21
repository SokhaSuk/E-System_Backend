import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface AuthPayload {
	userId: string;
	role: 'admin' | 'teacher' | 'student';
}

declare global {
	namespace Express {
		interface Request {
			auth?: AuthPayload;
		}
	}
}

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


