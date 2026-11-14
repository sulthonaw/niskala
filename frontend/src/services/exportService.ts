import { CLASS_SHORT_LABEL } from '../constants/anomalyColors';
import type { DistrictMeta, MonthCell, PointsIndex } from '../types/niskala';
import { dataUrl, parseYearMonth } from './niskalaDataService';

/** Above this many rows the user is asked to confirm before the hotspot CSV is built (PRD 6.7). */
export const LARGE_EXPORT_ROWS = 150_000;
const PARALLEL_REQUESTS = 4;
const PROVINCE_SLUG = 'kalimantan-barat';

export function downloadTextFile(fileName: string, text: string, mime = 'text/csv;charset=utf-8') {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function exportFileName(slug: string, fromYm: string, toYm: string, kind: string): string {
  return `niskala_${slug}_${fromYm}_${toYm}_${kind}.csv`;
}

const csvValue = (value: string | number | boolean | null | undefined): string => {
  if (value === null || value === undefined) return '';
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

function buildNiskalaCsvDocument({
  reportType,
  regionName,
  regionSlug,
  fromYm,
  toYm,
  headerLine,
  rowLines,
}: {
  reportType: string;
  regionName: string;
  regionSlug: string;
  fromYm: string;
  toYm: string;
  headerLine: string;
  rowLines: string[];
}): string {
  const generatedAt = new Date().toISOString();
  const preamble = [
    ['NISKALA', 'Harmonized Hotspot Anomaly Archive (West Kalimantan)'],
    ['Report Type', reportType],
    ['Region', `${regionName} (${regionSlug})`],
    ['Date Range', `${fromYm} to ${toYm}`],
    ['Reference Scale', 'VIIRS NOAA-20 Equivalent'],
    ['Sources', 'NASA FIRMS (MODIS C6.1 & VIIRS C2) · NOAA PSL · KLHK SiPongi'],
    ['Generated (UTC)', generatedAt],
    ['Total Records', rowLines.length],
  ]
    .map((pair) => pair.map(csvValue).join(','))
    .join('\n');

  return `\uFEFF${preamble}\n\n${headerLine}\n${rowLines.join('\n')}\n`;
}

/* ------------------------------------------------------------------ */
/* Monthly summary (harmonized calendar)                               */
/* ------------------------------------------------------------------ */

export function buildMonthlySummaryCsv(
  regionName: string,
  regionSlug: string,
  fromYm: string,
  toYm: string,
  cells: MonthCell[]
): string {
  const headerLine = [
    'year',
    'month',
    'region',
    'hotspots_harmonized_noaa20_eq',
    'normal_mean',
    'ratio_to_normal',
    'anomaly_class',
    'anomaly_label',
    'percentile',
    'source',
    'partial_month',
  ]
    .map(csvValue)
    .join(',');

  const rowLines = cells.map((c) =>
    [
      c.year,
      c.month,
      regionName,
      c.hotspots === null ? null : Math.round(c.hotspots),
      c.normal.toFixed(1),
      c.ratio === null ? null : c.ratio.toFixed(2),
      c.cls,
      c.cls === null ? 'No harmonized data' : CLASS_SHORT_LABEL[c.cls],
      c.percentile,
      c.source,
      c.partial,
    ]
      .map(csvValue)
      .join(',')
  );

  return buildNiskalaCsvDocument({
    reportType: 'Monthly Harmonized Summary',
    regionName,
    regionSlug,
    fromYm,
    toYm,
    headerLine,
    rowLines,
  });
}

/* ------------------------------------------------------------------ */
/* Hotspot points (raw FIRMS detections)                               */
/* ------------------------------------------------------------------ */

export interface PointsExportPlan {
  files: { slug: string; year: number }[];
  estimatedRows: number;
}

let pointsIndexCache: PointsIndex | null = null;

async function loadPointsIndex(): Promise<PointsIndex> {
  if (pointsIndexCache) return pointsIndexCache;
  const response = await fetch(dataUrl('points/index.json'));
  if (!response.ok) throw new Error(`Failed to fetch points index (${response.status})`);
  pointsIndexCache = (await response.json()) as PointsIndex;
  return pointsIndexCache;
}

export async function planPointsExport(
  regionSlug: string,
  districts: DistrictMeta[],
  fromYm: string,
  toYm: string
): Promise<PointsExportPlan> {
  const index = await loadPointsIndex();
  const slugs =
    regionSlug === PROVINCE_SLUG
      ? districts.filter((d) => d.slug !== PROVINCE_SLUG).map((d) => d.slug)
      : [regionSlug];
  const fromYear = parseYearMonth(fromYm).year;
  const toYear = parseYearMonth(toYm).year;

  const files: PointsExportPlan['files'] = [];
  let estimatedRows = 0;
  for (const slug of slugs) {
    const years = index[slug] ?? {};
    for (let year = fromYear; year <= toYear; year += 1) {
      const rows = years[String(year)] ?? 0;
      if (rows > 0) {
        files.push({ slug, year });
        estimatedRows += rows;
      }
    }
  }
  return { files, estimatedRows };
}

export async function buildPointsCsv(
  plan: PointsExportPlan,
  regionName: string,
  regionSlug: string,
  fromYm: string,
  toYm: string,
  onProgress: (done: number, total: number) => void
): Promise<{ csv: string; rows: number }> {
  const texts: string[] = new Array(plan.files.length);
  let done = 0;
  let cursor = 0;

  const worker = async () => {
    while (cursor < plan.files.length) {
      const i = cursor;
      cursor += 1;
      const { slug, year } = plan.files[i];
      const response = await fetch(dataUrl(`points/${slug}/${year}.csv`));
      if (!response.ok) throw new Error(`Failed to fetch ${slug}/${year}.csv (${response.status})`);
      texts[i] = await response.text();
      done += 1;
      onProgress(done, plan.files.length);
    }
  };
  await Promise.all(
    Array.from({ length: Math.min(PARALLEL_REQUESTS, plan.files.length) }, () => worker())
  );

  let header = '';
  let timeCol = -1;
  const out: string[] = [];
  for (const text of texts) {
    const lines = text.split(/\r?\n/);
    if (!header) {
      header = lines[0];
      timeCol = header.split(',').indexOf('local_datetime_wib');
    }
    for (let i = 1; i < lines.length; i += 1) {
      const line = lines[i];
      if (!line) continue;
      if (timeCol >= 0) {
        const ym = (line.split(',')[timeCol] ?? '').slice(0, 7);
        if (ym < fromYm || ym > toYm) continue;
      }
      out.push(line);
    }
  }
  if (!header || out.length === 0) return { csv: '', rows: 0 };

  const csv = buildNiskalaCsvDocument({
    reportType: 'Raw NASA FIRMS Detections',
    regionName,
    regionSlug,
    fromYm,
    toYm,
    headerLine: header,
    rowLines: out,
  });

  return { csv, rows: out.length };
}
