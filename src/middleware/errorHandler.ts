/**
 * Enhanced Error Handler Middleware
 * Centralized error handling with proper logging and response formatting
 */

import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors';
import { HTTP_STATUS } from '../constants/http-status';
import logger from '../utils/logger';

// Re-export asyncHandler for backward compatibility
export { asyncHandler } from './async-handler';

/**
 * Helper function to create errors (backward compatibility)
 * @deprecated Use specific error classes from '../errors' instead
 */
export function createError(message: string, statusCode: number = 500): AppError {
	return new AppError(message, statusCode as any);
}

interface ErrorResponse {
	status: 'error';
	message: string;
	statusCode: number;
	timestamp: Date;
	path?: string;
	details?: any;
	stack?: string;
}

/**
 * Global error handler middleware
 * Must be registered last in the middleware chain
 */
export const errorHandler = (
	err: Error | AppError,
	req: Request,
	res: Response,
	next: NextFunction
): void => {
	// Default error values
	let statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR;
	let message = 'An unexpected error occurred';
	let details: any = undefined;
	let isOperational = false;

	// Handle AppError instances
	if (err instanceof AppError) {
		statusCode = err.statusCode;
		message = err.message;
		details = err.details;
		isOperational = err.isOperational;
	}

	// Handle Mongoose validation errors
	if (err.name === 'ValidationError') {
		statusCode = HTTP_STATUS.UNPROCESSABLE_ENTITY;
		message = 'Validation failed';
		details = Object.values((err as any).errors).map((e: any) => ({
			field: e.path,
			message: e.message,
		}));
	}

	// Handle Mongoose duplicate key errors
	if ((err as any).code === 11000) {
		statusCode = HTTP_STATUS.CONFLICT;
		message = 'Duplicate entry';
		const field = Object.keys((err as any).keyPattern)[0];
		details = { field, message: `${field} already exists` };
	}

	// Handle Mongoose cast errors
	if (err.name === 'CastError') {
		statusCode = HTTP_STATUS.BAD_REQUEST;
		message = 'Invalid ID format';
	}

	// Handle JWT errors
	if (err.name === 'JsonWebTokenError') {
		statusCode = HTTP_STATUS.UNAUTHORIZED;
		message = 'Invalid token';
	}

	if (err.name === 'TokenExpiredError') {
		statusCode = HTTP_STATUS.UNAUTHORIZED;
		message = 'Token expired';
	}

	// Log the error
	const logMessage = `${req.method} ${req.path} - ${statusCode} - ${message}`;
	const logMetadata = {
		method: req.method,
		path: req.path,
		statusCode,
		ip: req.ip,
		userAgent: req.get('user-agent'),
		...(details && { details }),
	};

	if (statusCode >= 500) {
		logger.error(logMessage, { ...logMetadata, stack: err.stack });
	} else if (statusCode >= 400) {
		logger.warn(logMessage, logMetadata);
	}

	// Prepare error response
	const errorResponse: ErrorResponse = {
		status: 'error',
		message,
		statusCode,
		timestamp: new Date(),
		path: req.path,
		...(details && { details }),
	};

	// Include stack trace in development
	if (process.env.NODE_ENV === 'development' && err.stack) {
		errorResponse.stack = err.stack;
	}

	// Send error response
	res.status(statusCode).json(errorResponse);
};

/**
 * 404 Not Found handler
 * Should be registered before the error handler
 */
export const notFoundHandler = (
	req: Request,
	res: Response,
	next: NextFunction
): void => {
	const error = new AppError(
		`Route ${req.method} ${req.path} not found`,
		HTTP_STATUS.NOT_FOUND
	);
	next(error);
};
