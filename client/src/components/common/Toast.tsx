import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import type { ToastItem } from '../../context/ToastContext.tsx';
import './Toast.css';

interface ToastProps {
  toast: ToastItem;
  onClose: (id: string) => void;
}

const ICONS = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

export default function Toast({ toast, onClose }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);
  const Icon = ICONS[toast.type];
  const duration = toast.duration || 4000;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onClose(toast.id), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [toast.id, duration, onClose]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => onClose(toast.id), 300);
  };

  return (
    <div className={`toast toast--${toast.type} ${isExiting ? 'toast--exiting' : ''}`}>
      <div className="toast__icon">
        <Icon size={20} />
      </div>
      <div className="toast__content">
        <p className="toast__title">{toast.title}</p>
        {toast.message && <p className="toast__message">{toast.message}</p>}
      </div>
      <button className="toast__close" onClick={handleClose} aria-label="Dismiss">
        <X size={16} />
      </button>
      <div
        className="toast__progress"
        style={{ animationDuration: `${duration}ms` }}
      />
    </div>
  );
}
