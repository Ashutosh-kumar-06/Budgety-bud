import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import * as transactionService from '../services/transactionService';

export const createTransaction = async (req: AuthRequest, res: Response) => {
  if (!req.user) return;
  const transaction = await transactionService.createTransaction((req.user.id as string), req.body);
  
  res.status(201).json({
    status: 'success',
    data: { transaction },
  });
};

export const getAllTransactions = async (req: AuthRequest, res: Response) => {
  if (!req.user) return;
  const transactions = await transactionService.getTransactions(req.user.id);
  
  res.status(200).json({
    status: 'success',
    results: transactions.length,
    data: { transactions },
  });
};

export const getTransaction = async (req: AuthRequest, res: Response) => {
  if (!req.user) return;
  const transaction = await transactionService.getTransactionById((req.user.id as string), (req.params.id as string));
  
  res.status(200).json({
    status: 'success',
    data: { transaction },
  });
};

export const deleteTransaction = async (req: AuthRequest, res: Response) => {
  if (!req.user) return;
  await transactionService.deleteTransaction((req.user.id as string), (req.params.id as string));
  
  res.status(204).json({
    status: 'success',
    data: null,
  });
};
