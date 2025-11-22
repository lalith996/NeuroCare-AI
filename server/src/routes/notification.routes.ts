import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  getNotificationPreferences,
  updateNotificationPreferences,
} from '../controllers/notification.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Notification routes
router.get('/', getUserNotifications);
router.patch('/:notificationId/read', markAsRead);
router.post('/mark-all-read', markAllAsRead);

// Preferences routes
router.get('/preferences', getNotificationPreferences);
router.put('/preferences', updateNotificationPreferences);

export default router;
