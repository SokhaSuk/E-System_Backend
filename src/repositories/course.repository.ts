import { BaseRepository } from './base.repository';
import { CourseModel, CourseDocument } from '../models/Course';
import { FilterQuery } from 'mongoose';
import { PaginationOptions } from '../interfaces/pagination.interface';

/**
 * Course repository for data access operations
 */
export class CourseRepository extends BaseRepository<CourseDocument> {
    constructor() {
        super(CourseModel);
    }

    /**
     * Find course by code
     */
    async findByCode(code: string): Promise<CourseDocument | null> {
        return this.model.findOne({ code }).exec();
    }

    /**
     * Find courses with pagination and population
     */
    async findWithPagination(
        filter: FilterQuery<CourseDocument>,
        options: PaginationOptions
    ): Promise<{ courses: CourseDocument[]; total: number }> {
        const { page, limit, sortBy = 'createdAt', sortOrder = 'desc' } = options;
        const skip = (page - 1) * limit;
        const sort: any = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

        const [courses, total] = await Promise.all([
            this.model
                .find(filter)
                .populate('teacher', 'fullName email')
                .populate('students', 'fullName email')
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .exec(),
            this.model.countDocuments(filter).exec(),
        ]);

        return { courses, total };
    }

    /**
     * Find course by ID with population
     */
    async findByIdWithPopulation(id: string): Promise<CourseDocument | null> {
        return this.model
            .findById(id)
            .populate('teacher', 'fullName email')
            .populate('students', 'fullName email')
            .exec();
    }

    /**
     * Add student to course
     */
    async addStudent(courseId: string, studentId: string): Promise<CourseDocument | null> {
        return this.model
            .findByIdAndUpdate(
                courseId,
                { $addToSet: { students: studentId } },
                { new: true }
            )
            .populate('students', 'fullName email')
            .exec();
    }

    /**
     * Remove student from course
     */
    async removeStudent(courseId: string, studentId: string): Promise<CourseDocument | null> {
        return this.model
            .findByIdAndUpdate(
                courseId,
                { $pull: { students: studentId } },
                { new: true }
            )
            .populate('students', 'fullName email')
            .exec();
    }
}

// Export singleton instance
export const courseRepository = new CourseRepository();
