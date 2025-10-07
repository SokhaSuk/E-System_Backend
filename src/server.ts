/**
 * Application HTTP server entrypoint.
 *
 * - Initializes database connection
 * - Starts the HTTP server using configured app from `app.ts`
 */
import { app } from './app';
import { env } from './config/env';
import { connectToDatabase } from './config/db';

async function startServer() {
    await connectToDatabase();
    app.listen(env.port, () => {
        console.log(`🚀 E-System API server running on port ${env.port}`);
        console.log(`📊 Environment: ${env.nodeEnv}`);
        console.log(`🔗 Health check: http://localhost:${env.port}/health`);
        console.log(`📚 API docs: http://localhost:${env.port}/api`);
    });
}

if (require.main === module) {
    startServer().catch((err) => {
        console.error('❌ Failed to start server', err);
        process.exit(1);
    });
}

// Re-export app for tests
export { app };


