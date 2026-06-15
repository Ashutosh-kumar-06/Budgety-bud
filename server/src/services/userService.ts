import { User, IUser } from '../models/User';
import { AppError } from '../utils/AppError';

export const getUserProfile = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    balance: user.balance,
    createdAt: user.createdAt,
  };
};

export const updateUserBalance = async (userId: string, amount: number, type: 'income' | 'expense') => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (type === 'income') {
    user.balance += amount;
  } else if (type === 'expense') {
    user.balance -= amount;
  }

  await user.save();
  return user.balance;
};
