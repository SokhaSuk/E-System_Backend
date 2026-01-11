/**
 * Announcement management routes for school system.
 */
import { Router } from 'express';
import * as announcementController from '../controllers/announcement.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Announcement management routes
router.get('/', announcementController.listAnnouncements);
router.post('/', announcementController.createAnnouncement);
router.get('/:id', announcementController.getAnnouncement);
router.put('/:id', announcementController.updateAnnouncement);
router.delete('/:id', announcementController.deleteAnnouncement);

// Announcement status management
router.patch('/:id/toggle', announcementController.toggleAnnouncementStatus);
// Backward-compatible alias
router.patch(
	'/:id/toggle-status',
	announcementController.toggleAnnouncementStatus
);

// Special routes (aligned with docs) and legacy aliases
router.get('/active', announcementController.getActiveAnnouncements);
router.get(
	'/course/:courseId',
	announcementController.getAnnouncementsByCourse
);
router.get('/user/me', announcementController.getUserAnnouncements);
router.put('/:id/read', announcementController.markAnnouncementAsRead);
// Legacy aliases to avoid breaking consumers
router.get(
	'/active/announcements',
	announcementController.getActiveAnnouncements
);
router.get(
	'/course/:courseId/announcements',
	announcementController.getAnnouncementsByCourse
);
router.get(
	'/user/my-announcements',
	announcementController.getUserAnnouncements
);
router.post('/:id/mark-read', announcementController.markAnnouncementAsRead);

export default router;
