/**
 * PocketBuddy — JWT Authentication Middleware
 * =============================================
 * Uses the `jose` library (NOT jsonwebtoken) for JWT verification.
 *
 * Token lookup order:
 *   1. httpOnly cookie named "accessToken"
 *   2. Authorization header  →  "Bearer <token>"
 *
 * On success, attaches `{ userId, email }` to `req.user`.
 */

import { Request, Response, NextFunction } from 'express';
import { jwtVerify, type JWTPayload } from 'jose';
import { AppError, JwtPayload } from '../types';
import env from '../config/env';

/**
 * Convert a UTF-8 secret string to a Uint8Array
 * (required by jose for symmetric HMAC verification).
 */
function getSecretKey(secret: string): Uint8Array {
  return new TextEncoder().encode(secret);
}

/**
 * Extract the raw JWT string from the request.
 * Prefers cookie over header so browser clients Just Work™.
 */
function extractToken(req: Request): string | null {
  // 1. Check httpOnly cookie
  const cookieToken = req.cookies?.accessToken;
  if (cookieToken) return cookieToken;

  // 2. Check Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  return null;
}

/**
 * Main authentication guard.
 * Place before any route that requires a logged-in user.
 */
export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const token = extractToken(req);

    if (!token) {
      throw new AppError('Authentication required — no token provided', 401);
    }

    // jose.jwtVerify validates signature + exp/nbf automatically
    const { payload } = await jwtVerify(
      token,
      getSecretKey(env.jwt.secret),
      { algorithms: ['HS256'] },
    );

    // Ensure required claims exist
    const userId = (payload as JWTPayload & { userId?: string }).userId;
    const email = (payload as JWTPayload & { email?: string }).email;

    if (!userId || !email) {
      throw new AppError('Invalid token payload', 401);
    }

    // Attach to request for downstream handlers
    (req as any).userId = userId;
    req.user = { userId, email } as JwtPayload;

    next();
  } catch (err: any) {
    // jose throws specific error codes we can translate
    if (err?.code === 'ERR_JWT_EXPIRED') {
      return next(new AppError('Token expired — please refresh', 401));
    }
    if (err?.code === 'ERR_JWS_SIGNATURE_VERIFICATION_FAILED') {
      return next(new AppError('Invalid token signature', 401));
    }
    if (err instanceof AppError) {
      return next(err);
    }
    return next(new AppError('Authentication failed', 401));
  }
}

/**
 * Verify a refresh token (used by the /auth/refresh endpoint).
 * Returns the decoded payload or throws.
 */
export async function verifyRefreshToken(token: string): Promise<JwtPayload> {
  try {
    const { payload } = await jwtVerify(
      token,
      getSecretKey(env.jwt.refreshSecret),
      { algorithms: ['HS256'] },
    );

    const userId = (payload as JWTPayload & { userId?: string }).userId;
    const email = (payload as JWTPayload & { email?: string }).email;

    if (!userId || !email) {
      throw new AppError('Invalid refresh token payload', 401);
    }

    return { userId, email };
  } catch (err: any) {
    if (err?.code === 'ERR_JWT_EXPIRED') {
      throw new AppError('Refresh token expired — please log in again', 401);
    }
    if (err instanceof AppError) throw err;
    throw new AppError('Invalid refresh token', 401);
  }
}

/**
 * Extended Request interface with authenticated user info
 */
export interface AuthRequest extends Request {
  userId?: string;
  user?: JwtPayload;
}

/**
 * Alias for the main authenticate middleware
 */
export const authMiddleware = authenticate;
