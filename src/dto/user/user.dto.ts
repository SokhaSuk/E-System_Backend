/**
 * DTO for creating a new user
 */
export interface CreateUserDto {
    fullName: string;
    email: string;
    password: string;
    role?: 'admin' | 'teacher' | 'student';
    nameKh?: string;
    gender?: string;
    dateOfBirth?: Date;
    placeOfBirth?: string;
    phone?: string;
    occupation?: string;
    address?: string;
    studyShift?: string;
    avatar?: string;
    nationality?: string;
    studentId?: string;
}

/**
 * DTO for updating user information
 */
export interface UpdateUserDto {
    fullName?: string;
    email?: string;
    role?: 'admin' | 'teacher' | 'student';
    nameKh?: string;
    gender?: string;
    dateOfBirth?: Date;
    placeOfBirth?: string;
    phone?: string;
    occupation?: string;
    address?: string;
    studyShift?: string;
    avatar?: string;
    nationality?: string;
    studentId?: string;
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
    nameKh?: string;
    gender?: string;
    dateOfBirth?: Date;
    placeOfBirth?: string;
    phone?: string;
    occupation?: string;
    address?: string;
    studyShift?: string;
    avatar?: string;
    nationality?: string;
    studentId?: string;
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
