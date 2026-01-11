/**
 * Authorization Error (Forbidden)
 * Thrown when user doesn't have permission to access a resource
 */

import { HTTP_STATUS } from '../constants/http-status';
import { ERROR_MESSAGES } from '../constants/error-messages';
import { AppError } from './AppError';

export class ForbiddenError extends AppError {
    constructor(message: string = ERROR_MESSAGES.INSUFFICIENT_PERMISSIONS) {
        super(message, HTTP_STATUS.FORBIDDEN);
        Object.setPrototypeOf(this, ForbiddenError.prototype);
    }
}
