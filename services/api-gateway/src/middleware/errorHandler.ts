/**
 * Error Handler Middleware
 */
import { Request, Response, NextFunction } from 'express';

export function errorHandler(
	err: any,
	req: Request,
	res: Response,
	next: NextFunction
) {
	console.error('Error:', err);

	const status = err.status || err.statusCode || 500;
	const message = err.message || 'Internal Server Error';

	res.status(status).json({
		error: message,
		...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
	});
}

export function notFoundHandler(req: Request, res: Response) {
	res.status(404).json({
		error: 'Route not found',
		path: req.path,
	});
}

