/**
 * PocketBuddy — Validation Middleware Factory
 * =============================================
 * Wraps express-validator's `validationResult` into a
 * reusable middleware that returns a consistent 400 response
 * when any validation chain fails.
 *
 * Usage:
 *   router.post('/signup', [...rules], validate, controller);
 */

import { Request, Response, NextFunction } from 'express';
import { validationResult, type ValidationChain } from 'express-validator';
import { ApiResponse } from '../types';

/**
 * Run all validation chains, then check results.
 * If errors exist → respond 400 with structured error array.
 * If clean → call next().
 *
 * @param validations - Array of express-validator ValidationChain rules.
 * @returns Express middleware that executes validations then checks.
 */
export function validate(validations: ValidationChain[]) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Run every validation chain in parallel
    await Promise.all(validations.map((v) => v.run(req)));

    const errors = validationResult(req);

    if (errors.isEmpty()) {
      return next();
    }

    // Map express-validator errors to our ApiResponse format
    const formattedErrors = errors.array().map((err) => ({
      field: (err as any).path as string | undefined,
      message: err.msg as string,
    }));

    const response: ApiResponse = {
      success: false,
      message: 'Validation failed',
      errors: formattedErrors,
    };

    res.status(400).json(response);
  };
}

/**
 * Simple validation middleware for signup/login
 * Validates: email, password (min 6 chars), optional name (min 2 chars)
 */
export const validateInput = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { email, password, name } = req.body;
  const errors: Array<{ field?: string; message: string }> = [];

  // Email validation
  if (!email || typeof email !== 'string') {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push({ field: 'email', message: 'Invalid email format' });
  }

  // Password validation
  if (!password || typeof password !== 'string') {
    errors.push({ field: 'password', message: 'Password is required' });
  } else if (password.length < 6) {
    errors.push({ field: 'password', message: 'Password must be at least 6 characters' });
  }

  // Name validation (optional but if provided, min 2 chars)
  if (name && typeof name === 'string' && name.length < 2) {
    errors.push({ field: 'name', message: 'Name must be at least 2 characters' });
  }

  if (errors.length > 0) {
    const response: ApiResponse = {
      success: false,
      message: 'Validation failed',
      errors,
    };
    return void res.status(400).json(response);
  }

  next();
};
