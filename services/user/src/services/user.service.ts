import { User, UserDocument } from '../models/User';

export interface CreateUserDto {
  fullName: string;
  email: string;
  role?: 'admin' | 'teacher' | 'student';
  nameKh?: string;
  gender?: string;
  dateOfBirth?: Date;
  placeOfBirth?: string;
  phone?: string;
  occupation?: string;
  address?: string;
  studyShift?: string;
  nationality?: string;
  studentId?: string;
}

export interface UpdateUserDto {
  fullName?: string;
  nameKh?: string;
  gender?: string;
  dateOfBirth?: Date;
  placeOfBirth?: string;
  phone?: string;
  occupation?: string;
  address?: string;
  studyShift?: string;
  avatar?: string;
  nationality?: string;
  studentId?: string;
}

export interface UserFilters {
  role?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export class UserService {
  /**
   * Get all users with pagination and filters
   */
  async getUsers(filters: UserFilters) {
    const { role, search, page = 1, limit = 10 } = filters;
    const query: any = {};

    if (role) {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { nameKh: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
      User.countDocuments(query),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<UserDocument | null> {
    return User.findById(userId);
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<UserDocument | null> {
    return User.findOne({ email: email.toLowerCase() });
  }

  /**
   * Create a new user
   */
  async createUser(data: CreateUserDto): Promise<UserDocument> {
    // Check if user already exists
    const existingUser = await this.getUserByEmail(data.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Check if studentId is unique
    if (data.studentId) {
      const existingStudent = await User.findOne({ studentId: data.studentId });
      if (existingStudent) {
        throw new Error('Student ID already exists');
      }
    }

    const user = await User.create(data);
    return user;
  }

  /**
   * Update user profile
   */
  async updateUser(
    userId: string,
    data: UpdateUserDto
  ): Promise<UserDocument | null> {
    // Check if studentId is unique (if being updated)
    if (data.studentId) {
      const existingStudent = await User.findOne({
        studentId: data.studentId,
        _id: { $ne: userId },
      });
      if (existingStudent) {
        throw new Error('Student ID already exists');
      }
    }

    const user = await User.findByIdAndUpdate(userId, data, {
      new: true,
      runValidators: true,
    });

    return user;
  }

  /**
   * Delete user
   */
  async deleteUser(userId: string): Promise<boolean> {
    const result = await User.findByIdAndDelete(userId);
    return !!result;
  }

  /**
   * Update user avatar
   */
  async updateAvatar(userId: string, avatarPath: string): Promise<UserDocument | null> {
    return User.findByIdAndUpdate(
      userId,
      { avatar: avatarPath },
      { new: true }
    );
  }
}

export const userService = new UserService();
