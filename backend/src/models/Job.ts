import mongoose, { Document, Schema } from 'mongoose';

export interface IJob extends Document {
  title: string;
  description: string;
  budget: number;
  category: string;
  skills: string[];
  deadline: Date;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  client: mongoose.Types.ObjectId;
  freelancer?: mongoose.Types.ObjectId;
  escrowAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

const jobSchema = new Schema<IJob>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    budget: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
    },
    skills: [{
      type: String,
      required: true,
    }],
    deadline: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'completed', 'cancelled'],
      default: 'open',
    },
    client: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    freelancer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    escrowAmount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
jobSchema.index({ client: 1, createdAt: -1 });
jobSchema.index({ freelancer: 1, createdAt: -1 });
jobSchema.index({ status: 1, createdAt: -1 });
jobSchema.index({ category: 1, status: 1 });
jobSchema.index({ skills: 1, status: 1 });

export default mongoose.model<IJob>('Job', jobSchema); 