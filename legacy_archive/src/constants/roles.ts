/**
 * User Roles and Permissions
 * Centralized role definitions and permission mappings
 */

export const USER_ROLES = {
    ADMIN: 'admin',
    TEACHER: 'teacher',
    STUDENT: 'student',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const PERMISSIONS = {
    // User Management
    CREATE_USER: 'create:user',
    READ_USER: 'read:user',
    UPDATE_USER: 'update:user',
    DELETE_USER: 'delete:user',

    // Course Management
    CREATE_COURSE: 'create:course',
    READ_COURSE: 'read:course',
    UPDATE_COURSE: 'update:course',
    DELETE_COURSE: 'delete:course',
    ENROLL_STUDENT: 'enroll:student',

    // Attendance
    CREATE_ATTENDANCE: 'create:attendance',
    READ_ATTENDANCE: 'read:attendance',
    UPDATE_ATTENDANCE: 'update:attendance',

    // Grades
    CREATE_GRADE: 'create:grade',
    READ_GRADE: 'read:grade',
    UPDATE_GRADE: 'update:grade',
    DELETE_GRADE: 'delete:grade',

    // Announcements
    CREATE_ANNOUNCEMENT: 'create:announcement',
    READ_ANNOUNCEMENT: 'read:announcement',
    UPDATE_ANNOUNCEMENT: 'update:announcement',
    DELETE_ANNOUNCEMENT: 'delete:announcement',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// Role-based permissions mapping
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
    [USER_ROLES.ADMIN]: [
        // All permissions
        PERMISSIONS.CREATE_USER,
        PERMISSIONS.READ_USER,
        PERMISSIONS.UPDATE_USER,
        PERMISSIONS.DELETE_USER,
        PERMISSIONS.CREATE_COURSE,
        PERMISSIONS.READ_COURSE,
        PERMISSIONS.UPDATE_COURSE,
        PERMISSIONS.DELETE_COURSE,
        PERMISSIONS.ENROLL_STUDENT,
        PERMISSIONS.CREATE_ATTENDANCE,
        PERMISSIONS.READ_ATTENDANCE,
        PERMISSIONS.UPDATE_ATTENDANCE,
        PERMISSIONS.CREATE_GRADE,
        PERMISSIONS.READ_GRADE,
        PERMISSIONS.UPDATE_GRADE,
        PERMISSIONS.DELETE_GRADE,
        PERMISSIONS.CREATE_ANNOUNCEMENT,
        PERMISSIONS.READ_ANNOUNCEMENT,
        PERMISSIONS.UPDATE_ANNOUNCEMENT,
        PERMISSIONS.DELETE_ANNOUNCEMENT,
    ],
    [USER_ROLES.TEACHER]: [
        PERMISSIONS.READ_USER,
        PERMISSIONS.CREATE_COURSE,
        PERMISSIONS.READ_COURSE,
        PERMISSIONS.UPDATE_COURSE,
        PERMISSIONS.ENROLL_STUDENT,
        PERMISSIONS.CREATE_ATTENDANCE,
        PERMISSIONS.READ_ATTENDANCE,
        PERMISSIONS.UPDATE_ATTENDANCE,
        PERMISSIONS.CREATE_GRADE,
        PERMISSIONS.READ_GRADE,
        PERMISSIONS.UPDATE_GRADE,
        PERMISSIONS.CREATE_ANNOUNCEMENT,
        PERMISSIONS.READ_ANNOUNCEMENT,
        PERMISSIONS.UPDATE_ANNOUNCEMENT,
    ],
    [USER_ROLES.STUDENT]: [
        PERMISSIONS.READ_COURSE,
        PERMISSIONS.READ_ATTENDANCE,
        PERMISSIONS.READ_GRADE,
        PERMISSIONS.READ_ANNOUNCEMENT,
    ],
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
    return ROLE_PERMISSIONS[role].includes(permission);
}

/**
 * Check if a role has all specified permissions
 */
export function hasAllPermissions(
    role: UserRole,
    permissions: Permission[]
): boolean {
    return permissions.every(permission => hasPermission(role, permission));
}

/**
 * Check if a role has any of the specified permissions
 */
export function hasAnyPermission(
    role: UserRole,
    permissions: Permission[]
): boolean {
    return permissions.some(permission => hasPermission(role, permission));
}
