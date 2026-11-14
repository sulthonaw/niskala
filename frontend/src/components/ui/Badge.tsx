import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../utils/formatters';

export type BadgeVariant = 'neutral' | 'mint' | 'amber' | 'coral' | 'yellow';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  showDot?: boolean;
  children: ReactNode;
}

const dotStyles: Record<BadgeVariant, string> = {
  neutral: 'bg-zinc-400',
  mint: 'bg-[#A4FFF0]',
  amber: 'bg-[#FF9C33]',
  coral: 'bg-[#FF6060]',
  yellow: 'bg-[#FFEB67]',
};

export function Badge({
  variant = 'neutral',
  showDot = false,
  children,
  className = '',
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap shrink-0',
        'bg-white/[0.06] border border-white/[0.11] text-zinc-200',
        className
      )}
      {...props}
    >
      {showDot && (
        <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotStyles[variant])} />
      )}
      {children}
    </span>
  );
}
