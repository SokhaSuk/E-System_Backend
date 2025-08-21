import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export async function hashPassword(plainText: string): Promise<string> {
	return bcrypt.hash(plainText, SALT_ROUNDS);
}

export async function verifyPassword(plainText: string, passwordHash: string): Promise<boolean> {
	return bcrypt.compare(plainText, passwordHash);
}


