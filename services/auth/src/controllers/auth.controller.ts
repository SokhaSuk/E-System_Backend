import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import Joi from 'joi';

/**
 * Validation schemas
 */
const registerSchema = Joi.object({
  fullName: Joi.string().required().trim().min(2).max(100),
  email: Joi.string().required().email().lowercase(),
  password: Joi.string().required().min(6).max(100),
  role: Joi.string().valid('admin', 'teacher', 'student').optional(),
  adminCode: Joi.string().optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().required().email().lowercase(),
  password: Joi.string().required(),
});

/**
 * Auth Controller
 */
export class AuthController {
  /**
   * Register a new user
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      // Validate request body
      const { error, value } = registerSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: error.details[0].message,
        });
        return;
      }

      // Register user
      const result = await authService.register(value);

      res.status(201).json(result);
    } catch (error: any) {
      console.error('Register error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Registration failed',
      });
    }
  }

  /**
   * Login user
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      // Validate request body
      const { error, value } = loginSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: error.details[0].message,
        });
        return;
      }

      // Login user
      const result = await authService.login(value);

      res.status(200).json(result);
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(401).json({
        success: false,
        message: error.message || 'Login failed',
      });
    }
  }

  /**
   * Verify token
   */
  async verifyToken(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
          success: false,
          message: 'No token provided',
        });
        return;
      }

      const token = authHeader.substring(7);
      const decoded = await authService.verifyToken(token);

      res.status(200).json({
        success: true,
        data: decoded,
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        message: error.message || 'Token verification failed',
      });
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User ID not found in request',
        });
        return;
      }

      const user = await authService.getUserById(userId);

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          id: user._id.toString(),
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
        },
      });
    } catch (error: any) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get profile',
      });
    }
  }
}

export const authController = new AuthController();
