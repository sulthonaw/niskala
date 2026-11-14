import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../utils/formatters';

export type ButtonVariant = 'mint' | 'pill' | 'outline' | 'icon';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  mint: 'bg-[#A4FFF0] hover:bg-[#8efce9] text-[#050507] font-semibold [--slide-bg:rgba(255,255,255,0.3)]',
  pill: 'bg-white/[0.09] hover:border-white/25 text-white border border-white/[0.14] [--slide-bg:rgba(164,255,240,0.12)]',
  outline: 'bg-white/[0.03] hover:border-[#A4FFF0]/45 text-zinc-200 hover:text-white border border-white/[0.14] [--slide-bg:rgba(164,255,240,0.1)]',
  icon: 'bg-white/[0.04] hover:border-[#A4FFF0]/45 text-zinc-200 hover:text-white border border-white/[0.14] rounded-md [--slide-bg:rgba(164,255,240,0.12)]',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'text-xs px-3 py-1.5 rounded-md gap-1.5',
  md: 'text-[13px] px-4 py-2.5 rounded-md gap-2',
  lg: 'text-sm px-5 py-3 rounded-md gap-2',
};

export function Button({
  variant = 'mint',
  size = 'md',
  leftIcon,
  rightIcon,
  children,
  className = '',
  disabled,
  type = 'button',
  ...props
}: ButtonProps) {
  const isIconOnly = variant === 'icon';

  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(
        'group hover-slide-fill inline-flex items-center justify-center font-medium select-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A4FFF0]',
        isIconOnly ? 'w-9 h-9 rounded-md p-0' : sizeStyles[size],
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {leftIcon && (
        <span className="inline-flex shrink-0 w-4 h-4 items-center justify-center transition-transform duration-200 group-hover:translate-x-0.5">
          {leftIcon}
        </span>
      )}
      <span>{children}</span>
      {rightIcon && (
        <span className="inline-flex shrink-0 w-4 h-4 items-center justify-center transition-transform duration-200 group-hover:translate-x-0.5">
          {rightIcon}
        </span>
      )}
    </button>
  );
}
