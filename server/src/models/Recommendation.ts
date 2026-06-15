/**
 * PocketBuddy — Recommendation Model
 * =====================================
 * Deals, discounts, campus resources, and other recommendations
 * surfaced to students.  Some are global (no userId), others
 * are user-specific (saved by a student).
 */

import mongoose, { Schema, Model } from 'mongoose';
import { IRecommendation } from '../types';

const RecommendationSchema = new Schema<IRecommendation>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null, // null = global/public recommendation
    },
    type: {
      type: String,
      enum: ['foodDeal', 'travelDeal', 'campusResource', 'discount'],
      required: [true, 'Recommendation type is required'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: 2000,
    },
    url: {
      type: String,
      trim: true,
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
    },
    campus: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      min: 0,
    },
    savings: {
      type: Number,
      min: 0,
    },
    saved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

// ── Indexes ──────────────────────────────────────────────
RecommendationSchema.index({ type: 1, campus: 1 }); // filter by type + campus
RecommendationSchema.index({ userId: 1, saved: 1 }); // user's saved items

RecommendationSchema.set('toJSON', {
  transform(_doc, ret) {
    delete ret.__v;
    return ret;
  },
});

const Recommendation: Model<IRecommendation> = mongoose.model<IRecommendation>(
  'Recommendation',
  RecommendationSchema,
);

export default Recommendation;
