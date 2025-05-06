import mongoose, { Document, Schema } from 'mongoose';

export type NotificationType = 
  | 'new_proposal'
  | 'proposal_accepted'
  | 'proposal_rejected'
  | 'contract_created'
  | 'contract_completed'
  | 'contract_refunded'
  | 'new_message'
  | 'new_review';

export interface INotification extends Document {
  user: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  relatedJob?: mongoose.Types.ObjectId;
  relatedContract?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: [
        'new_proposal',
        'proposal_accepted',
        'proposal_rejected',
        'contract_created',
        'contract_completed',
        'contract_refunded',
        'new_message',
        'new_review',
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    link: {
      type: String,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    relatedJob: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
    },
    relatedContract: {
      type: Schema.Types.ObjectId,
      ref: 'Contract',
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient notification retrieval
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, isRead: 1 });

export default mongoose.model<INotification>('Notification', notificationSchema); 