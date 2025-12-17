/**
 * Announcement DTOs
 */

export interface CreateAnnouncementDto {
    title: string;
    content: string;
    type?: 'general' | 'course' | 'academic' | 'emergency';
    targetAudience?: 'all' | 'student' | 'teacher' | 'admin';
    course?: string;
    isActive?: boolean;
    expiresAt?: Date;
}

export interface UpdateAnnouncementDto {
    title?: string;
    content?: string;
    type?: 'general' | 'course' | 'academic' | 'emergency';
    targetAudience?: 'all' | 'student' | 'teacher' | 'admin';
    course?: string;
    isActive?: boolean;
    expiresAt?: Date;
}

export interface AnnouncementFilterDto {
    type?: string;
    course?: string;
    author?: string;
    targetAudience?: string;
    isActive?: boolean;
    search?: string;
}
