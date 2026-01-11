"use strict";
/**
 * Validation Error
 * Thrown when request validation fails
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationError = void 0;
const http_status_1 = require("../constants/http-status");
const AppError_1 = require("./AppError");
class ValidationError extends AppError_1.AppError {
    constructor(message = 'Validation failed', details) {
        super(message, http_status_1.HTTP_STATUS.UNPROCESSABLE_ENTITY, true, details);
        Object.setPrototypeOf(this, ValidationError.prototype);
    }
    static fromJoiError(error) {
        const details = error.details?.map((detail) => ({
            field: detail.path.join('.'),
            message: detail.message,
            value: detail.context?.value,
        })) || [];
        return new ValidationError('Validation failed', details);
    }
}
exports.ValidationError = ValidationError;
