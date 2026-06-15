import api from './api';
import type { Transaction, ApiResponse, PaginatedResponse, Category, TransactionType } from '../types/index.ts';

export interface TransactionFilters {
  page?: number;
  limit?: number;
  category?: Category;
  type?: TransactionType;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export const transactionService = {
  async getTransactions(filters?: TransactionFilters): Promise<PaginatedResponse<Transaction>> {
    const response = await api.get<PaginatedResponse<Transaction>>('/transactions', {
      params: filters,
    });
    return response.data;
  },

  async createTransaction(data: Omit<Transaction, 'id' | 'createdAt'>): Promise<ApiResponse<Transaction>> {
    const response = await api.post<ApiResponse<Transaction>>('/transactions', data);
    return response.data;
  },

  async updateTransaction(id: string, data: Partial<Transaction>): Promise<ApiResponse<Transaction>> {
    const response = await api.put<ApiResponse<Transaction>>(`/transactions/${id}`, data);
    return response.data;
  },

  async deleteTransaction(id: string): Promise<ApiResponse<null>> {
    const response = await api.delete<ApiResponse<null>>(`/transactions/${id}`);
    return response.data;
  },
};
