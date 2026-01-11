# E-System Microservices Architecture

This project has been converted to a microservices architecture with the following services:

## Services

### API Gateway (Port 4000)

- **Purpose**: Routes requests to appropriate microservices
- **Features**: Authentication, rate limiting, request forwarding
- **URL**: http://localhost:4000

### Auth Service (Port 4001)

- **Purpose**: User authentication and authorization
- **Features**: Registration, login, JWT token management
- **Database**: `e_system_auth`

### User Service (Port 4002)

- **Purpose**: User profile management
- **Features**: User CRUD, profile updates, profile pictures
- **Database**: `e_system_user`

### Course Service (Port 4003)

- **Purpose**: Course management
- **Features**: Course CRUD, enrollment, teacher assignment
- **Database**: `e_system_course`

### Attendance Service (Port 4004)

- **Purpose**: Attendance tracking
- **Features**: Record attendance, bulk operations, statistics
- **Database**: `e_system_attendance`

### Grade Service (Port 4005)

- **Purpose**: Grade management
- **Features**: Grade CRUD, score records, calculations
- **Database**: `e_system_grade`

### Content Service (Port 4006)

- **Purpose**: Content management (announcements, chat, exercises)
- **Features**: Announcements, chat, exercises, Gemini AI integration
- **Database**: `e_system_content`

## Getting Started

### Development Mode

1. **Install dependencies for all services**:

   ```bash
   npm install
   ```

2. **Build shared packages**:

   ```bash
   npm run build:shared
   ```

3. **Run all services concurrently**:

   ```bash
   npm run dev
   ```

4. **Run individual services**:
   ```bash
   npm run dev:gateway    # API Gateway
   npm run dev:auth       # Auth Service
   npm run dev:user       # User Service
   npm run dev:course     # Course Service
   npm run dev:attendance # Attendance Service
   npm run dev:grade      # Grade Service
   npm run dev:content    # Content Service
   ```

### Docker Deployment

1. **Build all services**:

   ```bash
   npm run docker:build
   ```

2. **Start all services**:

   ```bash
   npm run docker:up
   ```

3. **View logs**:

   ```bash
   npm run docker:logs
   ```

4. **Stop all services**:
   ```bash
   npm run docker:down
   ```

## API Endpoints

All requests go through the API Gateway at `http://localhost:4000/api/v1`

### Authentication

- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/profile` - Get user profile

### Users

- `GET /api/v1/users` - List users
- `GET /api/v1/users/:id` - Get user by ID
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user

### Courses

- `GET /api/v1/courses` - List courses
- `POST /api/v1/courses` - Create course
- `GET /api/v1/courses/:id` - Get course
- `PUT /api/v1/courses/:id` - Update course
- `POST /api/v1/courses/:id/enroll` - Enroll student

### Attendance

- `POST /api/v1/attendance` - Record attendance
- `POST /api/v1/attendance/bulk` - Bulk attendance
- `GET /api/v1/attendance/stats/:courseId` - Get statistics

### Grades

- `GET /api/v1/grades` - List grades
- `POST /api/v1/grades` - Create grade
- `PUT /api/v1/grades/:id` - Update grade

### Content

- `GET /api/v1/announcements` - List announcements
- `POST /api/v1/announcements` - Create announcement
- `GET /api/v1/chat` - Get chat messages
- `POST /api/v1/chat` - Send chat message
- `GET /api/v1/exercises` - List exercises
- `POST /api/v1/exercises` - Create exercise

## Health Checks

- API Gateway: http://localhost:4000/health
- Auth Service: http://localhost:4001/health
- User Service: http://localhost:4002/health
- Course Service: http://localhost:4003/health
- Attendance Service: http://localhost:4004/health
- Grade Service: http://localhost:4005/health
- Content Service: http://localhost:4006/health
- All Services: http://localhost:4000/health/services

## Database Management

Access Mongo Express at http://localhost:8081

- Username: `admin`
- Password: `admin123`

## Project Structure

```
E-System_Backend/
├── packages/
│   └── shared/              # Shared types, errors, utils, constants
├── services/
│   ├── api-gateway/         # API Gateway service
│   ├── auth/                # Auth service
│   ├── user/                # User service
│   ├── course/              # Course service
│   ├── attendance/          # Attendance service
│   ├── grade/               # Grade service
│   └── content/             # Content service
├── docker-compose.yml       # Docker Compose configuration
├── package.json             # Root package.json with workspaces
└── tsconfig.base.json       # Base TypeScript configuration
```

## Environment Variables

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

See `.env.example` for all available configuration options.

## Migration from Monolith

The original monolithic application has been decomposed into microservices:

- Each service has its own dedicated MongoDB database
- Services communicate via REST APIs
- API Gateway handles authentication and routing
- Shared code is in the `packages/shared` directory

## Development Notes

- Each service runs independently
- Services use npm workspaces for dependency management
- Shared packages are linked automatically
- Hot reload is enabled in development mode
- Docker Compose handles service orchestration
