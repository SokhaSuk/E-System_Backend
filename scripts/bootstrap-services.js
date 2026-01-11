/**
 * Bootstrap script to create remaining microservices
 * This script creates the basic structure for User, Course, Attendance, Grade, and Content services
 */

const fs = require('fs');
const path = require('path');

const services = [
  {
    name: 'user',
    port: 4002,
    packageName: '@e-system/user-service',
    description: 'User Management Service for E-System',
    database: 'e_system_user',
    dependencies: {
      '@e-system/shared': '*',
      express: '^5.2.1',
      mongoose: '^9.1.2',
      multer: '^2.0.2',
      joi: '^17.12.2',
      dotenv: '^16.4.1',
    },
  },
  {
    name: 'course',
    port: 4003,
    packageName: '@e-system/course-service',
    description: 'Course Management Service for E-System',
    database: 'e_system_course',
    dependencies: {
      '@e-system/shared': '*',
      express: '^5.2.1',
      mongoose: '^9.1.2',
      axios: '^1.6.5',
      joi: '^17.12.2',
      dotenv: '^16.4.1',
    },
  },
  {
    name: 'attendance',
    port: 4004,
    packageName: '@e-system/attendance-service',
    description: 'Attendance Tracking Service for E-System',
    database: 'e_system_attendance',
    dependencies: {
      '@e-system/shared': '*',
      express: '^5.2.1',
      mongoose: '^9.1.2',
      axios: '^1.6.5',
      joi: '^17.12.2',
      dotenv: '^16.4.1',
    },
  },
  {
    name: 'grade',
    port: 4005,
    packageName: '@e-system/grade-service',
    description: 'Grade Management Service for E-System',
    database: 'e_system_grade',
    dependencies: {
      '@e-system/shared': '*',
      express: '^5.2.1',
      mongoose: '^9.1.2',
      axios: '^1.6.5',
      joi: '^17.12.2',
      dotenv: '^16.4.1',
    },
  },
  {
    name: 'content',
    port: 4006,
    packageName: '@e-system/content-service',
    description: 'Content Management Service for E-System (Announcements, Chat, Exercises)',
    database: 'e_system_content',
    dependencies: {
      '@e-system/shared': '*',
      express: '^5.2.1',
      mongoose: '^9.1.2',
      axios: '^1.6.5',
      joi: '^17.12.2',
      dotenv: '^16.4.1',
      '@google/generative-ai': '^0.24.1',
    },
  },
];

function createDirectoryStructure(serviceName) {
  const basePath = path.join(__dirname, 'services', serviceName);
  const dirs = [
    basePath,
    path.join(basePath, 'src'),
    path.join(basePath, 'src', 'config'),
    path.join(basePath, 'src', 'models'),
    path.join(basePath, 'src', 'controllers'),
    path.join(basePath, 'src', 'services'),
    path.join(basePath, 'src', 'routes'),
    path.join(basePath, 'src', 'middleware'),
  ];

  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  });
}

function createPackageJson(service) {
  const content = {
    name: service.packageName,
    version: '1.0.0',
    private: true,
    description: service.description,
    main: 'dist/server.js',
    scripts: {
      dev: 'nodemon src/server.ts',
      build: 'tsc',
      start: 'node dist/server.js',
      clean: 'rimraf dist',
    },
    dependencies: service.dependencies,
    devDependencies: {
      '@types/express': '^5.0.6',
      '@types/node': '^22.17.2',
      nodemon: '^3.0.2',
      'ts-node': '^10.9.2',
      typescript: '^5.9.2',
    },
  };

  const filePath = path.join(__dirname, 'services', service.name, 'package.json');
  fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
  console.log(`Created package.json for ${service.name}`);
}

function createTsConfig(serviceName) {
  const content = {
    extends: '../../tsconfig.base.json',
    compilerOptions: {
      outDir: './dist',
      rootDir: './src',
    },
    include: ['src/**/*'],
    exclude: ['node_modules', 'dist'],
  };

  const filePath = path.join(__dirname, 'services', serviceName, 'tsconfig.json');
  fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
  console.log(`Created tsconfig.json for ${serviceName}`);
}

