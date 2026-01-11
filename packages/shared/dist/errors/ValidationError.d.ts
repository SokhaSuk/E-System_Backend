/**
 * Validation Error
 * Thrown when request validation fails
 */
import { AppError } from './AppError';
export interface ValidationErrorDetail {
    field: string;
    message: string;
    value?: any;
}
export declare class ValidationError extends AppError {
    constructor(message?: string, details?: ValidationErrorDetail[]);
    static fromJoiError(error: any): ValidationError;
}
//# sourceMappingURL=ValidationError.d.ts.map