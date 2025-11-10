import { Router, Request, Response } from 'express';
export const healthRouter = Router();
healthRouter.get('/', (req: Request, res: Response) => {
	res.json({ status: 'ok', service: 'attendance-service', timestamp: new Date().toISOString() });
});

