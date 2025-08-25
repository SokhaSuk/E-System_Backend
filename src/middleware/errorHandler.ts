/**
 * Global error handling middleware.
 */
import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

export interface AppError extends Error {
	statusCode?: number;
	isOperational?: boolean;
	code?: string;
}

export const createError = (message: string, statusCode: number = 500, isOperational: boolean = true): AppError => {
	const error = new Error(message) as AppError;
	error.statusCode = statusCode;
	error.isOperational = isOperational;
	return error;
};

export const errorHandler = (
	err: AppError,
	req: Request,
	res: Response,
	next: NextFunction
) => {
	let { statusCode = 500, message } = err;

	// Handle Mongoose validation errors
	if (err.name === 'ValidationError') {
		statusCode = 400;
		message = 'Validation Error';
	}

	// Handle Mongoose duplicate key errors
	if (err.code === '11000') {
		statusCode = 409;
		message = 'Duplicate field value entered';
	}

	// Handle Mongoose cast errors
	if (err.name === 'CastError') {
		statusCode = 400;
		message = 'Invalid ID format';
	}

	// Handle JWT errors
	if (err.name === 'JsonWebTokenError') {
		statusCode = 401;
		message = 'Invalid token';
	}

	if (err.name === 'TokenExpiredError') {
		statusCode = 401;
		message = 'Token expired';
	}

	// Log error in development (but skip common browser requests and 404s)
	if (env.nodeEnv === 'development' && 
		!req.url.includes('favicon.ico') && 
		statusCode !== 404) {
		console.error('Error:', {
			message: err.message,
			stack: err.stack,
			statusCode: err.statusCode,
			url: req.url,
			method: req.method,
			ip: req.ip,
			userAgent: req.get('User-Agent')
		});
	}

	// Send error response
	res.status(statusCode).json({
		message,
		...(env.nodeEnv === 'development' && { stack: err.stack }),
		...(env.nodeEnv === 'development' && { error: err })
	});
};

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
	const error = createError(`Route ${req.originalUrl} not found`, 404);
	next(error);
};

export const asyncHandler = (fn: Function) => {
	return (req: Request, res: Response, next: NextFunction) => {
		Promise.resolve(fn(req, res, next)).catch(next);
	};
};
