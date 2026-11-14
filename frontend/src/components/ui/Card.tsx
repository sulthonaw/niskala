import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../utils/formatters';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  headerAction?: ReactNode;
  footer?: ReactNode;
  /** Retained for backwards compatibility */
  cornerGlow?: boolean;
  noPadding?: boolean;
  children: ReactNode;
}

export function Card({
  title,
  subtitle,
  headerAction,
  footer,
  cornerGlow: _cornerGlow,
  noPadding = false,
  children,
  className = '',
  ...props
}: CardProps) {
  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-xl flex flex-col',
        'bg-[#0b0d11]/90 backdrop-blur-md transition-colors duration-300',
        'border border-white/[0.1] hover:border-white/[0.18]',
        className
      )}
      {...props}
    >

      {/* Optional Card Header */}
      {(title || subtitle || headerAction) && (
        <header className="relative z-10 px-5 pt-5 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="min-w-0">
            {title && (
              <h2 className="text-[15px] font-medium tracking-tight text-white/95 truncate">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-[11px] text-zinc-400 mt-0.5">{subtitle}</p>
            )}
          </div>
          {headerAction && <div className="shrink-0 flex items-center gap-2">{headerAction}</div>}
        </header>
      )}

      {/* Card Body */}
      <div className={cn('relative z-10 flex-1 flex flex-col', !noPadding && 'px-5 pb-5 pt-2')}>
        {children}
      </div>

      {/* Optional Footer */}
      {footer && (
        <footer className="relative z-10 px-5 py-3.5 border-t border-white/[0.08] bg-black/25">
          {footer}
        </footer>
      )}
    </section>
  );
}
