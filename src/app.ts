/**
 * Express application configuration.
 *
 * Builds and exports the configured Express app with middlewares and routes.
 */
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { env } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { apiLimiter, authLimiter } from './middleware/rateLimit';
import apiRouter from './routes';

/**
 * Exported Express app instance, ready for testing and server startup.
 */
export const app = express();

// Security and rate limiting
app.use(apiLimiter);

// CORS configuration
app.use(cors({
	origin: env.cors.origin,
	credentials: env.cors.credentials
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (env.nodeEnv === 'development') {
	app.use(morgan('dev'));
} else {
	app.use(morgan('combined'));
}

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Favicon endpoint (handle browser requests)
app.get('/favicon.ico', (_req, res) => res.status(204).end());

// Health check endpoint
app.get('/health', (_req, res) => res.json({
	status: 'ok',
	timestamp: new Date().toISOString(),
	environment: env.nodeEnv
}));

// Simple test endpoint (useful during development)
app.get('/test', (_req, res) => {
	res.json({ message: 'Hello World' });
});

// Redirect common mistake
app.get('/api/health', (_req, res) => {
	res.status(308).json({
		message: 'Health endpoint is at /health, not /api/health',
		redirect: '/health',
		status: 'permanent_redirect'
	});
});

// Apply stricter rate limiting to auth routes (skip in tests)
if (env.nodeEnv !== 'test') {
	app.use('/api/auth', authLimiter);
}

// Mount API routes root
app.use('/api', apiRouter);

// 404 handler
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);


