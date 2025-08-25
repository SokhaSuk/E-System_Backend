# E-System Backend API

A comprehensive educational management system backend built with Node.js, Express, TypeScript, and MongoDB.

## 🚀 Features

### Core Features
- **User Authentication & Authorization** - JWT-based authentication with role-based access control
- **User Management** - Admin, Teacher, and Student roles with different permissions
- **Course Management** - Create, update, and manage courses with student enrollment
- **Attendance Tracking** - Record and manage student attendance with bulk operations
- **Grade Management** - Track student grades and assessments with automatic letter grade calculation
- **Announcements** - System-wide and course-specific announcements

### Advanced Features
- **File Upload System** - Secure file uploads with validation and organization
- **Email Notifications** - Automated email notifications for various events
- **Rate Limiting** - API protection against abuse
- **Input Validation** - Comprehensive request validation using Joi
- **Error Handling** - Centralized error handling with detailed logging
- **Pagination & Filtering** - Advanced query capabilities with search and sorting
- **API Documentation** - Built-in API documentation endpoint

### Security Features
- **Password Hashing** - Secure password storage using bcrypt
- **JWT Authentication** - Stateless authentication with configurable expiration
- **CORS Protection** - Configurable cross-origin resource sharing
- **Request Validation** - Input sanitization and validation
- **Rate Limiting** - Protection against brute force attacks

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd E-System_Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   
   **⚠️ SECURITY FIRST:** Never commit your `.env` file to Git!
   
   a) Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   
   b) Generate secure secrets:
   ```bash
   npm run generate-secrets
   ```
   
   c) Update your `.env` file with the generated values and your actual configuration:
   ```env
   # Server Configuration
   PORT=4000
   NODE_ENV=development
   
   # Database (use your actual MongoDB connection string)
   MONGO_URI=mongodb://127.0.0.1:27017/e_system
   
   # Authentication (use the generated JWT_SECRET)
   JWT_SECRET=your-generated-jwt-secret-here
   JWT_EXPIRES_IN=7d
   ADMIN_SIGNUP_CODE=your-generated-admin-code
   
   # SMTP Configuration (for email notifications)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-app-password
   
   # File Upload
   MAX_FILE_SIZE=10485760
   UPLOAD_PATH=uploads
   
   # Frontend URL (for email links)
   FRONTEND_URL=http://localhost:3000
   
   # CORS
   CORS_ORIGIN=http://localhost:3000
   CORS_CREDENTIALS=true
   
   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX=100
   RATE_LIMIT_AUTH_MAX=5
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

## 🔒 Security

### Important Security Notes
- **NEVER commit `.env` files to Git** - They contain sensitive information
- **Use strong, unique passwords** for all services
- **Generate secure JWT secrets** using the provided script
- **Use HTTPS in production** environments
- **Regularly update dependencies** to patch security vulnerabilities

### Security Features
- ✅ Environment variables for all sensitive data
- ✅ JWT-based authentication with secure secrets
- ✅ Password hashing with bcrypt
- ✅ Input validation and sanitization
- ✅ Rate limiting to prevent abuse
- ✅ CORS protection
- ✅ File upload validation
- ✅ Role-based access control

### Quick Security Setup
```bash
# Generate secure secrets
npm run generate-secrets

# Create environment file
cp .env.example .env

# Update .env with generated secrets
# (Edit the file manually with the generated values)
```

For detailed security information, see [SECURITY.md](./SECURITY.md).

## 📚 API Documentation

### Base URL
```
http://localhost:4000
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "student",
  "adminCode": "admin123" // Required for admin registration
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <jwt-token>
```

### Course Management

#### Get All Courses (with pagination and filtering)
```http
GET /api/courses?page=1&limit=10&search=math&semester=Fall&academicYear=2024
Authorization: Bearer <jwt-token>
```

#### Create Course (Teachers & Admins only)
```http
POST /api/courses
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "title": "Advanced Mathematics",
  "description": "Advanced mathematical concepts and applications",
  "code": "MATH301",
  "credits": 3,
  "semester": "Fall",
  "academicYear": "2024"
}
```

#### Enroll Student in Course
```http
POST /api/courses/:courseId/enroll
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "studentId": "student-id-here"
}
```

### Attendance Management

#### Record Bulk Attendance
```http
POST /api/attendance/bulk
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "courseId": "course-id-here",
  "date": "2024-01-15",
  "attendance": [
    {
      "studentId": "student-id-1",
      "status": "present",
      "notes": "On time"
    },
    {
      "studentId": "student-id-2",
      "status": "absent",
      "notes": "No excuse provided"
    }
  ]
}
```

#### Get Attendance Statistics
```http
GET /api/attendance/stats/:courseId?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <jwt-token>
```

### File Upload

#### Upload Profile Picture
```http
POST /api/upload/profile
Authorization: Bearer <jwt-token>
Content-Type: multipart/form-data

profile: [file]
```

#### Upload Assignment Files
```http
POST /api/upload/assignment
Authorization: Bearer <jwt-token>
Content-Type: multipart/form-data

assignment: [file1, file2, file3]
```

## 🗂️ Project Structure

```
src/
├── config/           # Configuration files
│   ├── db.ts        # Database connection
│   └── env.ts       # Environment variables
├── middleware/       # Express middleware
│   ├── auth.ts      # Authentication middleware
│   ├── validation.ts # Request validation
│   ├── rateLimit.ts # Rate limiting
│   └── errorHandler.ts # Error handling
├── models/          # Mongoose models
│   ├── User.ts      # User model
│   ├── Course.ts    # Course model
│   ├── Attendance.ts # Attendance model
│   ├── Grade.ts     # Grade model
│   └── Announcement.ts # Announcement model
├── routes/          # API routes
│   ├── auth.routes.ts
│   ├── admin.routes.ts
│   ├── teacher.routes.ts
│   ├── student.routes.ts
│   ├── course.routes.ts
│   └── attendance.routes.ts
├── utils/           # Utility functions
│   ├── password.ts  # Password utilities
│   ├── upload.ts    # File upload utilities
│   └── email.ts     # Email utilities
└── server.ts        # Main server file
```

## 🧪 Testing

Run the test suite:
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🔧 Development Scripts

```bash
# Development
npm run dev          # Start development server with nodemon
npm run build        # Build for production
npm run start        # Start production server
npm run typecheck    # TypeScript type checking

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run format       # Format code with Prettier

# Testing
npm test             # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage
```

## 🔒 Security Considerations

- All passwords are hashed using bcrypt
- JWT tokens have configurable expiration
- Rate limiting prevents brute force attacks
- Input validation prevents injection attacks
- CORS is properly configured
- File uploads are validated and restricted

## 📧 Email Notifications

The system supports automated email notifications for:
- Welcome emails for new users
- Password reset requests
- Course enrollment confirmations
- Grade notifications
- Announcement notifications

Configure SMTP settings in your `.env` file to enable email functionality.

## 📁 File Upload

The system supports file uploads for:
- Profile pictures
- Assignment submissions
- Course materials
- Announcement attachments

Files are organized in subdirectories and validated for type and size.

## 🚀 Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Set production environment variables**
   ```bash
   NODE_ENV=production
   ```

3. **Start the production server**
   ```bash
   npm start
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please open an issue in the repository or contact the development team.


