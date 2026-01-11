import mongoose, { Model, Document } from 'mongoose';
import type { PaginationOptions } from '../interfaces/pagination.interface';

// Fallback types for Mongoose 9 compatibility
// Fallback types for Mongoose 9 compatibility
export type FilterQuery<T> = Record<string, any>;
export type UpdateQuery<T> = Record<string, any>;

/**
 * Base repository class providing common CRUD operations
 * @template T - The document type
 */
export class BaseRepository<T extends Document> {
    constructor(protected model: Model<T>) { }

    /**
     * Find all documents matching the filter with pagination
     */
    async findAll(
        filter: FilterQuery<T> = {},
        options: Partial<PaginationOptions> = {}
    ): Promise<T[]> {
        const {
            page = 1,
            limit = 10,
            sortBy = 'createdAt',
            sortOrder = 'desc',
        } = options;

        const skip = (page - 1) * limit;
        const sort: any = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

        return this.model.find(filter).sort(sort).skip(skip).limit(limit).exec();
    }

    /**
     * Find a single document by ID
     */
    async findById(id: string): Promise<T | null> {
        return this.model.findById(id).exec();
    }

    /**
     * Find one document matching the filter
     */
    async findOne(filter: FilterQuery<T>): Promise<T | null> {
        return this.model.findOne(filter).exec();
    }

    /**
     * Create a new document
     */
    async create(data: Partial<T>): Promise<T> {
        const document = new this.model(data);
        return document.save();
    }

    /**
     * Update a document by ID
     */
    async update(id: string, data: UpdateQuery<T>): Promise<T | null> {
        return this.model
            .findByIdAndUpdate(id, data, { new: true, runValidators: true })
            .exec();
    }

    /**
     * Delete a document by ID
     */
    async delete(id: string): Promise<T | null> {
        return this.model.findByIdAndDelete(id).exec();
    }

    /**
     * Count documents matching the filter
     */
    async count(filter: FilterQuery<T> = {}): Promise<number> {
        return this.model.countDocuments(filter).exec();
    }

    /**
     * Check if a document exists
     */
    async exists(filter: FilterQuery<T>): Promise<boolean> {
        const count = await this.model.countDocuments(filter).limit(1).exec();
        return count > 0;
    }
}
