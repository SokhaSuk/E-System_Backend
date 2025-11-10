/**
 * Proxy Routes
 * 
 * Routes requests to appropriate microservices.
 */
import { Router, Request, Response, NextFunction } from 'express';
import { serviceRegistry } from '../services/registry';
import { authMiddleware, AuthRequest } from '../middleware/auth';

export const proxyRouter = Router();

// Apply authentication to all routes except auth routes
proxyRouter.use((req: Request, res: Response, next: NextFunction) => {
	if (req.path.startsWith('/auth')) {
		return next();
	}
	return authMiddleware(req as AuthRequest, res, next);
});

// Route mapping
const routeMapping: { [key: string]: string } = {
	'/auth': 'auth',
	'/users': 'user',
	'/courses': 'course',
	'/attendance': 'attendance',
	'/grades': 'grade',
	'/announcements': 'announcement',
	'/admin': 'user', // Admin routes handled by user service
	'/teacher': 'course', // Teacher routes handled by course service
	'/student': 'user', // Student routes handled by user service
};

// Simple proxy function
async function proxyRequest(
	req: Request,
	res: Response,
	serviceUrl: string,
	basePath: string
) {
	try {
		// Construct target URL
		// Remove /api/v1 prefix and use the basePath
		const requestPath = req.path.replace('/api/v1', '');
		const targetPath = requestPath.startsWith(basePath) 
			? requestPath 
			: `${basePath}${requestPath}`;
		const url = `${serviceUrl}${targetPath}${req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : ''}`;
		
		const headers: any = {
			'Content-Type': 'application/json',
		};

		// Forward user info from gateway
		if ((req as AuthRequest).user) {
			headers['X-User-Id'] = (req as AuthRequest).user!.userId;
			headers['X-User-Email'] = (req as AuthRequest).user!.email;
			headers['X-User-Role'] = (req as AuthRequest).user!.role;
		}

		// Forward original headers (excluding problematic ones)
		Object.keys(req.headers).forEach(key => {
			const lowerKey = key.toLowerCase();
			if (!['host', 'content-length', 'connection', 'transfer-encoding'].includes(lowerKey)) {
				if (Array.isArray(req.headers[key])) {
					headers[key] = (req.headers[key] as string[]).join(', ');
				} else {
					headers[key] = req.headers[key];
				}
			}
		});

		const fetchOptions: RequestInit = {
			method: req.method,
			headers,
		};

		if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
			fetchOptions.body = JSON.stringify(req.body);
		}

		const response = await fetch(url, fetchOptions);
		const contentType = response.headers.get('content-type');
		
		let data;
		if (contentType && contentType.includes('application/json')) {
			data = await response.json();
		} else {
			data = await response.text();
		}

		// Forward response headers
		response.headers.forEach((value, key) => {
			if (!['content-encoding', 'content-length', 'transfer-encoding'].includes(key.toLowerCase())) {
				res.setHeader(key, value);
			}
		});

		res.status(response.status).json(data);
	} catch (error: any) {
		console.error(`Proxy error:`, error);
		res.status(503).json({
			error: 'Service unavailable',
			message: error.message,
		});
	}
}

// Create proxy routes
Object.entries(routeMapping).forEach(([path, serviceName]) => {
	// Handle exact path and path with sub-routes
	const paths = [`${path}`, `${path}/*`];
	
	paths.forEach(routePath => {
		proxyRouter.all(
			routePath,
			async (req: Request, res: Response, next: NextFunction) => {
				try {
					const serviceUrl = serviceRegistry.getServiceUrl(serviceName);
					await proxyRequest(req, res, serviceUrl, `/api/v1${path}`);
				} catch (error: any) {
					console.error(`Proxy error for ${path}:`, error);
					res.status(503).json({
						error: 'Service unavailable',
						service: serviceName,
					});
				}
			}
		);
	});
});

export default proxyRouter;

