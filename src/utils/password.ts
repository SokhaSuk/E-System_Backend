/**
 * Password hashing and verification helpers using bcryptjs.
 */
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

/**
 * Hashes a plaintext password.
 * @param plainText - Raw user password
 * @returns bcrypt hash string
 */
export async function hashPassword(plainText: string): Promise<string> {
	return bcrypt.hash(plainText, SALT_ROUNDS);
}

/**
 * Verifies a plaintext password against a bcrypt hash.
 * @param plainText - Raw user password
 * @param passwordHash - Stored bcrypt hash
 * @returns true if the password matches
 */
export async function verifyPassword(
	plainText: string,
	passwordHash: string
): Promise<boolean> {
	return bcrypt.compare(plainText, passwordHash);
}
