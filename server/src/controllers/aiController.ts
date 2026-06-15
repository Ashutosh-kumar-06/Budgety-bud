import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import * as aiService from '../services/aiService';

export const chat = async (req: AuthRequest, res: Response) => {
  if (!req.user) return;
  const { message } = req.body;
  
  const reply = await aiService.processUserChat(req.user.id, message);
  
  res.status(200).json({
    status: 'success',
    data: { reply },
  });
};
