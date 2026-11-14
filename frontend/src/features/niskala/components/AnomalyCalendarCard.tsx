import { useMemo, useState } from 'react';
import { TableCellsIcon } from '@heroicons/react/24/solid';
import {
  CLASS_COLOR,
  CLASS_LEGEND_ITEMS,
  CLASS_SHORT_LABEL,
  MONTH_SHORT_NAMES,
  isLightSwatch,
} from '../../../constants/anomalyColors';
import { formatYmLabel } from '../../../services/niskalaDataService';
import type { MonthCell } from '../../../types/niskala';
import { cn } from '../../../utils/formatters';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';

export interface AnomalyCalendarCardProps {
  regionName: string;
  cells: MonthCell[];
  focusMonth: string;
  partialDaysCovered: number;
  onSelectFocusMonth: (ym: string) => void;
}

export function AnomalyCalendarCard({
  regionName,
  cells,
  focusMonth,
  partialDaysCovered,
  onSelectFocusMonth,
}: AnomalyCalendarCardProps) {
  const [showAsTable, setShowAsTable] = useState(false);

  // Group cells by year descending (newest on top per PRD 6.2)
  const rowsByYear = useMemo(() => {
    const yearMap = new Map<number, Map<number, MonthCell>>();
    for (const cell of cells) {
      let monthMap = yearMap.get(cell.year);
      if (!monthMap) {
        monthMap = new Map<number, MonthCell>();
        yearMap.set(cell.year, monthMap);
      }
      monthMap.set(cell.month, cell);
    }

    return Array.from(yearMap.entries())
      .sort((a, b) => b[0] - a[0])
      .map(([year, monthMap]) => ({
        year,
        months: Array.from({ length: 12 }, (_, idx) => monthMap.get(idx + 1) ?? null),
      }));
  }, [cells]);

  return (
    <Card
      title={`Harmonized Anomaly Calendar · ${regionName}`}
      subtitle="Select any month cell to update the summary cards and district ranking."
      headerAction={
        <Button
          variant={showAsTable ? 'mint' : 'outline'}
          size="sm"
          leftIcon={<TableCellsIcon />}
          onClick={() => setShowAsTable((prev) => !prev)}
        >
          {showAsTable ? 'Show as heatmap' : 'Show as table'}
        </Button>
      }
      footer={
        <div className="flex flex-wrap items-center justify-between gap-3 text-[11px]">
          <div className="flex flex-wrap items-center gap-3">
            {CLASS_LEGEND_ITEMS.map((item) => (
              <span key={item.cls} className="inline-flex items-center gap-1.5 text-zinc-300">
                <span
                  className="w-3 h-3 rounded-sm border border-white/15 shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span>{item.label}</span>
              </span>
            ))}
            <span className="inline-flex items-center gap-1.5 text-zinc-400">
              <span
                className="w-3 h-3 rounded-sm border border-white/20 shrink-0"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(45deg, #27272a 0, #27272a 2px, #18181b 2px, #18181b 4px)',
                }}
              />
              <span>No harmonized data</span>
            </span>
          </div>
          <span className="text-zinc-500">Dashed cell = in progress ({partialDaysCovered}d)</span>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        {!showAsTable ? (
          /* Heatmap Grid (Years × 12 Months) */
          <div className="overflow-x-auto pb-1">
            <div className="min-w-[600px]">
              {/* Month Header */}
              <div className="grid grid-cols-[64px_repeat(12,minmax(0,1fr))] gap-1.5 mb-1.5 text-[10px] font-brand uppercase tracking-[0.08em] text-zinc-400">
                <div className="sticky left-0 bg-[#0e1012] z-10 px-1">Year</div>
                {MONTH_SHORT_NAMES.map((m) => (
                  <div key={m} className="text-center">
                    {m}
                  </div>
                ))}
              </div>

              {/* Year Rows */}
              <div className="flex flex-col gap-1.5">
                {rowsByYear.map((row) => (
                  <div
                    key={row.year}
                    className="grid grid-cols-[64px_repeat(12,minmax(0,1fr))] gap-1.5 items-center"
                  >
                    <div className="sticky left-0 bg-[#0e1012]/95 z-10 text-xs font-medium text-zinc-300 px-1 tabular-nums">
                      {row.year}
                    </div>

                    {row.months.map((cell, idx) => {
                      if (!cell) {
                        return (
                          <div
                            key={`${row.year}-${idx + 1}`}
                            className="h-7 rounded-md bg-transparent"
                          />
                        );
                      }

                      const isFocus = cell.ym === focusMonth;
                      const bgColor =
                        cell.cls !== null ? CLASS_COLOR[cell.cls] : undefined;
                      const lightText = !isLightSwatch(cell.cls);

                      return (
                        <button
                          key={cell.ym}
                          type="button"
                          onClick={() => onSelectFocusMonth(cell.ym)}
                          aria-label={`${formatYmLabel(cell.ym)}: ${
                            cell.ratio !== null
                              ? `${cell.ratio.toFixed(1)}x normal`
                              : 'No harmonized data'
                          }`}
                          style={
                            bgColor
                              ? { backgroundColor: bgColor }
                              : {
                                  backgroundImage:
                                    'repeating-linear-gradient(45deg, #27272a 0, #27272a 3px, #141417 3px, #141417 6px)',
                                }
                          }
                          className={cn(
                            'h-7 rounded-md text-[10px] font-semibold tabular-nums transition-transform cursor-pointer focus-visible:outline-2 focus-visible:outline-[#A4FFF0]',
                            lightText ? 'text-white' : 'text-zinc-950',
                            cell.partial && 'border border-dashed border-white/80',
                            isFocus
                              ? 'ring-2 ring-[#A4FFF0] ring-offset-2 ring-offset-[#0e1012] scale-[1.06] z-10'
                              : 'hover:scale-[1.04]'
                          )}
                        >
                          {cell.ratio !== null ? `${cell.ratio.toFixed(1)}×` : '—'}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Accessible Tabular View (PRD 8.2) */
          <div className="overflow-x-auto max-h-[420px] overflow-y-auto rounded-xl border border-white/[0.08]">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="sticky top-0 bg-[#121417] text-[10px] font-brand uppercase tracking-[0.12em] text-zinc-400 border-b border-white/[0.08]">
                <tr>
                  <th className="py-2.5 px-3">Month</th>
                  <th className="py-2.5 px-3">Hotspots</th>
                  <th className="py-2.5 px-3">Normal</th>
                  <th className="py-2.5 px-3">Ratio</th>
                  <th className="py-2.5 px-3">Class</th>
                  <th className="py-2.5 px-3">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {[...cells].reverse().map((cell) => (
                  <tr
                    key={cell.ym}
                    onClick={() => onSelectFocusMonth(cell.ym)}
                    className={cn(
                      'cursor-pointer hover:bg-white/[0.04]',
                      cell.ym === focusMonth && 'bg-[#A4FFF0]/10'
                    )}
                  >
                    <td className="py-2 px-3 font-medium text-white tabular-nums">{cell.ym}</td>
                    <td className="py-2 px-3 tabular-nums text-zinc-200">
                      {cell.hotspots !== null ? Math.round(cell.hotspots).toLocaleString() : '—'}
                    </td>
                    <td className="py-2 px-3 tabular-nums text-zinc-400">
                      {Math.round(cell.normal).toLocaleString()}
                    </td>
                    <td className="py-2 px-3 tabular-nums text-white">
                      {cell.ratio !== null ? `${cell.ratio.toFixed(2)}×` : '—'}
                    </td>
                    <td className="py-2 px-3 text-zinc-300">
                      {cell.cls !== null ? CLASS_SHORT_LABEL[cell.cls] : 'No harmonized data'}
                    </td>
                    <td className="py-2 px-3 font-brand text-[10px] uppercase tracking-[0.06em] text-zinc-400">
                      {cell.source}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Card>
  );
}
