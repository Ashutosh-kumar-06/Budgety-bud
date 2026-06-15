import api from './api';
import type { Habit, HabitStreak, HabitType, ApiResponse } from '../types/index.ts';

export const habitService = {
  async logHabit(data: { type: HabitType; value: number; date: string; notes?: string }): Promise<ApiResponse<Habit>> {
    const response = await api.post<ApiResponse<Habit>>('/habits', data);
    return response.data;
  },

  async getHabits(params?: { type?: HabitType; startDate?: string; endDate?: string }): Promise<ApiResponse<Habit[]>> {
    const response = await api.get<ApiResponse<Habit[]>>('/habits', { params });
    return response.data;
  },

  async getStreaks(): Promise<ApiResponse<HabitStreak[]>> {
    const response = await api.get<ApiResponse<HabitStreak[]>>('/habits/streaks');
    return response.data;
  },

  async deleteHabit(id: string): Promise<ApiResponse<null>> {
    const response = await api.delete<ApiResponse<null>>(`/habits/${id}`);
    return response.data;
  },
};
