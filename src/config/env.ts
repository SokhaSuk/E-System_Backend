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
	port: parseInt(process.env.PORT || '4000', 10),
	jwtSecret: process.env.JWT_SECRET || 'change-me-in-env',
	mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/e_system',
	adminSignupCode: process.env.ADMIN_SIGNUP_CODE || '',
};


