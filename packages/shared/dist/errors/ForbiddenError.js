"use strict";
/**
 * Authorization Error (Forbidden)
 * Thrown when user doesn't have permission to access a resource
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForbiddenError = void 0;
const http_status_1 = require("../constants/http-status");
const error_messages_1 = require("../constants/error-messages");
const AppError_1 = require("./AppError");
class ForbiddenError extends AppError_1.AppError {
    constructor(message = error_messages_1.ERROR_MESSAGES.INSUFFICIENT_PERMISSIONS) {
        super(message, http_status_1.HTTP_STATUS.FORBIDDEN);
        Object.setPrototypeOf(this, ForbiddenError.prototype);
    }
}
exports.ForbiddenError = ForbiddenError;
