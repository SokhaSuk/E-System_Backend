/**
 * DTO for creating a new user
 */
export interface CreateUserDto {
    fullName: string;
    email: string;
    password: string;
    role?: 'admin' | 'teacher' | 'student';
}

/**
 * DTO for updating user information
 */
export interface UpdateUserDto {
    fullName?: string;
    email?: string;
    role?: 'admin' | 'teacher' | 'student';
}

/**
 * DTO for changing user password
 */
export interface ChangePasswordDto {
    currentPassword?: string;
    newPassword: string;
}

/**
 * User response DTO (without sensitive data)
 */
export interface UserResponseDto {
    _id: string;
    fullName: string;
    email: string;
    role: 'admin' | 'teacher' | 'student';
    createdAt: Date;
    updatedAt: Date;
}

/**
 * User list filter options
 */
export interface UserFilterDto {
    role?: 'admin' | 'teacher' | 'student';
    search?: string;
}
