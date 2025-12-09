/**
 * Conflict Error
 * Thrown when there's a conflict (e.g., duplicate resource)
 */

import { HTTP_STATUS } from '../constants/http-status';
import { AppError } from './app-error';

export class ConflictError extends AppError {
    constructor(message: string = 'Resource already exists') {
        super(message, HTTP_STATUS.CONFLICT);
        Object.setPrototypeOf(this, ConflictError.prototype);
    }
}
