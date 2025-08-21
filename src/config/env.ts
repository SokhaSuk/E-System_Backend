import dotenv from 'dotenv';

dotenv.config();

export const env = {
	port: parseInt(process.env.PORT || '4000', 10),
	jwtSecret: process.env.JWT_SECRET || 'change-me-in-env',
	mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/e_system',
	adminSignupCode: process.env.ADMIN_SIGNUP_CODE || '',
};


