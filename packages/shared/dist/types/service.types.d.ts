/**
 * Service configuration types
 */
export interface ServiceConfig {
    name: string;
    port: number;
    host: string;
    baseUrl: string;
}
export interface DatabaseConfig {
    uri: string;
    name: string;
}
export interface JWTConfig {
    secret: string;
    expiresIn: string;
}
//# sourceMappingURL=service.types.d.ts.map