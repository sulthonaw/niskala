import { useMemo, useState } from 'react';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  TableCellsIcon,
} from '@heroicons/react/24/outline';
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

const HEATMAP_YEARS_PER_PAGE = 9;
const TABLE_ROWS_PER_PAGE = 12;

export function AnomalyCalendarCard({
  regionName,
  cells,
  focusMonth,
  partialDaysCovered,
  onSelectFocusMonth,
}: AnomalyCalendarCardProps) {
  const [showAsTable, setShowAsTable] = useState(false);
  const [showAllYears, setShowAllYears] = useState(false);
  const [showAllTableRows, setShowAllTableRows] = useState(false);
  const [heatmapPage, setHeatmapPage] = useState(0);
  const [tablePage, setTablePage] = useState(0);
  const [hoveredCell, setHoveredCell] = useState<MonthCell | null>(null);

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

  const heatmapPages = useMemo(() => {
    const pages: Array<typeof rowsByYear> = [];
    for (let i = 0; i < rowsByYear.length; i += HEATMAP_YEARS_PER_PAGE) {
      pages.push(rowsByYear.slice(i, i + HEATMAP_YEARS_PER_PAGE));
    }
    return pages;
  }, [rowsByYear]);

  const totalHeatmapPages = Math.max(heatmapPages.length, 1);
  const safeHeatmapPage = Math.min(heatmapPage, totalHeatmapPages - 1);
  const visibleYearRows = showAllYears
    ? rowsByYear
    : (heatmapPages[safeHeatmapPage] ?? []);

  const reversedCells = useMemo(() => [...cells].reverse(), [cells]);
  const totalTablePages = Math.max(
    Math.ceil(reversedCells.length / TABLE_ROWS_PER_PAGE),
    1
  );
  const safeTablePage = Math.min(tablePage, totalTablePages - 1);
  const tableStart = safeTablePage * TABLE_ROWS_PER_PAGE;
  const visibleTableRows = showAllTableRows
    ? reversedCells
    : reversedCells.slice(tableStart, tableStart + TABLE_ROWS_PER_PAGE);

  const activeTooltipCell = hoveredCell ?? cells.find((c) => c.ym === focusMonth) ?? null;

  return (
    <Card
      title={`Harmonized Anomaly Calendar · ${regionName}`}
      subtitle="Select any month cell to inspect calibrated hotspot counts, baseline ratios, and historical percentile rank."
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
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        {/* Live Cell Inspector Bar (acts as accessible persistent tooltip) */}
        {activeTooltipCell && (
          <div className="rounded-lg bg-black/50 border border-white/[0.09] px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex flex-col gap-0.5">
              <div className="font-semibold text-white">
                {formatYmLabel(activeTooltipCell.ym)} · {regionName}
                {activeTooltipCell.partial && (
                  <span className="ml-2 font-mono text-[11px] text-[#FFEB67]">
                    (In progress · {partialDaysCovered} days)
                  </span>
                )}
              </div>
              <div className="text-zinc-300 font-mono text-[11px]">
                {activeTooltipCell.hotspots !== null
                  ? `${Math.round(activeTooltipCell.hotspots).toLocaleString()} hotspots (NOAA-20 eq.) · Normal: ${Math.round(activeTooltipCell.normal).toLocaleString()} · ${activeTooltipCell.ratio?.toFixed(1) ?? '—'}× normal · ${
                      activeTooltipCell.cls !== null
                        ? CLASS_SHORT_LABEL[activeTooltipCell.cls]
                        : '—'
                    }`
                  : 'No harmonized data (Terra only)'}
              </div>
            </div>

            <div className="flex flex-col sm:items-end text-[11px] font-mono text-zinc-400 shrink-0">
              <span>
                {activeTooltipCell.percentile !== null
                  ? `Higher than ${Math.round(activeTooltipCell.percentile)}% of past ${MONTH_SHORT_NAMES[activeTooltipCell.month - 1]}s`
                  : 'Baseline uncalibrated'}
              </span>
              <span>Source: {activeTooltipCell.source}</span>
            </div>
          </div>
        )}

        {!showAsTable ? (
          /* Paginated Heatmap Grid (Years × 12 Months, no vertical scrollbar) */
          <div className="flex flex-col gap-3">
            <div className="overflow-x-auto pb-1">
              <div className="min-w-[600px]">
                {/* Month Header */}
                <div className="grid grid-cols-[60px_repeat(12,minmax(0,1fr))] gap-1.5 pb-1.5 mb-1 border-b border-white/[0.08] text-[11px] font-mono text-zinc-400">
                  <div className="sticky left-0 bg-[#0e1012] z-10 px-1">Year</div>
                  {MONTH_SHORT_NAMES.map((m) => (
                    <div key={m} className="text-center">
                      {m}
                    </div>
                  ))}
                </div>

                {/* Year Rows */}
                <div className="flex flex-col gap-1.5 pt-1">
                  {visibleYearRows.map((row) => (
                    <div
                      key={row.year}
                      className="grid grid-cols-[60px_repeat(12,minmax(0,1fr))] gap-1.5 items-center"
                    >
                      <div className="sticky left-0 bg-[#0e1012]/95 z-10 font-mono text-xs text-zinc-300 px-1 tabular-nums">
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
                            onMouseEnter={() => setHoveredCell(cell)}
                            onFocus={() => setHoveredCell(cell)}
                            onMouseLeave={() => setHoveredCell(null)}
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
                              'h-7 rounded-md font-mono text-[10px] font-semibold transition-transform cursor-pointer focus-visible:outline-2 focus-visible:outline-[#A4FFF0]',
                              lightText ? 'text-white' : 'text-zinc-950',
                              cell.partial && 'border border-dashed border-white/80',
                              isFocus
                                ? 'ring-2 ring-[#A4FFF0] ring-offset-2 ring-offset-[#0e1012] scale-[1.05] z-10'
                                : 'hover:scale-[1.03]'
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

            {/* Heatmap Pagination Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/[0.08] text-[11px] font-mono">
              <span className="text-zinc-400">
                {showAllYears
                  ? `Showing all ${rowsByYear.length} years (${rowsByYear[0]?.year ?? '—'}–${rowsByYear[rowsByYear.length - 1]?.year ?? '—'})`
                  : `Years ${visibleYearRows[0]?.year ?? '—'}–${visibleYearRows[visibleYearRows.length - 1]?.year ?? '—'} · Page ${safeHeatmapPage + 1} of ${totalHeatmapPages}`}
              </span>

              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowAllYears((prev) => !prev)}
                  className={cn(
                    'hover-slide-fill [--slide-bg:rgba(164,255,240,0.12)] px-2.5 py-1 rounded-md border cursor-pointer',
                    showAllYears
                      ? 'bg-[#A4FFF0]/15 text-[#A4FFF0] border-[#A4FFF0]/45'
                      : 'bg-white/[0.03] text-zinc-400 border-white/[0.1] hover:border-white/[0.25] hover:text-white'
                  )}
                >
                  All ({rowsByYear.length}y)
                </button>

                <button
                  type="button"
                  disabled={showAllYears || safeHeatmapPage === 0}
                  onClick={() => {
                    setShowAllYears(false);
                    setHeatmapPage((p) => Math.max(0, p - 1));
                  }}
                  aria-label="Previous years page"
                  className="group hover-slide-fill [--slide-bg:rgba(164,255,240,0.12)] inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-white/[0.1] bg-white/[0.03] text-zinc-300 hover:text-white disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronLeftIcon className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
                  <span>Prev</span>
                </button>

                {heatmapPages.map((pg, idx) => {
                  const rangeLabel = `${pg[0]?.year ?? ''}–${pg[pg.length - 1]?.year ?? ''}`;
                  const active = !showAllYears && idx === safeHeatmapPage;
                  return (
                    <button
                      key={rangeLabel}
                      type="button"
                      onClick={() => {
                        setShowAllYears(false);
                        setHeatmapPage(idx);
                      }}
                      className={cn(
                        'hover-slide-fill [--slide-bg:rgba(164,255,240,0.12)] px-2.5 py-1 rounded-md border cursor-pointer',
                        active
                          ? 'bg-[#A4FFF0]/15 text-[#A4FFF0] border-[#A4FFF0]/45'
                          : 'bg-white/[0.03] text-zinc-400 border-white/[0.1] hover:border-white/[0.25] hover:text-white'
                      )}
                    >
                      {rangeLabel}
                    </button>
                  );
                })}

                <button
                  type="button"
                  disabled={showAllYears || safeHeatmapPage >= totalHeatmapPages - 1}
                  onClick={() => {
                    setShowAllYears(false);
                    setHeatmapPage((p) => Math.min(totalHeatmapPages - 1, p + 1));
                  }}
                  aria-label="Next years page"
                  className="group hover-slide-fill [--slide-bg:rgba(164,255,240,0.12)] inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-white/[0.1] bg-white/[0.03] text-zinc-300 hover:text-white disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRightIcon className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Paginated Accessible Tabular View (PRD 8.2, no vertical scrollbar) */
          <div className="flex flex-col gap-3">
            <div className="overflow-x-auto rounded-xl border border-white/[0.08]">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-[#121417] text-[11px] font-mono text-zinc-400 border-b border-white/[0.08]">
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
                  {visibleTableRows.map((cell) => (
                    <tr
                      key={cell.ym}
                      onClick={() => onSelectFocusMonth(cell.ym)}
                      className={cn(
                        'cursor-pointer hover:bg-white/[0.04]',
                        cell.ym === focusMonth && 'bg-[#A4FFF0]/10'
                      )}
                    >
                      <td className="py-2 px-3 font-mono text-white">{cell.ym}</td>
                      <td className="py-2 px-3 font-mono tabular-nums text-zinc-200">
                        {cell.hotspots !== null
                          ? Math.round(cell.hotspots).toLocaleString()
                          : '—'}
                      </td>
                      <td className="py-2 px-3 font-mono tabular-nums text-zinc-400">
                        {Math.round(cell.normal).toLocaleString()}
                      </td>
                      <td className="py-2 px-3 font-mono tabular-nums text-white">
                        {cell.ratio !== null ? `${cell.ratio.toFixed(2)}×` : '—'}
                      </td>
                      <td className="py-2 px-3 text-zinc-300">
                        {cell.cls !== null
                          ? CLASS_SHORT_LABEL[cell.cls]
                          : 'No harmonized data'}
                      </td>
                      <td className="py-2 px-3 font-mono text-[11px] text-zinc-400">
                        {cell.source}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Table Pagination Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] font-mono">
              <span className="text-zinc-400 tabular-nums">
                {showAllTableRows
                  ? `Showing all ${reversedCells.length} months`
                  : `Showing ${tableStart + 1}–${Math.min(tableStart + visibleTableRows.length, reversedCells.length)} of ${reversedCells.length} months`}
              </span>

              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowAllTableRows((prev) => !prev)}
                  className={cn(
                    'hover-slide-fill [--slide-bg:rgba(164,255,240,0.12)] px-2.5 py-1 rounded-md border cursor-pointer',
                    showAllTableRows
                      ? 'bg-[#A4FFF0]/15 text-[#A4FFF0] border-[#A4FFF0]/45'
                      : 'bg-white/[0.03] text-zinc-400 border-white/[0.1] hover:border-white/[0.25] hover:text-white'
                  )}
                >
                  All ({reversedCells.length})
                </button>
                <button
                  type="button"
                  disabled={showAllTableRows || safeTablePage === 0}
                  onClick={() => {
                    setShowAllTableRows(false);
                    setTablePage((p) => Math.max(0, p - 1));
                  }}
                  className="group hover-slide-fill [--slide-bg:rgba(164,255,240,0.12)] inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-white/[0.1] bg-white/[0.03] text-zinc-300 hover:text-white disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronLeftIcon className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
                  <span>Prev</span>
                </button>
                <span className="px-2.5 py-1 text-zinc-300 tabular-nums">
                  {showAllTableRows
                    ? 'All rows'
                    : `Page ${safeTablePage + 1} / ${totalTablePages}`}
                </span>
                <button
                  type="button"
                  disabled={showAllTableRows || safeTablePage >= totalTablePages - 1}
                  onClick={() => {
                    setShowAllTableRows(false);
                    setTablePage((p) => Math.min(totalTablePages - 1, p + 1));
                  }}
                  className="group hover-slide-fill [--slide-bg:rgba(164,255,240,0.12)] inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-white/[0.1] bg-white/[0.03] text-zinc-300 hover:text-white disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRightIcon className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
