import { createContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User } from '../types/index.ts';
import { authService } from '../services/authService.ts';

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: { email: string; password: string; name: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const profile = await authService.getProfile();
      setUser(profile);
    } catch {
      setUser(null);
      localStorage.removeItem('accessToken');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const login = useCallback(async (email: string, password: string) => {
    const profile = await authService.login({ email, password });
    setUser(profile);
  }, []);

  const signup = useCallback(async (data: { email: string; password: string; name: string }) => {
    const profile = await authService.signup(data);
    setUser(profile);
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const updateUser = useCallback((data: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...data } : null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
