/**
 * Generic service response wrapper
 */
export interface ServiceResponse<T> {
    success: boolean;
    data?: T;
    error?: {
        message: string;
        code?: string;
        statusCode?: number;
    };
}

/**
 * Service operation result
 */
export type ServiceResult<T> = Promise<T>;
