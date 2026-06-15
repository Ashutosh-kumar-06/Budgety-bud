import type { ReactNode, HTMLAttributes } from 'react';
import './Card.css';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  gradientBorder?: boolean;
  children: ReactNode;
}

export default function Card({
  children,
  variant = 'default',
  padding = 'md',
  hover = false,
  gradientBorder = false,
  className = '',
  ...props
}: CardProps) {
  return (
    <div
      className={`card card--${variant} card--pad-${padding} ${hover ? 'card--hover' : ''} ${gradientBorder ? 'card--gradient-border' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
