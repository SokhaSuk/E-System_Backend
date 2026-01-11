import { Router } from 'express';
import { authController } from '../controllers/auth.controller';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', (req, res) => authController.register(req, res));

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', (req, res) => authController.login(req, res));

/**
 * @route   POST /api/auth/verify
 * @desc    Verify JWT token
 * @access  Public
 */
router.post('/verify', (req, res) => authController.verifyToken(req, res));

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private (via Gateway)
 */
router.get('/profile', (req, res) => authController.getProfile(req, res));

export default router;
