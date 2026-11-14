import { useEffect, useState, type ComponentType } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowUpRightIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  DocumentCheckIcon,
  ExclamationTriangleIcon,
  FireIcon,
  MapPinIcon,
} from '@heroicons/react/24/solid';
import kalbarSatelliteImg from '../../assets/kalbar-satellite.jpg';
import { Card } from '../../components/ui/Card';
import { GitHubIcon } from '../../components/ui/GitHubIcon';
import { SatelliteIcon } from '../../components/ui/SatelliteIcon';
import { GITHUB_REPO_URL } from '../../constants/docsSections';
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

interface ArchiveStat {
  target: number;
  decimals: number;
  suffix: string;
  label: string;
}

const ARCHIVE_STATS: readonly ArchiveStat[] = [
  { target: 24, decimals: 0, suffix: '+ YRS', label: 'Harmonized MODIS Aqua + VIIRS record (Jul 2002–Nov 2026)' },
  { target: 293, decimals: 0, suffix: '', label: 'Calibrated monthly steps across 15 regions' },
  { target: 19.6, decimals: 1, suffix: '%', label: 'LOYO median error (vs. 27.6% single province ratio)' },
  { target: 0.90, decimals: 2, suffix: ' ρ', label: 'Provincial Spearman correlation vs. SiPongi' },
];

interface CtaTile {
  label: string;
  to: string;
  external?: boolean;
  icon: ComponentType<{ className?: string }>;
  accentClass: string;
}

const CTA_TILES: readonly CtaTile[] = [
  {
    label: 'Ketapang · Oct 2026',
    to: '/calendar?region=ketapang&focus=2026-10',
    icon: FireIcon,
    accentClass: 'text-[#FF6060] group-hover:text-[#FF7D7D]',
  },
  {
    label: 'Kayong Utara · Jul 2026',
    to: '/calendar?region=kayong-utara&focus=2026-07',
    icon: ExclamationTriangleIcon,
    accentClass: 'text-[#FF9C33] group-hover:text-[#FFB15C]',
  },
  {
    label: 'Kalbar · Jul 2026',
    to: '/calendar?region=kalimantan-barat&focus=2026-07',
    icon: MapPinIcon,
    accentClass: 'text-[#A4FFF0] group-hover:text-white',
  },
  {
    label: 'Validation Matrix',
    to: '/docs?doc=calibration-validation',
    icon: DocumentCheckIcon,
    accentClass: 'text-zinc-300 group-hover:text-[#A4FFF0]',
  },
  {
    label: 'Data & References',
    to: '/docs?doc=references',
    icon: BookOpenIcon,
    accentClass: 'text-zinc-300 group-hover:text-[#A4FFF0]',
  },
  {
    label: 'GitHub Source',
    to: GITHUB_REPO_URL,
    external: true,
    icon: GitHubIcon,
    accentClass: 'text-zinc-300 group-hover:text-white',
  },
];

function AnimatedStatValue({
  target,
  decimals,
  suffix,
  active,
  delayMs = 0,
}: {
  target: number;
  decimals: number;
  suffix: string;
  active: boolean;
  delayMs?: number;
}) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return undefined;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    let rafId = 0;
    const durationMs = prefersReduced ? 0 : 1200;
    const startTime = performance.now() + (prefersReduced ? 0 : delayMs);

    const tick = (now: number) => {
      if (now < startTime) {
        rafId = requestAnimationFrame(tick);
        return;
      }

      if (durationMs === 0) {
        setValue(target);
        return;
      }

      const progress = Math.min(1, (now - startTime) / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(target * eased);

      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        setValue(target);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [active, delayMs, target]);

  const formatted = decimals > 0 ? value.toFixed(decimals) : Math.round(value).toString();

  return (
    <span className="font-brand tabular-nums text-4xl sm:text-5xl lg:text-[54px] font-light tracking-tight text-white leading-none">
      {formatted}
      {suffix && <span className="text-[#A4FFF0]/90">{suffix}</span>}
    </span>
  );
}

