import { userRepository } from '../repositories/user.repository';
import { hashPassword, verifyPassword } from '../utils/password';
import { createError } from '../middleware/errorHandler';
import {
    CreateUserDto,
    UpdateUserDto,
    ChangePasswordDto,
    UserResponseDto,
    UserFilterDto,
} from '../dto/user/user.dto';
import { PaginationOptions } from '../interfaces/pagination.interface';
import { UserDocument } from '../models/User';

/**
 * User service containing business logic
 */
export class UserService {
    /**
     * List users with role-based filtering and pagination
     */
    async listUsers(
        filter: UserFilterDto,
        pagination: PaginationOptions,
        currentUser: UserDocument
    ) {
        const dbFilter: any = {};

        // Role-based filtering
        if (currentUser.role === 'teacher') {
            dbFilter.role = 'student';
        } else if (currentUser.role === 'student') {
            throw createError('Students cannot view other users', 403);
        }

        // Admin can filter by role
        if (filter.role && currentUser.role === 'admin') {
            dbFilter.role = filter.role;
        }

        // Search filter
        if (filter.search) {
            dbFilter.$or = [
                { fullName: { $regex: filter.search, $options: 'i' } },
                { email: { $regex: filter.search, $options: 'i' } },
            ];
        }

        const { users, total } = await userRepository.findWithPagination(
            dbFilter,
            pagination
        );

        return {
            users: users.map(user => this.toResponseDto(user)),
            total,
        };
    }

    /**
     * Get user by ID with authorization
     */
    async getUserById(id: string, currentUser: UserDocument): Promise<UserResponseDto> {
        // Students can only view their own profile
        if (currentUser.role === 'student' && id !== currentUser._id.toString()) {
            throw createError('Students can only view their own profile', 403);
        }

        // Teachers can only view student profiles
        if (currentUser.role === 'teacher' && id !== currentUser._id.toString()) {
            const targetUser = await userRepository.findByIdWithoutPassword(id);
            if (!targetUser) {
                throw createError('User not found', 404);
            }
            if (targetUser.role !== 'student') {
                throw createError('Teachers can only view student profiles', 403);
            }
            return this.toResponseDto(targetUser);
        }

        const user = await userRepository.findByIdWithoutPassword(id);
        if (!user) {
            throw createError('User not found', 404);
        }

        return this.toResponseDto(user);
    }

    /**
     * Create a new user (admin only)
     */
    async createUser(
        data: CreateUserDto,
        currentUser: UserDocument
    ): Promise<UserResponseDto> {
        // Only admins can create users
        if (currentUser.role !== 'admin') {
            throw createError('Only administrators can create users', 403);
        }

        // Validate required fields
        if (!data.fullName || !data.email || !data.password) {
            throw createError('Full name, email, and password are required', 400);
        }

        // Check if user already exists
        const existingUser = await userRepository.findByEmail(data.email);
        if (existingUser) {
            throw createError('User with this email already exists', 409);
        }

        // Hash password
        const passwordHash = await hashPassword(data.password);

        // Create user
        const user = await userRepository.create({
            fullName: data.fullName,
            email: data.email.toLowerCase(),
            passwordHash,
            role: data.role || 'student',
            nameKh: data.nameKh,
            gender: data.gender,
            dateOfBirth: data.dateOfBirth,
            placeOfBirth: data.placeOfBirth,
            phone: data.phone,
            occupation: data.occupation,
            address: data.address,
            studyShift: data.studyShift,
            avatar: data.avatar,
            nationality: data.nationality,
            studentId: data.studentId,
        } as any);

        return this.toResponseDto(user);
    }

    /**
     * Update user information
     */
    async updateUser(
        id: string,
        data: UpdateUserDto,
        currentUser: UserDocument
    ): Promise<UserResponseDto> {
        // Users can update their own profile, admins can update any profile
        if (currentUser.role !== 'admin' && id !== currentUser._id.toString()) {
            throw createError('Not authorized to update this user', 403);
        }

        const user = await userRepository.findById(id);
        if (!user) {
            throw createError('User not found', 404);
        }

        // Only admins can change user roles
        if (data.role && currentUser.role !== 'admin') {
            throw createError('Only administrators can change user roles', 403);
        }

        // Check email uniqueness if changing email
        if (data.email && data.email.toLowerCase() !== user.email) {
            const emailExists = await userRepository.emailExists(data.email, id);
            if (emailExists) {
                throw createError('Email already taken by another user', 409);
            }
        }

        // Update user fields
        const updateData: any = {};
        if (data.fullName) updateData.fullName = data.fullName;
        if (data.email) updateData.email = data.email.toLowerCase();
        if (data.role) updateData.role = data.role;
        if (data.nameKh !== undefined) updateData.nameKh = data.nameKh;
        if (data.gender !== undefined) updateData.gender = data.gender;
        if (data.dateOfBirth !== undefined) updateData.dateOfBirth = data.dateOfBirth;
        if (data.placeOfBirth !== undefined) updateData.placeOfBirth = data.placeOfBirth;
        if (data.phone !== undefined) updateData.phone = data.phone;
        if (data.occupation !== undefined) updateData.occupation = data.occupation;
        if (data.address !== undefined) updateData.address = data.address;
        if (data.studyShift !== undefined) updateData.studyShift = data.studyShift;
        if (data.avatar !== undefined) updateData.avatar = data.avatar;
        if (data.nationality !== undefined) updateData.nationality = data.nationality;
        if (data.studentId !== undefined) updateData.studentId = data.studentId;

        const updatedUser = await userRepository.update(id, updateData);
        if (!updatedUser) {
            throw createError('Failed to update user', 500);
        }

        return this.toResponseDto(updatedUser);
    }

