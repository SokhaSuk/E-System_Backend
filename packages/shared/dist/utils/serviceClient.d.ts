/**
 * HTTP Client for inter-service communication
 */
import { ApiResponse } from '../types/api.types';
export declare class ServiceClient {
    private baseUrl;
    private serviceName;
    constructor(serviceName: string, baseUrl: string);
    get<T>(path: string, token?: string): Promise<ApiResponse<T>>;
    post<T>(path: string, data?: any, token?: string): Promise<ApiResponse<T>>;
    put<T>(path: string, data?: any, token?: string): Promise<ApiResponse<T>>;
    delete<T>(path: string, token?: string): Promise<ApiResponse<T>>;
    private request;
}
//# sourceMappingURL=serviceClient.d.ts.map