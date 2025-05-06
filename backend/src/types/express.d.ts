import { Request } from 'express';

export interface AuthenticatedUser {
  _id: string;
  username: string;
  email: string;
  role: 'client' | 'freelancer';
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

declare global {
  namespace Express {
    interface Request {
      user: AuthenticatedUser;
    }
  }
}

// This export is needed to make this file a module
export {}; 