import { type InputHTMLAttributes, type ReactNode, forwardRef } from 'react';
import './Input.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, fullWidth = true, className = '', id, ...props }, ref) => {
    const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, '-') || 'field'}`;

    return (
      <div className={`input-group ${fullWidth ? 'input-group--full' : ''} ${className}`}>
        {label && (
          <label htmlFor={inputId} className="input-group__label">
            {label}
          </label>
        )}
        <div className={`input-wrapper ${error ? 'input-wrapper--error' : ''}`}>
          {leftIcon && <span className="input-wrapper__icon input-wrapper__icon--left">{leftIcon}</span>}
          <input
            ref={ref}
            id={inputId}
            className={`input-field ${leftIcon ? 'input-field--has-left' : ''} ${rightIcon ? 'input-field--has-right' : ''}`}
            {...props}
          />
          {rightIcon && <span className="input-wrapper__icon input-wrapper__icon--right">{rightIcon}</span>}
        </div>
        {error && <span className="input-group__error">{error}</span>}
        {helperText && !error && <span className="input-group__helper">{helperText}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
