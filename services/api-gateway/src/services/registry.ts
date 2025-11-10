/**
 * Service Registry
 * 
 * Manages service discovery and health checks for microservices.
 */
import { env } from '../config/env';

export interface ServiceInfo {
	name: string;
	url: string;
	healthy: boolean;
	lastChecked: Date;
}

class ServiceRegistry {
	private services: Map<string, ServiceInfo> = new Map();

	async initialize() {
		// Register all services
		Object.entries(env.services).forEach(([name, url]) => {
			this.services.set(name, {
				name,
				url,
				healthy: false,
				lastChecked: new Date(),
			});
		});

		// Start health checks
		this.startHealthChecks();
	}

	getService(name: string): ServiceInfo | undefined {
		return this.services.get(name);
	}

	getServiceUrl(name: string): string {
		const service = this.services.get(name);
		if (!service) {
			throw new Error(`Service ${name} not found`);
		}
		return service.url;
	}

	async checkHealth(serviceName: string): Promise<boolean> {
		const service = this.services.get(serviceName);
		if (!service) return false;

		try {
			const response = await fetch(`${service.url}/health`, {
				method: 'GET',
				headers: { 'Content-Type': 'application/json' },
				signal: AbortSignal.timeout(5000), // 5 second timeout
			});

			const isHealthy = response.ok;
			service.healthy = isHealthy;
			service.lastChecked = new Date();
			return isHealthy;
		} catch (error) {
			service.healthy = false;
			service.lastChecked = new Date();
			return false;
		}
	}

	private startHealthChecks() {
		// Check health every 30 seconds
		setInterval(async () => {
			for (const serviceName of this.services.keys()) {
				await this.checkHealth(serviceName);
			}
		}, 30000);

		// Initial health check
		setTimeout(async () => {
			for (const serviceName of this.services.keys()) {
				await this.checkHealth(serviceName);
			}
		}, 5000);
	}

	getAllServices(): ServiceInfo[] {
		return Array.from(this.services.values());
	}
}

export const serviceRegistry = new ServiceRegistry();

