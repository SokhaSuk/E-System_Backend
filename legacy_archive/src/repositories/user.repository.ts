import { BaseRepository, FilterQuery } from './base.repository';
import { UserModel, UserDocument } from '../models/User';

import { PaginationOptions } from '../interfaces/pagination.interface';

/**
 * User repository for data access operations
 */
export class UserRepository extends BaseRepository<UserDocument> {
    constructor() {
        super(UserModel);
    }

    /**
     * Find user by email
     */
    async findByEmail(email: string): Promise<UserDocument | null> {
        return this.model.findOne({ email: email.toLowerCase() }).exec();
    }

    /**
     * Find users with pagination and filters
     */
    async findWithPagination(
        filter: FilterQuery<UserDocument>,
        options: PaginationOptions
    ): Promise<{ users: UserDocument[]; total: number }> {
        const { page, limit, sortBy = 'createdAt', sortOrder = 'desc' } = options;
        const skip = (page - 1) * limit;
        const sort: any = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

        const [users, total] = await Promise.all([
            this.model
                .find(filter)
                .select('-passwordHash')
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .exec(),
            this.model.countDocuments(filter).exec(),
        ]);

        return { users, total };
    }

    /**
     * Find user by ID without password hash
     */
    async findByIdWithoutPassword(id: string): Promise<UserDocument | null> {
        return this.model.findById(id).select('-passwordHash').exec();
    }

    /**
     * Update user password
     */
    async updatePassword(
        userId: string,
        passwordHash: string
    ): Promise<UserDocument | null> {
        return this.model
            .findByIdAndUpdate(userId, { passwordHash }, { new: true })
            .select('-passwordHash')
            .exec();
    }

    /**
     * Check if email exists (excluding specific user ID)
     */
    async emailExists(email: string, excludeUserId?: string): Promise<boolean> {
        const filter: FilterQuery<UserDocument> = { email: email.toLowerCase() };
        if (excludeUserId) {
            filter._id = { $ne: excludeUserId };
        }
        return this.exists(filter);
    }
}

// Export singleton instance
export const userRepository = new UserRepository();
