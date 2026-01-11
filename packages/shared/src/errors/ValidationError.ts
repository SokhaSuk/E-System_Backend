/**
 * Validation Error
 * Thrown when request validation fails
 */

import { HTTP_STATUS } from '../constants/http-status';
import { AppError } from './AppError';

export interface ValidationErrorDetail {
    field: string;
    message: string;
    value?: any;
}

export class ValidationError extends AppError {
    constructor(
        message: string = 'Validation failed',
        details?: ValidationErrorDetail[]
    ) {
        super(message, HTTP_STATUS.UNPROCESSABLE_ENTITY, true, details);
        Object.setPrototypeOf(this, ValidationError.prototype);
    }

    static fromJoiError(error: any): ValidationError {
        const details: ValidationErrorDetail[] = error.details?.map((detail: any) => ({
            field: detail.path.join('.'),
            message: detail.message,
            value: detail.context?.value,
        })) || [];

        return new ValidationError('Validation failed', details);
    }
}
