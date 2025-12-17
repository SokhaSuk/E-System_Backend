import { PaginationOptions } from '../interfaces/pagination.interface';

/**
 * Parse pagination options from query parameters
 */
export function parsePaginationOptions(query: any): PaginationOptions {
    return {
        page: Number(query.page) || 1,
        limit: Number(query.limit) || 10,
        sortBy: query.sortBy || 'createdAt',
        sortOrder: query.sortOrder === 'asc' ? 'asc' : 'desc',
    };
}

/**
 * Build paginated response object
 */
export function buildPaginatedResponse<T>(
    data: T[],
    total: number,
    options: PaginationOptions
) {
    return {
        data,
        pagination: {
            page: options.page,
            limit: options.limit,
            total,
            pages: Math.ceil(total / options.limit),
        },
    };
}
