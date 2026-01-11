"use strict";
/**
 * Authentication Error
 * Thrown when authentication fails
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnauthorizedError = void 0;
const http_status_1 = require("../constants/http-status");
const error_messages_1 = require("../constants/error-messages");
const AppError_1 = require("./AppError");
class UnauthorizedError extends AppError_1.AppError {
    constructor(message = error_messages_1.ERROR_MESSAGES.UNAUTHORIZED) {
        super(message, http_status_1.HTTP_STATUS.UNAUTHORIZED);
        Object.setPrototypeOf(this, UnauthorizedError.prototype);
    }
}
exports.UnauthorizedError = UnauthorizedError;
