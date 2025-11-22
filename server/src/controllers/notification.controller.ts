import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middleware/auth';

/**
 * Get user notifications
 */
export const getUserNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { limit = 50, unreadOnly = false } = req.query;

    let query = `
      SELECT *
      FROM neurocare.notifications
      WHERE user_id = $1
    `;

    if (unreadOnly === 'true') {
      query += ' AND is_read = FALSE';
    }

    query += ' ORDER BY sent_at DESC LIMIT $2';

    const result = await pool.query(query, [userId, parseInt(limit as string)]);

    res.json({ notifications: result.rows });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

/**
 * Mark notification as read
 */
export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { notificationId } = req.params;
    const userId = req.user!.id;

    const result = await pool.query(
      `UPDATE neurocare.notifications
       SET is_read = TRUE, read_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [notificationId, userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Notification not found' });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    await pool.query(
      `UPDATE neurocare.notifications
       SET is_read = TRUE, read_at = CURRENT_TIMESTAMP
       WHERE user_id = $1 AND is_read = FALSE`,
      [userId]
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({ error: 'Failed to mark notifications as read' });
  }
};

/**
 * Create a notification (internal use)
 */
export const createNotification = async (
  userId: number,
  type: 'email' | 'in_app' | 'sms',
  category: 'reminder' | 'alert' | 'report' | 'achievement' | 'system',
  subject: string,
  message: string,
  data?: any
): Promise<void> => {
  try {
    await pool.query(
      `INSERT INTO neurocare.notifications (user_id, type, category, subject, message, data)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, type, category, subject, message, data ? JSON.stringify(data) : null]
    );
  } catch (error) {
    console.error('Create notification error:', error);
  }
};

/**
 * Get notification preferences
 */
export const getNotificationPreferences = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const result = await pool.query(
      'SELECT * FROM neurocare.notification_preferences WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      // Create default preferences
      const newPrefs = await pool.query(
        `INSERT INTO neurocare.notification_preferences (user_id)
         VALUES ($1)
         RETURNING *`,
        [userId]
      );
      res.json(newPrefs.rows[0]);
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({ error: 'Failed to fetch notification preferences' });
  }
};

/**
 * Update notification preferences
 */
export const updateNotificationPreferences = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const {
      email_reminders,
      email_reports,
      email_achievements,
      email_alerts,
      in_app_notifications,
      reminder_frequency,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO neurocare.notification_preferences
       (user_id, email_reminders, email_reports, email_achievements, email_alerts,
        in_app_notifications, reminder_frequency)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (user_id)
       DO UPDATE SET
         email_reminders = $2,
         email_reports = $3,
         email_achievements = $4,
         email_alerts = $5,
         in_app_notifications = $6,
         reminder_frequency = $7,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [
        userId,
        email_reminders,
        email_reports,
        email_achievements,
        email_alerts,
        in_app_notifications,
        reminder_frequency,
      ]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ error: 'Failed to update notification preferences' });
  }
};

/**
 * Send email notification (placeholder - integrate with SendGrid/AWS SES)
 */
export const sendEmailNotification = async (
  email: string,
  subject: string,
  message: string
): Promise<void> => {
  // TODO: Integrate with email service (SendGrid, AWS SES, etc.)
  console.log(`📧 Email would be sent to ${email}:`);
  console.log(`Subject: ${subject}`);
  console.log(`Message: ${message}`);
  // For now, just log. In production, use a real email service
};

export default {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  createNotification,
  getNotificationPreferences,
  updateNotificationPreferences,
  sendEmailNotification,
};
