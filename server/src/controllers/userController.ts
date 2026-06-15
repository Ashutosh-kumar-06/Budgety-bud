import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import * as userService from '../services/userService';

export const getProfile = async (req: AuthRequest, res: Response) => {
  if (!req.user) return;
  const profile = await userService.getUserProfile(req.user.id);
  
  res.status(200).json({
    status: 'success',
    data: { profile },
  });
};
