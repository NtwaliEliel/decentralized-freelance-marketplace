import express, { Response, NextFunction } from 'express';
import { verifySignature, requireAuth } from '../middleware/auth';
import User from '../models/User';
import Job from '../models/Job';
import Proposal from '../models/Proposal';
import { AuthenticatedRequest } from '../types/express';

const router = express.Router();

// Authenticate user with wallet signature
router.post('/auth', verifySignature, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  res.json({ user: req.user });
});

// Get current user profile
router.get('/me', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

// Update user profile
router.patch('/me', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { username, email, bio, skills, hourlyRate } = req.body;

    // Check if username is already taken
    if (username && username !== req.user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        res.status(400).json({ message: 'Username already taken' });
        return;
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        username,
        email,
        bio,
        skills,
        hourlyRate,
      },
      { new: true }
    ).select('-password');

    res.json({ user });
  } catch (error) {
    next(error);
  }
});

// Get user's jobs
router.get('/jobs', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const query = req.user.role === 'freelancer'
      ? { freelancer: req.user._id }
      : { client: req.user._id };

    const jobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .populate('client', 'username')
      .populate('freelancer', 'username');

    res.json({ jobs });
  } catch (error) {
    next(error);
  }
});

// Get user's proposals
router.get('/proposals', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const proposals = await Proposal.find({ freelancer: req.user._id })
      .sort({ createdAt: -1 })
      .populate('job', 'title budget')
      .populate('client', 'username');

    res.json({ proposals });
  } catch (error) {
    next(error);
  }
});

export default router; 