/**
 * API Gateway Environment Configuration
 */
import dotenv from 'dotenv';

dotenv.config();

export const env = {
	// Server configuration
	port: parseInt(process.env.PORT || '4000', 10),
	nodeEnv: process.env.NODE_ENV || 'development',

	// JWT Configuration (for token validation)
	jwtSecret: process.env.JWT_SECRET || 'change-me-in-env',

	// Service URLs
	services: {
		auth: process.env.AUTH_SERVICE_URL || 'http://localhost:4001',
		user: process.env.USER_SERVICE_URL || 'http://localhost:4002',
		course: process.env.COURSE_SERVICE_URL || 'http://localhost:4003',
		attendance: process.env.ATTENDANCE_SERVICE_URL || 'http://localhost:4004',
		grade: process.env.GRADE_SERVICE_URL || 'http://localhost:4005',
		announcement: process.env.ANNOUNCEMENT_SERVICE_URL || 'http://localhost:4006',
		blockchain: process.env.BLOCKCHAIN_SERVICE_URL || 'http://localhost:4007',
	},

	// CORS
	cors: {
		origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
		credentials: process.env.CORS_CREDENTIALS === 'true',
	},

	// Service Discovery
	serviceDiscovery: {
		enabled: process.env.SERVICE_DISCOVERY_ENABLED === 'true',
		consulUrl: process.env.CONSUL_URL || 'http://localhost:8500',
	},
};

