import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../utils/formatters';

export type BadgeVariant = 'neutral' | 'mint' | 'amber' | 'coral' | 'yellow';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  neutral: 'bg-white/[0.04] border-white/[0.1] text-zinc-300',
  mint: 'bg-[#A4FFF0]/[0.06] border-[#A4FFF0]/25 text-[#A4FFF0]',
  amber: 'bg-[#FF9C33]/[0.08] border-[#FF9C33]/30 text-[#FF9C33]',
  coral: 'bg-[#FF6060]/[0.08] border-[#FF6060]/30 text-[#FF6060]',
  yellow: 'bg-[#FFEB67]/[0.08] border-[#FFEB67]/30 text-[#FFEB67]',
};

export function Badge({
  variant = 'neutral',
  children,
  className = '',
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md border text-[11px] font-mono tracking-wide whitespace-nowrap shrink-0',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
