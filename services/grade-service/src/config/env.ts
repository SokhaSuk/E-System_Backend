/**
 * Grade Service Environment Configuration
 */
import dotenv from 'dotenv';

dotenv.config();

export const env = {
	// Server configuration
	port: parseInt(process.env.GRADE_SERVICE_PORT || '4005', 10),
	nodeEnv: process.env.NODE_ENV || 'development',

	// Database
	mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/e_system',

	// Blockchain Service
	blockchainServiceUrl: process.env.BLOCKCHAIN_SERVICE_URL || 'http://localhost:4007',

	// CORS
	cors: {
		origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
		credentials: process.env.CORS_CREDENTIALS === 'true',
	},
};

