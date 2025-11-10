/**
 * Auth Service
 */
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import { UserRole } from '../models/User';

export function getTokenExpirySeconds(): number {
	const ttl = env.jwtExpiresIn;
	if (!ttl) return 7 * 24 * 60 * 60;
	const numeric = Number(ttl);
	if (!Number.isNaN(numeric) && numeric > 0) return Math.floor(numeric);
	const match = /^\s*(\d+)\s*([smhd])\s*$/i.exec(ttl);
	if (match) {
		const value = Number(match[1]);
		const unit = match[2].toLowerCase();
		switch (unit) {
			case 's': return value;
			case 'm': return value * 60;
			case 'h': return value * 60 * 60;
			case 'd': return value * 24 * 60 * 60;
		}
	}
	return 7 * 24 * 60 * 60;
}

export interface AuthTokenPayload {
	userId: string;
	email: string;
	role: UserRole;
}

export function signAuthToken(payload: AuthTokenPayload): string {
	const secret: Secret = env.jwtSecret as unknown as Secret;
	const options: SignOptions = { expiresIn: getTokenExpirySeconds() };
	return jwt.sign(payload as object, secret, options);
}

