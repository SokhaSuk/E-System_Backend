/**
 * Auth Service Environment Configuration
 */
import dotenv from 'dotenv';

dotenv.config();

export const env = {
	// Server configuration
	port: parseInt(process.env.AUTH_SERVICE_PORT || '4001', 10),
	nodeEnv: process.env.NODE_ENV || 'development',

	// Database
	mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/e_system',

	// Authentication
	jwtSecret: process.env.JWT_SECRET || 'change-me-in-env',
	jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
	adminSignupCode: process.env.ADMIN_SIGNUP_CODE || '',

	// CORS
	cors: {
		origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
		credentials: process.env.CORS_CREDENTIALS === 'true',
	},
};

