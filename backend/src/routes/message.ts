import express, { Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/auth';
import Message from '../models/Message';
import Job from '../models/Job';
import { AuthenticatedRequest } from '../types/express';

const router = express.Router();

// Send a message
router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { jobId, content } = req.body;

    const job = await Job.findById(jobId)
      .populate('client')
      .populate('freelancer');

    if (!job) {
      res.status(404).json({ message: 'Job not found' });
      return;
    }

    // Verify user is part of the job
    if (
      job.client.toString() !== req.user._id &&
      job.freelancer?.toString() !== req.user._id
    ) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    // Determine recipient (the other party)
    const recipient =
      job.client.toString() === req.user._id
        ? job.freelancer
        : job.client;

    if (!recipient) {
      res.status(400).json({ message: 'No recipient found' });
      return;
    }

    const message = await Message.create({
      job: jobId,
      sender: req.user._id,
      recipient,
      content,
    });

    res.status(201).json({ message });
  } catch (error) {
    next(error);
  }
});

// Get messages for a job
router.get('/job/:jobId', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const job = await Job.findById(req.params.jobId);

    if (!job) {
      res.status(404).json({ message: 'Job not found' });
      return;
    }

    // Verify user is part of the job
    if (
      job.client.toString() !== req.user._id &&
      job.freelancer?.toString() !== req.user._id
    ) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    const messages = await Message.find({ job: req.params.jobId })
      .populate('sender', 'username')
      .populate('recipient', 'username')
      .sort({ createdAt: -1 });

    res.json({ messages });
  } catch (error) {
    next(error);
  }
});

// Get unread messages count
router.get('/unread', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const count = await Message.countDocuments({
      recipient: req.user._id,
      isRead: false,
    });

    res.json({ count });
  } catch (error) {
    next(error);
  }
});

// Mark messages as read
router.patch('/read', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { messageIds } = req.body;

    if (!Array.isArray(messageIds) || messageIds.length === 0) {
      res.status(400).json({ message: 'Invalid message IDs' });
      return;
    }

    // Verify all messages belong to the user
    const messages = await Message.find({
      _id: { $in: messageIds },
      recipient: req.user._id,
    });

    if (messages.length !== messageIds.length) {
      res.status(403).json({ message: 'Not authorized to mark some messages as read' });
      return;
    }

    await Message.updateMany(
      { _id: { $in: messageIds } },
      { $set: { isRead: true } }
    );

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    next(error);
  }
});

export default router; 