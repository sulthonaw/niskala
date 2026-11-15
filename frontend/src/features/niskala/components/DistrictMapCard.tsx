import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react';
import { MapIcon } from '@heroicons/react/24/solid';
import { Card } from '../../../components/ui/Card';
import { CLASS_COLOR, CLASS_LEGEND_ITEMS, CLASS_SHORT_LABEL } from '../../../constants/anomalyColors';
import { dataUrl, formatYmLabel } from '../../../services/niskalaDataService';
import type { DistrictRankItem } from '../../../types/niskala';
import { cn } from '../../../utils/formatters';

interface MapDistrict {
  name: string;
  slug: string;
  path: string;
  label: [number, number];
}

interface DistrictMapData {
  viewBox: string;
  width: number;
  height: number;
  districts: MapDistrict[];
}

export interface DistrictMapCardProps {
  focusMonth: string;
  selectedSlug: string;
  rankings: DistrictRankItem[];
  onSelectRegion: (slug: string) => void;
}

const PROVINCE_SLUG = 'kalimantan-barat';
const NO_DATA_FILL = '#27272a';

let mapCache: DistrictMapData | null = null;

async function loadDistrictMap(): Promise<DistrictMapData> {
  if (mapCache) return mapCache;
  const response = await fetch(dataUrl('map.json'));
  if (!response.ok) throw new Error(`Failed to fetch map.json (${response.status})`);
  mapCache = (await response.json()) as DistrictMapData;
  return mapCache;
}

