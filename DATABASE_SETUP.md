# E-System Database Setup Guide

This guide provides comprehensive instructions for setting up the E-System database with MongoDB.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Database Setup Options](#database-setup-options)
3. [Quick Start (Docker)](#quick-start-docker)
4. [Manual Setup](#manual-setup)
5. [Database Schema](#database-schema)
6. [Sample Data](#sample-data)
7. [Troubleshooting](#troubleshooting)

## 🔧 Prerequisites

- Node.js 18+ installed
- MongoDB (local installation or MongoDB Atlas account)
- Docker (optional, for containerized setup)

## 🚀 Database Setup Options

### Option 1: Docker Compose (Recommended for Development)
```bash
# Start all services including MongoDB
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Option 2: Node.js Script
```bash
# Install dependencies
npm install

# Run database setup script
npm run db:setup
```

### Option 3: MongoDB Shell Script
```bash
# Connect to MongoDB and run the script
mongosh < database-setup.mongodb
```

## ⚡ Quick Start (Docker)

1. **Start the database and services:**
   ```bash
   docker-compose up -d
   ```

2. **Verify services are running:**
   - MongoDB: `http://localhost:27017`
   - Mongo Express (Admin UI): `http://localhost:8081`
   - Backend API: `http://localhost:4000`

3. **Access Mongo Express:**
   - Username: `admin`
   - Password: `admin123`

4. **Start your backend:**
   ```bash
   npm run dev
   ```

## 🔧 Manual Setup

### 1. Install MongoDB

**Windows:**
```bash
# Download and install MongoDB Community Server
# https://www.mongodb.com/try/download/community
```

**macOS:**
```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb/brew/mongodb-community
```

**Linux (Ubuntu):**
```bash
# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Create list file for MongoDB
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update package database
sudo apt-get update

# Install MongoDB
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

### 2. Create Environment File

Create a `.env` file in your project root:

```env
# Server Configuration
NODE_ENV=development
PORT=4000

# Database Configuration
MONGO_URI=mongodb://127.0.0.1:27017/e_system

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
ADMIN_SIGNUP_CODE=admin123

# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Frontend URL
FRONTEND_URL=http://localhost:3000

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
CORS_CREDENTIALS=true

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
RATE_LIMIT_AUTH_MAX=5

# File Upload
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/jpg,image/png,image/gif,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain,text/csv
UPLOAD_PATH=uploads

# Logging
LOG_LEVEL=info
ENABLE_FILE_LOGGING=false
```

### 3. Run Database Setup

```bash
# Install dependencies
npm install

# Run database setup
npm run db:setup
```

## 📊 Database Schema

### Collections

1. **users** - User management (admin, teacher, student)
2. **courses** - Course information and enrollment
3. **attendance** - Student attendance tracking
4. **grades** - Student grades and assessments
5. **announcements** - System announcements

### Indexes

#### Users Collection
```javascript
// Unique email index
db.users.createIndex({ "email": 1 }, { unique: true })

// Role-based queries
db.users.createIndex({ "role": 1 })
```

#### Courses Collection
```javascript
// Unique course code
db.courses.createIndex({ "code": 1 }, { unique: true })

// Teacher's courses
db.courses.createIndex({ "teacher": 1, "isActive": 1 })

// Student's courses
db.courses.createIndex({ "students": 1, "isActive": 1 })
```

#### Attendance Collection
```javascript
// Prevent duplicate attendance records
db.attendance.createIndex(
    { "student": 1, "course": 1, "date": 1 }, 
    { unique: true }
)

// Course attendance queries
db.attendance.createIndex({ "course": 1, "date": 1 })

// Student attendance queries
db.attendance.createIndex({ "student": 1, "date": 1 })
```

#### Grades Collection
```javascript
// Student grades in course
db.grades.createIndex({ "student": 1, "course": 1 })

// Course grade types
db.grades.createIndex({ "course": 1, "gradeType": 1 })

// Student grade types
db.grades.createIndex({ "student": 1, "gradeType": 1 })
```

#### Announcements Collection
```javascript
// Active announcements by type
db.announcements.createIndex({ "type": 1, "isActive": 1, "publishedAt": -1 })

// Course announcements
db.announcements.createIndex({ "course": 1, "isActive": 1, "publishedAt": -1 })

// Target audience announcements
db.announcements.createIndex({ "targetAudience": 1, "isActive": 1, "publishedAt": -1 })
```

## 📝 Sample Data

The setup script creates the following sample data:

### Users
- **Admin**: `admin@university.edu` / `admin123`
- **Teachers**: 
  - `sarah.johnson@university.edu` / `teacher123`
  - `michael.chen@university.edu` / `teacher123`
  - `emily.rodriguez@university.edu` / `teacher123`
- **Students**:
  - `john.smith@student.university.edu` / `student123`
  - `maria.garcia@student.university.edu` / `student123`
  - `david.kim@student.university.edu` / `student123`
  - `lisa.wang@student.university.edu` / `student123`

### Courses
- CS101: Introduction to Computer Science
- MATH201: Advanced Mathematics
- ENG101: English Literature

### Sample Data Counts
- 8 users (1 admin, 3 teachers, 4 students)
- 3 courses
- 60 attendance records (past week)
- 48 grade records (4 types × 3 courses × 4 students)
- 2 announcements

## 🔍 Database Queries

### Useful MongoDB Queries

#### Get all users by role
```javascript
db.users.find({ role: "teacher" })
db.users.find({ role: "student" })
```

#### Get courses for a specific teacher
```javascript
db.courses.find({ 
    teacher: ObjectId("teacher_id_here"), 
    isActive: true 
})
```

#### Get attendance for a course on a specific date
```javascript
db.attendance.find({ 
    course: ObjectId("course_id_here"), 
    date: new Date("2024-01-15") 
})
```

#### Get student grades in a course
```javascript
db.grades.find({ 
    student: ObjectId("student_id_here"), 
    course: ObjectId("course_id_here") 
}).sort({ createdAt: -1 })
```

#### Get active announcements for students
```javascript
db.announcements.find({ 
    targetAudience: { $in: ["student", "all"] }, 
    isActive: true,
    $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } }
    ]
}).sort({ publishedAt: -1 })
```

## 🛠️ Troubleshooting

### Common Issues

#### 1. Connection Refused
```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Start MongoDB if not running
sudo systemctl start mongod
```

#### 2. Authentication Failed
```bash
# Check MongoDB connection string
echo $MONGO_URI

# Test connection
mongosh "mongodb://127.0.0.1:27017/e_system"
```

#### 3. Port Already in Use
```bash
# Check what's using port 27017
sudo lsof -i :27017

# Kill process if needed
sudo kill -9 <PID>
```

#### 4. Docker Issues
```bash
# Remove all containers and volumes
docker-compose down -v

# Rebuild and start
docker-compose up --build -d
```

### Reset Database

```bash
# Using Node.js script
npm run db:reset

# Using MongoDB shell
mongosh
use e_system
db.dropDatabase()
exit
mongosh < database-setup.mongodb
```

### Backup and Restore

#### Backup
```bash
# Backup entire database
mongodump --db e_system --out ./backup

# Backup specific collection
mongoexport --db e_system --collection users --out users.json
```

#### Restore
```bash
# Restore entire database
mongorestore --db e_system ./backup/e_system

# Restore specific collection
mongoimport --db e_system --collection users --file users.json
```

## 📞 Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Verify your MongoDB installation
3. Check the application logs: `npm run dev`
4. Test database connection: `npm run db:setup`

## 🎯 Next Steps

After successful database setup:

1. **Start the backend server:**
   ```bash
   npm run dev
   ```

2. **Test API endpoints:**
   ```bash
   curl http://localhost:4000/health
   curl http://localhost:4000/api
   ```

3. **Login with admin credentials:**
   - Email: `admin@university.edu`
   - Password: `admin123`

4. **Explore the API documentation:**
   - Visit: `http://localhost:4000/api`

5. **Access database admin (if using Docker):**
   - Visit: `http://localhost:8081`
   - Username: `admin`
   - Password: `admin123`
