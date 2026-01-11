/**
 * Error Messages
 * Centralized error messages for consistent error handling
 */
export declare const ERROR_MESSAGES: {
    readonly INVALID_CREDENTIALS: "Invalid email or password";
    readonly UNAUTHORIZED: "Authentication required";
    readonly TOKEN_EXPIRED: "Token has expired";
    readonly TOKEN_INVALID: "Invalid token";
    readonly INSUFFICIENT_PERMISSIONS: "Insufficient permissions";
    readonly USER_NOT_FOUND: "User not found";
    readonly USER_ALREADY_EXISTS: "User with this email already exists";
    readonly INVALID_ADMIN_CODE: "Invalid admin signup code";
    readonly COURSE_NOT_FOUND: "Course not found";
    readonly COURSE_ALREADY_EXISTS: "Course with this code already exists";
    readonly ENROLLMENT_FAILED: "Failed to enroll student";
    readonly ALREADY_ENROLLED: "Student is already enrolled in this course";
    readonly ATTENDANCE_NOT_FOUND: "Attendance record not found";
    readonly INVALID_DATE: "Invalid date format";
    readonly GRADE_NOT_FOUND: "Grade not found";
    readonly INVALID_SCORE: "Invalid score value";
    readonly ANNOUNCEMENT_NOT_FOUND: "Announcement not found";
    readonly VALIDATION_ERROR: "Validation error";
    readonly REQUIRED_FIELD: "This field is required";
    readonly INVALID_EMAIL: "Invalid email format";
    readonly INVALID_PASSWORD: "Password must be at least 6 characters";
    readonly INTERNAL_SERVER_ERROR: "An unexpected error occurred";
    readonly NOT_FOUND: "Resource not found";
    readonly BAD_REQUEST: "Bad request";
    readonly FORBIDDEN: "Access forbidden";
};
export type ErrorMessage = (typeof ERROR_MESSAGES)[keyof typeof ERROR_MESSAGES];
//# sourceMappingURL=error-messages.d.ts.map