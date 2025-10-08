/**
 * Environment configuration loader.
 *
 * Loads variables from the process environment (optionally from `.env`).
 * Provides a single `env` object for typed access throughout the app.
 */
import dotenv from 'dotenv';

dotenv.config();

/** Strongly-typed environment values used by the app. */
export const env = {
	// Server configuration
	port: parseInt(process.env.PORT || '4000', 10),
	nodeEnv: process.env.NODE_ENV || 'development',

	// Database
	mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/e_system',

	// Authentication
	jwtSecret: process.env.JWT_SECRET || 'change-me-in-env',
	jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
	adminSignupCode: process.env.ADMIN_SIGNUP_CODE || '',

	// SMTP Configuration
	smtp: {
		host: process.env.SMTP_HOST || 'smtp.gmail.com',
		port: parseInt(process.env.SMTP_PORT || '587', 10),
		secure: process.env.SMTP_SECURE === 'true',
		user: process.env.SMTP_USER || '',
		password: process.env.SMTP_PASSWORD || '',
	},

	// File Upload
	upload: {
		maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB
		allowedFileTypes: process.env.ALLOWED_FILE_TYPES?.split(',') || [
			'image/jpeg',
			'image/jpg',
			'image/png',
			'image/gif',
			'application/pdf',
			'application/msword',
			'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
			'application/vnd.ms-excel',
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			'text/plain',
			'text/csv',
		],
		uploadPath: process.env.UPLOAD_PATH || 'uploads',
	},

	// Frontend URL (for email links)
	frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',

	// Rate Limiting
	rateLimit: {
		windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
		max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
		authMax: parseInt(process.env.RATE_LIMIT_AUTH_MAX || '5', 10),
	},

	// CORS
	cors: {
		origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
		credentials: process.env.CORS_CREDENTIALS === 'true',
	},

	// Logging
	logging: {
		level: process.env.LOG_LEVEL || 'info',
		enableFileLogging: process.env.ENABLE_FILE_LOGGING === 'true',
	},
};
