import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '4006', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/e_system_content',
  courseServiceUrl: process.env.COURSE_SERVICE_URL || 'http://localhost:4003',
  userServiceUrl: process.env.USER_SERVICE_URL || 'http://localhost:4002',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
};
