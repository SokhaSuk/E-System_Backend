/**
 * Common Types
 * Shared TypeScript types used across the application
 */

import { Request } from 'express';
import { UserRole } from '../constants/roles';

/**
 * Pagination parameters
 */
export interface PaginationParams {
    page: number;
    limit: number;
    skip: number;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
    data: T[];
    meta: PaginationMeta;
}

/**
 * Sort parameters
 */
export interface SortParams {
    sortBy: string;
    sortOrder: 'asc' | 'desc';
}

/**
 * Filter parameters
 */
export interface FilterParams {
    [key: string]: any;
}

/**
 * Query parameters (pagination + sorting + filtering)
 */
export interface QueryParams extends PaginationParams, SortParams {
    filters?: FilterParams;
    search?: string;
}

/**
 * API Response wrapper
 */
export interface ApiResponse<T = any> {
    status: 'success' | 'error';
    message?: string;
    data?: T;
    meta?: PaginationMeta;
    timestamp: Date;
}

/**
 * Authenticated user payload (from JWT)
 */
export interface AuthUser {
    id: string;
    email: string;
    role: UserRole;
    fullName: string;
}

/**
 * File upload info
 */
export interface UploadedFile {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    destination: string;
    filename: string;
    path: string;
    size: number;
}

/**
 * Date range filter
 */
export interface DateRange {
    startDate?: Date;
    endDate?: Date;
}

/**
 * ID parameter
 */
export type ID = string;

/**
 * Timestamp fields
 */
export interface Timestamps {
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Soft delete fields
 */
export interface SoftDelete {
    deletedAt?: Date;
    isDeleted: boolean;
}

/**
 * Base model interface
 */
export interface BaseModel extends Timestamps {
    _id: ID;
}
