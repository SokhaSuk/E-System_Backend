import { User, UserDocument } from '../models/User';
import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config/env';

export interface RegisterDto {
  fullName: string;
  email: string;
  password: string;
  role?: 'admin' | 'teacher' | 'student';
  nameKh?: string;
  gender?: 'Male' | 'Female' | 'Other';
  dateOfBirth?: Date | string;
  placeOfBirth?: string;
  phone?: string;
  occupation?: string;
  address?: string;
  nationality?: string;
  adminCode?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    role: string;
  };
}

export class AuthService {
  /**
   * Register a new user
   */
  async register(data: RegisterDto): Promise<AuthResponse> {
    const {
      fullName,
      email,
      password,
      role,
      nameKh,
      gender,
      dateOfBirth,
      placeOfBirth,
      phone,
      occupation,
      address,
      nationality,
      adminCode,
    } = data;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Validate admin registration
    if (role === 'admin') {
      if (!adminCode || adminCode !== config.adminSignupCode) {
        throw new Error('Invalid admin signup code');
      }
    }

    // Create user
    const user = await User.create({
      fullName,
      email,
      password,
      role: role || 'student',
      nameKh,
      gender,
      dateOfBirth,
      placeOfBirth,
      phone,
      occupation,
      address,
      nationality,
    });

    // Generate JWT token
    const token = this.generateToken(user);

    return {
      success: true,
      token,
      user: {
        id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    };
  }

  /**
   * Login user
   */
  async login(data: LoginDto): Promise<AuthResponse> {
    const { email, password } = data;

    // Find user with password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Generate JWT token
    const token = this.generateToken(user);

    return {
      success: true,
      token,
      user: {
        id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    };
  }

  /**
   * Verify JWT token
   */
  async verifyToken(token: string): Promise<any> {
    try {
      const decoded = jwt.verify(token, config.jwtSecret);
      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<UserDocument | null> {
    return User.findById(userId);
  }

  /**
   * Generate JWT token
   */
  private generateToken(user: UserDocument): string {
    const payload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    };

    const options: SignOptions = {
      expiresIn: config.jwtExpiresIn as SignOptions['expiresIn'],
    };

    return jwt.sign(payload, config.jwtSecret, options);
  }
}

export const authService = new AuthService();
