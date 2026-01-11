import express from 'express';
import { config } from './config/env';
import { connectDatabase } from './config/database';
import contentRoutes from './routes/content.routes';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'content-service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use('/', contentRoutes);

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
      console.log(`🚀 Content Service running on port ${config.port}`);
      console.log(`📍 Health check: http://localhost:${config.port}/health`);
      if (config.geminiApiKey) {
        console.log('✅ Gemini AI configured');
      } else {
        console.log('⚠️  Gemini AI not configured (set GEMINI_API_KEY)');
      }
    });
  } catch (error) {
    console.error('Failed to start Content Service:', error);
    process.exit(1);
  }
};

startServer();
