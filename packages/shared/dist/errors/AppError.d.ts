/**
 * Base Application Error
 * All custom errors should extend this class
 */
import { HttpStatus } from '../constants/http-status';
export declare class AppError extends Error {
    readonly statusCode: HttpStatus;
    readonly isOperational: boolean;
    readonly timestamp: Date;
    readonly path?: string;
    readonly details?: any;
    constructor(message: string, statusCode?: HttpStatus, isOperational?: boolean, details?: any);
    toJSON(): any;
}
//# sourceMappingURL=AppError.d.ts.map