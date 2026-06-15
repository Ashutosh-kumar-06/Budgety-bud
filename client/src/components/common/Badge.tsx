import type { ReactNode } from 'react';
import './Badge.css';

interface BadgeProps {
  children: ReactNode;
  variant?: 'filled' | 'outline' | 'dot';
  color?: string;
  size?: 'sm' | 'md';
  className?: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  food: 'var(--cat-food)',
  transport: 'var(--cat-transport)',
  entertainment: 'var(--cat-entertainment)',
  education: 'var(--cat-education)',
  savings: 'var(--cat-savings)',
  rent: 'var(--cat-rent)',
  health: 'var(--cat-health)',
  other: 'var(--cat-other)',
};

export function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] || CATEGORY_COLORS.other;
}

export default function Badge({
  children,
  variant = 'filled',
  color,
  size = 'sm',
  className = '',
}: BadgeProps) {
  const badgeColor = color || 'var(--color-primary)';
  const style = {
    '--badge-color': badgeColor,
  } as React.CSSProperties;

  return (
    <span className={`badge badge--${variant} badge--${size} ${className}`} style={style}>
      {variant === 'dot' && <span className="badge__dot" />}
      {children}
    </span>
  );
}
