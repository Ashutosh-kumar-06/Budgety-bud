import { createContext, useState, useCallback, type ReactNode } from 'react';
import Toast from '../components/common/Toast.tsx';
import '../components/common/Toast.css';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

export interface ToastContextType {
  showToast: (type: ToastType, title: string, message?: string, duration?: number) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
}

export const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback(
    (type: ToastType, title: string, message?: string, duration = 4000) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const toast: ToastItem = { id, type, title, message, duration };
      setToasts(prev => [...prev, toast]);
    },
    []
  );

  const success = useCallback(
    (title: string, message?: string) => showToast('success', title, message),
    [showToast]
  );
  const error = useCallback(
    (title: string, message?: string) => showToast('error', title, message),
    [showToast]
  );
  const info = useCallback(
    (title: string, message?: string) => showToast('info', title, message),
    [showToast]
  );
  const warning = useCallback(
    (title: string, message?: string) => showToast('warning', title, message),
    [showToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning }}>
      {children}
      <div className="toast-container">
        {toasts.map(toast => (
          <Toast key={toast.id} toast={toast} onClose={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