    /**
     * Change user password
     */
    async changePassword(
        id: string,
        passwords: ChangePasswordDto,
        currentUser: UserDocument
    ): Promise<{ message: string }> {
        // Users can only change their own password, admins can change any password
        if (currentUser.role !== 'admin' && id !== currentUser._id.toString()) {
            throw createError('Not authorized to change this password', 403);
        }

        if (!passwords.newPassword || passwords.newPassword.length < 6) {
            throw createError(
                'New password must be at least 6 characters long',
                400
            );
        }

        const user = await userRepository.findById(id);
        if (!user) {
            throw createError('User not found', 404);
        }

        // If not admin, verify current password
        if (currentUser.role !== 'admin') {
            if (!passwords.currentPassword) {
                throw createError('Current password is required', 400);
            }
            const isValidPassword = await verifyPassword(
                passwords.currentPassword,
                user.passwordHash
            );
            if (!isValidPassword) {
                throw createError('Current password is incorrect', 400);
            }
        }

        // Hash new password
        const passwordHash = await hashPassword(passwords.newPassword);

        // Update password
        await userRepository.updatePassword(id, passwordHash);

        return { message: 'Password updated successfully' };
    }

    /**
     * Delete user (admin only)
     */
    async deleteUser(
        id: string,
        currentUser: UserDocument
    ): Promise<{ message: string }> {
        // Only admins can delete users
        if (currentUser.role !== 'admin') {
            throw createError('Only administrators can delete users', 403);
        }

        const user = await userRepository.delete(id);
        if (!user) {
            throw createError('User not found', 404);
        }

        return { message: 'User deleted successfully' };
    }

    /**
     * Get current user's profile
     */
    async getUserProfile(userId: string): Promise<UserResponseDto> {
        const user = await userRepository.findByIdWithoutPassword(userId);
        if (!user) {
            throw createError('User not found', 404);
        }

        return this.toResponseDto(user);
    }

    /**
     * Update current user's profile
     */
    async updateUserProfile(
        userId: string,
        data: UpdateUserDto
    ): Promise<UserResponseDto> {
        const user = await userRepository.findById(userId);
        if (!user) {
            throw createError('User not found', 404);
        }

        // Cannot change role through profile update
        if (data.role) {
            throw createError('Cannot change role through profile update', 403);
        }

        // Check email uniqueness if changing email
        if (data.email && data.email.toLowerCase() !== user.email) {
            const emailExists = await userRepository.emailExists(data.email, userId);
            if (emailExists) {
                throw createError('Email already taken by another user', 409);
            }
        }

        // Update allowed fields
        const updateData: any = {};
        if (data.fullName) updateData.fullName = data.fullName;
        if (data.email) updateData.email = data.email.toLowerCase();
        if (data.nameKh !== undefined) updateData.nameKh = data.nameKh;
        if (data.gender !== undefined) updateData.gender = data.gender;
        if (data.dateOfBirth !== undefined) updateData.dateOfBirth = data.dateOfBirth;
        if (data.placeOfBirth !== undefined) updateData.placeOfBirth = data.placeOfBirth;
        if (data.phone !== undefined) updateData.phone = data.phone;
        if (data.occupation !== undefined) updateData.occupation = data.occupation;
        if (data.address !== undefined) updateData.address = data.address;
        if (data.studyShift !== undefined) updateData.studyShift = data.studyShift;
        if (data.avatar !== undefined) updateData.avatar = data.avatar;
        if (data.nationality !== undefined) updateData.nationality = data.nationality;
        if (data.studentId !== undefined) updateData.studentId = data.studentId;

        const updatedUser = await userRepository.update(userId, updateData);
        if (!updatedUser) {
            throw createError('Failed to update profile', 500);
        }

        return this.toResponseDto(updatedUser);
    }

    /**
     * Change current user's password
     */
    async changeUserProfilePassword(
        userId: string,
        passwords: ChangePasswordDto
    ): Promise<{ message: string }> {
        if (!passwords.currentPassword) {
            throw createError('Current password is required', 400);
        }

        if (!passwords.newPassword || passwords.newPassword.length < 6) {
            throw createError(
                'New password must be at least 6 characters long',
                400
            );
        }

        const user = await userRepository.findById(userId);
        if (!user) {
            throw createError('User not found', 404);
        }

        // Verify current password
        const isValidPassword = await verifyPassword(
            passwords.currentPassword,
            user.passwordHash
        );
        if (!isValidPassword) {
            throw createError('Current password is incorrect', 400);
        }

        // Hash new password
        const passwordHash = await hashPassword(passwords.newPassword);

        // Update password
        await userRepository.updatePassword(userId, passwordHash);

        return { message: 'Password updated successfully' };
    }

    /**
     * Convert User model to response DTO
     */
    private toResponseDto(user: UserDocument): UserResponseDto {
        return {
            _id: user._id.toString(),
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            nameKh: user.nameKh,
            gender: user.gender,
            dateOfBirth: user.dateOfBirth,
            placeOfBirth: user.placeOfBirth,
            phone: user.phone,
            occupation: user.occupation,
            address: user.address,
            studyShift: user.studyShift,
            avatar: user.avatar,
            nationality: user.nationality,
            studentId: user.studentId,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
}

// Export singleton instance
export const userService = new UserService();

