/**
 * Rate limiting middleware using express-rate-limit.
 */
import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { env } from '../config/env';

// General API rate limiter
function formatWindowMs(ms: number): string {
	const minutes = Math.round(ms / 60000);
	if (minutes < 1) return `${Math.round(ms / 1000)} seconds`;
	if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'}`;
	const hours = Math.round(minutes / 60);
	return `${hours} hour${hours === 1 ? '' : 's'}`;
}

export const apiLimiter = rateLimit({
	windowMs: env.rateLimit.windowMs,
	max: env.rateLimit.max,
	message: {
		message: 'Too many requests from this IP, please try again later.',
		retryAfter: formatWindowMs(env.rateLimit.windowMs),
	},
	standardHeaders: true,
	legacyHeaders: false,
	handler: (req: Request, res: Response) => {
		res.status(429).json({
			message: 'Too many requests from this IP, please try again later.',
			retryAfter: formatWindowMs(env.rateLimit.windowMs),
		});
	},
});

// Stricter limiter for auth routes
export const authLimiter = rateLimit({
	windowMs: env.rateLimit.windowMs,
	max: env.rateLimit.authMax,
	message: {
		message: 'Too many authentication attempts, please try again later.',
		retryAfter: formatWindowMs(env.rateLimit.windowMs),
	},
	standardHeaders: true,
	legacyHeaders: false,
	skipSuccessfulRequests: true,
	handler: (req: Request, res: Response) => {
		res.status(429).json({
			message: 'Too many authentication attempts, please try again later.',
			retryAfter: formatWindowMs(env.rateLimit.windowMs),
		});
	},
});

// File upload limiter
export const uploadLimiter = rateLimit({
	windowMs: 60 * 60 * 1000, // 1 hour
	max: 10, // Limit each IP to 10 uploads per hour
	message: {
		message: 'Too many file uploads, please try again later.',
		retryAfter: '1 hour',
	},
	standardHeaders: true,
	legacyHeaders: false,
});
