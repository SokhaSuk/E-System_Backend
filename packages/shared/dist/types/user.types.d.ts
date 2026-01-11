/**
 * User-related types shared across services
 */
export type UserRole = 'admin' | 'teacher' | 'student';
export interface UserPayload {
    userId: string;
    email: string;
    role: UserRole;
    fullName: string;
}
export interface AuthenticatedRequest {
    user?: UserPayload;
}
//# sourceMappingURL=user.types.d.ts.map