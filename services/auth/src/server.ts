import express from 'express';
import dotenv from 'dotenv';
import { config } from './config/env';
import { connectToDatabase } from './config/db';
import authRoutes from './routes/auth.routes';

// Load environment variables
dotenv.config();

const app = express();

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'auth-service',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

// Auth routes
app.use('/api/auth', authRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Auth Service Error:', err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(config.nodeEnv === 'development' && { stack: err.stack }),
  });
});

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectToDatabase();

    // Start listening
    app.listen(config.port, () => {
      console.log('='.repeat(50));
      console.log(`🔐 Auth Service running on port ${config.port}`);
      console.log(`🌍 Environment: ${config.nodeEnv}`);
      console.log(`🔗 API Root: http://localhost:${config.port}/api/auth`);
      console.log(`🏥 Health Check: http://localhost:${config.port}/health`);
      console.log('='.repeat(50));
    });
  } catch (error) {
    console.error('❌ Failed to start Auth Service:', error);
    process.exit(1);
  }
};

startServer();

export default app;
