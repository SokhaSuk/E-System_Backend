/**
 * Application HTTP server entrypoint.
 *
 * - Initializes database connection
 * - Configures Express middlewares (CORS, JSON parsing, logging)
 * - Mounts feature routers under `/api`
 * - Exposes a simple `/health` probe
 */
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { env } from './config/env';
import { connectToDatabase } from './config/db';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { apiLimiter, authLimiter } from './middleware/rateLimit';

// Import routes
import authRoutes from './routes/auth.routes';
import adminRoutes from './routes/admin.routes';
import teacherRoutes from './routes/teacher.routes';
import studentRoutes from './routes/student.routes';
import courseRoutes from './routes/course.routes';
import attendanceRoutes from './routes/attendance.routes';

/**
 * Express app instance.
 */
export const app = express();

/**
 * Boots the server after a successful DB connection.
 */
async function bootstrap() {
	await connectToDatabase();

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

	// Health check endpoint
	app.get('/health', (_req, res) => res.json({ 
		status: 'ok', 
		timestamp: new Date().toISOString(),
		environment: env.nodeEnv
	}));

	// API documentation endpoint
	app.get('/api', (_req, res) => res.json({
		message: 'E-System API',
		version: '1.0.0',
		endpoints: {
			auth: '/api/auth',
			admin: '/api/admin',
			teacher: '/api/teacher',
			student: '/api/student',
			courses: '/api/courses',
			attendance: '/api/attendance'
		}
	}));

	// Apply stricter rate limiting to auth routes
	app.use('/api/auth', authLimiter);

	// Mount API routes
	app.use('/api/auth', authRoutes);
	app.use('/api/admin', adminRoutes);
	app.use('/api/teacher', teacherRoutes);
	app.use('/api/student', studentRoutes);
	app.use('/api/courses', courseRoutes);
	app.use('/api/attendance', attendanceRoutes);

	// 404 handler
	app.use(notFoundHandler);

	// Global error handler (must be last)
	app.use(errorHandler);

	app.listen(env.port, () => {
		console.log(`🚀 E-System API server running on port ${env.port}`);
		console.log(`📊 Environment: ${env.nodeEnv}`);
		console.log(`🔗 Health check: http://localhost:${env.port}/health`);
		console.log(`📚 API docs: http://localhost:${env.port}/api`);
	});
}

bootstrap().catch((err) => {
	console.error('❌ Failed to start server', err);
	process.exit(1);
});


