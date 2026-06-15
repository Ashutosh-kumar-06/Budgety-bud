/**
 * PocketBuddy — Shared TypeScript Types & Interfaces
 * ===================================================
 * Central type definitions used across the entire server.
 * Every layer (models, services, controllers, routes) imports from here.
 */

import { Request } from 'express';
import { Document, Types } from 'mongoose';

/* ─────────────────────────────────────────────
 * 1. Domain Interfaces (mirror Mongoose schemas)
 * ──────────────────────────────────────────── */

/** User profile — the core identity document. */
export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  age?: number;
  campus?: string;
  major?: string;
  livingSituation?: 'on-campus' | 'off-campus' | 'commuter' | 'with-family';
  incomeLevel?: 'none' | 'part-time' | 'full-time' | 'scholarship' | 'financial-aid';
  preferences: {
    theme: 'light' | 'dark' | 'system';
    notifications: {
      budgetAlerts: boolean;
      weeklyReport: boolean;
      habitReminders: boolean;
      dealAlerts: boolean;
    };
  };
  chatbotPersona: 'friendly' | 'professional' | 'motivational' | 'casual';
  onboardingCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;

  /** Instance method — compare a plain-text password against the hash. */
  comparePassword(candidatePassword: string): Promise<boolean>;
}

/** Transaction — a single income or expense record. */
export interface ITransaction extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  date: Date;
  amount: number;
  type: 'expense' | 'income';
  category: TransactionCategory;
  merchant?: string;
  description?: string;
  source: 'manual' | 'plaid';
  tags: string[];
  createdAt: Date;
}

/** Allowed categories — kept as a union to enforce at compile time. */
export type TransactionCategory =
  | 'food'
  | 'transport'
  | 'entertainment'
  | 'shopping'
  | 'housing'
  | 'utilities'
  | 'health'
  | 'education'
  | 'personal'
  | 'other';

/** Static array for runtime validation (enum values in Mongoose). */
export const TRANSACTION_CATEGORIES: TransactionCategory[] = [
  'food',
  'transport',
  'entertainment',
  'shopping',
  'housing',
  'utilities',
  'health',
  'education',
  'personal',
  'other',
];

/** Budget — monthly/weekly spending cap per category. */
export interface IBudget extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  category: TransactionCategory;
  limit: number;
  period: 'monthly' | 'weekly';
  month: number; // 1-12
  year: number;
  createdAt: Date;
}

/** Habit — daily wellness tracking data point. */
export interface IHabit extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  name: HabitName;
  value: number;
  unit: string;
  date: Date;
  notes?: string;
  createdAt: Date;
}

export type HabitName = 'Sleep' | 'Exercise' | 'Study' | 'Stress' | 'Water' | 'Mood';

export const HABIT_NAMES: HabitName[] = [
  'Sleep',
  'Exercise',
  'Study',
  'Stress',
  'Water',
  'Mood',
];

/** Chat message — a single turn in a conversation. */
export interface IMessage extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

/** Recommendation — deals, discounts, campus resources. */
export interface IRecommendation extends Document {
  _id: Types.ObjectId;
  userId?: Types.ObjectId;
  type: 'foodDeal' | 'travelDeal' | 'campusResource' | 'discount';
  title: string;
  description: string;
  url?: string;
  imageUrl?: string;
  category?: string;
  campus?: string;
  price?: number;
  savings?: number;
  saved: boolean;
  createdAt: Date;
}

/* ─────────────────────────────────────────────
 * 2. AI Chat Types (provider-agnostic)
 * ──────────────────────────────────────────── */

/** A single message in a chat conversation (sent to AI). */
export interface IChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/** Response returned from any AI provider. */
export interface IChatResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  provider: string;
}

/** Optional parameters controlling AI generation. */
export interface IChatOptions {
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

/** Strategy interface — every AI provider adapter must implement this. */
export interface IAIProvider {
  readonly name: string;
  chat(messages: IChatMessage[], options?: IChatOptions): Promise<IChatResponse>;
}

/* ─────────────────────────────────────────────
 * 3. AppError — Custom operational error class
 * ──────────────────────────────────────────── */

/**
 * Operational errors are expected (bad input, not found, unauthorized).
 * Programming bugs are NOT operational — they propagate as-is and
 * the global error handler returns a generic 500.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Maintains proper stack trace in V8
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

/* ─────────────────────────────────────────────
 * 4. Express Request Extension (auth)
 * ──────────────────────────────────────────── */

/**
 * After the auth middleware verifies the JWT, it attaches
 * the decoded payload to `req.user`.  We extend Express's
 * Request type so controllers can access `req.user` safely.
 */
export interface JwtPayload {
  userId: string;
  email: string;
}

/** Authenticated request — guaranteed to have `user` set. */
export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}

/* ─────────────────────────────────────────────
 * 5. API Response Wrapper
 * ──────────────────────────────────────────── */

/**
 * Every endpoint returns a consistent JSON envelope.
 * `data` is generic so each route can type its own payload.
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Array<{ field?: string; message: string }>;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

/* ─────────────────────────────────────────────
 * 6. Global Express augmentation
 * ──────────────────────────────────────────── */

/**
 * Merge our JwtPayload onto Express.Request so that
 * `req.user` is available without casting in every handler.
 */
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
