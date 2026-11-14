import { Link, useSearchParams } from 'react-router-dom';
import { ArrowUpRightIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import kalbarSatelliteImg from '../../assets/kalbar-satellite.jpg';
import { Button } from '../../components/ui/Button';
import { LandingHero } from '../../features/landing/components/LandingHero';
import { SensorSwathMatrix } from '../../features/landing/components/SensorSwathMatrix';
import { useRevealOnScroll } from '../../hooks/useRevealOnScroll';
import { cn } from '../../utils/formatters';
import { HomePage as CalendarDashboardPage } from '../Home/HomePage';

interface GeoPin {
  name: string;
  tag: string;
  leftPct: string;
  topPct: string;
  severity?: 'coral' | 'amber' | 'mint';
}

// Coordinates mapped to NASA BlueMarble BBOX (106.5E..-4.5S .. 116.5E..3.5N)
const KALBAR_PINS: readonly GeoPin[] = [
  { name: 'Pontianak', tag: '0.0°S · 109.3°E', leftPct: '28.4%', topPct: '44.1%', severity: 'mint' },
  { name: 'Kayong Utara', tag: 'Jul 2026 · 8.3×', leftPct: '35.0%', topPct: '59.0%', severity: 'amber' },
  { name: 'Ketapang', tag: 'Oct 2026 · 8.1×', leftPct: '38.0%', topPct: '66.6%', severity: 'coral' },
  { name: 'Kapuas Hulu', tag: 'Baseline Ref', leftPct: '64.3%', topPct: '33.5%', severity: 'mint' },
];

const SEASONAL_PROFILE = [
  { month: 'JAN', pct: 18, peak: false },
  { month: 'FEB', pct: 16, peak: false },
  { month: 'MAR', pct: 22, peak: false },
  { month: 'APR', pct: 20, peak: false },
  { month: 'MAY', pct: 28, peak: false },
  { month: 'JUN', pct: 38, peak: false },
  { month: 'JUL', pct: 64, peak: true },
  { month: 'AUG', pct: 92, peak: true },
  { month: 'SEP', pct: 100, peak: true },
  { month: 'OCT', pct: 74, peak: true },
  { month: 'NOV', pct: 26, peak: false },
  { month: 'DEC', pct: 15, peak: false },
] as const;

const ARCHIVE_STATS = [
  { value: '24 YRS', label: 'Continuous MODIS + VIIRS record' },
  { value: '311', label: 'Calibrated provincial & district cells' },
  { value: '0.90 ρ', label: 'Spearman fit vs official SiPongi' },
] as const;

export function LandingPage() {
  const [searchParams] = useSearchParams();
  const [arrayVisible, observeArray] = useRevealOnScroll();
  const [editorialVisible, observeEditorial] = useRevealOnScroll();
  const [seasonalVisible, observeSeasonal] = useRevealOnScroll();
  const [ctaVisible, observeCta] = useRevealOnScroll();

  // Preserve PRD T-10 direct scenario links such as /?region=ketapang&focus=2026-10
  if (searchParams.has('region') || searchParams.has('focus')) {
    return <CalendarDashboardPage />;
  }

  return (
    <div className="flex flex-col gap-20 sm:gap-24 pb-12">
      {/* Section 1: Planetary Hero centered on West Kalimantan */}
      <LandingHero />

      {/* Section 2: Animated NASA Satellite Cross-Sensor Swath Matrix (No Cards) */}
      <section
        ref={observeArray}
        className={cn(
          'flex flex-col gap-6 transition-transform duration-500 ease-out',
          arrayVisible ? 'translate-y-0' : 'translate-y-4'
        )}
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-col items-start gap-2">
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#A4FFF0]">
              01 · HOW BAD · CROSS-SENSOR HARMONIZATION
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white max-w-xl">
              One Unbroken Scale Across Three NASA Orbital Sensors
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-md leading-relaxed">
            Reconciles 1 km MODIS Terra & Aqua detections onto 375 m VIIRS NOAA-20 resolution so
            multi-decade fire anomalies never jump artificially.
          </p>
        </div>

        <SensorSwathMatrix />
      </section>

      {/* Section 3: Card-Free Zig-Zag Editorial Storytelling with NASA Satellite Imagery */}
      <section
        ref={observeEditorial}
        className={cn(
          'flex flex-col gap-16 sm:gap-20 transition-transform duration-500 ease-out',
          editorialVisible ? 'translate-y-0' : 'translate-y-4'
        )}
      >
        {/* Row A: West Kalimantan True Satellite Focus */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-7 relative overflow-hidden border border-white/[0.1] bg-[#04070c]">
            <img
              src={kalbarSatelliteImg}
              alt="NASA Blue Marble satellite imagery of West Kalimantan coastline and Borneo interior"
              className="w-full h-[280px] sm:h-[360px] object-cover brightness-110 contrast-105"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050507]/45 via-transparent to-[#050507]/15"
            />

            {/* Top-left Satellite Pass Watermark */}
            <div className="pointer-events-none absolute top-3 left-3 right-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.16em]">
              <span className="bg-black/70 border border-white/15 px-2 py-1 text-[#A4FFF0]">
                NASA BLUE MARBLE · WEST KALIMANTAN
              </span>
              <span className="hidden sm:inline bg-black/70 border border-white/15 px-2 py-1 text-zinc-300">
                106.5°E – 116.5°E
              </span>
            </div>

            {/* Georeferenced Regency Targeting Reticles */}
            {KALBAR_PINS.map((pin) => (
              <div
                key={pin.name}
                style={{ left: pin.leftPct, top: pin.topPct }}
                className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5"
              >
                <span
                  className={cn(
                    'w-2.5 h-2.5 border',
                    pin.severity === 'coral' && 'bg-[#FF6060]/80 border-[#FF9C33]',
                    pin.severity === 'amber' && 'bg-[#FF9C33]/80 border-[#FFEB67]',
                    pin.severity === 'mint' && 'bg-[#A4FFF0]/60 border-[#A4FFF0]'
                  )}
                />
                <div className="bg-black/80 backdrop-blur-sm border border-white/15 px-1.5 py-0.5 leading-tight whitespace-nowrap">
                  <div className="text-[10px] font-medium text-white">{pin.name}</div>
                  <div
                    className={cn(
                      'font-mono text-[9px]',
                      pin.severity === 'coral' && 'text-[#FF6060]',
                      pin.severity === 'amber' && 'text-[#FF9C33]',
                      pin.severity === 'mint' && 'text-[#A4FFF0]'
                    )}
                  >
                    {pin.tag}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-5 flex flex-col items-start gap-4">
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#A4FFF0]">
              02 · WHERE · DISTRICT PRIORITIZATION
            </span>
            <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
              Catch Localized Regency Spikes Before Provincial Totals React
            </h3>
            <p className="text-sm text-zinc-300 leading-relaxed">
              Province-wide averages often hide acute emergencies along coastal peatlands. NISKALA
              ranks all 14 regencies simultaneously to surface spikes like{' '}
              <span className="text-white font-medium">Ketapang at 8.1× normal</span> and{' '}
              <span className="text-white font-medium">Kayong Utara at 8.3×</span> within seconds.
            </p>
            <Link
              to="/calendar?region=ketapang&focus=2026-10"
              className="group hover-slide-underline inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-[0.14em] text-[#A4FFF0] hover:text-white border-b border-[#A4FFF0]/35 pb-1 transition-colors"
            >
              <span>Inspect Ketapang Oct 2026 Anomaly</span>
              <ArrowUpRightIcon className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </div>

        {/* Row B: Seasonal Baseline Clarity Visual Strip (Reversed Zig-Zag, No Card) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center pt-12 border-t border-white/[0.08]">
          <div className="lg:col-span-5 order-2 lg:order-1 flex flex-col items-start gap-4">
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#A4FFF0]">
              03 · WHEN · 2003–2025 LOYO BASELINE
            </span>
            <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
              Separate Normal Dry Seasons From True Fire Anomalies
            </h3>
            <p className="text-sm text-zinc-300 leading-relaxed">
              Every month is benchmarked against its own 2003–2025 leave-one-year-out seasonal
              baseline per regency—so planners distinguish routine August–October dry peaks from
              abnormal extreme fire outbreaks.
            </p>
            <Link
              to="/about"
              className="group hover-slide-underline inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-[0.14em] text-zinc-300 hover:text-[#A4FFF0] border-b border-white/20 pb-1 transition-colors"
            >
              <span>Read Calibration Methodology</span>
              <ArrowUpRightIcon className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>

          <div
            ref={observeSeasonal}
            className="lg:col-span-7 order-1 lg:order-2 flex flex-col gap-3 py-4 border-y border-white/[0.08]"
          >
            <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-400">
              <span>WEST KALIMANTAN SEASONAL ENVELOPE (JAN – DEC)</span>
              <span className="text-[#FF9C33]">PEAK FIRE WINDOW · JUL–OCT</span>
            </div>

            <div className="grid grid-cols-12 gap-1.5 sm:gap-2 items-end h-36 pt-4">
              {SEASONAL_PROFILE.map((m, idx) => (
                <div key={m.month} className="h-full flex flex-col justify-end items-center gap-2">
                  <div className="w-full flex-1 flex items-end bg-white/[0.025] border border-white/[0.05] overflow-hidden">
                    <div
                      data-visible={seasonalVisible}
                      style={{
                        height: `${m.pct}%`,
                        transitionDelay: `${idx * 45}ms`,
                      }}
                      className={cn(
                        'chart-bar-reveal w-full',
                        m.peak
                          ? 'bg-gradient-to-t from-[#FF9C33]/85 to-[#FF6060]'
                          : 'bg-gradient-to-t from-white/15 to-[#A4FFF0]/55'
                      )}
                    />
                  </div>
                  <span
                    className={cn(
                      'font-mono text-[9px] sm:text-[10px]',
                      m.peak ? 'text-[#FF9C33]' : 'text-zinc-500'
                    )}
                  >
                    {m.month}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Card-Free Editorial Metrics & Direct Scenario Entry */}
      <section
        ref={observeCta}
        className={cn(
          'pt-14 border-t border-white/[0.1] flex flex-col gap-10 transition-transform duration-500 ease-out',
          ctaVisible ? 'translate-y-0' : 'translate-y-4'
        )}
      >
        {/* Typographic Metrics Row (Squarespace-inspired, Zero Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6">
          {ARCHIVE_STATS.map((stat) => (
            <div key={stat.label} className="flex flex-col gap-1.5">
              <span className="font-brand text-3xl sm:text-4xl font-light tracking-wider text-white">
                {stat.value}
              </span>
              <span className="text-xs sm:text-sm text-zinc-400">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Direct Scenario Strip & Launch CTA */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pt-8 border-t border-white/[0.08]">
          <div className="flex flex-col gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#A4FFF0]">
              VERIFIED HISTORICAL ANOMALIES
            </span>
            <div className="flex flex-wrap gap-2">
              <Link
                to="/calendar?region=ketapang&focus=2026-10"
                className="hover-slide-fill [--slide-bg:rgba(255,96,96,0.14)] rounded-md text-xs font-mono px-3 py-1.5 bg-white/[0.03] border border-white/[0.12] hover:border-[#FF6060]/60 text-zinc-200 hover:text-white"
              >
                Ketapang · Oct 2026 (8.1×)
              </Link>
              <Link
                to="/calendar?region=kayong-utara&focus=2026-07"
                className="hover-slide-fill [--slide-bg:rgba(255,156,51,0.14)] rounded-md text-xs font-mono px-3 py-1.5 bg-white/[0.03] border border-white/[0.12] hover:border-[#FF9C33]/60 text-zinc-200 hover:text-white"
              >
                Kayong Utara · Jul 2026 (8.3×)
              </Link>
              <Link
                to="/calendar?region=kalimantan-barat&focus=2026-07"
                className="hover-slide-fill [--slide-bg:rgba(164,255,240,0.12)] rounded-md text-xs font-mono px-3 py-1.5 bg-white/[0.03] border border-white/[0.12] hover:border-[#A4FFF0]/60 text-zinc-200 hover:text-white"
              >
                West Kalimantan · Jul 2026 (1.4×)
              </Link>
            </div>
          </div>

          <Link to="/calendar" className="shrink-0">
            <Button variant="mint" size="lg" leftIcon={<CalendarDaysIcon />}>
              Open Interactive Calendar
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
