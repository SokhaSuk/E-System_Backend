/**
 * Rate limiting middleware using express-rate-limit.
 */
import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

// General API rate limiter
export const apiLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per windowMs
	message: {
		message: 'Too many requests from this IP, please try again later.',
		retryAfter: '15 minutes'
	},
	standardHeaders: true,
	legacyHeaders: false,
	handler: (req: Request, res: Response) => {
		res.status(429).json({
			message: 'Too many requests from this IP, please try again later.',
			retryAfter: '15 minutes'
		});
	}
});

// Stricter limiter for auth routes
export const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 5, // Limit each IP to 5 requests per windowMs
	message: {
		message: 'Too many authentication attempts, please try again later.',
		retryAfter: '15 minutes'
	},
	standardHeaders: true,
	legacyHeaders: false,
	skipSuccessfulRequests: true, // Don't count successful requests
	handler: (req: Request, res: Response) => {
		res.status(429).json({
			message: 'Too many authentication attempts, please try again later.',
			retryAfter: '15 minutes'
		});
	}
});

// File upload limiter
export const uploadLimiter = rateLimit({
	windowMs: 60 * 60 * 1000, // 1 hour
	max: 10, // Limit each IP to 10 uploads per hour
	message: {
		message: 'Too many file uploads, please try again later.',
		retryAfter: '1 hour'
	},
	standardHeaders: true,
	legacyHeaders: false
});
