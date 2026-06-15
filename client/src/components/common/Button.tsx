import type { ReactNode, ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';
import './Button.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`btn btn--${variant} btn--${size} ${fullWidth ? 'btn--full' : ''} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="btn__spinner" size={size === 'sm' ? 14 : 18} />
      ) : (
        leftIcon && <span className="btn__icon btn__icon--left">{leftIcon}</span>
      )}
      <span className="btn__text">{children}</span>
      {rightIcon && !isLoading && (
        <span className="btn__icon btn__icon--right">{rightIcon}</span>
      )}
    </button>
  );
}
