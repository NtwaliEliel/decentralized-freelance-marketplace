import express, { Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/auth';
import Review from '../models/Review';
import Contract from '../models/Contract';
import { AuthenticatedRequest } from '../types/express';

const router = express.Router();

// Create a new review
router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { contractId, rating, comment } = req.body;

    const contract = await Contract.findById(contractId)
      .populate('client')
      .populate('freelancer');

    if (!contract) {
      res.status(404).json({ message: 'Contract not found' });
      return;
    }

    if (contract.status !== 'completed') {
      res.status(400).json({ message: 'Cannot review an incomplete contract' });
      return;
    }

    // Check if user is either client or freelancer
    if (
      contract.client.toString() !== req.user._id &&
      contract.freelancer.toString() !== req.user._id
    ) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    // Check if user has already reviewed
    const existingReview = await Review.findOne({
      contract: contractId,
      reviewer: req.user._id,
    });

    if (existingReview) {
      res.status(400).json({ message: 'You have already reviewed this contract' });
      return;
    }

    // Determine reviewee (the other party)
    const reviewee =
      contract.client.toString() === req.user._id
        ? contract.freelancer
        : contract.client;

    const review = await Review.create({
      contract: contractId,
      reviewer: req.user._id,
      reviewee,
      rating,
      comment,
    });

    res.status(201).json({ review });
  } catch (error) {
    next(error);
  }
});

// Get reviews for a user
router.get('/user/:userId', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const reviews = await Review.find({ reviewee: req.params.userId })
      .populate('reviewer', 'username')
      .populate('contract', 'title')
      .sort({ createdAt: -1 });

    res.json({ reviews });
  } catch (error) {
    next(error);
  }
});

// Get reviews for a contract
router.get('/contract/:contractId', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const contract = await Contract.findById(req.params.contractId);

    if (!contract) {
      res.status(404).json({ message: 'Contract not found' });
      return;
    }

    if (
      contract.client.toString() !== req.user._id &&
      contract.freelancer.toString() !== req.user._id
    ) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    const reviews = await Review.find({ contract: req.params.contractId })
      .populate('reviewer', 'username')
      .populate('reviewee', 'username')
      .sort({ createdAt: -1 });

    res.json({ reviews });
  } catch (error) {
    next(error);
  }
});

// Update review
router.patch('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { rating, comment } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
      res.status(404).json({ message: 'Review not found' });
      return;
    }

    if (review.reviewer.toString() !== req.user._id) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    review.rating = rating || review.rating;
    review.comment = comment || review.comment;

    await review.save();
    res.json({ review });
  } catch (error) {
    next(error);
  }
});

export default router; 