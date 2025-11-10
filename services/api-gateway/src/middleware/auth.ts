/**
 * Authentication Middleware for API Gateway
 * 
 * Validates JWT tokens and forwards user info to microservices.
 */
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface AuthRequest extends Request {
	user?: {
		userId: string;
		email: string;
		role: string;
	};
}

export async function authMiddleware(
	req: AuthRequest,
	res: Response,
	next: NextFunction
) {
	try {
		// Skip auth for public routes
		const publicRoutes = ['/health', '/api/v1/auth/login', '/api/v1/auth/register'];
		if (publicRoutes.some(route => req.path.startsWith(route))) {
			return next();
		}

		const authHeader = req.headers.authorization;
		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			return res.status(401).json({ error: 'No token provided' });
		}

		const token = authHeader.substring(7);
		const decoded = jwt.verify(token, env.jwtSecret) as any;

		req.user = {
			userId: decoded.userId,
			email: decoded.email,
			role: decoded.role,
		};

		next();
	} catch (error) {
		return res.status(401).json({ error: 'Invalid token' });
	}
}

