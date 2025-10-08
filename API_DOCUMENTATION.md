# E-System API Documentation

Quick links:
- Swagger UI: `/api-docs`
- OpenAPI JSON: `/openapi.json`
- API Base URL: `/api/v1`

A comprehensive school management system API with role-based access control for Users, Courses, Grades, Teachers, Students, Admins, and Attendance tracking.

## Table of Contents

- [Authentication](#authentication)
- [Admin API](#admin-api)
- [Teacher API](#teacher-api)
- [Student API](#student-api)
- [Course API](#course-api)
- [Grade API](#grade-api)
- [Attendance API](#attendance-api)
- [User API](#user-api)
- [Announcement API](#announcement-api)
- [Data Explorer API](#data-explorer-api)
- [Error Handling](#error-handling)
- [Response Format](#response-format)

## Authentication

All API endpoints (except authentication routes) require JWT token authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Login

**POST** `/api/v1/auth/login`

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "user": {
    "_id": "user_id",
    "fullName": "John Doe",
    "email": "user@example.com",
    "role": "student"
  },
  "token": "jwt_token_here"
}
```

## Admin API

**Base URL:** `/api/v1/admin`

*Requires admin role*

### Get System Statistics

**GET** `/api/v1/admin/stats`

Returns comprehensive system statistics including user counts, course information, grade averages, and attendance data.

### User Management

**GET** `/api/v1/admin/users` - List all users with pagination and filtering
**POST** `/api/v1/admin/users` - Create new user
**PUT** `/api/v1/admin/users/:id` - Update user
**DELETE** `/api/v1/admin/users/:id` - Delete user

### Course Oversight

**GET** `/api/v1/admin/courses` - List all courses with detailed information
**GET** `/api/v1/admin/grades` - List all grades
**GET** `/api/v1/admin/attendance` - List all attendance records
**GET** `/api/v1/admin/announcements` - List all announcements

## Teacher API

**Base URL:** `/api/v1/teacher`

*Requires teacher or admin role*

### Dashboard

**GET** `/api/v1/teacher/dashboard` - Teacher's dashboard with course summary

### Course Management

**GET** `/api/v1/teacher/courses` - Get teacher's courses
**GET** `/api/v1/teacher/courses/:courseId` - Get course details with student list
**GET** `/api/v1/teacher/courses/:courseId/students` - Get students in a course
**GET** `/api/v1/teacher/courses/:courseId/stats` - Get course statistics

### Student Progress

**GET** `/api/v1/teacher/courses/:courseId/students/:studentId/progress` - Get student progress in course

### Grade Management

**GET** `/api/v1/teacher/courses/:courseId/grades` - Get grades for a course
**POST** `/api/v1/grades` - Create grade (via general grades API)
**PUT** `/api/v1/grades/:id` - Update grade (via general grades API)

### Attendance Management

**GET** `/api/v1/teacher/courses/:courseId/attendance` - Get attendance for a course
**POST** `/api/v1/attendance` - Record attendance (via general attendance API)
**POST** `/api/v1/attendance/bulk` - Record bulk attendance (via general attendance API)

## Student API

**Base URL:** `/api/v1/student`

*Requires student or admin role*

### Profile

**GET** `/api/v1/student/me` - Get current student's profile

### Dashboard

**GET** `/api/v1/student/dashboard` - Student's dashboard with summary

### Course Information

**GET** `/api/v1/student/courses` - Get enrolled courses
**GET** `/api/v1/student/courses/:courseId` - Get course details with grades and attendance

### Academic Records

**GET** `/api/v1/student/grades` - Get student's grades
**GET** `/api/v1/student/attendance` - Get student's attendance records
**GET** `/api/v1/student/transcript` - Get academic transcript with GPA

### Announcements

**GET** `/api/v1/student/announcements` - Get announcements for students

## Course API

**Base URL:** `/api/v1/courses`

*Authentication required, role-based access*

### Course Management

**GET** `/api/v1/courses` - List courses (with filtering and pagination)
**GET** `/api/v1/courses/:id` - Get course details
**POST** `/api/v1/courses` - Create course (teachers and admins only)
**PUT** `/api/v1/courses/:id` - Update course (teacher who created it or admin)
**DELETE** `/api/v1/courses/:id` - Delete course (admins only)

### Enrollment

**POST** `/api/v1/courses/:id/enroll` - Enroll student in course (teachers and admins only)
**DELETE** `/api/v1/courses/:id/enroll/:studentId` - Remove student from course (teachers and admins only)

### Query Parameters for GET /api/v1/courses

- `page` (number): Page number for pagination (default: 1)
- `limit` (number): Number of items per page (default: 10)
- `sortBy` (string): Field to sort by (default: 'createdAt')
- `sortOrder` (string): Sort order - 'asc' or 'desc' (default: 'desc')
- `teacher` (string): Filter by teacher ID
- `semester` (string): Filter by semester ('Fall', 'Spring', 'Summer')
- `academicYear` (string): Filter by academic year
- `isActive` (boolean): Filter by active status
- `search` (string): Search in title, description, or code

## Grade API

**Base URL:** `/api/v1/grades`

*Authentication required, role-based access*

### Grade Management

**GET** `/api/v1/grades` - List grades (with filtering and pagination)
**GET** `/api/v1/grades/:id` - Get specific grade
**POST** `/api/v1/grades` - Create grade (teachers and admins only)
**PUT** `/api/v1/grades/:id` - Update grade (teacher who created it or admin)
**DELETE** `/api/v1/grades/:id` - Delete grade (teacher who created it or admin)

### Grade-Specific Endpoints

**GET** `/api/v1/grades/student/:studentId` - Get grades for a specific student
**GET** `/api/v1/grades/student/:studentId/gpa` - Calculate GPA for a student
**GET** `/api/v1/grades/course/:courseId` - Get grades for a specific course

### Query Parameters for GET /api/v1/grades

- `page` (number): Page number for pagination (default: 1)
- `limit` (number): Number of items per page (default: 10)
- `sortBy` (string): Field to sort by (default: 'createdAt')
- `sortOrder` (string): Sort order - 'asc' or 'desc' (default: 'desc')
- `student` (string): Filter by student ID
- `course` (string): Filter by course ID
- `gradeType` (string): Filter by grade type ('assignment', 'quiz', 'exam', 'project', 'participation', 'final')
- `search` (string): Search in title or letter grade

## Attendance API

**Base URL:** `/api/v1/attendance`

*Authentication required, role-based access*

### Attendance Management

**GET** `/api/v1/attendance` - List attendance records (with filtering and pagination)
**GET** `/api/v1/attendance/:id` - Get specific attendance record
**POST** `/api/v1/attendance` - Record attendance (teachers and admins only)
**POST** `/api/v1/attendance/bulk` - Record bulk attendance (teachers and admins only)
**PUT** `/api/v1/attendance/:id` - Update attendance record (teachers and admins only)
**DELETE** `/api/v1/attendance/:id` - Delete attendance record (teachers and admins only)

### Attendance Statistics

**GET** `/api/v1/attendance/stats/:courseId` - Get attendance statistics for a course

### Query Parameters for GET /api/v1/attendance

- `page` (number): Page number for pagination (default: 1)
- `limit` (number): Number of items per page (default: 10)
- `sortBy` (string): Field to sort by (default: 'date')
- `sortOrder` (string): Sort order - 'asc' or 'desc' (default: 'desc')
- `student` (string): Filter by student ID
- `course` (string): Filter by course ID
- `date` (string): Filter by specific date (ISO format)
- `startDate` (string): Start date for date range (ISO format)
- `endDate` (string): End date for date range (ISO format)
- `status` (string): Filter by status ('present', 'absent', 'late', 'excused')

### Bulk Attendance Format

```json
{
  "courseId": "course_id",
  "date": "2024-01-15",
  "attendance": [
    {
      "studentId": "student_id_1",
      "status": "present",
      "notes": "On time"
    },
    {
      "studentId": "student_id_2",
      "status": "absent",
      "notes": "Sick leave"
    }
  ]
}
```

## User API

**Base URL:** `/api/v1/users`

*Authentication required, role-based access*

### User Management (Admin Only)

**GET** `/api/v1/users` - List users (with filtering and pagination)
**GET** `/api/v1/users/:id` - Get specific user
**POST** `/api/v1/users` - Create user (admins only)
**PUT** `/api/v1/users/:id` - Update user (admins only, users can update own profile)
**DELETE** `/api/v1/users/:id` - Delete user (admins only)
**POST** `/api/v1/users/:id/change-password` - Change user password (admins only, users can change own)

### Profile Management

**GET** `/api/v1/users/profile/me` - Get current user's profile
**PUT** `/api/v1/users/profile/me` - Update current user's profile

### Query Parameters for GET /api/v1/users

- `page` (number): Page number for pagination (default: 1)
- `limit` (number): Number of items per page (default: 10)
- `sortBy` (string): Field to sort by (default: 'createdAt')
- `sortOrder` (string): Sort order - 'asc' or 'desc' (default: 'desc')
- `role` (string): Filter by role ('admin', 'teacher', 'student')
- `search` (string): Search in full name or email

## Announcement API

**Base URL:** `/api/v1/announcements`

*Authentication required, role-based access*

### Announcement Management

**GET** `/api/v1/announcements` - List announcements (with filtering and pagination)
**GET** `/api/v1/announcements/:id` - Get specific announcement
**POST** `/api/v1/announcements` - Create announcement (teachers and admins only)
**PUT** `/api/v1/announcements/:id` - Update announcement (author or admin only)
**DELETE** `/api/v1/announcements/:id` - Delete announcement (author or admin only)
**PUT** `/api/v1/announcements/:id/toggle` - Toggle announcement active status (author or admin only)

### Specialized Endpoints

**GET** `/api/v1/announcements/active` - Get active announcements for current user
**GET** `/api/v1/announcements/course/:courseId` - Get announcements for a specific course
**GET** `/api/v1/announcements/user/me` - Get current user's announcements (authored)
**PUT** `/api/v1/announcements/:id/read` - Mark announcement as read

### Query Parameters for GET /api/v1/announcements

- `page` (number): Page number for pagination (default: 1)
- `limit` (number): Number of items per page (default: 10)
- `sortBy` (string): Field to sort by (default: 'publishedAt')
- `sortOrder` (string): Sort order - 'asc' or 'desc' (default: 'desc')
- `type` (string): Filter by type ('general', 'course', 'academic', 'emergency')
- `course` (string): Filter by course ID
- `author` (string): Filter by author ID
- `targetAudience` (string): Filter by target audience
- `isActive` (boolean): Filter by active status
- `search` (string): Search in title or content

## Data Explorer API

**Base URL:** `/api/v1/data`

*Requires admin role*

- **GET** `/api/v1/data/users` - List users (pagination, search by name/email)
- **GET** `/api/v1/data/courses` - List courses (pagination, search by title/description/code)
- **GET** `/api/v1/data/grades` - List grades (pagination)
- **GET** `/api/v1/data/attendances` - List attendance records (pagination)
- **GET** `/api/v1/data/announcements` - List announcements (pagination, search by title/content)

Query params for all:
- `page`, `limit`, `sortBy`, `sortOrder`, `search`

## Error Handling

The API uses consistent error response format:

```json
{
  "error": {
    "message": "Error description",
    "status": 400,
    "details": "Additional error details if available"
  }
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate data)
- `500` - Internal Server Error

## Response Format

All API responses follow a consistent format:

### Success Response

```json
{
  "data": "response_data_here",
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

### Pagination Object (when applicable)

- `page` - Current page number
- `limit` - Number of items per page
- `total` - Total number of items
- `pages` - Total number of pages

## Role-Based Access Control

The API implements comprehensive role-based access control:

- **Admin**: Full access to all resources
- **Teacher**: Access to courses they teach, their students' data, grade management
- **Student**: Access to their own data, enrolled courses, grades, and attendance

## Data Models

### User
```json
{
  "_id": "ObjectId",
  "fullName": "string",
  "email": "string",
  "role": "admin|teacher|student",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Course
```json
{
  "_id": "ObjectId",
  "title": "string",
  "description": "string",
  "code": "string",
  "credits": "number",
  "teacher": "ObjectId",
  "students": ["ObjectId"],
  "semester": "Fall|Spring|Summer",
  "academicYear": "string",
  "isActive": "boolean",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Grade
```json
{
  "_id": "ObjectId",
  "student": "ObjectId",
  "course": "ObjectId",
  "gradeType": "assignment|quiz|exam|project|participation|final",
  "title": "string",
  "score": "number",
  "maxScore": "number",
  "percentage": "number",
  "letterGrade": "string",
  "comments": "string",
  "submittedAt": "Date",
  "gradedBy": "ObjectId",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Attendance
```json
{
  "_id": "ObjectId",
  "student": "ObjectId",
  "course": "ObjectId",
  "date": "Date",
  "status": "present|absent|late|excused",
  "notes": "string",
  "recordedBy": "ObjectId",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

## Getting Started

1. **Install dependencies**: `npm install`
2. **Set up environment variables** (database connection, JWT secrets, etc.)
3. **Run the server**: `npm run dev`
4. **Access API documentation**: Visit `http://localhost:4000/api-docs` for interactive docs and `http://localhost:4000/openapi.json` for the OpenAPI spec (adjust port if different)

## Development

The project uses:
- **Node.js** with **TypeScript**
- **Express.js** for the web framework
- **MongoDB** with **Mongoose** for data persistence
- **JWT** for authentication
- **Joi** for input validation
- **bcryptjs** for password hashing

## Contributing

When adding new features:
1. Update the models if needed
2. Implement controllers with proper error handling and authorization
3. Add routes with validation schemas
4. Update this documentation
5. Add appropriate tests

## Support

For questions or issues, please refer to the project documentation or create an issue in the repository.
