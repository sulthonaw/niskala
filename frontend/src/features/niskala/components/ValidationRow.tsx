import { useState } from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import type {
  AnnualRow,
  DistrictMeta,
  MetaData,
  SipongiRow,
} from '../../../types/niskala';
import { cn } from '../../../utils/formatters';
import { Badge } from '../../../components/ui/Badge';
import { Card } from '../../../components/ui/Card';
import { ChartTooltip } from '../../../components/ui/ChartTooltip';
import { useRevealOnScroll } from '../../../hooks/useRevealOnScroll';

export interface ValidationRowProps {
  meta: MetaData;
  activeDistrict: DistrictMeta;
  sipongiSeries: SipongiRow[];
  annualSeries: AnnualRow[];
}

interface HoveredPoint {
  idx: number;
  x: number;
  y: number;
}

export function ValidationRow({
  meta,
  activeDistrict,
  sipongiSeries,
  annualSeries,
}: ValidationRowProps) {
  const [chartsVisible, observeCharts] = useRevealOnScroll();
  const [hoveredArea, setHoveredArea] = useState<HoveredPoint | null>(null);
  const [hoveredHotspot, setHoveredHotspot] = useState<HoveredPoint | null>(null);
  const [hoveredAnnual, setHoveredAnnual] = useState<HoveredPoint | null>(null);
  const isProvince = activeDistrict.slug === 'kalimantan-barat';
  const spearmanVal = isProvince
    ? meta.sipongi.spearman_province_2016_2025
    : meta.sipongi.per_district_spearman[activeDistrict.name];

  const maxAreaHa = Math.max(...sipongiSeries.map((r) => r.area_ha), 1);
  const maxSipongiHotspots = Math.max(...sipongiSeries.map((r) => r.hotspots ?? 0), 1);
  const flaggedYears = sipongiSeries.filter((r) => r.flag_area_high);

  // Why Harmonize SVG Line Chart math (2003-2025)
  const width = 520;
  const height = 175;
  const padLeft = 46;
  const padRight = 18;
  const padY = 22;
  const maxAnnual = Math.max(
    ...annualSeries.flatMap((r) => [r.naive_sum, r.harmonized ?? 0]),
    1
  );

  const toCoords = (vals: Array<number | null>) =>
    annualSeries.map((row, idx) => {
      const x =
        padLeft +
        (idx / Math.max(annualSeries.length - 1, 1)) * (width - padLeft - padRight);
      const val = vals[idx] ?? 0;
      const y = height - padY - (val / maxAnnual) * (height - padY * 2);
      return { x, y, year: row.year };
    });

  const naiveCoords = toCoords(annualSeries.map((r) => r.naive_sum));
  const harmCoords = toCoords(annualSeries.map((r) => r.harmonized));
  const toPath = (pts: Array<{ x: number; y: number }>) =>
    pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');

  const marker2018 = naiveCoords.find((c) => c.year === 2018);

  const hoveredAreaRow = hoveredArea !== null ? sipongiSeries[hoveredArea.idx] : null;
  const hoveredHotspotRow = hoveredHotspot !== null ? sipongiSeries[hoveredHotspot.idx] : null;
  const hoveredAnnualRow = hoveredAnnual !== null ? annualSeries[hoveredAnnual.idx] : null;
  const hoveredNaivePt = hoveredAnnual !== null ? naiveCoords[hoveredAnnual.idx] : null;
  const hoveredHarmPt = hoveredAnnual !== null ? harmCoords[hoveredAnnual.idx] : null;

  return (
    <section
      ref={observeCharts}
      className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch"
    >
      {/* Left: SiPongi Comparison (Stacked dual bars sharing X-axis 2016-2026) */}
      <Card
        title={`SiPongi Comparison · ${activeDistrict.name}`}
        headerAction={
          spearmanVal !== undefined && (
            <Badge variant="mint">
              Spearman {spearmanVal.toFixed(2)}
            </Badge>
          )
        }
      >
        <div className="flex flex-col gap-4">
          {/* Top Mini Bar Chart: SiPongi Burned Area (ha) */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[10px] font-brand uppercase tracking-[0.08em] text-zinc-400">
              <span>Y: SiPongi Burned Area (ha)</span>
              <span className="font-sans font-medium normal-case tracking-normal tabular-nums">
                Max {Math.round(maxAreaHa).toLocaleString()} ha
              </span>
            </div>
            <div className="relative flex items-end gap-1.5 h-20 border-b border-white/[0.08] pb-1">
              {hoveredArea !== null && hoveredAreaRow && (
                <ChartTooltip
                  title="SiPongi Burned Area"
                  badge={hoveredAreaRow.flag_area_high ? 'High burned area' : undefined}
                  x={hoveredArea.x}
                  y={hoveredArea.y}
                  rows={[
                    {
                      axis: 'X',
                      label: 'Year',
                      value: `${hoveredAreaRow.year}${hoveredAreaRow.partial ? ' (Jan–Jul)' : ''}`,
                    },
                    {
                      axis: 'Y',
                      label: 'Burned Area',
                      value: `${Math.round(hoveredAreaRow.area_ha).toLocaleString()} ha`,
                      swatchColor: hoveredAreaRow.flag_area_high ? '#FF9C33' : '#e4e4e7',
                    },
                  ]}
                />
              )}

              {sipongiSeries.map((row, idx) => {
                const pct = Math.max((row.area_ha / maxAreaHa) * 100, 4);
                const isHovered = hoveredArea?.idx === idx;
                return (
                  <button
                    key={`area-${row.year}`}
                    type="button"
                    onMouseEnter={(e) => setHoveredArea({ idx, x: e.clientX, y: e.clientY })}
                    onMouseMove={(e) => setHoveredArea({ idx, x: e.clientX, y: e.clientY })}
                    onMouseLeave={() => setHoveredArea(null)}
                    onFocus={(e) => {
                      const r = e.currentTarget.getBoundingClientRect();
                      setHoveredArea({ idx, x: r.left + r.width / 2, y: r.top + r.height / 2 });
                    }}
                    onBlur={() => setHoveredArea(null)}
                    aria-label={`${row.year}: ${Math.round(row.area_ha).toLocaleString()} ha`}
                    className="flex-1 h-full flex items-end justify-center cursor-pointer focus:outline-none"
                  >
                    <span
                      data-visible={chartsVisible}
                      className={cn(
                        'chart-bar-reveal w-full max-w-[18px] rounded-t-[2px] transition-opacity',
                        row.flag_area_high ? 'bg-[#FF9C33]' : 'bg-white/75',
                        hoveredArea !== null && !isHovered && 'opacity-50'
                      )}
                      style={{
                        height: `${pct}%`,
                        transitionDelay: `${idx * 40}ms`,
                      }}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Mini Bar Chart: Harmonized Hotspots */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[10px] font-brand uppercase tracking-[0.08em] text-zinc-400">
              <span>Y: Niskala Harmonized Hotspots</span>
              <span className="font-sans font-medium normal-case tracking-normal tabular-nums">
                Max {Math.round(maxSipongiHotspots).toLocaleString()} pts
              </span>
            </div>
            <div className="relative flex items-end gap-1.5 h-20 border-b border-white/[0.08] pb-1">
              {hoveredHotspot !== null && hoveredHotspotRow && (
                <ChartTooltip
                  title="Satellite Archive"
                  x={hoveredHotspot.x}
                  y={hoveredHotspot.y}
                  rows={[
                    {
                      axis: 'X',
                      label: 'Year',
                      value: `${hoveredHotspotRow.year}${hoveredHotspotRow.partial ? ' (Jan–Jul)' : ''}`,
                    },
                    {
                      axis: 'Y',
                      label: 'Hotspots',
                      value: `${Math.round(hoveredHotspotRow.hotspots ?? 0).toLocaleString()} pts`,
                      swatchColor: '#A4FFF0',
                    },
                  ]}
                />
              )}

              {sipongiSeries.map((row, idx) => {
                const pct = Math.max(((row.hotspots ?? 0) / maxSipongiHotspots) * 100, 4);
                const isHovered = hoveredHotspot?.idx === idx;
                return (
                  <button
                    key={`hot-${row.year}`}
                    type="button"
                    onMouseEnter={(e) => setHoveredHotspot({ idx, x: e.clientX, y: e.clientY })}
                    onMouseMove={(e) => setHoveredHotspot({ idx, x: e.clientX, y: e.clientY })}
                    onMouseLeave={() => setHoveredHotspot(null)}
                    onFocus={(e) => {
                      const r = e.currentTarget.getBoundingClientRect();
                      setHoveredHotspot({ idx, x: r.left + r.width / 2, y: r.top + r.height / 2 });
                    }}
                    onBlur={() => setHoveredHotspot(null)}
                    aria-label={`${row.year}: ${(row.hotspots ?? 0).toLocaleString()} hotspots`}
                    className="flex-1 h-full flex items-end justify-center cursor-pointer focus:outline-none"
                  >
                    <span
                      data-visible={chartsVisible}
                      className={cn(
                        'chart-bar-reveal w-full max-w-[18px] rounded-t-[2px] bg-[#A4FFF0] transition-opacity',
                        hoveredHotspot !== null && !isHovered && 'opacity-50'
                      )}
                      style={{
                        height: `${pct}%`,
                        transitionDelay: `${idx * 40}ms`,
                      }}
                    />
                  </button>
                );
              })}
            </div>
            <div className="flex items-center justify-between gap-1 text-[10px] tabular-nums text-zinc-500">
              {sipongiSeries.map((row) => (
                <span key={`yr-${row.year}`} className="flex-1 text-center">
                  {row.partial ? `${String(row.year).slice(2)}*` : String(row.year).slice(2)}
                </span>
              ))}
            </div>
            <div className="text-[10px] text-zinc-500 text-right">X: Year (2016–2026)</div>
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
          <div className="flex items-center justify-between gap-3 flex-wrap text-[11px]">
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1.5 text-zinc-400">
                <span className="w-3 h-0.5 bg-[#FF6060] inline-block" />
                Unadjusted sum (MODIS + VIIRS)
              </span>
              <span className="inline-flex items-center gap-1.5 text-white">
                <span className="w-3 h-0.5 bg-[#A4FFF0] inline-block" />
                Niskala harmonized
              </span>
            </div>
            <span className="text-[10px] text-zinc-500">Y: Annual Hotspots · X: Year</span>
          </div>

          <div className="relative">
            {hoveredAnnual !== null && hoveredAnnualRow && (
              <ChartTooltip
                title="Annual Calibration"
                badge={hoveredAnnualRow.year >= 2018 ? 'MODIS + NOAA-20' : 'Aqua scaled'}
                x={hoveredAnnual.x}
                y={hoveredAnnual.y}
                rows={[
                  {
                    axis: 'X',
                    label: 'Year',
                    value: String(hoveredAnnualRow.year),
                  },
                  {
                    axis: 'Y',
                    label: 'Unadjusted Sum',
                    value: `${Math.round(hoveredAnnualRow.naive_sum).toLocaleString()} pts`,
                    swatchColor: '#FF6060',
                  },
                  {
                    axis: 'Y',
                    label: 'Harmonized',
                    value:
                      hoveredAnnualRow.harmonized !== null
                        ? `${Math.round(hoveredAnnualRow.harmonized).toLocaleString()} pts`
                        : '—',
                    swatchColor: '#A4FFF0',
                  },
                ]}
              />
            )}

            <svg
              viewBox={`0 0 ${width} ${height}`}
              data-visible={chartsVisible}
              onMouseLeave={() => setHoveredAnnual(null)}
              className="chart-line-reveal w-full h-44 overflow-visible"
              role="img"
              aria-label="Annual naive sum vs harmonized hotspots 2003 to 2025"
            >
              {/* Y-axis scale bounds */}
              <text
                x={padLeft - 6}
                y={padY + 3}
                textAnchor="end"
                fill="#71717a"
                fontSize="9"
                className="font-brand"
              >
                {Math.round(maxAnnual).toLocaleString()}
              </text>
              <text
                x={padLeft - 6}
                y={height - padY + 3}
                textAnchor="end"
                fill="#71717a"
                fontSize="9"
                className="font-brand"
              >
                0
              </text>

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
                    fontSize="9.5"
                    className="font-brand"
                  >
                    2018 NOAA-20 joins
                  </text>
                </g>
              )}

              <line
                x1={padLeft}
                y1={height - padY}
                x2={width - padRight}
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

              {/* Active hover crosshair + focus dots */}
              {hoveredHarmPt && hoveredNaivePt && (
                <g className="pointer-events-none">
                  <line
                    x1={hoveredHarmPt.x}
                    y1={padY}
                    x2={hoveredHarmPt.x}
                    y2={height - padY}
                    stroke="rgba(164,255,240,0.35)"
                    strokeDasharray="2 2"
                  />
                  <circle
                    cx={hoveredNaivePt.x}
                    cy={hoveredNaivePt.y}
                    r="4"
                    fill="#FF6060"
                    stroke="#0B0E14"
                    strokeWidth="1.5"
                  />
                  <circle
                    cx={hoveredHarmPt.x}
                    cy={hoveredHarmPt.y}
                    r="4.5"
                    fill="#A4FFF0"
                    stroke="#0B0E14"
                    strokeWidth="1.5"
                  />
                </g>
              )}

              {/* Invisible vertical hover bands per year for smooth interaction */}
              {harmCoords.map((pt, idx) => {
                const bandWidth = (width - padLeft - padRight) / Math.max(harmCoords.length - 1, 1);
                return (
                  <rect
                    key={`hover-${pt.year}`}
                    x={pt.x - bandWidth / 2}
                    y={padY - 6}
                    width={bandWidth}
                    height={height - padY * 2 + 12}
                    fill="transparent"
                    className="cursor-crosshair"
                    onMouseEnter={(e) => setHoveredAnnual({ idx, x: e.clientX, y: e.clientY })}
                    onMouseMove={(e) => setHoveredAnnual({ idx, x: e.clientX, y: e.clientY })}
                  />
                );
              })}

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
                    fontSize="9.5"
                    className="font-brand"
                  >
                    {yr}
                  </text>
                );
              })}
            </svg>
          </div>

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
