/**
 * Authentication Error
 * Thrown when authentication fails
 */

import { HTTP_STATUS } from '../constants/http-status';
import { ERROR_MESSAGES } from '../constants/error-messages';
import { AppError } from './AppError';

export class UnauthorizedError extends AppError {
    constructor(message: string = ERROR_MESSAGES.UNAUTHORIZED) {
        super(message, HTTP_STATUS.UNAUTHORIZED);
        Object.setPrototypeOf(this, UnauthorizedError.prototype);
    }
}
