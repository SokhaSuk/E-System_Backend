/**
 * HTTP Client for inter-service communication
 */

import { ApiResponse, ErrorResponse } from '../types/api.types';

export class ServiceClient {
    private baseUrl: string;
    private serviceName: string;

    constructor(serviceName: string, baseUrl: string) {
        this.serviceName = serviceName;
        this.baseUrl = baseUrl;
    }

    async get<T>(path: string, token?: string): Promise<ApiResponse<T>> {
        return this.request<T>('GET', path, undefined, token);
    }

    async post<T>(path: string, data?: any, token?: string): Promise<ApiResponse<T>> {
        return this.request<T>('POST', path, data, token);
    }

    async put<T>(path: string, data?: any, token?: string): Promise<ApiResponse<T>> {
        return this.request<T>('PUT', path, data, token);
    }

    async delete<T>(path: string, token?: string): Promise<ApiResponse<T>> {
        return this.request<T>('DELETE', path, undefined, token);
    }

    private async request<T>(
        method: string,
        path: string,
        data?: any,
        token?: string
    ): Promise<ApiResponse<T>> {
        const url = `${this.baseUrl}${path}`;
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(url, {
                method,
                headers,
                body: data ? JSON.stringify(data) : undefined,
            });

            const result = (await response.json()) as ApiResponse<T>;

            if (!response.ok) {
                throw new Error(result.message || `${this.serviceName} request failed`);
            }

            return result;
        } catch (error: any) {
            console.error(`[${this.serviceName}] Request failed:`, error);
            throw error;
        }
    }
}
