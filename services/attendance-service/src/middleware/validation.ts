import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export function validate(schemas: { body?: Joi.ObjectSchema; query?: Joi.ObjectSchema; params?: Joi.ObjectSchema }) {
	return (req: Request, res: Response, next: NextFunction) => {
		const errors: string[] = [];
		if (schemas.body) {
			const { error } = schemas.body.validate(req.body);
			if (error) errors.push(`Body: ${error.details.map(d => d.message).join(', ')}`);
		}
		if (schemas.query) {
			const { error } = schemas.query.validate(req.query);
			if (error) errors.push(`Query: ${error.details.map(d => d.message).join(', ')}`);
		}
		if (schemas.params) {
			const { error } = schemas.params.validate(req.params);
			if (error) errors.push(`Params: ${error.details.map(d => d.message).join(', ')}`);
		}
		if (errors.length > 0) return res.status(400).json({ error: errors.join('; ') });
		next();
	};
}

