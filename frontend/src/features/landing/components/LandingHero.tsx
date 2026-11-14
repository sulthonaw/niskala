import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/solid';
import earthFaviconGlobeImg from '../../../assets/earth-favicon-globe.webp';
import { cn } from '../../../utils/formatters';
import { Button } from '../../../components/ui/Button';

interface TelemetrySlide {
  id: string;
  tag: string;
  metrics: Array<{ label: string; value: string; accent?: 'mint' | 'coral' | 'amber' }>;
}

const TELEMETRY_SLIDES: TelemetrySlide[] = [
  {
    id: 'mission',
    tag: 'Mission Overview',
    metrics: [
      { label: 'REGION', value: 'West Kalimantan' },
      { label: 'ARCHIVE', value: 'Jul 2002 – 2026' },
      { label: 'BASELINE', value: '2003–2025 LOYO' },
      { label: 'COVERAGE', value: '15 Regions', accent: 'mint' },
    ],
  },
  {
    id: 'oct2026',
    tag: 'Oct 2026 Anomaly',
    metrics: [
      { label: 'PROVINCE', value: '9,767 Hotspots' },
      { label: 'SEVERITY', value: '5.2× Normal', accent: 'amber' },
      { label: 'PEAK DISTRICT', value: 'Ketapang (8.1×)', accent: 'coral' },
      { label: 'SENSOR', value: 'VIIRS NOAA-20' },
    ],
  },
  {
    id: 'validation',
    tag: 'Calibration & Fit',
    metrics: [
      { label: 'REFERENCE', value: 'NOAA-20 (375 m)' },
      { label: 'METHOD', value: 'MODIS Aqua × r' },
      { label: 'SIPONGI FIT', value: 'Spearman 0.90', accent: 'mint' },
      { label: 'LOYO ERROR', value: '19.6% Median' },
    ],
  },
];

