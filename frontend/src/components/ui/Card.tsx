import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../utils/formatters';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  headerAction?: ReactNode;
  footer?: ReactNode;
  /** Toggle ambient corner mint-green radial orbs */
  cornerGlow?: boolean;
  noPadding?: boolean;
  children: ReactNode;
}

export function Card({
  title,
  subtitle,
  headerAction,
  footer,
  cornerGlow = true,
  noPadding = false,
  children,
  className = '',
  ...props
}: CardProps) {
  return (
    <section
      className={cn(
        'relative overflow-clip rounded-[22px] flex flex-col',
        'bg-[#0e1012]/80 backdrop-blur-md transition-colors duration-300',
        'border border-white/[0.11] hover:border-white/[0.18] shadow-[0_18px_48px_rgba(0,0,0,0.65)]',
        className
      )}
      {...props}
    >
      {/* Top hairline specular edge */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent"
      />

      {/* Signature corner blurred mint-green radial orbs */}
      {cornerGlow && (
        <>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-12 -left-12 w-40 h-40 rounded-full bg-[#A4FFF0]/[0.13] blur-2xl"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-14 -right-12 w-44 h-44 rounded-full bg-[#A4FFF0]/[0.12] blur-2xl"
          />
        </>
      )}

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
