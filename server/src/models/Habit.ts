/**
 * PocketBuddy — Habit Model
 * ===========================
 * Daily wellness data points.  Each record captures one
 * measurement for a specific habit on a specific date.
 *
 * Indexed by userId + name + date for streak calculations
 * and date-range queries from the wellness dashboard.
 */

import mongoose, { Schema, Model } from 'mongoose';
import { IHabit, HABIT_NAMES } from '../types';

const HabitSchema = new Schema<IHabit>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'userId is required'],
    },
    name: {
      type: String,
      enum: {
        values: HABIT_NAMES,
        message: '{VALUE} is not a valid habit',
      },
      required: [true, 'Habit name is required'],
    },
    value: {
      type: Number,
      required: [true, 'Habit value is required'],
    },
    unit: {
      type: String,
      required: [true, 'Unit is required'],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

// ── Compound indexes ─────────────────────────────────────
HabitSchema.index({ userId: 1, name: 1, date: -1 }); // streak queries
HabitSchema.index({ userId: 1, date: -1 }); // date-range queries

HabitSchema.set('toJSON', {
  transform(_doc, ret) {
    delete ret.__v;
    return ret;
  },
});

const Habit: Model<IHabit> = mongoose.model<IHabit>('Habit', HabitSchema);
export default Habit;
