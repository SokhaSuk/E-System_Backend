/**
 * Not Found Error
 * Thrown when a requested resource is not found
 */

import { HTTP_STATUS } from '../constants/http-status';
import { AppError } from './AppError';

export class NotFoundError extends AppError {
    constructor(resource: string = 'Resource', identifier?: string | number) {
        const message = identifier
            ? `${resource} with identifier '${identifier}' not found`
            : `${resource} not found`;

        super(message, HTTP_STATUS.NOT_FOUND);
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}
