import { useMemo, useState } from 'react';
import {
  ArrowDownTrayIcon,
  CalendarDaysIcon,
  DocumentArrowDownIcon,
  ExclamationTriangleIcon,
  MapPinIcon,
} from '@heroicons/react/24/solid';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { SelectDropdown } from '../../../components/ui/SelectDropdown';
import { MONTH_SHORT_NAMES } from '../../../constants/anomalyColors';
import {
  LARGE_EXPORT_ROWS,
  buildMonthlySummaryCsv,
  buildPointsCsv,
  downloadTextFile,
  exportFileName,
  planPointsExport,
  type PointsExportPlan,
} from '../../../services/exportService';
import {
  formatYearMonth,
  formatYmLabel,
  parseYearMonth,
} from '../../../services/niskalaDataService';
import type { DistrictMeta, MonthCell } from '../../../types/niskala';
import { cn } from '../../../utils/formatters';

export interface ReferenceCaseItem {
  label: string;
  region: string;
  focus: string;
}

export interface RangeExportBarProps {
  regionSlug: string;
  focusMonth: string;
  fromYm: string;
  toYm: string;
  minYm: string;
  maxYm: string;
  activeDistrict: DistrictMeta;
  districts: DistrictMeta[];
  rangeCells: MonthCell[];
  referenceCases: readonly ReferenceCaseItem[];
  onSelectRegion: (slug: string) => void;
  onSelectScenario: (region: string, focus: string) => void;
  onChangeRange: (fromYm: string, toYm: string) => void;
  onPrintReport: () => void;
}

type CsvKind = 'monthly' | 'hotspots';

type ExportStatus =
  | { kind: 'idle' }
  | { kind: 'planning' }
  | { kind: 'confirm'; plan: PointsExportPlan }
  | { kind: 'loading'; done: number; total: number }
  | { kind: 'done'; message: string }
  | { kind: 'error'; message: string };

const MONTH_OPTIONS = MONTH_SHORT_NAMES.map((name, idx) => ({
  value: String(idx + 1),
  label: name,
}));

function clampYm(ym: string, minYm: string, maxYm: string): string {
  if (ym < minYm) return minYm;
  if (ym > maxYm) return maxYm;
  return ym;
}

function MonthYearPicker({
  id,
  label,
  value,
  yearOptions,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  yearOptions: { value: string; label: string }[];
  onChange: (ym: string) => void;
}) {
  const { year, month } = parseYearMonth(value);
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[11px] font-brand uppercase tracking-[0.12em] text-zinc-400">
        {label}
      </span>
      <div className="flex items-center gap-2">
        <SelectDropdown
          id={`${id}-month`}
          className="w-[92px]"
          value={String(month)}
          options={MONTH_OPTIONS}
          ariaLabel={`${label} month`}
          onChange={(m) => onChange(formatYearMonth(year, Number(m)))}
        />
        <SelectDropdown
          id={`${id}-year`}
          className="w-[100px]"
          value={String(year)}
          options={yearOptions}
          ariaLabel={`${label} year`}
          onChange={(y) => onChange(formatYearMonth(Number(y), month))}
        />
      </div>
    </div>
  );
}

