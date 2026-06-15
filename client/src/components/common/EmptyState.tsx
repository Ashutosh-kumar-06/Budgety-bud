import type { ReactNode } from 'react';
import { Inbox } from 'lucide-react';
import Button from './Button.tsx';
import './EmptyState.css';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="empty-state animate-fade-in-up">
      <div className="empty-state__icon">
        {icon || <Inbox size={48} />}
      </div>
      <h3 className="empty-state__title">{title}</h3>
      {description && <p className="empty-state__description">{description}</p>}
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction} className="empty-state__action">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
