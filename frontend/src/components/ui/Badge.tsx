import type { HTMLAttributes, ReactNode } from 'react';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'success' | 'warning' | 'default';
  children: ReactNode;
}

export function Badge({
  variant = 'default',
  children,
  className = '',
  style,
  ...props
}: BadgeProps) {
  const badgeStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.2rem 0.6rem',
    borderRadius: 'var(--radius-full)',
    fontSize: '0.75rem',
    fontWeight: 500,
    ...style,
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      backgroundColor: 'var(--primary-light)',
      color: 'var(--primary-text)',
    },
    success: {
      backgroundColor: 'var(--success-light)',
      color: 'var(--success)',
    },
    warning: {
      backgroundColor: 'var(--warning-light)',
      color: 'var(--warning)',
    },
    default: {
      backgroundColor: 'var(--bg-tertiary)',
      color: 'var(--text-secondary)',
    },
  };

  return (
    <span
      style={{ ...badgeStyles, ...variantStyles[variant] }}
      className={`ui-badge ui-badge--${variant} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
