import express, { Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/auth';
import Notification from '../models/Notification';
import { AuthenticatedRequest } from '../types/express';

const router = express.Router();

// Get user's notifications
router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('sender', 'username')
      .sort({ createdAt: -1 });

    res.json({ notifications });
  } catch (error) {
    next(error);
  }
});

// Get unread notifications count
router.get('/unread', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user._id,
      read: false,
    });

    res.json({ count });
  } catch (error) {
    next(error);
  }
});

// Mark notifications as read
router.patch('/read', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { notificationIds } = req.body;

    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
      res.status(400).json({ message: 'Invalid notification IDs' });
      return;
    }

    // Verify all notifications belong to the user
    const notifications = await Notification.find({
      _id: { $in: notificationIds },
      recipient: req.user._id,
    });

    if (notifications.length !== notificationIds.length) {
      res.status(403).json({ message: 'Not authorized to mark some notifications as read' });
      return;
    }

    await Notification.updateMany(
      { _id: { $in: notificationIds } },
      { $set: { read: true } }
    );

    res.json({ message: 'Notifications marked as read' });
  } catch (error) {
    next(error);
  }
});

// Mark all notifications as read
router.patch('/read-all', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    await Notification.updateMany(
      {
        recipient: req.user._id,
        read: false,
      },
      { $set: { read: true } }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
});

// Delete notifications
router.delete('/', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { notificationIds } = req.body;

    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
      res.status(400).json({ message: 'Invalid notification IDs' });
      return;
    }

    // Verify all notifications belong to the user
    const notifications = await Notification.find({
      _id: { $in: notificationIds },
      recipient: req.user._id,
    });

    if (notifications.length !== notificationIds.length) {
      res.status(403).json({ message: 'Not authorized to delete some notifications' });
      return;
    }

    await Notification.deleteMany({ _id: { $in: notificationIds } });

    res.json({ message: 'Notifications deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Delete all notifications
router.delete('/delete-all', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    await Notification.deleteMany({ recipient: req.user._id });
    res.json({ message: 'All notifications deleted' });
  } catch (error) {
    next(error);
  }
});

export default router; 