import swaggerJSDoc from 'swagger-jsdoc';
import { env } from './env';

const servers = [
	{ url: `http://localhost:${env.port}/api/v1`, description: 'Local' },
];

export const swaggerSpec = swaggerJSDoc({
	definition: {
		openapi: '3.0.3',
		info: {
			title: 'E-System API',
			version: '1.0.0',
			description:
				'REST API for E-System with role-based access (admin/teacher/student).',
		},
		servers,
		components: {
			securitySchemes: {
				bearerAuth: {
					type: 'http',
					scheme: 'bearer',
					bearerFormat: 'JWT',
				},
			},
		},
		security: [{ bearerAuth: [] }],
		paths: {
			'/health': {
				get: {
					summary: 'Health check',
					description: 'Returns API health status.',
					security: [],
					responses: {
						'200': {
							description: 'OK',
						},
					},
				},
			},
			'/auth/login': {
				post: {
					tags: ['Auth'],
					summary: 'Login',
					requestBody: {
						required: true,
						content: {
							'application/json': {
								schema: {
									type: 'object',
									properties: {
										email: { type: 'string', format: 'email' },
										password: { type: 'string', minLength: 6 },
									},
									required: ['email', 'password'],
								},
							},
						},
					},
					responses: {
						'200': { description: 'Authenticated' },
						'401': { description: 'Invalid credentials' },
					},
				},
			},
			'/auth/register': {
				post: {
					tags: ['Auth'],
					summary: 'Register',
					requestBody: {
						required: true,
						content: {
							'application/json': {
								schema: {
									type: 'object',
									properties: {
										fullName: { type: 'string' },
										email: { type: 'string', format: 'email' },
										password: { type: 'string', minLength: 6 },
										role: {
											type: 'string',
											enum: ['admin', 'teacher', 'student'],
										},
										adminCode: { type: 'string' },
									},
									required: ['fullName', 'email', 'password'],
								},
							},
						},
					},
					responses: {
						'201': { description: 'Registered' },
						'409': { description: 'Email already in use' },
					},
				},
			},
			'/auth/profile': {
				get: {
					tags: ['Auth'],
					summary: 'Get current user profile',
					responses: {
						'200': { description: 'OK' },
						'401': { description: 'Unauthorized' },
					},
				},
			},
			'/data/{collection}': {
				get: {
					tags: ['Data'],
					summary: 'Admin data explorer',
					parameters: [
						{
							name: 'collection',
							in: 'path',
							required: true,
							schema: {
								type: 'string',
								enum: [
									'users',
									'courses',
									'grades',
									'attendances',
									'announcements',
								],
							},
						},
						{
							name: 'page',
							in: 'query',
							schema: { type: 'integer', minimum: 1, default: 1 },
						},
						{
							name: 'limit',
							in: 'query',
							schema: {
								type: 'integer',
								minimum: 1,
								maximum: 100,
								default: 10,
							},
						},
						{
							name: 'sortBy',
							in: 'query',
							schema: { type: 'string', default: 'createdAt' },
						},
						{
							name: 'sortOrder',
							in: 'query',
							schema: {
								type: 'string',
								enum: ['asc', 'desc'],
								default: 'desc',
							},
						},
						{ name: 'search', in: 'query', schema: { type: 'string' } },
					],
					responses: {
						'200': { description: 'OK' },
						'403': { description: 'Forbidden' },
					},
				},
			},
		},
	},
	apis: [],
});
