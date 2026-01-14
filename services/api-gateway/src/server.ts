import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { gatewayConfig, serviceConfig } from './config/services';
import { apiLimiter } from './middleware/rateLimit';
import apiRoutes from './routes';

// Load environment variables
dotenv.config();

const app = express();

// Security and basic middleware
app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: gatewayConfig.corsOrigin.includes(',')
      ? gatewayConfig.corsOrigin.split(',')
      : gatewayConfig.corsOrigin,
    credentials: gatewayConfig.corsCredentials,
  })
);

// Body parsing
// Body parsing - REMOVED to avoid consuming stream before proxy
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (gatewayConfig.nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting
app.use(apiLimiter);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'api-gateway',
    timestamp: new Date().toISOString(),
    environment: gatewayConfig.nodeEnv,
  });
});

// Services health check
app.get('/health/services', async (_req, res) => {
  const services = {
    auth: { url: serviceConfig.auth.url, status: 'unknown' },
    user: { url: serviceConfig.user.url, status: 'unknown' },
    course: { url: serviceConfig.course.url, status: 'unknown' },
    attendance: { url: serviceConfig.attendance.url, status: 'unknown' },
    grade: { url: serviceConfig.grade.url, status: 'unknown' },
    content: { url: serviceConfig.content.url, status: 'unknown' },
  };

  // Check each service health (simple implementation)
  for (const [name, config] of Object.entries(serviceConfig)) {
    try {
      const response = await fetch(`${config.url}${config.healthPath}`);
      services[name as keyof typeof services].status = response.ok ? 'healthy' : 'unhealthy';
    } catch (error) {
      services[name as keyof typeof services].status = 'unreachable';
    }
  }

  res.json({
    gateway: 'healthy',
    services,
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api', apiRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Gateway Error:', err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(gatewayConfig.nodeEnv === 'development' && { stack: err.stack }),
  });
});

// Start server
const PORT = gatewayConfig.port;

app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`🚀 API Gateway running on port ${PORT}`);
  console.log(`🌍 Environment: ${gatewayConfig.nodeEnv}`);
  console.log(`🔗 API Root: http://localhost:${PORT}/api/v1`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
  console.log('='.repeat(50));
  console.log('\nMicroservices:');
  console.log(`  Auth Service: ${serviceConfig.auth.url}`);
  console.log(`  User Service: ${serviceConfig.user.url}`);
  console.log(`  Course Service: ${serviceConfig.course.url}`);
  console.log(`  Attendance Service: ${serviceConfig.attendance.url}`);
  console.log(`  Grade Service: ${serviceConfig.grade.url}`);
  console.log(`  Content Service: ${serviceConfig.content.url}`);
  console.log('='.repeat(50));
});

export default app;
