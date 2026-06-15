/**
 * PocketBuddy — Budget Model
 * ============================
 * A per-category spending cap for a given month/year.
 * The `spent` amount is NOT stored here — it's computed
 * at query time from the Transaction collection via aggregation.
 *
 * Unique compound index ensures one budget per user+category+month+year.
 */

import mongoose, { Schema, Model } from 'mongoose';
import { IBudget, TRANSACTION_CATEGORIES } from '../types';

const BudgetSchema = new Schema<IBudget>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'userId is required'],
    },
    category: {
      type: String,
      enum: {
        values: TRANSACTION_CATEGORIES,
        message: '{VALUE} is not a valid category',
      },
      required: [true, 'Category is required'],
    },
    limit: {
      type: Number,
      required: [true, 'Budget limit is required'],
      min: [0.01, 'Budget limit must be positive'],
    },
    period: {
      type: String,
      enum: ['monthly', 'weekly'],
      default: 'monthly',
    },
    month: {
      type: Number,
      required: [true, 'Month is required'],
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
      min: 2020,
      max: 2100,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

// ── Unique compound index ────────────────────────────────
// One budget per user per category per period
BudgetSchema.index(
  { userId: 1, category: 1, month: 1, year: 1 },
  { unique: true },
);

BudgetSchema.set('toJSON', {
  transform(_doc, ret) {
    delete (ret as any).__v;
    return ret;
  },
});

const Budget: Model<IBudget> = mongoose.model<IBudget>('Budget', BudgetSchema);
export default Budget;
