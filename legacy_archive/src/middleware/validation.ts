/**
 * Request validation middleware using Joi.
 */
import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export interface ValidationSchema {
	body?: Joi.ObjectSchema;
	query?: Joi.ObjectSchema;
	params?: Joi.ObjectSchema;
}

export const validate = (schema: ValidationSchema) => {
	return (req: Request, res: Response, next: NextFunction) => {
		const errors: string[] = [];

		// Validate body
		if (schema.body) {
			const { error } = schema.body.validate(req.body, { abortEarly: false });
			if (error) {
				errors.push(...error.details.map(detail => detail.message));
			}
		}

		// Validate query
		if (schema.query) {
			const { error } = schema.query.validate(req.query, { abortEarly: false });
			if (error) {
				errors.push(...error.details.map(detail => detail.message));
			}
		}

		// Validate params
		if (schema.params) {
			const { error } = schema.params.validate(req.params, {
				abortEarly: false,
			});
			if (error) {
				errors.push(...error.details.map(detail => detail.message));
			}
		}

		if (errors.length > 0) {
			return res.status(400).json({
				message: 'Validation failed',
				errors,
			});
		}

		next();
	};
};

// Common validation schemas
export const commonSchemas = {
	objectId: Joi.string().hex().length(24).required(),
	email: Joi.string().email().required(),
	password: Joi.string().min(6).required(),
	pagination: {
		page: Joi.number().integer().min(1).default(1),
		limit: Joi.number().integer().min(1).max(100).default(10),
		sortBy: Joi.string()
			.valid('createdAt', 'updatedAt', 'title', 'name')
			.default('createdAt'),
		sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
	},
};
