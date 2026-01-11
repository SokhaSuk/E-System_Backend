import express from 'express';
import { config } from './config/env';
import { connectDatabase } from './config/database';
import courseRoutes from './routes/course.routes';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'course-service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use('/courses', courseRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();

    // Start listening
    app.listen(config.port, () => {
      console.log(`🚀 Course Service running on port ${config.port}`);
      console.log(`📍 Health check: http://localhost:${config.port}/health`);
    });
  } catch (error) {
    console.error('Failed to start Course Service:', error);
    process.exit(1);
  }
};

startServer();
