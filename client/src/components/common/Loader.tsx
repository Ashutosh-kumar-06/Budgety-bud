import './Loader.css';

interface LoaderProps {
  variant?: 'spinner' | 'skeleton' | 'dots';
  size?: 'sm' | 'md' | 'lg';
  count?: number;
  className?: string;
}

export default function Loader({
  variant = 'spinner',
  size = 'md',
  count = 3,
  className = '',
}: LoaderProps) {
  if (variant === 'spinner') {
    return (
      <div className={`loader-spinner loader-spinner--${size} ${className}`}>
        <div className="loader-spinner__ring" />
      </div>
    );
  }

  if (variant === 'dots') {
    return (
      <div className={`loader-dots ${className}`}>
        <span className="loader-dots__dot" />
        <span className="loader-dots__dot" />
        <span className="loader-dots__dot" />
      </div>
    );
  }

  // Skeleton variant
  return (
    <div className={`loader-skeleton ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`skeleton skeleton--${size}`} />
      ))}
    </div>
  );
}
