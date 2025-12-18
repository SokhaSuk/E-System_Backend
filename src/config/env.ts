import dotenv from 'dotenv';

dotenv.config();

interface EnvConfig {
	port: number;
	nodeEnv: string;
	mongoUri: string;
	jwtSecret: string;
	jwtExpiresIn: string;
	adminSignupCode: string | undefined;
	smtp: {
		host: string | undefined;
		port: number;
		secure: boolean;
		user: string | undefined;
		pass: string | undefined;
	};
	frontendUrl: string | undefined;
	corsOrigin: string | undefined;
	corsCredentials: boolean;
	geminiApiKey: string | undefined;
}

export const env: EnvConfig = {
	port: Number(process.env.PORT) || 4000,

	nodeEnv: process.env.NODE_ENV || 'development',

	mongoUri: process.env.MONGO_URI as string,

	jwtSecret: process.env.JWT_SECRET as string,
	jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

	adminSignupCode: process.env.ADMIN_SIGNUP_CODE,

	smtp: {
		host: process.env.SMTP_HOST,
		port: Number(process.env.SMTP_PORT),
		secure: process.env.SMTP_SECURE === 'true',
		user: process.env.SMTP_USER,
		pass: process.env.SMTP_PASS,
	},

	frontendUrl: process.env.FRONTEND_URL,
	corsOrigin: process.env.CORS_ORIGIN,
	corsCredentials: process.env.CORS_CREDENTIALS === 'true',
	geminiApiKey: process.env.GEMINI_API_KEY,
};

// ✅ Validate required variables early
if (!env.mongoUri) {
	throw new Error('❌ MONGO_URI is not defined in environment variables');
}

if (!env.jwtSecret) {
	throw new Error('❌ JWT_SECRET is not defined in environment variables');
}