export function RangeExportBar({
  regionSlug,
  focusMonth,
  fromYm,
  toYm,
  minYm,
  maxYm,
  activeDistrict,
  districts,
  rangeCells,
  referenceCases,
  onSelectRegion,
  onSelectScenario,
  onChangeRange,
  onPrintReport,
}: RangeExportBarProps) {
  const [csvKind, setCsvKind] = useState<CsvKind>('monthly');
  const [status, setStatus] = useState<ExportStatus>({ kind: 'idle' });

  const yearOptions = useMemo(() => {
    const first = parseYearMonth(minYm).year;
    const last = parseYearMonth(maxYm).year;
    return Array.from({ length: last - first + 1 }, (_, i) => {
      const y = String(last - i);
      return { value: y, label: y };
    });
  }, [minYm, maxYm]);

  const presets = useMemo(
    () => [
      { label: 'Full record', from: '2002-07', to: maxYm },
      { label: 'Last 5 years', from: `${parseYearMonth(maxYm).year - 4}-01`, to: maxYm },
      { label: 'Overlap 2018–2025', from: '2018-04', to: '2025-12' },
      { label: `${parseYearMonth(maxYm).year} YTD`, from: `${parseYearMonth(maxYm).year}-01`, to: maxYm },
    ],
    [maxYm]
  );

  const setRange = (nextFrom: string, nextTo: string) => {
    const a = clampYm(nextFrom, minYm, maxYm);
    const b = clampYm(nextTo, minYm, maxYm);
    setStatus({ kind: 'idle' });
    onChangeRange(a <= b ? a : b, a <= b ? b : a);
  };

  const busy = status.kind === 'planning' || status.kind === 'loading';
  const monthsInRange = rangeCells.length;

  const runPointsExport = async (plan: PointsExportPlan) => {
    try {
      setStatus({ kind: 'loading', done: 0, total: plan.files.length });
      const { csv, rows } = await buildPointsCsv(
        plan,
        activeDistrict.name,
        activeDistrict.slug,
        fromYm,
        toYm,
        (done, total) => setStatus({ kind: 'loading', done, total })
      );
      if (rows === 0) {
        setStatus({ kind: 'done', message: 'No hotspot detections in this range.' });
        return;
      }
      downloadTextFile(exportFileName(activeDistrict.slug, fromYm, toYm, 'hotspots'), csv);
      setStatus({ kind: 'done', message: `Hotspot CSV saved (${rows.toLocaleString('en-US')} detections).` });
    } catch {
      setStatus({ kind: 'error', message: 'Download failed. Try a shorter date range.' });
    }
  };

  const handleDownloadCsv = async () => {
    if (csvKind === 'monthly') {
      const csv = buildMonthlySummaryCsv(
        activeDistrict.name,
        activeDistrict.slug,
        fromYm,
        toYm,
        rangeCells
      );
      downloadTextFile(exportFileName(activeDistrict.slug, fromYm, toYm, 'monthly'), csv);
      setStatus({ kind: 'done', message: `Monthly summary CSV saved (${monthsInRange} months).` });
      return;
    }

    try {
      setStatus({ kind: 'planning' });
      const plan = await planPointsExport(activeDistrict.slug, districts, fromYm, toYm);
      if (plan.files.length === 0) {
        setStatus({ kind: 'done', message: 'No hotspot detections in this range.' });
        return;
      }
      if (plan.estimatedRows > LARGE_EXPORT_ROWS) {
        setStatus({ kind: 'confirm', plan });
        return;
      }
      await runPointsExport(plan);
    } catch {
      setStatus({ kind: 'error', message: 'Download failed. Try a shorter date range.' });
    }
  };

  return (
    <Card
      title="Filters & Export"
      subtitle={`${formatYmLabel(fromYm)} – ${formatYmLabel(toYm)} · ${monthsInRange} months · ${activeDistrict.name}`}
      headerAction={<CalendarDaysIcon className="w-5 h-5 text-zinc-400" />}
    >
      <div className="flex flex-col gap-4">
        {/* Row 1: Region + From / To Date Pickers */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
          <div className="lg:col-span-5 flex flex-col gap-1.5">
            <label
              htmlFor="region-select"
              className="text-[11px] font-brand uppercase tracking-[0.12em] text-zinc-400 flex items-center gap-1.5"
            >
              <MapPinIcon className="w-3.5 h-3.5 text-[#A4FFF0]" />
              <span>Region (15 Areas)</span>
            </label>
            <SelectDropdown
              id="region-select"
              value={regionSlug}
              onChange={onSelectRegion}
              ariaLabel="Select province or regency"
              options={districts.map((dist) => ({
                value: dist.slug,
                label: dist.name,
                hint: dist.slug === 'kalimantan-barat' ? 'Province' : undefined,
              }))}
            />
          </div>

          <div className="lg:col-span-7 flex flex-wrap items-end gap-4 lg:justify-end">
            <MonthYearPicker
              id="range-from"
              label="From"
              value={fromYm}
              yearOptions={yearOptions}
              onChange={(ym) => setRange(ym, toYm)}
            />
            <span className="hidden sm:inline-block pb-2.5 text-zinc-500 text-xs">→</span>
            <MonthYearPicker
              id="range-to"
              label="To"
              value={toYm}
              yearOptions={yearOptions}
              onChange={(ym) => setRange(fromYm, ym)}
            />
          </div>
        </div>

        {/* Row 2: Quick Ranges & Reference Cases */}
        <div className="flex flex-col gap-2.5 pt-3 border-t border-white/[0.07]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-brand uppercase tracking-[0.14em] text-zinc-500 min-w-[118px]">
              Quick Ranges
            </span>
            {presets.map((p) => {
              const isCurrent = fromYm === p.from && toYm === p.to;
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setRange(p.from, p.to)}
                  className={cn(
                    'px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors',
                    isCurrent
                      ? 'bg-[#A4FFF0] text-[#050507]'
                      : 'hover-slide-fill [--slide-bg:rgba(164,255,240,0.12)] bg-white/[0.03] text-zinc-300 border border-white/[0.12] hover:border-[#A4FFF0]/45 hover:text-white'
                  )}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-brand uppercase tracking-[0.14em] text-zinc-500 min-w-[118px]">
              Reference Cases
            </span>
            {referenceCases.map((sc) => {
              const isCurrent = regionSlug === sc.region && focusMonth === sc.focus;
              return (
                <button
                  key={sc.label}
                  type="button"
                  onClick={() => onSelectScenario(sc.region, sc.focus)}
                  className={cn(
                    'px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors',
                    isCurrent
                      ? 'bg-[#A4FFF0] text-[#050507]'
                      : 'hover-slide-fill [--slide-bg:rgba(164,255,240,0.12)] bg-white/[0.03] text-zinc-300 border border-white/[0.12] hover:border-[#A4FFF0]/45 hover:text-white'
                  )}
                >
                  {sc.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 3: Unified CSV Export + Corporate PDF Report */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-3 border-t border-white/[0.08]">
          <div className="text-[11px] text-zinc-400">
            Unified <span className="font-brand text-zinc-200">NISKALA</span> CSV template · Print
            exports clean A4 report
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Segmented CSV dataset selector */}
            <div
              role="group"
              aria-label="CSV dataset contents"
              className="inline-flex items-center p-0.5 rounded-lg bg-black/50 border border-white/[0.1]"
            >
              <button
                type="button"
                onClick={() => setCsvKind('monthly')}
                className={cn(
                  'px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors',
                  csvKind === 'monthly'
                    ? 'bg-white/[0.14] text-white'
                    : 'text-zinc-400 hover:text-zinc-200'
                )}
              >
                Monthly Summary
              </button>
              <button
                type="button"
                onClick={() => setCsvKind('hotspots')}
                className={cn(
                  'px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors',
                  csvKind === 'hotspots'
                    ? 'bg-white/[0.14] text-white'
                    : 'text-zinc-400 hover:text-zinc-200'
                )}
              >
                Raw Hotspots
              </button>
            </div>

            <Button
              variant="outline"
              size="md"
              leftIcon={<ArrowDownTrayIcon />}
              onClick={() => void handleDownloadCsv()}
              disabled={busy || (csvKind === 'monthly' && monthsInRange === 0)}
            >
              Download CSV
            </Button>

            <Button
              variant="mint"
              size="md"
              leftIcon={<DocumentArrowDownIcon />}
              onClick={onPrintReport}
              disabled={busy || monthsInRange === 0}
            >
              Download Report (PDF)
            </Button>
          </div>
        </div>

        {/* Status line */}
        {status.kind !== 'idle' && (
          <div
            role="status"
            className="rounded-2xl bg-black/50 border border-white/[0.09] px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
          >
            {status.kind === 'planning' && <span className="text-zinc-300">Checking files…</span>}
            {status.kind === 'loading' && (
              <span className="text-zinc-300 tabular-nums">
                Loading {status.done} of {status.total} files…
              </span>
            )}
            {status.kind === 'done' && <span className="text-[#A4FFF0]">{status.message}</span>}
            {status.kind === 'error' && (
              <span className="inline-flex items-center gap-1.5 text-[#FF6060]">
                <ExclamationTriangleIcon className="w-4 h-4" />
                {status.message}
              </span>
            )}
            {status.kind === 'confirm' && (
              <>
                <span className="inline-flex items-start gap-1.5 text-[#FF9C33] leading-relaxed">
                  <ExclamationTriangleIcon className="w-4 h-4 shrink-0 mt-px" />
                  This export has about {status.plan.estimatedRows.toLocaleString('en-US')} rows (~
                  {Math.max(1, Math.round((status.plan.estimatedRows * 110) / 1_000_000))} MB). Narrow
                  the date range or pick a district, or continue anyway.
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <Button variant="outline" size="sm" onClick={() => setStatus({ kind: 'idle' })}>
                    Cancel
                  </Button>
                  <Button variant="mint" size="sm" onClick={() => void runPointsExport(status.plan)}>
                    Continue
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
