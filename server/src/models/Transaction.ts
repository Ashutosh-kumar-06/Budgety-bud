import mongoose, { Document, Schema } from 'mongoose';

export interface ITransaction extends Document {
  user: mongoose.Types.ObjectId;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description?: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ['income', 'expense'],
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const Transaction = mongoose.model<ITransaction>('Transaction', transactionSchema);
