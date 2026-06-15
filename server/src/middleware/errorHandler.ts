/**
 * PocketBuddy — Global Error Handler Middleware
 * ===============================================
 * Catches every error that reaches Express's error pipeline.
 *
 * Operational errors (AppError) → send the message + status to client.
 * Programming bugs             → log the full stack, send generic 500.
 *
 * Place this AFTER all routes:
 *   app.use(errorHandler);
 */

import { Request, Response, NextFunction } from 'express';
import { AppError } from '../types';
import env from '../config/env';

/**
 * Express error-handling middleware (4-arg signature).
 */
export function errorHandler(
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // ── Determine status & message ─────────────────────────
  let statusCode = 500;
  let message = 'Internal Server Error';
  let isOperational = false;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    isOperational = err.isOperational;
  }

  // ── Mongoose validation error ──────────────────────────
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = err.message;
    isOperational = true;
  }

  // ── Mongoose duplicate key error ───────────────────────
  if (err.name === 'MongoServerError' && (err as any).code === 11000) {
    statusCode = 409;
    message = 'Duplicate value — resource already exists';
    isOperational = true;
  }

  // ── Mongoose cast error (bad ObjectId, etc.) ───────────
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid resource identifier';
    isOperational = true;
  }

  // ── Log non-operational (unexpected) errors fully ──────
  if (!isOperational) {
    console.error('💥  UNEXPECTED ERROR:', err);
  }

  // ── Send JSON response ─────────────────────────────────
  res.status(statusCode).json({
    success: false,
    message,
    // Expose stack trace only in development for debugging
    ...(env.nodeEnv === 'development' && { stack: err.stack }),
  });
}
