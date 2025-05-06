import mongoose, { Document, Schema } from 'mongoose';

export interface IContract extends Document {
  job: mongoose.Types.ObjectId;
  client: mongoose.Types.ObjectId;
  freelancer: mongoose.Types.ObjectId;
  amount: number;
  status: 'pending' | 'completed' | 'refunded';
  contractAddress: string;
  createdAt: Date;
  updatedAt: Date;
}

const contractSchema = new Schema<IContract>(
  {
    job: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    client: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    freelancer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'refunded'],
      default: 'pending',
    },
    contractAddress: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IContract>('Contract', contractSchema); 