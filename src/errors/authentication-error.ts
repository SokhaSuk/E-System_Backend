/**
 * Authentication Error
 * Thrown when authentication fails
 */

import { HTTP_STATUS } from '../constants/http-status';
import { ERROR_MESSAGES } from '../constants/error-messages';
import { AppError } from './app-error';

export class AuthenticationError extends AppError {
    constructor(message: string = ERROR_MESSAGES.UNAUTHORIZED) {
        super(message, HTTP_STATUS.UNAUTHORIZED);
        Object.setPrototypeOf(this, AuthenticationError.prototype);
    }
}
