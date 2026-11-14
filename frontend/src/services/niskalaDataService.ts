import { MONTH_SHORT_NAMES } from '../constants/anomalyColors';
import type {
  AnnualData,
  AnomalyClass,
  CalendarData,
  CalendarRow,
  DistrictMeta,
  DistrictRankItem,
  MetaData,
  MonthCell,
  NiskalaDataset,
  SipongiData,
} from '../types/niskala';

export const dataUrl = (path: string): string => `${import.meta.env.BASE_URL}data/${path}`;

export function formatYearMonth(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}`;
}

export function parseYearMonth(ym: string): { year: number; month: number } {
  const [yStr, mStr] = ym.split('-');
  return {
    year: Number(yStr) || 2026,
    month: Number(mStr) || 10,
  };
}

export function formatYmLabel(ym: string): string {
  const { year, month } = parseYearMonth(ym);
  const name = MONTH_SHORT_NAMES[month - 1] ?? String(month);
  return `${name} ${year}`;
}

export function formatPeakMonths(peakMonths: number[]): string {
  if (peakMonths.length === 0) return 'N/A';
  const sorted = [...peakMonths].sort((a, b) => a - b);
  const first = MONTH_SHORT_NAMES[sorted[0] - 1];
  const last = MONTH_SHORT_NAMES[sorted[sorted.length - 1] - 1];
  if (sorted.length === 1) return first;
  return `${first}-${last}`;
}

export function toMonthCell(row: CalendarRow): MonthCell {
  const [year, month, hotspots, normal, ratio, cls, percentile, source, partial] = row;
  return {
    year,
    month,
    ym: formatYearMonth(year, month),
    hotspots,
    normal,
    ratio,
    cls: cls === null ? null : (Math.round(cls) as AnomalyClass),
    percentile,
    source,
    partial,
  };
}

export function normalizeCalendarData(raw: CalendarData): Record<string, MonthCell[]> {
  const normalized: Record<string, MonthCell[]> = {};
  for (const [slug, rows] of Object.entries(raw)) {
    normalized[slug] = rows.map(toMonthCell);
  }
  return normalized;
}

export function rankDistrictsForMonth(
  calendarBySlug: Record<string, MonthCell[]>,
  districts: DistrictMeta[],
  targetYm: string
): DistrictRankItem[] {
  const onlyDistricts = districts.filter((d) => d.slug !== 'kalimantan-barat');

  const mapped = onlyDistricts.map((district) => {
    const cell = calendarBySlug[district.slug]?.find((c) => c.ym === targetYm) ?? null;
    const hasEnoughActivity = cell !== null && cell.ratio !== null && (cell.hotspots ?? 0) >= 20;
    return {
      district,
      cell,
      isLowActivity: !hasEnoughActivity,
    };
  });

  const active = mapped
    .filter((item) => !item.isLowActivity)
    .sort((a, b) => (b.cell?.ratio ?? 0) - (a.cell?.ratio ?? 0))
    .map((item, idx) => ({
      ...item,
      rank: idx + 1,
    }));

  const low = mapped
    .filter((item) => item.isLowActivity)
    .sort((a, b) => (b.cell?.hotspots ?? 0) - (a.cell?.hotspots ?? 0))
    .map((item) => ({
      ...item,
      rank: null,
    }));

  return [...active, ...low];
}

async function fetchJson<T>(fileName: string): Promise<T> {
  const response = await fetch(dataUrl(fileName));
  if (!response.ok) {
    throw new Error(`Failed to fetch ${fileName} (${response.status})`);
  }
  return (await response.json()) as T;
}

export async function loadNiskalaDataset(): Promise<NiskalaDataset> {
  const [meta, rawCalendar, sipongi, annual] = await Promise.all([
    fetchJson<MetaData>('meta.json'),
    fetchJson<CalendarData>('calendar.json'),
    fetchJson<SipongiData>('sipongi.json'),
    fetchJson<AnnualData>('annual.json'),
  ]);

  return {
    meta,
    calendarBySlug: normalizeCalendarData(rawCalendar),
    sipongi,
    annual,
  };
}
