/**
 * Not Found Error
 * Thrown when a requested resource is not found
 */
import { AppError } from './AppError';
export declare class NotFoundError extends AppError {
    constructor(resource?: string, identifier?: string | number);
}
//# sourceMappingURL=NotFoundError.d.ts.map