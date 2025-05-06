import express, { Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/auth';
import Job from '../models/Job';
import Proposal from '../models/Proposal';
import { AuthenticatedRequest } from '../types/express';
import { IProposal } from '../models/Proposal';

const router = express.Router();

// Create a new job
router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      title,
      description,
      budget,
      category,
      skills,
      deadline,
      escrowAmount,
    } = req.body;

    const job = await Job.create({
      title,
      description,
      budget,
      client: req.user._id,
      category,
      skills,
      deadline,
      escrowAmount,
    });

    res.status(201).json({ job });
  } catch (error) {
    next(error);
  }
});

// Get all jobs with filters
router.get('/', async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      category,
      minBudget,
      maxBudget,
      skills,
      status,
      search,
      page = 1,
      limit = 10,
    } = req.query;

    const query: Record<string, any> = {};

    if (category) query.category = category;
    if (status) query.status = status;
    if (minBudget || maxBudget) {
      query.budget = {};
      if (minBudget) query.budget.$gte = Number(minBudget);
      if (maxBudget) query.budget.$lte = Number(maxBudget);
    }
    if (skills) {
      query.skills = { $in: (skills as string).split(',') };
    }
    if (search) {
      query.$text = { $search: search as string };
    }

    const jobs = await Job.find(query)
      .populate('client', 'username')
      .populate('freelancer', 'username')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Job.countDocuments(query);

    res.json({
      jobs,
      total,
      pages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
    });
  } catch (error) {
    next(error);
  }
});

// Get job details
router.get('/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('client', 'username')
      .populate('freelancer', 'username');

    if (!job) {
      res.status(404).json({ message: 'Job not found' });
      return;
    }

    // Get proposals if user is the client
    let proposals: IProposal[] = [];
    if (req.user && req.user._id === job.client.toString()) {
      proposals = await Proposal.find({ job: job._id })
        .populate('freelancer', 'username rating completedJobs');
    }

    res.json({ job, proposals });
  } catch (error) {
    next(error);
  }
});

// Update job status
router.patch('/:id/status', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status } = req.body;
    const job = await Job.findById(req.params.id);

    if (!job) {
      res.status(404).json({ message: 'Job not found' });
      return;
    }

    if (job.client.toString() !== req.user._id) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    job.status = status;
    await job.save();

    res.json({ job });
  } catch (error) {
    next(error);
  }
});

// Assign freelancer to job
router.post('/:id/assign', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { freelancerId } = req.body;
    const job = await Job.findById(req.params.id);

    if (!job) {
      res.status(404).json({ message: 'Job not found' });
      return;
    }

    if (job.client.toString() !== req.user._id) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    job.freelancer = freelancerId;
    job.status = 'in_progress';
    await job.save();

    res.json({ job });
  } catch (error) {
    next(error);
  }
});

export default router; 