import { Transaction, ITransaction } from '../models/Transaction';
import { AppError } from '../utils/AppError';
import * as userService from './userService';

export interface CreateTransactionDTO {
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description?: string;
  date?: string;
}

export const createTransaction = async (userId: string, data: CreateTransactionDTO) => {
  const transaction = await Transaction.create({
    user: userId,
    amount: data.amount,
    type: data.type,
    category: data.category,
    description: data.description,
    date: data.date ? new Date(data.date) : new Date(),
  });

  // Update user balance
  await userService.updateUserBalance(userId, data.amount, data.type);

  return transaction;
};

export const getTransactions = async (userId: string) => {
  const transactions = await Transaction.find({ user: userId }).sort({ date: -1 });
  return transactions;
};

export const getTransactionById = async (userId: string, transactionId: string) => {
  const transaction = await Transaction.findOne({ _id: transactionId, user: userId });
  if (!transaction) {
    throw new AppError('Transaction not found', 404);
  }
  return transaction;
};

export const deleteTransaction = async (userId: string, transactionId: string) => {
  const transaction = await Transaction.findOne({ _id: transactionId, user: userId });
  if (!transaction) {
    throw new AppError('Transaction not found', 404);
  }

  // Reverse balance change
  const reverseType = transaction.type === 'income' ? 'expense' : 'income';
  await userService.updateUserBalance(userId, transaction.amount, reverseType);

  await transaction.deleteOne();
  return null;
};