export function DistrictMapCard({
  focusMonth,
  selectedSlug,
  rankings,
  onSelectRegion,
}: DistrictMapCardProps) {
  const [map, setMap] = useState<DistrictMapData | null>(mapCache);
  const [failed, setFailed] = useState(false);
  const [hoverSlug, setHoverSlug] = useState<string | null>(null);
  const [cursor, setCursor] = useState<{ x: number; y: number; w: number } | null>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (map) return undefined;
    let active = true;
    loadDistrictMap()
      .then((data) => {
        if (active) setMap(data);
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => {
      active = false;
    };
  }, [map]);

  const bySlug = useMemo(() => {
    const lookup = new Map<string, DistrictRankItem>();
    for (const item of rankings) lookup.set(item.district.slug, item);
    return lookup;
  }, [rankings]);

  const hoverItem = hoverSlug ? (bySlug.get(hoverSlug) ?? null) : null;
  const isProvince = selectedSlug === PROVINCE_SLUG;

  // Selected and hovered districts are drawn last so their outline sits on top.
  const ordered = useMemo(() => {
    if (!map) return [];
    const rank = (slug: string) => (slug === selectedSlug ? 2 : slug === hoverSlug ? 1 : 0);
    return [...map.districts].sort((a, b) => rank(a.slug) - rank(b.slug));
  }, [map, selectedSlug, hoverSlug]);

  const handleMove = (event: MouseEvent<SVGSVGElement>) => {
    const box = frameRef.current?.getBoundingClientRect();
    if (!box) return;
    setCursor({ x: event.clientX - box.left, y: event.clientY - box.top, w: box.width });
  };

  const handleKey = (event: KeyboardEvent<SVGPathElement>, slug: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelectRegion(slug);
    }
  };

  const describe = (item: DistrictRankItem | undefined | null) => {
    const cell = item?.cell;
    if (!cell || cell.hotspots === null || cell.ratio === null || cell.cls === null) return 'No data';
    return `${Math.round(cell.hotspots).toLocaleString()} hotspots, ${cell.ratio.toFixed(1)}× normal, ${CLASS_SHORT_LABEL[cell.cls]}`;
  };

  return (
    <Card
      title={`District Map · ${formatYmLabel(focusMonth)}`}
      subtitle="Colored by ratio to the normal. Click a district to open it."
      headerAction={
        isProvince ? (
          <MapIcon className="w-5 h-5 text-zinc-400" />
        ) : (
          <button
            type="button"
            onClick={() => onSelectRegion(PROVINCE_SLUG)}
            className="hover-slide-fill [--slide-bg:rgba(164,255,240,0.12)] px-2.5 py-1 rounded-md text-[11px] font-medium bg-white/[0.03] text-zinc-300 border border-white/[0.12] hover:border-[#A4FFF0]/45 hover:text-white cursor-pointer"
          >
            Whole province
          </button>
        )
      }
      footer={
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px]">
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
                  'repeating-linear-gradient(45deg, #52525b 0, #52525b 1px, transparent 1px, transparent 4px)',
              }}
            />
            <span>Low activity (&lt;20 pts)</span>
          </span>
        </div>
      }
    >
      <div ref={frameRef} className="relative">
        {!map && (
          <div className="aspect-[600/558] w-full rounded-xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-center text-xs text-zinc-500">
            {failed ? 'Map unavailable.' : 'Loading map…'}
          </div>
        )}

        {map && (
          <svg
            viewBox={map.viewBox}
            className="w-full h-auto select-none"
            role="group"
            aria-label={`Map of West Kalimantan districts, anomaly for ${formatYmLabel(focusMonth)}`}
            onMouseMove={handleMove}
            onMouseLeave={() => {
              setHoverSlug(null);
              setCursor(null);
            }}
          >
            <defs>
              <pattern id="niskala-map-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="6" stroke="#050507" strokeOpacity="0.55" strokeWidth="2.2" />
              </pattern>
            </defs>

            {ordered.map((d) => {
              const item = bySlug.get(d.slug);
              const cls = item?.cell?.cls ?? null;
              const fill = cls === null ? NO_DATA_FILL : CLASS_COLOR[cls];
              const low = item?.isLowActivity ?? true;
              const selected = d.slug === selectedSlug;
              const hovered = d.slug === hoverSlug;

              return (
                <g key={d.slug}>
                  <path
                    d={d.path}
                    fill={fill}
                    stroke={selected ? '#A4FFF0' : hovered ? '#ffffff' : '#050507'}
                    strokeWidth={selected ? 2.5 : hovered ? 1.8 : 1}
                    strokeLinejoin="round"
                    tabIndex={0}
                    role="button"
                    aria-label={`${d.name}: ${describe(item)}`}
                    aria-pressed={selected}
                    className="cursor-pointer outline-none focus-visible:[stroke:#A4FFF0]"
                    onMouseEnter={() => setHoverSlug(d.slug)}
                    onFocus={() => setHoverSlug(d.slug)}
                    onBlur={() => setHoverSlug(null)}
                    onClick={() => onSelectRegion(d.slug)}
                    onKeyDown={(event) => handleKey(event, d.slug)}
                  />
                  {low && cls !== null && (
                    <path d={d.path} fill="url(#niskala-map-hatch)" pointerEvents="none" />
                  )}
                </g>
              );
            })}

            {/* Labels for the selected district and districts with a clear anomaly */}
            {map.districts.map((d) => {
              const item = bySlug.get(d.slug);
              const cls = item?.cell?.cls ?? null;
              const show = d.slug === selectedSlug || (!item?.isLowActivity && cls !== null && cls >= 2);
              if (!show) return null;
              const ratio = item?.cell?.ratio;
              return (
                <text
                  key={`label-${d.slug}`}
                  x={d.label[0]}
                  y={d.label[1]}
                  textAnchor="middle"
                  pointerEvents="none"
                  className="font-sans"
                  style={{ paintOrder: 'stroke' }}
                  stroke="#050507"
                  strokeWidth={3}
                  strokeOpacity={0.85}
                  fill="#ffffff"
                  fontSize={15}
                  fontWeight={600}
                >
                  {d.name.replace('Kota ', '')}
                  {ratio != null && (
                    <tspan x={d.label[0]} dy={16} fontSize={13} fontWeight={500} fill="#e4e4e7">
                      {ratio.toFixed(1)}×
                    </tspan>
                  )}
                </text>
              );
            })}
          </svg>
        )}

        {/* Hover tooltip */}
        {map && hoverSlug && cursor && (
          <div
            className="pointer-events-none absolute z-20 min-w-[180px] rounded-xl bg-[#0b0d11]/95 border border-white/[0.14] px-3 py-2 text-[11px] shadow-2xl"
            style={{
              left: Math.max(0, Math.min(cursor.x + 14, cursor.w - 196)),
              top: cursor.y + 14,
            }}
          >
            <div className="font-semibold text-white text-xs">
              {map.districts.find((d) => d.slug === hoverSlug)?.name}
            </div>
            {hoverItem?.cell && hoverItem.cell.hotspots !== null ? (
              <div className="mt-1 flex flex-col gap-0.5 text-zinc-300 tabular-nums">
                <span>
                  {Math.round(hoverItem.cell.hotspots).toLocaleString()} hotspots · normal{' '}
                  {Math.round(hoverItem.cell.normal).toLocaleString()}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-[3px] border border-white/20"
                    style={{
                      backgroundColor:
                        hoverItem.cell.cls !== null ? CLASS_COLOR[hoverItem.cell.cls] : NO_DATA_FILL,
                    }}
                  />
                  {hoverItem.cell.ratio?.toFixed(1) ?? '—'}× normal
                  {hoverItem.cell.cls !== null && ` · ${CLASS_SHORT_LABEL[hoverItem.cell.cls]}`}
                </span>
                <span className={cn(hoverItem.isLowActivity ? 'text-zinc-500' : 'text-[#A4FFF0]')}>
                  {hoverItem.isLowActivity
                    ? 'Low activity: ratio is unreliable'
                    : `Rank #${hoverItem.rank} of ${rankings.filter((r) => r.rank !== null).length}`}
                </span>
              </div>
            ) : (
              <div className="mt-1 text-zinc-500">No data for this month</div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
