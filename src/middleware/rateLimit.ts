/**
 * Rate limiting middleware using express-rate-limit.
 */
import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

// Define rate limit config locally since it was removed from global env
const rateLimitConfig = {
	windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
	max: Number(process.env.RATE_LIMIT_MAX) || 100,
	authMax: Number(process.env.RATE_LIMIT_AUTH_MAX) || 5,
};

// General API rate limiter
function formatWindowMs(ms: number): string {
	const minutes = Math.round(ms / 60000);
	if (minutes < 1) return `${Math.round(ms / 1000)} seconds`;
	if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'}`;
	const hours = Math.round(minutes / 60);
	return `${hours} hour${hours === 1 ? '' : 's'}`;
}

export const apiLimiter = rateLimit({
	windowMs: rateLimitConfig.windowMs,
	max: rateLimitConfig.max,
	message: {
		message: 'Too many requests from this IP, please try again later.',
		retryAfter: formatWindowMs(rateLimitConfig.windowMs),
	},
	standardHeaders: true,
	legacyHeaders: false,
	handler: (req: Request, res: Response) => {
		res.status(429).json({
			message: 'Too many requests from this IP, please try again later.',
			retryAfter: formatWindowMs(rateLimitConfig.windowMs),
		});
	},
});

// Stricter limiter for auth routes
export const authLimiter = rateLimit({
	windowMs: rateLimitConfig.windowMs,
	max: rateLimitConfig.authMax,
	message: {
		message: 'Too many authentication attempts, please try again later.',
		retryAfter: formatWindowMs(rateLimitConfig.windowMs),
	},
	standardHeaders: true,
	legacyHeaders: false,
	skipSuccessfulRequests: true,
	handler: (req: Request, res: Response) => {
		res.status(429).json({
			message: 'Too many authentication attempts, please try again later.',
			retryAfter: formatWindowMs(rateLimitConfig.windowMs),
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
