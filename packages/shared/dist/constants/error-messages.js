"use strict";
/**
 * Error Messages
 * Centralized error messages for consistent error handling
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ERROR_MESSAGES = void 0;
exports.ERROR_MESSAGES = {
    // Authentication
    INVALID_CREDENTIALS: 'Invalid email or password',
    UNAUTHORIZED: 'Authentication required',
    TOKEN_EXPIRED: 'Token has expired',
    TOKEN_INVALID: 'Invalid token',
    INSUFFICIENT_PERMISSIONS: 'Insufficient permissions',
    // User
    USER_NOT_FOUND: 'User not found',
    USER_ALREADY_EXISTS: 'User with this email already exists',
    INVALID_ADMIN_CODE: 'Invalid admin signup code',
    // Course
    COURSE_NOT_FOUND: 'Course not found',
    COURSE_ALREADY_EXISTS: 'Course with this code already exists',
    ENROLLMENT_FAILED: 'Failed to enroll student',
    ALREADY_ENROLLED: 'Student is already enrolled in this course',
    // Attendance
    ATTENDANCE_NOT_FOUND: 'Attendance record not found',
    INVALID_DATE: 'Invalid date format',
    // Grade
    GRADE_NOT_FOUND: 'Grade not found',
    INVALID_SCORE: 'Invalid score value',
    // Announcement
    ANNOUNCEMENT_NOT_FOUND: 'Announcement not found',
    // Validation
    VALIDATION_ERROR: 'Validation error',
    REQUIRED_FIELD: 'This field is required',
    INVALID_EMAIL: 'Invalid email format',
    INVALID_PASSWORD: 'Password must be at least 6 characters',
    // General
    INTERNAL_SERVER_ERROR: 'An unexpected error occurred',
    NOT_FOUND: 'Resource not found',
    BAD_REQUEST: 'Bad request',
    FORBIDDEN: 'Access forbidden',
};
