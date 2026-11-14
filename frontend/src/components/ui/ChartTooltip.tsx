import { createPortal } from 'react-dom';
import { cn } from '../../utils/formatters';

export interface ChartTooltipRow {
  axis: 'X' | 'Y';
  label: string;
  value: string;
  swatchColor?: string;
}

export interface ChartTooltipProps {
  title?: string;
  badge?: string;
  rows: ChartTooltipRow[];
  /** Viewport X/Y coordinates of the active cursor or focused element. */
  x: number;
  y: number;
  className?: string;
}

/**
 * Niskala design-system tooltip anchored directly beside the cursor,
 * explicitly showing X and Y axis labels & values.
 */
export function ChartTooltip({ title, badge, rows, x, y, className }: ChartTooltipProps) {
  if (typeof document === 'undefined') return null;

  const viewportW = typeof window !== 'undefined' ? window.innerWidth : 1280;
  const viewportH = typeof window !== 'undefined' ? window.innerHeight : 720;

  const placeLeft = x > viewportW - 215;
  const clampedY = Math.max(48, Math.min(y, viewportH - 56));

  return createPortal(
    <div
      role="status"
      style={{
        position: 'fixed',
        left: `${placeLeft ? x - 12 : x + 12}px`,
        top: `${clampedY}px`,
        transform: placeLeft ? 'translate(-100%, -50%)' : 'translate(0, -50%)',
      }}
      className={cn(
        'pointer-events-none z-[9999] min-w-[152px] max-w-[205px]',
        'rounded-lg bg-[#0B0E14]/92 backdrop-blur-xl',
        'shadow-[0_12px_28px_rgba(0,0,0,0.88)] px-2.5 py-1.5 text-[10px]',
        className
      )}
    >
      {(title || badge) && (
        <div className="flex items-center justify-between gap-2 pb-1 mb-0.5">
          {title && (
            <span className="font-brand text-[9px] uppercase tracking-[0.09em] text-[#A4FFF0] truncate">
              {title}
            </span>
          )}
          {badge && (
            <span className="text-[9px] font-medium text-zinc-300 tabular-nums shrink-0">
              {badge}
            </span>
          )}
        </div>
      )}

      <div className="flex flex-col gap-0.5">
        {rows.map((row) => (
          <div
            key={`${row.axis}-${row.label}`}
            className="flex items-center justify-between gap-2"
          >
            <div className="flex items-center gap-1 min-w-0">
              <span className="font-brand text-[8px] uppercase tracking-[0.05em] px-1 py-px rounded bg-white/[0.08] text-[#A4FFF0] shrink-0">
                {row.axis}
              </span>
              {row.swatchColor && (
                <span
                  className="w-1.5 h-1.5 rounded-[2px] shrink-0"
                  style={{ backgroundColor: row.swatchColor }}
                />
              )}
              <span className="text-zinc-400 truncate">{row.label}</span>
            </div>
            <span className="font-medium text-white tabular-nums shrink-0">{row.value}</span>
          </div>
        ))}
      </div>
    </div>,
    document.body
  );
}
