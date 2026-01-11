import { Announcement, AnnouncementDocument, AnnouncementType } from '../models/Announcement';
import axios from 'axios';
import { config } from '../config/env';

export interface CreateAnnouncementDto {
  title: string;
  content: string;
  type: AnnouncementType;
  author: string;
  targetAudience: string[];
  course?: string;
  expiresAt?: Date;
  attachments?: string[];
}

export interface UpdateAnnouncementDto {
  title?: string;
  content?: string;
  type?: AnnouncementType;
  targetAudience?: string[];
  isActive?: boolean;
  expiresAt?: Date;
}

export interface AnnouncementFilters {
  type?: AnnouncementType;
  course?: string;
  targetAudience?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export class AnnouncementService {
  /**
   * Verify user exists via User Service
   */
  private async verifyUser(userId: string): Promise<boolean> {
    try {
      const response = await axios.get(`${config.userServiceUrl}/users/${userId}`);
      return response.data.success;
    } catch (error) {
      return false;
    }
  }

  /**
   * Verify course exists via Course Service
   */
  private async verifyCourse(courseId: string): Promise<boolean> {
    try {
      const response = await axios.get(`${config.courseServiceUrl}/courses/${courseId}`);
      return response.data.success;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get announcements with pagination and filters
   */
  async getAnnouncements(filters: AnnouncementFilters) {
    const { type, course, targetAudience, isActive, page = 1, limit = 10 } = filters;
    const query: any = {};

    if (type) {
      query.type = type;
    }

    if (course) {
      query.course = course;
    }

    if (targetAudience) {
      query.targetAudience = targetAudience;
    }

    if (isActive !== undefined) {
      query.isActive = isActive;
    }

    const skip = (page - 1) * limit;
    const [announcements, total] = await Promise.all([
      Announcement.find(query).skip(skip).limit(limit).sort({ publishedAt: -1 }),
      Announcement.countDocuments(query),
    ]);

    return {
      announcements,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get announcement by ID
   */
  async getAnnouncementById(announcementId: string): Promise<AnnouncementDocument | null> {
    return Announcement.findById(announcementId);
  }

  /**
   * Create announcement
   */
  async createAnnouncement(data: CreateAnnouncementDto): Promise<AnnouncementDocument> {
    // Verify author exists
    const authorExists = await this.verifyUser(data.author);
    if (!authorExists) {
      throw new Error('Author not found');
    }

    // Verify course exists if provided
    if (data.course) {
      const courseExists = await this.verifyCourse(data.course);
      if (!courseExists) {
        throw new Error('Course not found');
      }
    }

    const announcement = await Announcement.create(data);
    return announcement;
  }

  /**
   * Update announcement
   */
  async updateAnnouncement(
    announcementId: string,
    data: UpdateAnnouncementDto
  ): Promise<AnnouncementDocument | null> {
    const announcement = await Announcement.findByIdAndUpdate(announcementId, data, {
      new: true,
      runValidators: true,
    });

    return announcement;
  }

  /**
   * Delete announcement
   */
  async deleteAnnouncement(announcementId: string): Promise<boolean> {
    const result = await Announcement.findByIdAndDelete(announcementId);
    return !!result;
  }
}

export const announcementService = new AnnouncementService();
