import api from './api';
import type { Recommendation, CampusResource, ApiResponse } from '../types/index.ts';

export const recommendationService = {
  async getRecommendations(category?: string): Promise<ApiResponse<Recommendation[]>> {
    const response = await api.get<ApiResponse<Recommendation[]>>('/recommendations', {
      params: { category },
    });
    return response.data;
  },

  async saveRecommendation(id: string): Promise<ApiResponse<null>> {
    const response = await api.post<ApiResponse<null>>(`/recommendations/${id}/save`);
    return response.data;
  },

  async unsaveRecommendation(id: string): Promise<ApiResponse<null>> {
    const response = await api.delete<ApiResponse<null>>(`/recommendations/${id}/save`);
    return response.data;
  },

  async getCampusResources(): Promise<ApiResponse<CampusResource[]>> {
    const response = await api.get<ApiResponse<CampusResource[]>>('/recommendations/campus');
    return response.data;
  },
};
