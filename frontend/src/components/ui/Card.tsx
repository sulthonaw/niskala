import type { HTMLAttributes, ReactNode } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}

export function Card({
  title,
  subtitle,
  icon,
  children,
  footer,
  style,
  className = '',
  ...props
}: CardProps) {
  const cardStyles: React.CSSProperties = {
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-sm)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    ...style,
  };

  const headerStyles: React.CSSProperties = {
    padding: '1.25rem 1.5rem',
    borderBottom: subtitle || children ? '1px solid var(--border-subtle)' : 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  };

  const bodyStyles: React.CSSProperties = {
    padding: '1.5rem',
    flex: 1,
  };

  const footerStyles: React.CSSProperties = {
    padding: '1rem 1.5rem',
    borderTop: '1px solid var(--border-subtle)',
    backgroundColor: 'var(--bg-tertiary)',
  };

  return (
    <div style={cardStyles} className={`ui-card ${className}`} {...props}>
      {(title || icon) && (
        <div style={headerStyles} className="ui-card__header">
          {icon && (
            <div
              style={{
                display: 'inline-flex',
                padding: '0.5rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary-text)',
                width: '1.5rem',
                height: '1.5rem',
              }}
            >
              {icon}
            </div>
          )}
          <div>
            {title && <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{title}</h3>}
            {subtitle && (
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.125rem' }}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
      )}
      <div style={bodyStyles} className="ui-card__body">
        {children}
      </div>
      {footer && (
        <div style={footerStyles} className="ui-card__footer">
          {footer}
        </div>
      )}
    </div>
  );
}
