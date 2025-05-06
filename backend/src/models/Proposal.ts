import mongoose, { Document, Schema } from 'mongoose';

export interface IProposal extends Document {
  job: mongoose.Types.ObjectId;
  freelancer: mongoose.Types.ObjectId;
  client: mongoose.Types.ObjectId;
  coverLetter: string;
  bidAmount: number;
  estimatedDuration: number;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

const proposalSchema = new Schema<IProposal>(
  {
    job: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    freelancer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    client: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    coverLetter: {
      type: String,
      required: true,
    },
    bidAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    estimatedDuration: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
proposalSchema.index({ job: 1, freelancer: 1 }, { unique: true });
proposalSchema.index({ freelancer: 1, status: 1 });
proposalSchema.index({ client: 1, status: 1 });

export default mongoose.model<IProposal>('Proposal', proposalSchema); 