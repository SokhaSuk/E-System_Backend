"use strict";
/**
 * Not Found Error
 * Thrown when a requested resource is not found
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotFoundError = void 0;
const http_status_1 = require("../constants/http-status");
const AppError_1 = require("./AppError");
class NotFoundError extends AppError_1.AppError {
    constructor(resource = 'Resource', identifier) {
        const message = identifier
            ? `${resource} with identifier '${identifier}' not found`
            : `${resource} not found`;
        super(message, http_status_1.HTTP_STATUS.NOT_FOUND);
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}
exports.NotFoundError = NotFoundError;
