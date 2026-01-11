import { BaseRepository, FilterQuery } from './base.repository';
import { ExerciseModel, ExerciseDocument } from '../models/Exercise';

import { PaginationOptions } from '../interfaces/pagination.interface';

/**
 * Exercise repository for data access operations
 */
export class ExerciseRepository extends BaseRepository<ExerciseDocument> {
    constructor() {
        super(ExerciseModel);
    }

    /**
     * Find exercises with pagination and filters
     */
    async findWithPagination(
        filter: FilterQuery<ExerciseDocument>,
        options: PaginationOptions
    ): Promise<{ exercises: ExerciseDocument[]; total: number }> {
        const { page, limit, sortBy = 'createdAt', sortOrder = 'desc' } = options;
        const skip = (page - 1) * limit;
        const sort: any = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

        const [exercises, total] = await Promise.all([
            this.model
                .find(filter)
                .populate('course', 'title code')
                .populate('createdBy', 'fullName email')
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .exec(),
            this.model.countDocuments(filter).exec(),
        ]);

        return { exercises, total };
    }

    /**
     * Find exercise by ID with populated references
     */
    async findByIdWithDetails(id: string): Promise<ExerciseDocument | null> {
        return this.model
            .findById(id)
            .populate('course', 'title code')
            .populate('createdBy', 'fullName email')
            .exec();
    }

    /**
     * Find exercises by course
     */
    async findByCourse(courseId: string): Promise<ExerciseDocument[]> {
        return this.model
            .find({ course: courseId, isActive: true })
            .populate('createdBy', 'fullName email')
            .sort({ dueDate: 1 })
            .exec();
    }

    /**
     * Find active exercises due after a specific date
     */
    async findUpcoming(
        courseId: string,
        fromDate: Date
    ): Promise<ExerciseDocument[]> {
        return this.model
            .find({
                course: courseId,
                isActive: true,
                dueDate: { $gte: fromDate },
            })
            .populate('createdBy', 'fullName email')
            .sort({ dueDate: 1 })
            .exec();
    }
}

// Export singleton instance
export const exerciseRepository = new ExerciseRepository();
