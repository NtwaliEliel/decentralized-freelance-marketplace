import express, { Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/auth';
import Proposal from '../models/Proposal';
import Job from '../models/Job';
import { AuthenticatedRequest } from '../types/express';

const router = express.Router();

// Create a new proposal
router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { jobId, coverLetter, bidAmount, estimatedDuration } = req.body;

    const job = await Job.findById(jobId);
    if (!job) {
      res.status(404).json({ message: 'Job not found' });
      return;
    }

    if (job.status !== 'open') {
      res.status(400).json({ message: 'Job is not open for proposals' });
      return;
    }

    if (job.client.toString() === req.user._id) {
      res.status(400).json({ message: 'Cannot submit proposal to your own job' });
      return;
    }

    const existingProposal = await Proposal.findOne({
      job: jobId,
      freelancer: req.user._id,
    });

    if (existingProposal) {
      res.status(400).json({ message: 'You have already submitted a proposal for this job' });
      return;
    }

    const proposal = await Proposal.create({
      job: jobId,
      freelancer: req.user._id,
      client: job.client,
      coverLetter,
      bidAmount,
      estimatedDuration,
      status: 'pending',
    });

    res.status(201).json({ proposal });
  } catch (error) {
    next(error);
  }
});

// Get proposals for a job
router.get('/job/:jobId', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      res.status(404).json({ message: 'Job not found' });
      return;
    }

    if (job.client.toString() !== req.user._id) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    const proposals = await Proposal.find({ job: req.params.jobId })
      .populate('freelancer', 'username rating completedJobs')
      .sort({ createdAt: -1 });

    res.json({ proposals });
  } catch (error) {
    next(error);
  }
});

// Get freelancer's proposals
router.get('/my-proposals', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const proposals = await Proposal.find({ freelancer: req.user._id })
      .populate({
        path: 'job',
        select: 'title description budget status',
        populate: {
          path: 'client',
          select: 'username walletAddress rating',
        },
      })
      .sort({ createdAt: -1 });

    res.json({ proposals });
  } catch (error) {
    next(error);
  }
});

// Update proposal
router.patch('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { coverLetter, bidAmount, estimatedDuration } = req.body;
    const proposal = await Proposal.findById(req.params.id);

    if (!proposal) {
      res.status(404).json({ message: 'Proposal not found' });
      return;
    }

    if (proposal.freelancer.toString() !== req.user._id) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    if (proposal.status !== 'pending') {
      res.status(400).json({ message: 'Cannot update a non-pending proposal' });
      return;
    }

    proposal.coverLetter = coverLetter || proposal.coverLetter;
    proposal.bidAmount = bidAmount || proposal.bidAmount;
    proposal.estimatedDuration = estimatedDuration || proposal.estimatedDuration;

    await proposal.save();
    res.json({ proposal });
  } catch (error) {
    next(error);
  }
});

// Delete proposal
router.delete('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const proposal = await Proposal.findById(req.params.id);

    if (!proposal) {
      res.status(404).json({ message: 'Proposal not found' });
      return;
    }

    if (proposal.freelancer.toString() !== req.user._id) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    if (proposal.status !== 'pending') {
      res.status(400).json({ message: 'Cannot delete a non-pending proposal' });
      return;
    }

    await proposal.deleteOne();
    res.json({ message: 'Proposal deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router; 