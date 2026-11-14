import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import type {
  AnnualRow,
  DistrictMeta,
  MetaData,
  SipongiRow,
} from '../../../types/niskala';
import { cn } from '../../../utils/formatters';
import { Badge } from '../../../components/ui/Badge';
import { Card } from '../../../components/ui/Card';

export interface ValidationRowProps {
  meta: MetaData;
  activeDistrict: DistrictMeta;
  sipongiSeries: SipongiRow[];
  annualSeries: AnnualRow[];
}

export function ValidationRow({
  meta,
  activeDistrict,
  sipongiSeries,
  annualSeries,
}: ValidationRowProps) {
  const isProvince = activeDistrict.slug === 'kalimantan-barat';
  const spearmanVal = isProvince
    ? meta.sipongi.spearman_province_2016_2025
    : meta.sipongi.per_district_spearman[activeDistrict.name];

  const maxAreaHa = Math.max(...sipongiSeries.map((r) => r.area_ha), 1);
  const maxSipongiHotspots = Math.max(...sipongiSeries.map((r) => r.hotspots ?? 0), 1);
  const flaggedYears = sipongiSeries.filter((r) => r.flag_area_high);

  // Why Harmonize SVG Line Chart math (2003-2025)
  const width = 500;
  const height = 165;
  const padX = 28;
  const padY = 20;
  const maxAnnual = Math.max(
    ...annualSeries.flatMap((r) => [r.naive_sum, r.harmonized ?? 0]),
    1
  );

  const toCoords = (vals: Array<number | null>) =>
    annualSeries.map((row, idx) => {
      const x = padX + (idx / Math.max(annualSeries.length - 1, 1)) * (width - padX * 2);
      const val = vals[idx] ?? 0;
      const y = height - padY - (val / maxAnnual) * (height - padY * 2);
      return { x, y, year: row.year };
    });

  const naiveCoords = toCoords(annualSeries.map((r) => r.naive_sum));
  const harmCoords = toCoords(annualSeries.map((r) => r.harmonized));
  const toPath = (pts: Array<{ x: number; y: number }>) =>
    pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');

  const marker2018 = naiveCoords.find((c) => c.year === 2018);

  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
      {/* Left: SiPongi Comparison (Stacked dual bars sharing X-axis 2016-2026) */}
      <Card
        title={`SiPongi Official Comparison · ${activeDistrict.name}`}
        headerAction={
          spearmanVal !== undefined && (
            <Badge variant="mint" showDot>
              Spearman {spearmanVal.toFixed(2)}
            </Badge>
          )
        }
      >
        <div className="flex flex-col gap-4">
          {/* Top Mini Bar Chart: Official Burned Area (ha) */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
              <span>SiPongi Burned Area (ha)</span>
              <span>Max {Math.round(maxAreaHa).toLocaleString()} ha</span>
            </div>
            <div className="flex items-end gap-1.5 h-20 border-b border-white/[0.08] pb-1">
              {sipongiSeries.map((row) => {
                const pct = Math.max((row.area_ha / maxAreaHa) * 100, 4);
                return (
                  <div
                    key={`area-${row.year}`}
                    className="flex-1 h-full flex items-end justify-center"
                    title={`${row.year}${row.partial ? ' (Jan-Jul)' : ''}: ${Math.round(row.area_ha).toLocaleString()} ha`}
                  >
                    <span
                      className={cn(
                        'w-full max-w-[18px] rounded-t-md',
                        row.flag_area_high ? 'bg-[#FF9C33]' : 'bg-white/75'
                      )}
                      style={{ height: `${pct}%` }}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Mini Bar Chart: Harmonized Hotspots */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
              <span>Niskala Harmonized Hotspots</span>
              <span>Max {Math.round(maxSipongiHotspots).toLocaleString()} pts</span>
            </div>
            <div className="flex items-end gap-1.5 h-20 border-b border-white/[0.08] pb-1">
              {sipongiSeries.map((row) => {
                const pct = Math.max(((row.hotspots ?? 0) / maxSipongiHotspots) * 100, 4);
                return (
                  <div
                    key={`hot-${row.year}`}
                    className="flex-1 h-full flex items-end justify-center"
                    title={`${row.year}${row.partial ? ' (Jan-Jul)' : ''}: ${(row.hotspots ?? 0).toLocaleString()} hotspots`}
                  >
                    <span
                      className="w-full max-w-[18px] rounded-t-md bg-[#A4FFF0]"
                      style={{ height: `${pct}%` }}
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between gap-1 text-[10px] font-mono text-zinc-500">
              {sipongiSeries.map((row) => (
                <span key={`yr-${row.year}`} className="flex-1 text-center">
                  {row.partial ? `${String(row.year).slice(2)}*` : String(row.year).slice(2)}
                </span>
              ))}
            </div>
          </div>

          <div className="text-xs text-zinc-300 leading-relaxed flex flex-col gap-1.5 pt-1">
            <p className="text-zinc-400 text-[11px]">
              Across 2016–2025, harmonized hotspots track SiPongi burned area (Spearman{' '}
              <strong className="text-white">
                {spearmanVal !== undefined ? spearmanVal.toFixed(2) : '—'}
              </strong>
              ). *2026 compares Jan–Jul only.
            </p>
            {flaggedYears.length > 0 && (
              <div className="flex items-start gap-2 rounded-xl bg-[#FF9C33]/10 border border-[#FF9C33]/30 px-3 py-2 text-[11px] text-[#FF9C33]">
                <ExclamationTriangleIcon className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  {flaggedYears.map((f) => f.year).join(', ')}: Burned area higher than hotspots
                  suggest — possible peat or smoke-hidden fires.
                </span>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Right: Cross-Sensor Harmonization Impact (2003-2025) */}
      <Card
        title={`Cross-Sensor Harmonization · ${activeDistrict.name}`}
        headerAction={
          <Badge variant="neutral">
            LOYO error {meta.harmonization.validation_loyo_median_abs_pct_error.district_ratio}% vs{' '}
            {meta.harmonization.validation_loyo_median_abs_pct_error.single_ratio}%
          </Badge>
        }
      >
        <div className="flex flex-col justify-between gap-4 flex-1">
          <div className="flex items-center gap-4 text-[11px]">
            <span className="inline-flex items-center gap-1.5 text-zinc-400">
              <span className="w-3 h-0.5 bg-[#FF6060] inline-block" />
              Unadjusted sum (MODIS + VIIRS)
            </span>
            <span className="inline-flex items-center gap-1.5 text-white">
              <span className="w-3 h-0.5 bg-[#A4FFF0] inline-block" />
              Niskala harmonized
            </span>
          </div>

          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-44 overflow-visible"
            role="img"
            aria-label="Annual naive sum vs harmonized hotspots 2003 to 2025"
          >
            {/* 2018 NOAA-20 joins vertical guide */}
            {marker2018 && (
              <g>
                <line
                  x1={marker2018.x}
                  y1={padY - 4}
                  x2={marker2018.x}
                  y2={height - padY}
                  stroke="rgba(255,255,255,0.28)"
                  strokeDasharray="3 3"
                />
                <text
                  x={marker2018.x}
                  y={12}
                  textAnchor="middle"
                  fill="#a1a1aa"
                  fontSize="10"
                  fontFamily="monospace"
                >
                  2018 NOAA-20 joins
                </text>
              </g>
            )}

            <line
              x1={padX}
              y1={height - padY}
              x2={width - padX}
              y2={height - padY}
              stroke="rgba(255,255,255,0.1)"
            />

            <path
              d={toPath(naiveCoords)}
              fill="none"
              stroke="#FF6060"
              strokeWidth="1.75"
              strokeDasharray="4 3"
              opacity="0.85"
            />
            <path
              d={toPath(harmCoords)}
              fill="none"
              stroke="#A4FFF0"
              strokeWidth="2.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {[2003, 2009, 2015, 2019, 2023, 2025].map((yr) => {
              const pt = harmCoords.find((c) => c.year === yr);
              if (!pt) return null;
              return (
                <text
                  key={yr}
                  x={pt.x}
                  y={height - 3}
                  textAnchor="middle"
                  fill="#71717a"
                  fontSize="10"
                  fontFamily="monospace"
                >
                  {yr}
                </text>
              );
            })}
          </svg>

          <p className="text-[11px] text-zinc-400 leading-relaxed">
            District-level calibration median error is{' '}
            <strong className="text-white">
              {meta.harmonization.validation_loyo_median_abs_pct_error.district_ratio}%
            </strong>{' '}
            vs{' '}
            <strong className="text-white">
              {meta.harmonization.validation_loyo_median_abs_pct_error.single_ratio}%
            </strong>{' '}
            with a single province ratio ({meta.harmonization.formula}).
          </p>
        </div>
      </Card>
    </section>
  );
}
