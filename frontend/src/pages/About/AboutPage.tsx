import { Link } from 'react-router-dom';
import {
  ArrowUpRightIcon,
  CalendarDaysIcon,
  ChartBarSquareIcon,
  GlobeAltIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useNiskalaData } from '../../hooks/useNiskalaData';

const CAPABILITIES = [
  {
    code: '01 · HARMONIZATION',
    title: 'Multi-Satellite Continuity',
    body: 'Reconciles legacy MODIS Aqua (1 km) thermal detections with VIIRS NOAA-20 (375 m) using district-level empirical Bayes shrinkage ratios so 2002–2026 baselines stay physically consistent.',
    icon: GlobeAltIcon,
  },
  {
    code: '02 · BASELINE',
    title: 'Leave-One-Year-Out Climatology',
    body: 'Measures every month against its historical 2003–2025 normal per regency and calendar month—preventing wet or extreme drought years from skewing seasonal readiness alerts.',
    icon: CalendarDaysIcon,
  },
  {
    code: '03 · PRIORITIZATION',
    title: '14-Regency Granularity',
    body: 'Surfaces localized hotspots across West Kalimantan regencies—such as Ketapang or Kayong Utara—even when provincial aggregate totals still look relatively calm.',
    icon: MapPinIcon,
  },
  {
    code: '04 · VERIFICATION',
    title: 'Official SiPongi Cross-Check',
    body: 'Benchmarks orbital thermal anomalies against official Ministry of Environment and Forestry (SiPongi) burned-area hectares from 2016–2026, flagging potential smoke-hidden peat fires.',
    icon: ChartBarSquareIcon,
  },
];

const SENSOR_STACK = [
  {
    name: 'MODIS Terra & Aqua',
    resolution: '1 km nominal',
    window: '2002 – 2026',
    role: 'Long-horizon historical anchor scaled via district Aqua-to-NOAA-20 calibration ratios.',
  },
  {
    name: 'VIIRS NOAA-20',
    resolution: '375 m high-res',
    window: '2018-04 – 2026',
    role: 'Primary modern reference sensor capturing smaller peatland and agricultural fire fronts.',
  },
  {
    name: 'KLHK SiPongi Archive',
    resolution: 'Hectares burned',
    window: '2016 – 2026',
    role: 'Ground-reported institutional validation ledger (0.90 provincial Spearman correlation).',
  },
];

