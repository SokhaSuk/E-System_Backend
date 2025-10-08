/**
 * Authentication route tests.
 */
import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../server';
import { UserModel } from '../models/User';
import { hashPassword } from '../utils/password';

describe('Authentication Routes', () => {
	beforeAll(async () => {
		// Connect to test database
		await mongoose.connect(
			process.env.MONGO_URI || 'mongodb://localhost:27017/e_system_test'
		);
	});

	afterAll(async () => {
		// Clean up and disconnect
		await mongoose.connection.dropDatabase();
		await mongoose.connection.close();
	});

	beforeEach(async () => {
		// Clear users before each test
		await UserModel.deleteMany({});
	});

	describe('POST /api/auth/register', () => {
		it('should register a new student successfully', async () => {
			const userData = {
				fullName: 'Suk Sokha',
				email: 'sokha168@gmail.com',
				password: 'password123',
				role: 'student',
			};

			const response = await request(app)
				.post('/api/auth/register')
				.send(userData)
				.expect(201);

			expect(response.body).toHaveProperty('token');
			expect(response.body.user).toHaveProperty('_id');
			expect(response.body.user.email).toBe(userData.email);
			expect(response.body.user.role).toBe(userData.role);
			expect(response.body.user).not.toHaveProperty('password');
		});

		it('should register an admin with correct admin code', async () => {
			const userData = {
				fullName: 'Sokha',
				email: 'sokha168@gmail.com',
				password: 'password123',
				role: 'admin',
				adminCode: 'admin123',
			};

			const response = await request(app)
				.post('/api/auth/register')
				.send(userData)
				.expect(201);

			expect(response.body.user.role).toBe('admin');
		});

		it('should reject admin registration without admin code', async () => {
			const userData = {
				fullName: 'Admin User',
				email: 'admin@example.com',
				password: 'password123',
				role: 'admin',
			};

			await request(app).post('/api/auth/register').send(userData).expect(400);
		});

		it('should reject registration with existing email', async () => {
			// Create a user first
			const existingUser = new UserModel({
				fullName: 'Existing User',
				email: 'existing@example.com',
				passwordHash: await hashPassword('password123'),
				role: 'student',
			});
			await existingUser.save();

			const userData = {
				fullName: 'New User',
				email: 'existing@example.com',
				password: 'password123',
				role: 'student',
			};

			await request(app).post('/api/auth/register').send(userData).expect(409);
		});

		it('should validate required fields', async () => {
			const response = await request(app)
				.post('/api/auth/register')
				.send({})
				.expect(400);

			expect(response.body).toHaveProperty('errors');
		});
	});

	describe('POST /api/auth/login', () => {
		beforeEach(async () => {
			// Create a test user
			const passwordHash = await hashPassword('password123');
			const user = new UserModel({
				fullName: 'Test User',
				email: 'test@example.com',
				passwordHash,
				role: 'student',
			});
			await user.save();
		});

		it('should login successfully with correct credentials', async () => {
			const loginData = {
				email: 'test@example.com',
				password: 'password123',
			};

			const response = await request(app)
				.post('/api/auth/login')
				.send(loginData)
				.expect(200);

			expect(response.body).toHaveProperty('token');
			expect(response.body.user).toHaveProperty('_id');
			expect(response.body.user.email).toBe(loginData.email);
		});

		it('should reject login with incorrect password', async () => {
			const loginData = {
				email: 'test@example.com',
				password: 'wrongpassword',
			};

			await request(app).post('/api/auth/login').send(loginData).expect(401);
		});

		it('should reject login with non-existent email', async () => {
			const loginData = {
				email: 'nonexistent@example.com',
				password: 'password123',
			};

			await request(app).post('/api/auth/login').send(loginData).expect(401);
		});
	});

	describe('GET /api/auth/profile', () => {
		let token: string;
		let user: any;

		beforeEach(async () => {
			// Create a test user and get token
			const passwordHash = await hashPassword('password123');
			user = new UserModel({
				fullName: 'Test User',
				email: 'test@example.com',
				passwordHash,
				role: 'student',
			});
			await user.save();

			// Login to get token
			const loginResponse = await request(app).post('/api/auth/login').send({
				email: 'test@example.com',
				password: 'password123',
			});

			token = loginResponse.body.token;
		});

		it('should return user profile with valid token', async () => {
			const response = await request(app)
				.get('/api/auth/profile')
				.set('Authorization', `Bearer ${token}`)
				.expect(200);

			expect(response.body).toHaveProperty('_id');
			expect(response.body.email).toBe(user.email);
			expect(response.body.fullName).toBe(user.fullName);
		});

		it('should reject request without token', async () => {
			await request(app).get('/api/auth/profile').expect(401);
		});

		it('should reject request with invalid token', async () => {
			await request(app)
				.get('/api/auth/profile')
				.set('Authorization', 'Bearer invalid-token')
				.expect(401);
		});
	});
});
