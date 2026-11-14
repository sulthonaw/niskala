import { CLASS_COLOR } from '../../../constants/anomalyColors';
import { formatYmLabel } from '../../../services/niskalaDataService';
import type { DistrictRankItem } from '../../../types/niskala';
import { cn } from '../../../utils/formatters';
import { Card } from '../../../components/ui/Card';

export interface DistrictRankingCardProps {
  focusMonth: string;
  selectedSlug: string;
  rankings: DistrictRankItem[];
  onSelectRegion: (slug: string) => void;
}

export function DistrictRankingCard({
  focusMonth,
  selectedSlug,
  rankings,
  onSelectRegion,
}: DistrictRankingCardProps) {
  return (
    <Card
      title={`District Ranking · ${formatYmLabel(focusMonth)}`}
      headerAction={
        <span className="font-brand text-[10px] uppercase tracking-[0.1em] text-zinc-400">
          ≥ 20 pts threshold
        </span>
      }
    >
      <div className="flex flex-col gap-2 max-h-[540px] overflow-y-auto pr-1">
        {rankings.map((item) => {
          const isSelected = item.district.slug === selectedSlug;
          const swatchColor =
            item.cell?.cls !== null && item.cell?.cls !== undefined
              ? CLASS_COLOR[item.cell.cls]
              : '#3f3f46';

          return (
            <button
              key={item.district.slug}
              type="button"
              onClick={() => onSelectRegion(item.district.slug)}
              className={cn(
                'shrink-0 hover-row-glide hover-slide-fill [--slide-bg:rgba(164,255,240,0.09)] w-full text-left px-3 py-1.5 rounded-lg border cursor-pointer flex items-center justify-between gap-3',
                isSelected
                  ? 'bg-[#A4FFF0]/12 border-[#A4FFF0]/55'
                  : 'bg-white/[0.025] border-white/[0.08] hover:border-white/[0.22]'
              )}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="font-brand text-[11px] text-zinc-400 w-6 shrink-0">
                  {item.rank !== null ? `#${item.rank}` : '—'}
                </span>
                <span
                  className="w-2.5 h-2.5 rounded-[3px] shrink-0 border border-white/20"
                  style={{ backgroundColor: swatchColor }}
                />
                <div className="min-w-0">
                  <div className="text-xs font-medium text-white truncate">
                    {item.district.name}
                  </div>
                  <div className="text-[11px] text-zinc-400 tabular-nums">
                    {item.cell?.hotspots !== null && item.cell?.hotspots !== undefined
                      ? `${Math.round(item.cell.hotspots).toLocaleString()} pts`
                      : 'No data'}
                    {item.isLowActivity && ' · low activity'}
                  </div>
                </div>
              </div>

              <span
                className={cn(
                  'text-xs font-semibold tabular-nums shrink-0',
                  item.isLowActivity ? 'text-zinc-500' : 'text-white'
                )}
              >
                {item.cell?.ratio !== null && item.cell?.ratio !== undefined
                  ? `${item.cell.ratio.toFixed(1)}×`
                  : '—'}
              </span>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
