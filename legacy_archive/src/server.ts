import { env } from './config/env';
import { connectToDatabase } from './config/db';
import chalk from 'chalk';
import logger from './utils/logger';

async function startServer() {
	// Clear console for a fresh start look
	console.clear();

	const divider = chalk.gray('---------------------------------------------------');

	logger.info(divider);
	logger.info(chalk.bold.cyan('🚀 E-System Backend API'));
	logger.info(divider);

	await connectToDatabase();

	try {
		// Import app after DB connection to catch any initialization errors
		const { app } = await import('./app');

		app.listen(env.port, () => {
			logger.info(divider);
			logger.info(`✅ Server running on port: ${chalk.green(env.port)}`);
			logger.info(`🌍 Environment: ${chalk.yellow(env.nodeEnv)}`);
			logger.info(`🔗 API Root: ${chalk.blue(`http://localhost:${env.port}/api/v1`)}`);
			logger.info(`🏥 Health Check: ${chalk.magenta(`http://localhost:${env.port}/health`)}`);
			logger.info(divider);
		});
	} catch (error: any) {
		console.error(chalk.red('❌ Error initializing app:'), error);
		logger.error(chalk.red('❌ Error initializing app'), { error: error.message, stack: error.stack });
		throw error;
	}
}

if (require.main === module) {
	startServer().catch(err => {
		console.error(chalk.red('❌ Failed to start server:'), err);
		logger.error(chalk.red('❌ Failed to start server'), { error: err.message, stack: err.stack });
		process.exit(1);
	});
}

// Re-export app for tests
export { app } from './app';
