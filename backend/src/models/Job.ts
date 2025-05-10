import mongoose, { Schema, Document } from 'mongoose';

export interface IJob extends Document {
  title: string;
  description: string;
  budget: number;
  deadline: Date;
  client: string;
  freelancer?: string;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  skills: string[];
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  budget: { type: Number, required: true },
  deadline: { type: Date, required: true },
  client: { type: String, required: true },
  freelancer: { type: String },
  status: { 
    type: String, 
    enum: ['open', 'in_progress', 'completed', 'cancelled'],
    default: 'open'
  },
  skills: [{ type: String }],
}, {
  timestamps: true
});

export default mongoose.model<IJob>('Job', JobSchema); 