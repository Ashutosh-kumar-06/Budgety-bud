import api from './api';
import type { Budget, BudgetWithSpent, ApiResponse, Category } from '../types/index.ts';

export const budgetService = {
  async getBudgets(): Promise<ApiResponse<BudgetWithSpent[]>> {
    const response = await api.get<ApiResponse<BudgetWithSpent[]>>('/budgets');
    return response.data;
  },

  async setBudget(data: { category: Category; limit: number; period: 'monthly' | 'weekly' }): Promise<ApiResponse<Budget>> {
    const response = await api.post<ApiResponse<Budget>>('/budgets', data);
    return response.data;
  },

  async updateBudget(id: string, data: Partial<Budget>): Promise<ApiResponse<Budget>> {
    const response = await api.put<ApiResponse<Budget>>(`/budgets/${id}`, data);
    return response.data;
  },

  async deleteBudget(id: string): Promise<ApiResponse<null>> {
    const response = await api.delete<ApiResponse<null>>(`/budgets/${id}`);
    return response.data;
  },
};
