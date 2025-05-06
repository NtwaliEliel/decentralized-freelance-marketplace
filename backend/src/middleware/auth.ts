import { Request, Response, NextFunction } from 'express';
import { ethers } from 'ethers';
import User from '../models/User';
import { AuthenticatedRequest, AuthenticatedUser } from '../types/express';

export const verifySignature = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { address, signature, message } = req.body;

    if (!address || !signature || !message) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    // Verify the signature
    const recoveredAddress = ethers.verifyMessage(message, signature);
    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      res.status(401).json({ message: 'Invalid signature' });
      return;
    }

    // Find or create user
    let user = await User.findOne({ walletAddress: address.toLowerCase() });
    if (!user) {
      user = await User.create({
        walletAddress: address.toLowerCase(),
        username: `user_${address.slice(0, 6)}`,
        email: `${address.slice(0, 6)}@example.com`,
        role: 'client',
      });
    }

    // Map user document to AuthenticatedUser type
    const authenticatedUser: AuthenticatedUser = {
      _id: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role
    };

    // Attach user to request
    (req as AuthenticatedRequest).user = authenticatedUser;
    next();
  } catch (error) {
    next(error);
  }
};

export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  if (!(req as AuthenticatedRequest).user) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }
  next();
}; 