/**
 * Base Application Error
 * All custom errors should extend this class
 */

import { HTTP_STATUS, HttpStatus } from '../constants/http-status';

export class AppError extends Error {
    public readonly statusCode: HttpStatus;
    public readonly isOperational: boolean;
    public readonly timestamp: Date;
    public readonly path?: string;
    public readonly details?: any;

    constructor(
        message: string,
        statusCode: HttpStatus = HTTP_STATUS.INTERNAL_SERVER_ERROR,
        isOperational = true,
        details?: any
    ) {
        super(message);

        // Maintains proper stack trace for where our error was thrown (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }

        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.timestamp = new Date();
        this.details = details;

        // Set the prototype explicitly to maintain instanceof checks
        Object.setPrototypeOf(this, AppError.prototype);
    }

    toJSON() {
        return {
            name: this.name,
            message: this.message,
            statusCode: this.statusCode,
            timestamp: this.timestamp,
            ...(this.details && { details: this.details }),
            ...(this.path && { path: this.path }),
        };
    }
}
