import { MapPinIcon } from '@heroicons/react/24/solid';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { SelectDropdown } from '../../components/ui/SelectDropdown';
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
        <div className="h-24 rounded-[22px] bg-white/[0.03] border border-white/[0.07]" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[1, 2, 3].map((idx) => (
            <div
              key={idx}
              className="h-56 rounded-[22px] bg-white/[0.03] border border-white/[0.07]"
            />
          ))}
        </div>
        <div className="h-96 rounded-[22px] bg-white/[0.03] border border-white/[0.07]" />
      </div>
    );
  }

  if (error || !dataset || !activeDistrict) {
    return (
      <Card title="Unable to Load Data">
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
          <div className="flex items-center gap-2.5 flex-wrap font-brand text-[11px] uppercase tracking-[0.14em]">
            <span className="text-[#A4FFF0]">{dataset.meta.region}</span>
            <span className="text-zinc-600">/</span>
            <span className="text-zinc-400">Focus: {formatYmLabel(focusMonth)}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
            Harmonized Hotspot Anomaly Calendar
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl">
            Monthly hotspot counts on the VIIRS NOAA-20 scale compared with the 2003–2025 normal
            for West Kalimantan and each of its 14 districts.
          </p>
        </div>

        {/* Region Dropdown */}
        <div className="flex flex-col gap-1.5 min-w-[250px]">
          <label
            htmlFor="region-select"
            className="text-[11px] font-brand uppercase tracking-[0.12em] text-zinc-400 flex items-center gap-1.5"
          >
            <MapPinIcon className="w-3.5 h-3.5 text-[#A4FFF0]" />
            <span>Region (15 Areas)</span>
          </label>
          <SelectDropdown
            id="region-select"
            value={regionSlug}
            onChange={setRegion}
            ariaLabel="Select province or regency"
            options={dataset.meta.districts.map((dist) => ({
              value: dist.slug,
              label: dist.name,
              hint: dist.slug === 'kalimantan-barat' ? 'Province' : undefined,
            }))}
          />
        </div>
      </section>

      {/* Reference Case Bar */}
      <section className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-brand uppercase tracking-[0.12em] text-zinc-500 mr-1">
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
                  ? 'px-3 py-1 rounded-md text-xs font-medium bg-[#A4FFF0] text-[#050507] cursor-pointer'
                  : 'hover-slide-fill [--slide-bg:rgba(164,255,240,0.12)] px-3 py-1 rounded-md text-xs font-medium bg-white/[0.03] text-zinc-300 border border-white/[0.12] hover:border-[#A4FFF0]/45 hover:text-white cursor-pointer'
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
        <div className="xl:col-span-4 min-w-0 xl:sticky xl:top-24 xl:self-start">
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
