import { Request, Response, NextFunction } from 'express';
import { jwtVerify } from 'jose';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';

export interface AuthRequest extends Request {
  user?: any;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('You are not logged in! Please log in to get access.', 401));
    }

    const secret = new TextEncoder().encode(env.JWT_SECRET);
    
    const { payload } = await jwtVerify(token, secret);
    
    req.user = { id: payload.id as string };
    
    next();
  } catch (error) {
    next(new AppError('Invalid token or token expired.', 401));
  }
};