export function AboutPage() {
  const { dataset } = useNiskalaData();
  const meta = dataset?.meta;

  return (
    <div className="flex flex-col gap-10 pb-8">
      {/* Editorial Header */}
      <header className="flex flex-col gap-3 max-w-3xl">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#A4FFF0]">
          ABOUT NISKALA
        </span>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
          <span className="font-brand tracking-[0.12em] mr-2">NISKALA</span>
          <span className="text-zinc-400 font-normal">—</span> Temporal Fire Clarity for West
          Kalimantan
        </h1>
        <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
          Derived from the Sanskrit word meaning <em>steady, unshakeable, and enduring</em>,
          NISKALA is a multi-decade NASA Earth Observation anomaly calendar engineered to turn noisy
          orbital hotspot counts into fast, defensible seasonal readiness decisions.
        </p>
      </header>

      {/* Why It Exists + Key Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-7 flex">
          <Card title="Why Harmonization Matters" className="w-full">
            <div className="flex flex-col gap-3 text-xs sm:text-sm text-zinc-300 leading-relaxed">
              <p>
                When NASA launched higher-resolution <strong className="text-white">VIIRS NOAA-20 (375 m)</strong>{' '}
                alongside legacy <strong className="text-white">MODIS (1 km)</strong> sensors in 2018,
                raw unadjusted hotspot counts jumped artificially because sharper pixels detect smaller
                fires.
              </p>
              <p>
                Without cross-sensor calibration, comparing a 2026 dry-season spike against a 2006 or
                2015 baseline produces distorted severity ratios. NISKALA removes that structural
                break so planners across all 14 West Kalimantan regencies inspect one unbroken
                2002–2026 timeline.
              </p>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-5 flex">
          <Card title="Operational Footprint" className="w-full">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="hover-row-glide rounded-lg bg-white/[0.025] border border-white/[0.08] hover:border-[#A4FFF0]/35 p-3">
                <div className="font-mono text-[10px] uppercase tracking-wider text-zinc-400">
                  Coverage
                </div>
                <div className="text-base font-semibold text-[#A4FFF0] mt-0.5">
                  {meta ? `${meta.districts.length} Regions` : '15 Regions'}
                </div>
                <div className="text-[11px] text-zinc-400 mt-0.5">Province + 14 regencies</div>
              </div>

              <div className="hover-row-glide rounded-lg bg-white/[0.025] border border-white/[0.08] hover:border-[#A4FFF0]/35 p-3">
                <div className="font-mono text-[10px] uppercase tracking-wider text-zinc-400">
                  Archive Window
                </div>
                <div className="text-base font-semibold text-white mt-0.5">2002 – 2026</div>
                <div className="text-[11px] text-zinc-400 mt-0.5">311 monthly cells</div>
              </div>

              <div className="hover-row-glide rounded-lg bg-white/[0.025] border border-white/[0.08] hover:border-[#A4FFF0]/35 p-3">
                <div className="font-mono text-[10px] uppercase tracking-wider text-zinc-400">
                  LOYO Median Error
                </div>
                <div className="text-base font-semibold text-white mt-0.5">
                  {meta
                    ? `${meta.harmonization.validation_loyo_median_abs_pct_error.district_ratio}%`
                    : '19.6%'}
                </div>
                <div className="text-[11px] text-zinc-400 mt-0.5">District ratio model</div>
              </div>

              <div className="hover-row-glide rounded-lg bg-white/[0.025] border border-white/[0.08] hover:border-[#A4FFF0]/35 p-3">
                <div className="font-mono text-[10px] uppercase tracking-wider text-zinc-400">
                  SiPongi Fit
                </div>
                <div className="text-base font-semibold text-[#A4FFF0] mt-0.5">
                  {meta
                    ? `Spearman ${meta.sipongi.spearman_province_2016_2025.toFixed(2)}`
                    : 'Spearman 0.90'}
                </div>
                <div className="text-[11px] text-zinc-400 mt-0.5">2016–2025 rank correlation</div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* 4 Core Pillars */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#A4FFF0]">
            CAPABILITIES
          </span>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">
            Built for Emergency Planners &amp; Researchers
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
          {CAPABILITIES.map((item) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.code}
                title={item.title}
                headerAction={
                  <span className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.1] flex items-center justify-center text-[#A4FFF0]">
                    <Icon className="w-4 h-4" />
                  </span>
                }
              >
                <div className="flex flex-col gap-3">
                  <span className="font-mono text-[11px] tracking-widest text-[#A4FFF0]">
                    {item.code}
                  </span>
                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">{item.body}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Sensor & Data Sources */}
      <Card title="Earth Observation & Ground Validation Stack">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SENSOR_STACK.map((src) => (
            <div
              key={src.name}
              className="hover-row-glide rounded-lg bg-white/[0.025] border border-white/[0.08] hover:border-[#A4FFF0]/35 p-4 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-white">{src.name}</h3>
                <span className="font-mono text-[10px] text-[#A4FFF0] px-2 py-0.5 rounded bg-[#A4FFF0]/[0.07] border border-[#A4FFF0]/25">
                  {src.resolution}
                </span>
              </div>
              <div className="font-mono text-[11px] text-zinc-400">{src.window}</div>
              <p className="text-xs text-zinc-300 leading-relaxed">{src.role}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Bottom CTA Navigation */}
      <Card title="Start Exploring NISKALA">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl leading-relaxed">
            Jump into the interactive Anomaly Calendar, inspect the 15-region calibration matrix, or
            read the full harmonization documentation.
          </p>
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link to="/calendar">
              <Button variant="mint" size="md" rightIcon={<ArrowUpRightIcon />}>
                Open Calendar
              </Button>
            </Link>
            <Link to="/catalog">
              <Button variant="outline" size="md">
                Validation Matrix
              </Button>
            </Link>
            <Link to="/docs">
              <Button variant="outline" size="md">
                Read Docs
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
