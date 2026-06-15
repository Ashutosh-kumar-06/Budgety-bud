import { Request, Response } from 'express';
import * as authService from '../services/authService';

export const register = async (req: Request, res: Response) => {
  const { email, password, name } = req.body;
  const result = await authService.registerUser(email, password, name);
  
  res.status(201).json({
    status: 'success',
    data: result,
  });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await authService.loginUser(email, password);
  
  res.status(200).json({
    status: 'success',
    data: result,
  });
};
