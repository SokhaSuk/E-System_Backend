/**
 * Express Type Extensions
 * Extends Express types with custom properties
 */

import { AuthUser } from '../common.types';

declare global {
    namespace Express {
        interface Request {
            user?: AuthUser;
        }
    }
}

export { };
