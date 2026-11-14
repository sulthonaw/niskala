import type { ButtonHTMLAttributes, ReactNode } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  children,
  className = '',
  style,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    borderRadius: 'var(--radius-md)',
    fontWeight: 500,
    fontSize: size === 'sm' ? '0.875rem' : size === 'lg' ? '1.125rem' : '1rem',
    padding:
      size === 'sm'
        ? '0.375rem 0.75rem'
        : size === 'lg'
          ? '0.75rem 1.5rem'
          : '0.5rem 1rem',
    border: '1px solid transparent',
    transition: 'all 0.15s ease-in-out',
    opacity: disabled ? 0.6 : 1,
    cursor: disabled ? 'not-allowed' : 'pointer',
    ...style,
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      backgroundColor: 'var(--primary)',
      color: '#ffffff',
    },
    secondary: {
      backgroundColor: 'var(--bg-tertiary)',
      color: 'var(--text-primary)',
    },
    outline: {
      backgroundColor: 'transparent',
      borderColor: 'var(--border-color)',
      color: 'var(--text-primary)',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: 'var(--text-secondary)',
    },
  };

  return (
    <button
      type="button"
      disabled={disabled}
      style={{ ...baseStyles, ...variantStyles[variant] }}
      className={`ui-button ui-button--${variant} ${className}`}
      {...props}
    >
      {leftIcon && <span style={{ display: 'inline-flex', width: '1.25rem', height: '1.25rem' }}>{leftIcon}</span>}
      <span>{children}</span>
      {rightIcon && <span style={{ display: 'inline-flex', width: '1.25rem', height: '1.25rem' }}>{rightIcon}</span>}
    </button>
  );
}
