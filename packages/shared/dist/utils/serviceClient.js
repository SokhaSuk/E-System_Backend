"use strict";
/**
 * HTTP Client for inter-service communication
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceClient = void 0;
class ServiceClient {
    constructor(serviceName, baseUrl) {
        this.serviceName = serviceName;
        this.baseUrl = baseUrl;
    }
    async get(path, token) {
        return this.request('GET', path, undefined, token);
    }
    async post(path, data, token) {
        return this.request('POST', path, data, token);
    }
    async put(path, data, token) {
        return this.request('PUT', path, data, token);
    }
    async delete(path, token) {
        return this.request('DELETE', path, undefined, token);
    }
    async request(method, path, data, token) {
        const url = `${this.baseUrl}${path}`;
        const headers = {
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
            const result = (await response.json());
            if (!response.ok) {
                throw new Error(result.message || `${this.serviceName} request failed`);
            }
            return result;
        }
        catch (error) {
            console.error(`[${this.serviceName}] Request failed:`, error);
            throw error;
        }
    }
}
exports.ServiceClient = ServiceClient;
