import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  walletAddress: string;
  username: string;
  email: string;
  role: 'client' | 'freelancer';
  profileImage?: string;
  bio?: string;
  skills: string[];
  hourlyRate?: number;
  rating: number;
  totalRatings: number;
  completedJobs: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  walletAddress: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  role: {
    type: String,
    enum: ['client', 'freelancer'],
    default: 'client',
    required: true,
  },
  profileImage: {
    type: String,
  },
  bio: {
    type: String,
    maxlength: 500,
  },
  skills: [{
    type: String,
    trim: true,
  }],
  hourlyRate: {
    type: Number,
    min: 0,
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  totalRatings: {
    type: Number,
    default: 0,
  },
  completedJobs: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

export default mongoose.model<IUser>('User', UserSchema); 