import {
  ArrowsPointingOutIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/solid';
import {
  CLASS_SHORT_LABEL,
  MONTH_SHORT_NAMES,
} from '../../../constants/anomalyColors';
import {
  formatPeakMonths,
  formatYmLabel,
} from '../../../services/niskalaDataService';
import type {
  DistrictMeta,
  DistrictRankItem,
  MonthCell,
} from '../../../types/niskala';
import { cn } from '../../../utils/formatters';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { useRevealOnScroll } from '../../../hooks/useRevealOnScroll';

export interface AnswerCardsGridProps {
  activeDistrict: DistrictMeta;
  focusMonth: string;
  focusCell: MonthCell | null;
  sameMonthHistory: MonthCell[];
  topDistrict: DistrictRankItem | null;
  activeDistrictRank: DistrictRankItem | null;
  onSelectRegion: (slug: string) => void;
}

export function AnswerCardsGrid({
  activeDistrict,
  focusMonth,
  focusCell,
  sameMonthHistory,
  topDistrict,
  activeDistrictRank,
  onSelectRegion,
}: AnswerCardsGridProps) {
  const [cardsVisible, observeCards] = useRevealOnScroll();
  const maxMonthlyMean = Math.max(...activeDistrict.monthly_mean, 1);
  const maxHistoryHotspots = Math.max(
    ...sameMonthHistory.map((item) => item.hotspots ?? 0),
    1
  );

  const isWarningClass =
    focusCell?.cls !== null && focusCell?.cls !== undefined && focusCell.cls >= 2;

  const focusClassLabel =
    focusCell?.cls !== null && focusCell?.cls !== undefined
      ? CLASS_SHORT_LABEL[focusCell.cls]
      : 'No data';

  const topDotColor =
    topDistrict?.cell?.cls !== null && topDistrict?.cell?.cls !== undefined
      ? topDistrict.cell.cls >= 3
        ? 'bg-[#FF6060]'
        : topDistrict.cell.cls >= 1
          ? 'bg-[#FF9C33]'
          : 'bg-[#A4FFF0]'
      : 'bg-zinc-400';

  return (
    <section
      ref={observeCards}
      className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 items-stretch"
    >
      {/* CARD 1: WHEN (Normal Seasonal Peak) */}
      <Card
        title="Seasonal Peak"
        headerAction={
          <Badge variant="mint">
            {formatPeakMonths(activeDistrict.peak_months)}
          </Badge>
        }
      >
        <div className="flex-1 flex flex-col justify-between gap-5">
          {/* 12-Month Normal Baseline Curve */}
          <div className="flex flex-col gap-2 pt-2">
            <div className="flex items-end justify-between gap-1.5 h-28 border-b border-white/[0.08] pb-2">
              {activeDistrict.monthly_mean.map((val, idx) => {
                const monthNum = idx + 1;
                const isPeak = activeDistrict.peak_months.includes(monthNum);
                const heightPct = Math.max((val / maxMonthlyMean) * 100, 6);
                return (
                  <div
                    key={MONTH_SHORT_NAMES[idx]}
                    className="flex-1 flex flex-col items-center justify-end h-full gap-1.5 group"
                    title={`${MONTH_SHORT_NAMES[idx]} normal: ${val.toFixed(1)} hotspots`}
                  >
                    <span
                      data-visible={cardsVisible}
                      className={cn(
                        'chart-bar-reveal w-full max-w-[14px] rounded-t-[2px]',
                        isPeak ? 'bg-[#A4FFF0]' : 'bg-white/25 group-hover:bg-white/50'
                      )}
                      style={{
                        height: `${heightPct}%`,
                        transitionDelay: `${idx * 35}ms`,
                      }}
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between text-[10px] font-brand text-zinc-500">
              {MONTH_SHORT_NAMES.map((m, idx) => (
                <span
                  key={m}
                  className={cn(
                    'flex-1 text-center',
                    activeDistrict.peak_months.includes(idx + 1) && 'text-[#A4FFF0]'
                  )}
                >
                  {m.slice(0, 1)}
                </span>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between gap-2 text-xs">
            <span className="text-zinc-400">
              Normal peak:{' '}
              <strong className="text-white font-medium">
                {formatPeakMonths(activeDistrict.peak_months)}
              </strong>
            </span>
            <span className="font-medium text-zinc-300 tabular-nums">
              {Math.round(maxMonthlyMean).toLocaleString()} avg
            </span>
          </div>
        </div>
      </Card>

      {/* CARD 2: HOW BAD (Focus Month Anomaly vs Baseline) */}
      <Card
        title={`Anomaly Severity · ${formatYmLabel(focusMonth)}`}
        headerAction={
          isWarningClass ? (
            <Badge variant="coral">
              <ExclamationTriangleIcon className="w-3.5 h-3.5 text-[#FF6060]" />
              <span>{focusClassLabel}</span>
            </Badge>
          ) : (
            <Badge variant="neutral">{focusClassLabel}</Badge>
          )
        }
      >
        <div className="flex-1 flex flex-col justify-between gap-5">
          {/* Same-Month Multi-Year Comparison Bars */}
          <div className="flex flex-col gap-2 pt-2">
            <div className="flex items-end gap-2 h-28 border-b border-white/[0.08] pb-2">
              <div className="flex flex-col justify-between h-full text-[10px] tabular-nums text-zinc-500 pr-1">
                <span>{Math.round(maxHistoryHotspots).toLocaleString()}</span>
                <span>{Math.round(maxHistoryHotspots / 2).toLocaleString()}</span>
                <span>0</span>
              </div>
              <div className="flex-1 flex items-end justify-between gap-1 h-full">
                {sameMonthHistory.map((item, idx) => {
                  const isFocus = item.ym === focusMonth;
                  const pct = Math.max(((item.hotspots ?? 0) / maxHistoryHotspots) * 100, 5);
                  return (
                    <div
                      key={item.ym}
                      className="flex-1 h-full flex items-end justify-center"
                      title={`${formatYmLabel(item.ym)}: ${(item.hotspots ?? 0).toLocaleString()} hotspots (${item.ratio?.toFixed(2) ?? '—'}x)`}
                    >
                      <span
                        data-visible={cardsVisible}
                        className={cn(
                          'chart-bar-reveal w-full max-w-[10px] rounded-t-[2px]',
                          isFocus
                            ? isWarningClass
                              ? 'bg-[#FF6060]'
                              : 'bg-[#A4FFF0]'
                            : 'bg-white/25 hover:bg-white/50'
                        )}
                        style={{
                          height: `${pct}%`,
                          transitionDelay: `${idx * 25}ms`,
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px] text-zinc-500 tabular-nums pl-8">
              <span>{sameMonthHistory[0]?.year ?? ''}</span>
              <span>Same-month history ({formatYmLabel(focusMonth).slice(0, 3)})</span>
              <span>{sameMonthHistory[sameMonthHistory.length - 1]?.year ?? ''}</span>
            </div>
          </div>

          <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between gap-2 text-xs">
            <span className="text-white font-semibold tabular-nums">
              {focusCell?.ratio !== null && focusCell?.ratio !== undefined
                ? `${focusCell.ratio.toFixed(1)}× normal`
                : 'No data for this month'}
            </span>
            <span className="text-zinc-300 tabular-nums">
              {focusCell?.hotspots !== null && focusCell?.hotspots !== undefined
                ? `${Math.round(focusCell.hotspots).toLocaleString()} hotspots`
                : 'Terra only'}
            </span>
          </div>
        </div>
      </Card>

      {/* CARD 3: WHERE (Highest Anomaly District in Focus Month) */}
      <Card
        title={`District Watch · ${formatYmLabel(focusMonth)}`}
        headerAction={
          <Badge variant="neutral">14 regencies</Badge>
        }
      >
        <div className="flex-1 flex flex-col justify-between gap-3.5">
          {/* Key-Value Rows */}
          <div className="flex flex-col gap-2">
            <div className="hover-row-glide flex items-center justify-between px-3.5 py-2 rounded-md bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] text-xs">
              <span className="text-zinc-400">Highest Anomaly</span>
              <span className="font-semibold text-white">
                {topDistrict ? topDistrict.district.name : 'No elevated activity'}
              </span>
            </div>

            <div className="hover-row-glide flex items-center justify-between px-3.5 py-2 rounded-md bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] text-xs">
              <span className="text-zinc-400">Ratio vs. Normal</span>
              <span className="inline-flex items-center gap-1.5 font-semibold text-white tabular-nums">
                <span className={cn('w-2 h-2 rounded-[2px] shrink-0', topDotColor)} />
                <span>
                  {topDistrict?.cell?.ratio !== null && topDistrict?.cell?.ratio !== undefined
                    ? `${topDistrict.cell.ratio.toFixed(1)}× normal`
                    : '—'}
                </span>
              </span>
            </div>

            <div className="hover-row-glide flex items-center justify-between px-3.5 py-2 rounded-md bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] text-xs">
              <span className="text-zinc-400">Harmonized Hotspots</span>
              <span className="text-zinc-200 tabular-nums">
                {topDistrict?.cell?.hotspots !== null && topDistrict?.cell?.hotspots !== undefined
                  ? `${Math.round(topDistrict.cell.hotspots).toLocaleString()} pts`
                  : '—'}
              </span>
            </div>

            {activeDistrictRank && (
              <div className="hover-row-glide flex items-center justify-between px-3.5 py-2 rounded-md bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] text-xs">
                <span className="text-zinc-400">Selected Rank</span>
                <span className="font-brand text-[11px] tracking-[0.06em] text-[#A4FFF0]">
                  {activeDistrictRank.rank !== null
                    ? `#${activeDistrictRank.rank} of 14`
                    : 'Low activity (<20 pts)'}
                </span>
              </div>
            )}
          </div>

          {topDistrict && topDistrict.district.slug !== activeDistrict.slug ? (
            <Button
              variant="mint"
              className="w-full"
              rightIcon={<ArrowsPointingOutIcon className="w-4 h-4" />}
              onClick={() => onSelectRegion(topDistrict.district.slug)}
            >
              Inspect {topDistrict.district.name}
            </Button>
          ) : (
            <Button
              variant="pill"
              className="w-full"
              onClick={() => onSelectRegion('kalimantan-barat')}
            >
              Return to Province Overview
            </Button>
          )}
        </div>
      </Card>
    </section>
  );
}
