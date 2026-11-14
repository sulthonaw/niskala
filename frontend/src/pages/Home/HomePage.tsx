import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { AnomalyCalendarCard } from '../../features/niskala/components/AnomalyCalendarCard';
import { AnswerCardsGrid } from '../../features/niskala/components/AnswerCardsGrid';
import { DistrictRankingCard } from '../../features/niskala/components/DistrictRankingCard';
import { LimitationsFooterCard } from '../../features/niskala/components/LimitationsFooterCard';
import { PrintableReport } from '../../features/niskala/components/PrintableReport';
import { RangeExportBar } from '../../features/niskala/components/RangeExportBar';
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
    fromYm,
    toYm,
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
    setRange,
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

  const provinceCells = dataset.calendarBySlug['kalimantan-barat'] ?? regionCells;
  const minYm = provinceCells[0]?.ym ?? '2001-01';
  const maxYm = provinceCells[provinceCells.length - 1]?.ym ?? '2026-11';

  const handlePrintReport = () => {
    const previousTitle = document.title;
    document.title = `niskala_${activeDistrict.slug}_${fromYm}_${toYm}_report`;
    const restore = () => {
      document.title = previousTitle;
      window.removeEventListener('afterprint', restore);
    };
    window.addEventListener('afterprint', restore);
    window.print();
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <section className="flex flex-col gap-2">
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
      </section>

      {/* Consolidated Filters & Export Bar */}
      <RangeExportBar
        regionSlug={regionSlug}
        focusMonth={focusMonth}
        fromYm={fromYm}
        toYm={toYm}
        minYm={minYm}
        maxYm={maxYm}
        activeDistrict={activeDistrict}
        districts={dataset.meta.districts}
        rangeCells={regionCells}
        referenceCases={REFERENCE_CASES}
        onSelectRegion={setRegion}
        onSelectScenario={setScenario}
        onChangeRange={setRange}
        onPrintReport={handlePrintReport}
      />

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

      {/* Print-only report (shown by window.print via index.css) */}
      <PrintableReport
        meta={dataset.meta}
        activeDistrict={activeDistrict}
        fromYm={fromYm}
        toYm={toYm}
        focusMonth={focusMonth}
        focusCell={focusCell}
        rangeCells={regionCells}
        topDistrict={topDistrict}
        sipongiSeries={sipongiSeries}
      />
    </div>
  );
}
