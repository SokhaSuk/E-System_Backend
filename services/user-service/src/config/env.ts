/**
 * User Service Environment Configuration
 */
import dotenv from 'dotenv';

dotenv.config();

export const env = {
	// Server configuration
	port: parseInt(process.env.USER_SERVICE_PORT || '4002', 10),
	nodeEnv: process.env.NODE_ENV || 'development',

	// Database
	mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/e_system',

	// CORS
	cors: {
		origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
		credentials: process.env.CORS_CREDENTIALS === 'true',
	},
};