const DATA_SOURCES = [
  {
    name: 'MODIS Aqua & Terra',
    sourceLabel: 'NASA FIRMS',
    detail: '1 km · 2002–2026',
    href: 'https://firms.modaps.eosdis.nasa.gov/',
    note: 'Scaled per district to match NOAA-20.',
    icon: SatelliteIcon,
  },
  {
    name: 'VIIRS NOAA-20',
    sourceLabel: 'NASA FIRMS',
    detail: '375 m · 2018–2026',
    href: 'https://firms.modaps.eosdis.nasa.gov/',
    note: 'Fine-pixel reference for peat and small fires.',
    icon: FireIcon,
  },
  {
    name: 'SiPongi Burned Area',
    sourceLabel: 'KLHK SiPongi',
    detail: 'Hectares · 2016–2026',
    href: 'https://sipongi.menlhk.go.id/',
    note: 'Official ground record for trend checks.',
    icon: DocumentCheckIcon,
  },
] as const;

const SUPPORTING_REFERENCES = [
  {
    label: 'NOAA PSL · Niño 3.4',
    href: 'https://psl.noaa.gov/data/correlation/nina34.anom.data',
  },
  {
    label: 'geoBoundaries · ADM2',
    href: 'https://www.geoboundaries.org/',
  },
  {
    label: 'Zahra et al. (2023)',
    href: 'https://reference-global.com/article/10.14746/quageo-2023-0006',
  },
] as const;

