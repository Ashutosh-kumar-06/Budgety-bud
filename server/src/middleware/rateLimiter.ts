/**
 * PocketBuddy — Rate Limiter Configurations
 * ===========================================
 * Pre-configured rate limiters for different route groups.
 *
 * - authLimiter  → Strict (brute-force protection on login/signup)
 * - apiLimiter   → Normal (general API endpoints)
 * - chatLimiter  → Moderate (AI chat is expensive per-call)
 */

import rateLimit from 'express-rate-limit';

/**
 * Auth endpoints (login, signup, refresh).
 * 10 requests per 15 minutes per IP.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  message: {
    success: false,
    message: 'Too many authentication attempts — please try again later',
  },
});

/**
 * General API endpoints (transactions, budgets, habits, etc.).
 * 100 requests per 15 minutes per IP.
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests — please slow down',
  },
});

/**
 * AI chat endpoint.
 * 30 requests per 15 minutes per IP — AI calls are costly.
 */
export const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Chat rate limit reached — please wait before sending more messages',
  },
});
