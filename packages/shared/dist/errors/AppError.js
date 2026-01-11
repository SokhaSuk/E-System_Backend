"use strict";
/**
 * Base Application Error
 * All custom errors should extend this class
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
const http_status_1 = require("../constants/http-status");
class AppError extends Error {
    constructor(message, statusCode = http_status_1.HTTP_STATUS.INTERNAL_SERVER_ERROR, isOperational = true, details) {
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
exports.AppError = AppError;