export function LandingPage() {
  const [searchParams] = useSearchParams();
  const [arrayVisible, observeArray] = useRevealOnScroll();
  const [editorialVisible, observeEditorial] = useRevealOnScroll();
  const [seasonalVisible, observeSeasonal] = useRevealOnScroll();
  const [statsVisible, observeStats] = useRevealOnScroll();
  const [ctaVisible, observeCta] = useRevealOnScroll();

  // Preserve PRD T-10 direct scenario links such as /?region=ketapang&focus=2026-10
  if (searchParams.has('region') || searchParams.has('focus')) {
    return <CalendarDashboardPage />;
  }

  return (
    <div className="flex flex-col gap-16 lg:gap-0 pb-12">
      {/* Section 1: Planetary Hero centered on West Kalimantan */}
      <LandingHero />

      {/* Section 2: 01 — Animated NASA Satellite Cross-Sensor Swath Matrix (No Cards) */}
      <section
        ref={observeArray}
        className={cn(
          'lg:min-h-[calc(100vh-5rem)] flex flex-col justify-center gap-6 py-8 lg:py-12 transition-transform duration-500 ease-out',
          arrayVisible ? 'translate-y-0' : 'translate-y-4'
        )}
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-col items-start gap-2">
            <span className="font-brand text-[11px] uppercase tracking-[0.18em] text-[#A4FFF0]">
              01 · HOW BAD · CROSS-SENSOR HARMONIZATION
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white max-w-xl">
              One Consistent Scale Across NASA Satellites
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-lg leading-relaxed">
            In 2018, sharper 375 m VIIRS NOAA-20 pixels began catching smaller fires than 1 km
            MODIS Aqua, causing raw counts to jump even when burning did not. Scaling Aqua to
            NOAA-20 removes that break so 2006 and 2015 compare fairly with 2026.
          </p>
        </div>

        <SensorSwathMatrix />
      </section>

      {/* Section 3: Card-Free Zig-Zag Editorial Storytelling (1 Viewport per Point on Desktop) */}
      <section
        ref={observeEditorial}
        className={cn(
          'flex flex-col gap-16 lg:gap-0 transition-transform duration-500 ease-out',
          editorialVisible ? 'translate-y-0' : 'translate-y-4'
        )}
      >
        {/* Row A (02): West Kalimantan True Satellite Focus */}
        <div className="lg:min-h-[calc(100vh-5rem)] flex flex-col justify-center py-6 lg:py-12 lg:border-t lg:border-white/[0.08]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-7 relative overflow-hidden rounded-2xl border border-white/[0.11] bg-[#0e1012]/80">
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
            <div className="pointer-events-none absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between font-brand text-[10px] uppercase tracking-[0.14em]">
              <span className="rounded-full bg-[#0b0d11]/80 backdrop-blur-md border border-white/15 px-3 py-1 text-[#A4FFF0]">
                NASA BLUE MARBLE · WEST KALIMANTAN
              </span>
              <span className="hidden sm:inline rounded-full bg-[#0b0d11]/80 backdrop-blur-md border border-white/15 px-3 py-1 text-zinc-300">
                106.5°E – 116.5°E
              </span>
            </div>

            {/* Georeferenced Regency Markers */}
            {KALBAR_PINS.map((pin) => (
              <div
                key={pin.name}
                style={{ left: pin.leftPct, top: pin.topPct }}
                className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5"
              >
                <span
                  className={cn(
                    'w-2.5 h-2.5 rounded-full border',
                    pin.severity === 'coral' && 'bg-[#FF6060]/85 border-[#FF9C33]',
                    pin.severity === 'amber' && 'bg-[#FF9C33]/85 border-[#FFEB67]',
                    pin.severity === 'mint' && 'bg-[#A4FFF0]/70 border-[#A4FFF0]'
                  )}
                />
                <div className="rounded-lg bg-[#0b0d11]/85 backdrop-blur-md border border-white/15 px-2.5 py-1 leading-tight whitespace-nowrap">
                  <div className="text-[10px] font-medium text-white">{pin.name}</div>
                  <div
                    className={cn(
                      'font-brand text-[9px] uppercase tracking-[0.1em]',
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
            <span className="font-brand text-[11px] uppercase tracking-[0.18em] text-[#A4FFF0]">
              02 · WHERE · DISTRICT RANKING
            </span>
            <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
              Spot Local Fire Spikes Hidden in Provincial Totals
            </h3>
            <p className="text-sm text-zinc-300 leading-relaxed">
              Provincial totals can look ordinary while one district is burning far above normal.
              Niskala ranks all 14 districts side by side, making local surges like{' '}
              <span className="text-white font-medium">Kayong Utara (8.3× in Jul 2026)</span> and{' '}
              <span className="text-white font-medium">Ketapang (8.1× in Oct 2026)</span> easy to
              see.
            </p>
            <Link
              to="/calendar?region=ketapang&focus=2026-10"
              className="group hover-slide-underline inline-flex items-center gap-1.5 text-[11px] font-brand uppercase tracking-[0.14em] text-[#A4FFF0] hover:text-white border-b border-[#A4FFF0]/35 pb-1 transition-colors"
            >
              <span>Inspect Ketapang Oct 2026 Anomaly</span>
              <ArrowUpRightIcon className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
          </div>
        </div>

        {/* Row B (03): Seasonal Baseline Clarity Visual Strip (1 Viewport on Desktop) */}
        <div className="lg:min-h-[calc(100vh-5rem)] flex flex-col justify-center pt-12 lg:py-12 border-t border-white/[0.08]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-5 order-2 lg:order-1 flex flex-col items-start gap-4">
              <span className="font-brand text-[11px] uppercase tracking-[0.18em] text-[#A4FFF0]">
                03 · WHEN · SEASONAL BASELINE
              </span>
              <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
                Compare Every Month Against Its Own Normal
              </h3>
              <p className="text-sm text-zinc-300 leading-relaxed">
                Each month is divided by its 2003–2025 historical average for that exact district and
                calendar month, excluding the year being checked. That makes it clear whether
                August–October hotspots are a routine dry season or an unusually severe year.
              </p>
              <Link
                to="/docs?doc=harmonization"
                className="group hover-slide-underline inline-flex items-center gap-1.5 text-[11px] font-brand uppercase tracking-[0.14em] text-zinc-300 hover:text-[#A4FFF0] border-b border-white/20 pb-1 transition-colors"
              >
                <span>Read Calibration Methodology</span>
                <ArrowUpRightIcon className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>

            <div ref={observeSeasonal} className="lg:col-span-7 order-1 lg:order-2">
              <Card
                title="West Kalimantan Seasonal Envelope (Jan – Dec)"
                headerAction={
                  <span className="font-brand text-[10px] uppercase tracking-[0.12em] text-[#FF9C33]">
                    PEAK · JUL–OCT
                  </span>
                }
              >
                <div className="grid grid-cols-12 gap-1.5 sm:gap-2.5 items-end h-48 sm:h-56 pt-4">
                  {SEASONAL_PROFILE.map((m, idx) => (
                    <div key={m.month} className="h-full flex flex-col justify-end items-center gap-2">
                      <div className="w-full flex-1 flex items-end rounded-md bg-white/[0.025] border border-white/[0.06] overflow-hidden">
                        <div
                          data-visible={seasonalVisible}
                          style={{
                            height: `${m.pct}%`,
                            transitionDelay: `${idx * 45}ms`,
                          }}
                          className={cn(
                            'chart-bar-reveal w-full rounded-t-[4px]',
                            m.peak
                              ? 'bg-gradient-to-t from-[#FF9C33]/85 to-[#FF6060]'
                              : 'bg-gradient-to-t from-white/15 to-[#A4FFF0]/55'
                          )}
                        />
                      </div>
                      <span
                        className={cn(
                          'font-brand text-[9px] sm:text-[10px] uppercase tracking-[0.06em]',
                          m.peak ? 'text-[#FF9C33]' : 'text-zinc-500'
                        )}
                      >
                        {m.month}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Row C (04): Data Sources & Ground Validation (1 Viewport on Desktop) */}
        <div className="lg:min-h-[calc(100vh-5rem)] flex flex-col justify-center gap-8 pt-12 lg:py-12 border-t border-white/[0.08]">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex flex-col items-start gap-2">
              <span className="font-brand text-[11px] uppercase tracking-[0.18em] text-[#A4FFF0]">
                04 · DATA &amp; VALIDATION · GROUND CHECK
              </span>
              <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white max-w-xl">
                Steady Across Sensors, Checked on the Ground
              </h3>
            </div>
            <div className="flex flex-col items-start md:items-end gap-2.5 max-w-md">
              <p className="text-xs sm:text-sm text-zinc-400 md:text-right leading-relaxed">
                From the Sanskrit for <em>steady</em>, Niskala links NASA FIRMS sensors with
                official SiPongi burned-area records.
              </p>
              <Link
                to="/docs?doc=references"
                className="group hover-slide-underline inline-flex items-center gap-1.5 text-[11px] font-brand uppercase tracking-[0.14em] text-[#A4FFF0] hover:text-white border-b border-[#A4FFF0]/35 pb-1 transition-colors"
              >
                <span>Data &amp; References</span>
                <ArrowUpRightIcon className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
            {DATA_SOURCES.map((src) => {
              const Icon = src.icon;
              return (
                <a
                  key={src.name}
                  href={src.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group block h-full"
                >
                  <Card
                    className="h-full group-hover:border-[#A4FFF0]/45"
                    footer={
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-brand text-[10px] uppercase tracking-[0.12em] text-zinc-300 group-hover:text-white transition-colors">
                          {src.sourceLabel}
                        </span>
                        <ArrowUpRightIcon className="w-3.5 h-3.5 text-[#A4FFF0] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </div>
                    }
                  >
                    <div className="flex flex-col gap-3 pt-1">
                      <div className="flex items-center justify-between gap-3">
                        <span className="w-9 h-9 rounded-xl bg-[#A4FFF0]/[0.08] border border-[#A4FFF0]/20 flex items-center justify-center text-[#A4FFF0]">
                          <Icon className="w-4 h-4" />
                        </span>
                        <span className="font-brand text-[10px] uppercase tracking-[0.1em] text-[#A4FFF0]">
                          {src.detail}
                        </span>
                      </div>

                      <div className="flex flex-col gap-1">
                        <h4 className="text-base font-semibold text-white group-hover:text-[#A4FFF0] transition-colors">
                          {src.name}
                        </h4>
                        <p className="text-xs text-zinc-400 leading-relaxed">{src.note}</p>
                      </div>
                    </div>
                  </Card>
                </a>
              );
            })}
          </div>

          {/* Supporting Datasets & Study Links */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/[0.08]">
            <span className="font-brand text-[10px] uppercase tracking-[0.16em] text-zinc-500">
              CLIMATE &amp; BOUNDARY REFERENCES
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {SUPPORTING_REFERENCES.map((ref) => (
                <a
                  key={ref.label}
                  href={ref.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group hover-slide-fill [--slide-bg:rgba(164,255,240,0.09)] inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/[0.12] bg-white/[0.025] hover:border-[#A4FFF0]/45 text-[10px] font-brand uppercase tracking-[0.08em] text-zinc-300 hover:text-white"
                >
                  <span>{ref.label}</span>
                  <ArrowUpRightIcon className="w-3 h-3 text-[#A4FFF0] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: 1-Viewport Editorial Metrics with Count-Up Animation */}
      <section
        ref={observeStats}
        className={cn(
          'lg:min-h-[calc(100vh-5rem)] flex flex-col justify-center gap-12 py-12 lg:py-16 border-t border-white/[0.1] transition-transform duration-500 ease-out',
          statsVisible ? 'translate-y-0' : 'translate-y-4'
        )}
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-col items-start gap-2">
            <span className="font-brand text-[11px] uppercase tracking-[0.18em] text-[#A4FFF0]">
              05 · ARCHIVE SCALE · CALIBRATED RECORD
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-white max-w-2xl">
              Twenty-Four Years of Calibrated Observations
            </h2>
          </div>
          <p className="text-sm text-zinc-400 max-w-md md:text-right leading-relaxed">
            Every district time series is anchored to overlap-window NOAA-20 geometry and checked
            against independent provincial burned-area records.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 pt-8 border-t border-white/[0.08]">
          {ARCHIVE_STATS.map((stat, index) => (
            <div key={stat.label} className="flex flex-col gap-2.5">
              <AnimatedStatValue
                target={stat.target}
                decimals={stat.decimals}
                suffix={stat.suffix}
                active={statsVisible}
                delayMs={index * 90}
              />
              <span className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-[26ch]">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Section 5: Split Bento CTA (Verified Anomalies & Interactive Entry) */}
      <section
        ref={observeCta}
        className={cn(
          'pt-10 pb-4 lg:py-14 border-t border-white/[0.08] transition-transform duration-500 ease-out',
          ctaVisible ? 'translate-y-0' : 'translate-y-4'
        )}
      >
        <div className="rounded-[24px] border border-white/[0.12] bg-[#0B0D12]/95 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          {/* Left Column: Editorial Headline */}
          <div className="lg:col-span-5 p-8 sm:p-12 lg:p-14 flex flex-col justify-center gap-4 lg:border-r border-b lg:border-b-0 border-white/[0.08]">
            <span className="font-brand text-[10px] uppercase tracking-[0.2em] text-[#A4FFF0]">
              VERIFIED HISTORICAL ANOMALIES
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-semibold tracking-tight text-white leading-[1.1]">
              See the record yourself.
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-sm">
              Jump directly to documented burn anomalies in West Kalimantan, or inspect the full
              calibration evidence.
            </p>
          </div>

          {/* Right Column: 3x2 Hairline Action Grid + Full-Width Primary CTA */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-px bg-white/[0.08] flex-1">
              {CTA_TILES.map((tile) => {
                const Icon = tile.icon;
                const inner = (
                  <>
                    <Icon
                      className={cn(
                        'w-6 h-6 transition-transform duration-200 group-hover:scale-110',
                        tile.accentClass
                      )}
                    />
                    <span className="text-xs font-medium text-zinc-300 group-hover:text-white transition-colors">
                      {tile.label}
                    </span>
                  </>
                );

                return tile.external ? (
                  <a
                    key={tile.label}
                    href={tile.to}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex flex-col items-center justify-center gap-3 px-4 py-8 sm:py-10 bg-[#0B0D12] hover:bg-[#121620] transition-colors text-center"
                  >
                    {inner}
                  </a>
                ) : (
                  <Link
                    key={tile.label}
                    to={tile.to}
                    className="group flex flex-col items-center justify-center gap-3 px-4 py-8 sm:py-10 bg-[#0B0D12] hover:bg-[#121620] transition-colors text-center"
                  >
                    {inner}
                  </Link>
                );
              })}
            </div>

            <Link
              to="/calendar"
              className="group hover-slide-fill [--slide-bg:rgba(164,255,240,0.12)] border-t border-white/[0.08] bg-[#0B0D12] px-6 py-5 flex items-center justify-center gap-2.5 text-sm font-medium text-[#A4FFF0] hover:text-white transition-colors"
            >
              <CalendarDaysIcon className="w-4 h-4 shrink-0" />
              <span>Open Interactive Calendar</span>
              <ArrowUpRightIcon className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
