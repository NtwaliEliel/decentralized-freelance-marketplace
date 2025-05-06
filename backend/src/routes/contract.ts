import express, { Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/auth';
import Contract from '../models/Contract';
import Job from '../models/Job';
import User from '../models/User';
import { AuthenticatedRequest } from '../types/express';

const router = express.Router();

// Create a new contract
router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { jobId, freelancerId, amount } = req.body;

    const job = await Job.findById(jobId)
      .populate('client', 'walletAddress')
      .populate('freelancer', 'walletAddress');

    if (!job) {
      res.status(404).json({ message: 'Job not found' });
      return;
    }

    if (!job.freelancer) {
      res.status(400).json({ message: 'Job has no assigned freelancer' });
      return;
    }

    if (job.client.toString() !== req.user._id) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    if (job.freelancer.toString() !== freelancerId) {
      res.status(400).json({ message: 'Invalid freelancer' });
      return;
    }

    // Get freelancer's wallet address
    const freelancer = await User.findById(freelancerId);
    if (!freelancer) {
      res.status(404).json({ message: 'Freelancer not found' });
      return;
    }

    // Create contract
    const contract = await Contract.create({
      job: jobId,
      client: req.user._id,
      freelancer: freelancerId,
      amount,
      status: 'pending',
      contractAddress: '', // This will be set after blockchain interaction
    });

    res.status(201).json({ contract });
  } catch (error) {
    next(error);
  }
});

// Get contract details
router.get('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const contract = await Contract.findById(req.params.id)
      .populate('job', 'title description')
      .populate('client', 'username')
      .populate('freelancer', 'username');

    if (!contract) {
      res.status(404).json({ message: 'Contract not found' });
      return;
    }

    if (contract.client.toString() !== req.user._id && contract.freelancer.toString() !== req.user._id) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    res.json({ contract });
  } catch (error) {
    next(error);
  }
});

// Release funds to freelancer
router.post('/:id/release', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const contract = await Contract.findById(req.params.id)
      .populate('job')
      .populate('client', 'walletAddress')
      .populate('freelancer', 'walletAddress');

    if (!contract) {
      res.status(404).json({ message: 'Contract not found' });
      return;
    }

    if (contract.client.toString() !== req.user._id) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    if (contract.status !== 'pending') {
      res.status(400).json({ message: 'Contract is not in pending status' });
      return;
    }

    // Update contract status
    contract.status = 'completed';
    await contract.save();

    // Update job status
    await Job.findByIdAndUpdate(contract.job, { status: 'completed' });

    res.json({ contract });
  } catch (error) {
    next(error);
  }
});

// Refund funds to client
router.post('/:id/refund', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const contract = await Contract.findById(req.params.id)
      .populate('job')
      .populate('client', 'walletAddress')
      .populate('freelancer', 'walletAddress');

    if (!contract) {
      res.status(404).json({ message: 'Contract not found' });
      return;
    }

    if (contract.client.toString() !== req.user._id) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    if (contract.status !== 'pending') {
      res.status(400).json({ message: 'Contract is not in pending status' });
      return;
    }

    // Update contract status
    contract.status = 'refunded';
    await contract.save();

    // Update job status
    await Job.findByIdAndUpdate(contract.job, { status: 'cancelled' });

    res.json({ contract });
  } catch (error) {
    next(error);
  }
});

export default router; 