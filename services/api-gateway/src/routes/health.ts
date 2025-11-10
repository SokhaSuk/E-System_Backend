/**
 * Health Check Routes
 */
import { Router, Request, Response } from 'express';
import { serviceRegistry } from '../services/registry';

export const healthRouter = Router();

healthRouter.get('/', async (req: Request, res: Response) => {
	const services = serviceRegistry.getAllServices();
	
	res.json({
		status: 'ok',
		timestamp: new Date().toISOString(),
		services: services.map(s => ({
			name: s.name,
			healthy: s.healthy,
			lastChecked: s.lastChecked,
		})),
	});
});

