import api from './api';
import type { User, LoginCredentials, SignupData } from '../types/index.ts';

interface AuthResponse {
  user: { id: string; email: string; name: string };
  accessToken: string;
}

function mapUser(raw: AuthResponse['user']): User {
  return {
    id: raw.id,
    name: raw.name,
    email: raw.email,
    isOnboarded: false,
    createdAt: new Date().toISOString(),
  };
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<User> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    localStorage.setItem('accessToken', response.data.accessToken);
    return mapUser(response.data.user);
  },

  async signup(data: Pick<SignupData, 'email' | 'password' | 'name'>): Promise<User> {
    const response = await api.post<AuthResponse>('/auth/signup', {
      email: data.email,
      password: data.password,
      name: data.name,
    });
    localStorage.setItem('accessToken', response.data.accessToken);
    return mapUser(response.data.user);
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('accessToken');
    }
  },

  async getProfile(): Promise<User | null> {
    const token = localStorage.getItem('accessToken');
    if (!token || token === '[object Object]') return null;

    const response = await api.get<{ user: AuthResponse['user'] }>('/auth/profile');
    return mapUser(response.data.user);
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await api.put<{ user: AuthResponse['user'] }>('/auth/profile', data);
    return mapUser(response.data.user);
  },

  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/auth/change-password', data);
    return response.data;
  },
};