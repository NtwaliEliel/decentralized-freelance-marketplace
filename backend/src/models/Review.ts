import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
  contract: mongoose.Types.ObjectId;
  reviewer: mongoose.Types.ObjectId;
  reviewee: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  isClientReview: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    contract: {
      type: Schema.Types.ObjectId,
      ref: 'Contract',
      required: true,
    },
    reviewer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reviewee: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
    isClientReview: {
      type: Boolean,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure one review per user per contract
reviewSchema.index({ contract: 1, reviewer: 1, isClientReview: 1 }, { unique: true });

export default mongoose.model<IReview>('Review', reviewSchema); 