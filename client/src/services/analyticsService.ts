import api from './api';
import type { SpendingSummary, CategoryBreakdown, MonthlyTrend, ApiResponse } from '../types/index.ts';

export const analyticsService = {
  async getSpendingSummary(period?: string): Promise<ApiResponse<SpendingSummary>> {
    const response = await api.get<ApiResponse<SpendingSummary>>('/analytics/summary', {
      params: { period },
    });
    return response.data;
  },

  async getCategoryBreakdown(period?: string): Promise<ApiResponse<CategoryBreakdown[]>> {
    const response = await api.get<ApiResponse<CategoryBreakdown[]>>('/analytics/categories', {
      params: { period },
    });
    return response.data;
  },

  async getMonthlyTrends(months?: number): Promise<ApiResponse<MonthlyTrend[]>> {
    const response = await api.get<ApiResponse<MonthlyTrend[]>>('/analytics/trends', {
      params: { months },
    });
    return response.data;
  },

  async exportCSV(period?: string): Promise<Blob> {
    const response = await api.get('/analytics/export', {
      params: { period },
      responseType: 'blob',
    });
    return response.data as Blob;
  },
};
