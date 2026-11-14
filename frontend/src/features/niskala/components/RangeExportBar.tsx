import { useMemo, useState } from 'react';
import {
  ArrowDownTrayIcon,
  CalendarDaysIcon,
  DocumentArrowDownIcon,
  ExclamationTriangleIcon,
  TableCellsIcon,
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

export interface RangeExportBarProps {
  fromYm: string;
  toYm: string;
  minYm: string;
  maxYm: string;
  activeDistrict: DistrictMeta;
  districts: DistrictMeta[];
  rangeCells: MonthCell[];
  onChangeRange: (fromYm: string, toYm: string) => void;
  onPrintReport: () => void;
}

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
          className="w-[96px]"
          value={String(month)}
          options={MONTH_OPTIONS}
          ariaLabel={`${label} month`}
          onChange={(m) => onChange(formatYearMonth(year, Number(m)))}
        />
        <SelectDropdown
          id={`${id}-year`}
          className="w-[104px]"
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
  fromYm,
  toYm,
  minYm,
  maxYm,
  activeDistrict,
  districts,
  rangeCells,
  onChangeRange,
  onPrintReport,
}: RangeExportBarProps) {
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
      { label: 'Sensor overlap 2018–2025', from: '2018-04', to: '2025-12' },
      { label: `${parseYearMonth(maxYm).year} so far`, from: `${parseYearMonth(maxYm).year}-01`, to: maxYm },
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

  const handleMonthlyCsv = () => {
    const csv = buildMonthlySummaryCsv(activeDistrict.name, rangeCells);
    downloadTextFile(exportFileName(activeDistrict.slug, fromYm, toYm, 'monthly'), csv);
    setStatus({ kind: 'done', message: `Monthly summary saved (${monthsInRange} months).` });
  };

  const runPointsExport = async (plan: PointsExportPlan) => {
    try {
      setStatus({ kind: 'loading', done: 0, total: plan.files.length });
      const { csv, rows } = await buildPointsCsv(plan, fromYm, toYm, (done, total) =>
        setStatus({ kind: 'loading', done, total })
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

  const handlePointsCsv = async () => {
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
      title="Date Range & Export"
      subtitle={`${formatYmLabel(fromYm)} – ${formatYmLabel(toYm)} · ${monthsInRange} months · ${activeDistrict.name}`}
      headerAction={<CalendarDaysIcon className="w-5 h-5 text-zinc-400" />}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
          {/* Range pickers */}
          <div className="flex flex-wrap items-end gap-4">
            <MonthYearPicker
              id="range-from"
              label="From"
              value={fromYm}
              yearOptions={yearOptions}
              onChange={(ym) => setRange(ym, toYm)}
            />
            <MonthYearPicker
              id="range-to"
              label="To"
              value={toYm}
              yearOptions={yearOptions}
              onChange={(ym) => setRange(fromYm, ym)}
            />
          </div>

          {/* Export actions */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="md"
              leftIcon={<TableCellsIcon />}
              onClick={handleMonthlyCsv}
              disabled={busy || monthsInRange === 0}
            >
              Monthly summary CSV
            </Button>
            <Button
              variant="outline"
              size="md"
              leftIcon={<ArrowDownTrayIcon />}
              onClick={() => void handlePointsCsv()}
              disabled={busy}
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
              Download report
            </Button>
          </div>
        </div>

        {/* Quick ranges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-brand uppercase tracking-[0.12em] text-zinc-500 mr-1">
            Quick Ranges:
          </span>
          {presets.map((p) => {
            const isCurrent = fromYm === p.from && toYm === p.to;
            return (
              <button
                key={p.label}
                type="button"
                onClick={() => setRange(p.from, p.to)}
                className={
                  isCurrent
                    ? 'px-3 py-1 rounded-md text-xs font-medium bg-[#A4FFF0] text-[#050507] cursor-pointer'
                    : 'hover-slide-fill [--slide-bg:rgba(164,255,240,0.12)] px-3 py-1 rounded-md text-xs font-medium bg-white/[0.03] text-zinc-300 border border-white/[0.12] hover:border-[#A4FFF0]/45 hover:text-white cursor-pointer'
                }
              >
                {p.label}
              </button>
            );
          })}
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

        <p className="text-[11px] text-zinc-500 leading-relaxed">
          <strong className="text-zinc-400 font-medium">Download CSV</strong> gives the raw NASA
          FIRMS detections (MODIS and VIIRS) in the range.{' '}
          <strong className="text-zinc-400 font-medium">Monthly summary CSV</strong> gives the
          harmonized counts, normals and anomaly classes shown in the calendar.{' '}
          <strong className="text-zinc-400 font-medium">Download report</strong> opens a print view;
          choose “Save as PDF”.
        </p>
      </div>
    </Card>
  );
}
