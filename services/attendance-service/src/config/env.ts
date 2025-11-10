import dotenv from 'dotenv';
dotenv.config();

export const env = {
	port: parseInt(process.env.ATTENDANCE_SERVICE_PORT || '4004', 10),
	nodeEnv: process.env.NODE_ENV || 'development',
	mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/e_system',
	blockchainServiceUrl: process.env.BLOCKCHAIN_SERVICE_URL || 'http://localhost:4007',
	cors: {
		origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
		credentials: process.env.CORS_CREDENTIALS === 'true',
	},
};

