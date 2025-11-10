# E-System Microservices

This directory contains all microservices for the E-System application.

## Services

### 1. API Gateway (`api-gateway`)
- **Port**: 4000
- **Purpose**: Single entry point for all client requests
- **Responsibilities**: Request routing, authentication, service discovery

### 2. Auth Service (`auth-service`)
- **Port**: 4001
- **Purpose**: Authentication and authorization
- **Responsibilities**: User registration, login, JWT token generation

### 3. User Service (`user-service`)
- **Port**: 4002
- **Purpose**: User management
- **Responsibilities**: User CRUD operations, profile management

### 4. Course Service (`course-service`)
- **Port**: 4003
- **Purpose**: Course management
- **Responsibilities**: Course CRUD, student enrollment

### 5. Attendance Service (`attendance-service`)
- **Port**: 4004
- **Purpose**: Attendance tracking
- **Responsibilities**: Attendance recording, statistics, blockchain integration

### 6. Grade Service (`grade-service`)
- **Port**: 4005
- **Purpose**: Grade management
- **Responsibilities**: Grade CRUD, calculations, blockchain integration

### 7. Announcement Service (`announcement-service`)
- **Port**: 4006
- **Purpose**: Announcement management
- **Responsibilities**: Announcement CRUD, system-wide and course-specific announcements

### 8. Blockchain Service (`blockchain-service`)
- **Port**: 4007
- **Purpose**: Blockchain integration
- **Responsibilities**: Store and verify records on blockchain

## Service Structure

Each service follows this structure:
```
service-name/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Request handlers
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── middleware/      # Express middleware
│   └── server.ts        # Server entry point
├── package.json
├── tsconfig.json
└── Dockerfile
```

## Development

### Setting up a service

1. Navigate to service directory:
   ```bash
   cd services/service-name
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file with required environment variables

4. Start development server:
   ```bash
   npm run dev
   ```

### Building a service

```bash
cd services/service-name
npm run build
```

### Running with Docker

```bash
docker-compose -f docker-compose.microservices.yml up -d
```

## Service Communication

Services communicate via:
- **HTTP/REST**: Synchronous communication
- **API Gateway**: Routes requests to appropriate services
- **Headers**: User information forwarded via `X-User-Id`, `X-User-Email`, `X-User-Role`

## Database

All services share the same MongoDB instance:
- **Database**: `e_system`
- **Blockchain Database**: `e_system_blockchain`

Each service has its own collections but can access shared collections when needed.

## Blockchain Integration

Services that integrate with blockchain:
- **Grade Service**: Stores grades on blockchain
- **Attendance Service**: Stores attendance records on blockchain

These services communicate with the Blockchain Service via HTTP/REST.

## Testing

Each service can be tested independently:
1. Start the service
2. Test endpoints using curl or Postman
3. Verify service health at `/health`

## Deployment

Services can be deployed:
- **Individually**: Each service can be deployed separately
- **Together**: Using Docker Compose for local development
- **Production**: Using Kubernetes or similar orchestration tool

## Documentation

- [MICROSERVICES_ARCHITECTURE.md](../MICROSERVICES_ARCHITECTURE.md) - Architecture documentation
- [SERVICES_README.md](../SERVICES_README.md) - Quick start guide

