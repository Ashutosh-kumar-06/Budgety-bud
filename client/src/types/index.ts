export interface User {
  id: string;
  email: string;
  name: string;
  isOnboarded?: boolean;
  createdAt?: string;
  preferences?: {
    theme: 'light' | 'dark';
    aiTone: 'Strict' | 'Sweet' | 'Mix';
  };
}

export interface Transaction {
  id: string;
  amount: number;
  category: string;
  date: string;
  description: string;
}

export interface Budget {
  category: string;
  spent: number;
  limit: number;
}

export type ThemeMode = 'light' | 'dark' | 'system';
export interface SpendingSummary { [key: string]: any }
export interface CategoryBreakdown { [key: string]: any }
export interface MonthlyTrend { [key: string]: any }
export interface ApiResponse<T = any> { data: T; message?: string; }
export interface LoginCredentials { [key: string]: any }
export interface SignupData { [key: string]: any }
export interface BudgetWithSpent extends Budget { spent: number; }
export interface Category { id: string; name: string; icon?: string; }
export interface ChatMessage { id: string; role: string; content: string; }
export interface ChatResponse { reply: string; }
export interface Conversation { id: string; messages: ChatMessage[]; }
export interface Habit { id: string; name: string; }
export interface HabitStreak { streak: number; }
export interface HabitType { id: string; name: string; }
export interface Recommendation { id: string; title: string; }
export interface CampusResource { id: string; name: string; }
export interface PaginatedResponse<T> { items: T[]; total: number; }
export type TransactionType = 'expense' | 'income';