function createEnvConfig(service) {
  const content = `import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '${service.port}', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/${service.database}',
  userServiceUrl: process.env.USER_SERVICE_URL || 'http://localhost:4002',
  courseServiceUrl: process.env.COURSE_SERVICE_URL || 'http://localhost:4003',
};
`;

  const filePath = path.join(__dirname, 'services', service.name, 'src', 'config', 'env.ts');
  fs.writeFileSync(filePath, content);
  console.log(`Created env.ts for ${service.name}`);
}

function createDbConfig(serviceName) {
  const content = `import mongoose from 'mongoose';
import { config } from './env';

export const connectToDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('✅ ${serviceName.charAt(0).toUpperCase() + serviceName.slice(1)} Service: Connected to MongoDB');
  } catch (error) {
    console.error('❌ ${serviceName.charAt(0).toUpperCase() + serviceName.slice(1)} Service: MongoDB connection error:', error);
    process.exit(1);
  }
};
`;

  const filePath = path.join(__dirname, 'services', serviceName, 'src', 'config', 'db.ts');
  fs.writeFileSync(filePath, content);
  console.log(`Created db.ts for ${serviceName}`);
}

function createServerFile(service) {
  const content = `import express from 'express';
import dotenv from 'dotenv';
import { config } from './config/env';
import { connectToDatabase } from './config/db';

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
    service: '${service.name}-service',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

// TODO: Add routes here
// app.use('/api/${service.name}', routes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('${service.name.charAt(0).toUpperCase() + service.name.slice(1)} Service Error:', err);

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
      console.log(\`🚀 ${service.name.charAt(0).toUpperCase() + service.name.slice(1)} Service running on port \${config.port}\`);
      console.log(\`🌍 Environment: \${config.nodeEnv}\`);
      console.log(\`🔗 API Root: http://localhost:\${config.port}/api/${service.name}\`);
      console.log(\`🏥 Health Check: http://localhost:\${config.port}/health\`);
      console.log('='.repeat(50));
    });
  } catch (error) {
    console.error('❌ Failed to start ${service.name.charAt(0).toUpperCase() + service.name.slice(1)} Service:', error);
    process.exit(1);
  }
};

startServer();

export default app;
`;

  const filePath = path.join(__dirname, 'services', service.name, 'src', 'server.ts');
  fs.writeFileSync(filePath, content);
  console.log(`Created server.ts for ${service.name}`);
}

function createNodemonConfig(serviceName) {
  const content = {
    watch: ['src'],
    ext: 'ts,json',
    ignore: ['src/**/*.spec.ts', 'src/**/*.test.ts'],
    exec: 'ts-node src/server.ts',
    env: {
      NODE_ENV: 'development',
    },
  };

  const filePath = path.join(__dirname, 'services', serviceName, 'nodemon.json');
  fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
  console.log(`Created nodemon.json for ${serviceName}`);
}

function createDockerfile(service) {
  const content = `FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY src ./src

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE ${service.port}

# Start the application
CMD ["node", "dist/server.js"]
`;

  const filePath = path.join(__dirname, 'services', service.name, 'Dockerfile');
  fs.writeFileSync(filePath, content);
  console.log(`Created Dockerfile for ${service.name}`);
}

// Main execution
console.log('🚀 Starting microservices bootstrap...\n');

services.forEach((service) => {
  console.log(`\n📦 Creating ${service.name} service...`);
  createDirectoryStructure(service.name);
  createPackageJson(service);
  createTsConfig(service.name);
  createEnvConfig(service);
  createDbConfig(service.name);
  createServerFile(service);
  createNodemonConfig(service.name);
  createDockerfile(service);
  console.log(`✅ ${service.name} service created successfully!`);
});

console.log('\n✨ All services created successfully!');
console.log('\n📝 Next steps:');
console.log('1. Run: npm install');
console.log('2. Implement business logic in each service');
console.log('3. Run: npm run dev (to start all services)');
console.log('4. Or run: npm run docker:up (to start with Docker)\n');