export function LandingHero() {
  const [slideIdx, setSlideIdx] = useState(0);
  const activeSlide = TELEMETRY_SLIDES[slideIdx];

  const handlePrev = () => {
    setSlideIdx((prev) => (prev - 1 + TELEMETRY_SLIDES.length) % TELEMETRY_SLIDES.length);
  };

  const handleNext = () => {
    setSlideIdx((prev) => (prev + 1) % TELEMETRY_SLIDES.length);
  };

  return (
    <section className="relative min-h-[min(740px,calc(100vh-8rem))] flex flex-col items-center justify-center gap-7 sm:gap-9 pt-4 pb-8 overflow-hidden">
      {/* Subtle Concentric Orbital Rings behind Planet */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <div className="w-[460px] h-[460px] sm:w-[680px] sm:h-[680px] rounded-full border border-white/[0.06] absolute" />
        <div className="w-[620px] h-[620px] sm:w-[900px] sm:h-[900px] rounded-full border border-white/[0.04] absolute" />
        <div className="w-[540px] h-[540px] sm:w-[780px] sm:h-[780px] rounded-full border border-dashed border-[#A4FFF0]/12 animate-orbit-spin absolute" />
      </div>

      {/* Top Editorial Telemetry Eyebrow */}
      <div className="relative z-20 animate-hero-reveal flex flex-col sm:flex-row items-center gap-1 sm:gap-3 font-brand text-[11px] sm:text-xs uppercase tracking-[0.18em] sm:tracking-[0.22em] text-zinc-400 text-center px-3">
        <span className="text-zinc-300">West Kalimantan Fire Readiness</span>
      </div>

      {/* Central Visual Composition: Giant NISKALA Wordmark + Overlapping HD Earth Globe */}
      <div className="relative w-full flex flex-col items-center justify-center my-4 sm:my-6">
        {/* Giant Background Wordmark */}
        <h1
          className={cn(
            'font-brand animate-hero-reveal select-none text-center font-light uppercase text-white/90 leading-none',
            'text-[clamp(3.3rem,14.5vw,9.8rem)] tracking-[0.22em] pl-[0.22em]',
            'relative z-10 -mb-10 sm:-mb-20 md:-mb-24'
          )}
        >
          NISKALA
        </h1>

        {/* HD NASA Blue Marble Earth Globe matching favicon style */}
        <div className="relative z-20 animate-hero-reveal-delay-1">
          <div className="relative w-[270px] h-[270px] sm:w-[370px] sm:h-[370px] md:w-[430px] md:h-[430px] animate-globe-float">
            <img
              src={earthFaviconGlobeImg}
              alt="NASA Suomi NPP Blue Marble Earth globe"
              className="w-full h-full object-contain select-none drop-shadow-[0_24px_56px_rgba(0,0,0,0.85)]"
            />
          </div>
        </div>

        {/* Floating Bottom 4-Column Telemetry Dock with < > Arrows */}
        <div className="relative z-30 -mt-10 sm:-mt-14 w-full max-w-4xl px-2 animate-hero-reveal-delay-2">
          <div className="flex items-center justify-center gap-2.5 sm:gap-4">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous telemetry slide"
              className="group hover-slide-fill [--slide-bg:rgba(164,255,240,0.12)] w-10 h-10 rounded-md bg-[#0b0d11]/90 border border-white/[0.12] hover:border-[#A4FFF0]/45 flex items-center justify-center text-zinc-300 hover:text-white cursor-pointer shrink-0"
            >
              <ChevronLeftIcon className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
            </button>

            <div className="relative overflow-hidden flex-1 rounded-2xl bg-[#0e1012]/80 backdrop-blur-md border border-white/[0.11] px-4 sm:px-7 py-3.5 shadow-[0_18px_48px_rgba(0,0,0,0.65)]">
              <div
                key={activeSlide.id}
                className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5 animate-hero-reveal"
              >
                {activeSlide.metrics.map((m) => (
                  <div key={m.label} className="flex flex-col gap-0.5 min-w-0">
                    <span className="font-brand text-[10px] uppercase tracking-[0.12em] text-zinc-400">
                      {m.label}
                    </span>
                    <span
                      className={cn(
                        'text-xs sm:text-sm font-medium truncate',
                        m.accent === 'mint' && 'text-[#A4FFF0]',
                        m.accent === 'coral' && 'text-[#FF6060]',
                        m.accent === 'amber' && 'text-[#FF9C33]',
                        !m.accent && 'text-white'
                      )}
                    >
                      {m.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleNext}
              aria-label="Next telemetry slide"
              className="group hover-slide-fill [--slide-bg:rgba(164,255,240,0.12)] w-10 h-10 rounded-md bg-[#0b0d11]/90 border border-white/[0.12] hover:border-[#A4FFF0]/45 flex items-center justify-center text-zinc-300 hover:text-white cursor-pointer shrink-0"
            >
              <ChevronRightIcon className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </button>
          </div>

          {/* Slide Bar Indicators */}
          <div className="flex items-center justify-center gap-2 mt-3.5">
            {TELEMETRY_SLIDES.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSlideIdx(idx)}
                aria-label={`Show ${s.tag}`}
                className={cn(
                  'h-[2px] transition-all duration-300 cursor-pointer',
                  idx === slideIdx ? 'w-7 bg-[#A4FFF0]' : 'w-3 bg-white/20 hover:bg-white/45'
                )}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Primary Hero Actions */}
      <div className="relative z-20 flex flex-wrap items-center justify-center gap-3 animate-hero-reveal-delay-2">
        <Link to="/calendar">
          <Button variant="mint" size="lg" rightIcon={<ArrowUpRightIcon />}>
            Launch Anomaly Calendar
          </Button>
        </Link>
        <Link to="/docs">
          <Button variant="outline" size="lg">
            View Calibration &amp; Docs
          </Button>
        </Link>
      </div>
    </section>
  );
}
