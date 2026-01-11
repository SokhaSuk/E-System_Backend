/**
 * Service configuration for microservices
 */

export const serviceConfig = {
  auth: {
    url: process.env.AUTH_SERVICE_URL || 'http://localhost:4001',
    healthPath: '/health',
  },
  user: {
    url: process.env.USER_SERVICE_URL || 'http://localhost:4002',
    healthPath: '/health',
  },
  course: {
    url: process.env.COURSE_SERVICE_URL || 'http://localhost:4003',
    healthPath: '/health',
  },
  attendance: {
    url: process.env.ATTENDANCE_SERVICE_URL || 'http://localhost:4004',
    healthPath: '/health',
  },
  grade: {
    url: process.env.GRADE_SERVICE_URL || 'http://localhost:4005',
    healthPath: '/health',
  },
  content: {
    url: process.env.CONTENT_SERVICE_URL || 'http://localhost:4006',
    healthPath: '/health',
  },
};

export const gatewayConfig = {
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  corsCredentials: process.env.CORS_CREDENTIALS === 'true',
};
