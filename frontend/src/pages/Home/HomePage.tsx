import { MapPinIcon } from '@heroicons/react/24/outline';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { AnomalyCalendarCard } from '../../features/niskala/components/AnomalyCalendarCard';
import { AnswerCardsGrid } from '../../features/niskala/components/AnswerCardsGrid';
import { DistrictRankingCard } from '../../features/niskala/components/DistrictRankingCard';
import { LimitationsFooterCard } from '../../features/niskala/components/LimitationsFooterCard';
import { ValidationRow } from '../../features/niskala/components/ValidationRow';
import { useNiskalaData } from '../../hooks/useNiskalaData';
import { formatYmLabel } from '../../services/niskalaDataService';

const REFERENCE_CASES = [
  { label: 'West Kalimantan · Jul 2026', region: 'kalimantan-barat', focus: '2026-07' },
  { label: 'Kayong Utara · Jul 2026', region: 'kayong-utara', focus: '2026-07' },
  { label: 'Ketapang · Oct 2026', region: 'ketapang', focus: '2026-10' },
  { label: 'West Kalimantan · Oct 2026', region: 'kalimantan-barat', focus: '2026-10' },
];

export function HomePage() {
  const {
    dataset,
    loading,
    error,
    reload,
    regionSlug,
    focusMonth,
    activeDistrict,
    regionCells,
    focusCell,
    sameMonthHistory,
    districtRanking,
    activeDistrictRank,
    sipongiSeries,
    annualSeries,
    setRegion,
    setFocusMonth,
    setScenario,
  } = useNiskalaData();

  if (loading) {
    return (
      <div className="flex flex-col gap-5">
        <div className="h-24 rounded-[22px] bg-white/[0.04] border border-white/[0.08] animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[1, 2, 3].map((idx) => (
            <div
              key={idx}
              className="h-56 rounded-[22px] bg-white/[0.04] border border-white/[0.08] animate-pulse"
            />
          ))}
        </div>
        <div className="h-96 rounded-[22px] bg-white/[0.04] border border-white/[0.08] animate-pulse" />
      </div>
    );
  }

  if (error || !dataset || !activeDistrict) {
    return (
      <Card title="Unable to Load Telemetry Data">
        <div className="flex flex-col items-start gap-4 py-4">
          <p className="text-sm text-zinc-300">
            Couldn&apos;t load data. Refresh the page or try again later.
          </p>
          {error && <code className="text-xs font-mono text-[#FF6060]">{error}</code>}
          <Button variant="mint" size="sm" onClick={() => void reload()}>
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  const topDistrict = districtRanking[0] ?? null;

  return (
    <div className="flex flex-col gap-6">
      {/* Control Header & Region Selector */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="mint" showDot>
              {dataset.meta.region}
            </Badge>
            <Badge variant="neutral" className="font-mono">
              Focus: {formatYmLabel(focusMonth)}
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
            Harmonized Hotspot Anomaly Calendar
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl">
            Cross-sensor calibrated MODIS and VIIRS thermal anomaly archive (2002–2026, NOAA-20
            equivalent) supporting provincial and district fire readiness.
          </p>
        </div>

        {/* Region Dropdown */}
        <div className="flex flex-col gap-1.5 min-w-[240px]">
          <label
            htmlFor="region-select"
            className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5"
          >
            <MapPinIcon className="w-3.5 h-3.5 text-[#A4FFF0]" />
            <span>Area of Interest (15 Regions)</span>
          </label>
          <select
            id="region-select"
            value={regionSlug}
            onChange={(e) => setRegion(e.target.value)}
            className="w-full rounded-full bg-[#0e1012] border border-white/[0.14] px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#A4FFF0] cursor-pointer"
          >
            {dataset.meta.districts.map((dist) => (
              <option key={dist.slug} value={dist.slug} className="bg-[#0e1012] text-white">
                {dist.name}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Reference Case Bar */}
      <section className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 mr-1">
          Reference Cases:
        </span>
        {REFERENCE_CASES.map((sc) => {
          const isCurrent = regionSlug === sc.region && focusMonth === sc.focus;
          return (
            <button
              key={sc.label}
              type="button"
              onClick={() => setScenario(sc.region, sc.focus)}
              className={
                isCurrent
                  ? 'px-3 py-1 rounded-full text-xs font-medium bg-[#A4FFF0] text-[#050507] cursor-pointer'
                  : 'px-3 py-1 rounded-full text-xs font-medium bg-white/[0.05] text-zinc-300 border border-white/[0.1] hover:bg-white/[0.1] cursor-pointer transition-colors'
              }
            >
              {sc.label}
            </button>
          );
        })}
      </section>

      {/* 3 Answer Cards (When / How Bad / Where) */}
      <AnswerCardsGrid
        activeDistrict={activeDistrict}
        focusMonth={focusMonth}
        focusCell={focusCell}
        sameMonthHistory={sameMonthHistory}
        topDistrict={topDistrict}
        activeDistrictRank={activeDistrictRank}
        onSelectRegion={setRegion}
      />

      {/* Main Split: Anomaly Calendar (Left 8 cols) + District Ranking (Right 4 cols) */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        <div className="xl:col-span-8 min-w-0">
          <AnomalyCalendarCard
            regionName={activeDistrict.name}
            cells={regionCells}
            focusMonth={focusMonth}
            partialDaysCovered={dataset.meta.partial_month.days_covered}
            onSelectFocusMonth={setFocusMonth}
          />
        </div>
        <div className="xl:col-span-4 min-w-0">
          <DistrictRankingCard
            focusMonth={focusMonth}
            selectedSlug={regionSlug}
            rankings={districtRanking}
            onSelectRegion={setRegion}
          />
        </div>
      </section>

      {/* Validation Row: SiPongi Comparison + Why Harmonize */}
      <ValidationRow
        meta={dataset.meta}
        activeDistrict={activeDistrict}
        sipongiSeries={sipongiSeries}
        annualSeries={annualSeries}
      />

      {/* Limitations & Sources */}
      <LimitationsFooterCard meta={dataset.meta} />
    </div>
  );
}
