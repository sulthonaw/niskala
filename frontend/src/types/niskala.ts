export type AnomalyClass = -2 | -1 | 0 | 1 | 2 | 3;

export type CalendarSource =
  | 'no Aqua (Terra only)'
  | 'Aqua x ratio'
  | 'NOAA-20';

export type SatelliteName = 'Terra' | 'Aqua' | 'N20' | 'SNPP';
export type PointDataType = 'standard' | 'NRT';
export type ForecastModelName = 'climatology' | 'persistence' | 'lstm';

export interface PartialMonthInfo {
  year: number;
  month: number;
  days_covered: number;
}

export interface HarmonizationMeta {
  reference: string;
  modis_reference: string;
  overlap: string;
  formula: string;
  shrinkage_k: number;
  validation_loyo_median_abs_pct_error: {
    district_ratio: number;
    single_ratio: number;
  };
}

export interface DistrictMeta {
  name: string;
  slug: string;
  ratio: number;
  raw_ratio: number;
  monthly_mean: number[];
  peak_months: number[];
}

export interface SipongiMeta {
  spearman_district_years_2016_2025: number;
  spearman_province_2016_2025: number;
  pearson_province_2016_2025: number;
  per_district_spearman: Record<string, number>;
  fit_log_area_on_log_hotspots: {
    slope: number;
    intercept: number;
    resid_sd: number;
    within_district_sd: number;
  };
  district_area_per_hotspot_bias: Record<string, number>;
}

export interface MetaData {
  project: string;
  region: string;
  generated_local: string;
  data_through_utc: string;
  partial_month: PartialMonthInfo;
  calendar_fields: string[];
  anomaly_classes: Record<string, string>;
  baseline_years: [number, number];
  baseline_method: string;
  harmonization: HarmonizationMeta;
  districts: DistrictMeta[];
  sipongi: SipongiMeta;
  ranking: Record<string, unknown>;
  limitations: string[];
  sources: string[];
  firms_citation: string;
}

export type CalendarRow = [
  year: number,
  month: number,
  hotspots: number | null,
  normal: number,
  ratio: number | null,
  cls: number | null,
  percentile: number | null,
  source: CalendarSource,
  partial: boolean,
];

export type CalendarData = Record<string, CalendarRow[]>;

export interface MonthCell {
  year: number;
  month: number;
  ym: string;
  hotspots: number | null;
  normal: number;
  ratio: number | null;
  cls: AnomalyClass | null;
  percentile: number | null;
  source: CalendarSource;
  partial: boolean;
}

export interface SipongiRow {
  year: number;
  area_ha: number;
  hotspots: number | null;
  flag_area_high: boolean;
  partial: boolean;
}

export type SipongiData = Record<string, SipongiRow[]>;

export interface AnnualRow {
  year: number;
  harmonized: number | null;
  aqua: number;
  terra: number;
  n20: number;
  naive_sum: number;
}

export type AnnualData = Record<string, AnnualRow[]>;

export type PointsIndex = Record<string, Record<string, number>>;

export interface DateRangeYM {
  from: string;
  to: string;
}

export interface NiskalaQueryState {
  region: string;
  range: DateRangeYM;
  focusMonth: string;
}

export interface DistrictRankItem {
  district: DistrictMeta;
  cell: MonthCell | null;
  rank: number | null;
  isLowActivity: boolean;
}

export interface NiskalaDataset {
  meta: MetaData;
  calendarBySlug: Record<string, MonthCell[]>;
  sipongi: SipongiData;
  annual: AnnualData;
}
