import { Link } from 'react-router-dom';
import {
  ArrowUpRightIcon,
  CalendarDaysIcon,
  ChartBarSquareIcon,
  GlobeAltIcon,
  MapPinIcon,
} from '@heroicons/react/24/solid';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useNiskalaData } from '../../hooks/useNiskalaData';

const CAPABILITIES = [
  {
    code: '01 · HARMONIZATION',
    title: 'One Sensor Scale',
    body: 'Scales earlier MODIS Aqua (1 km) hotspot counts to match VIIRS NOAA-20 (375 m) using a district-specific multiplier shrunk toward the province average for stability.',
    icon: GlobeAltIcon,
  },
  {
    code: '02 · BASELINE',
    title: 'Fair Monthly Normals',
    body: 'Compares each month against the 2003–2025 average for that same district and calendar month, leaving out the year being scored so extreme seasons do not skew their own baseline.',
    icon: CalendarDaysIcon,
  },
  {
    code: '03 · RANKING',
    title: '14-District Detail',
    body: 'Breaks West Kalimantan down into 14 districts so high-anomaly activity in areas like Ketapang or Kayong Utara stands out even when province-wide totals look ordinary.',
    icon: MapPinIcon,
  },
  {
    code: '04 · VALIDATION',
    title: 'Ground Validation',
    body: "Cross-checks satellite hotspot counts against official burned-area records from Indonesia's Ministry of Forestry (SiPongi, 2016–2026) and flags years where smoke may hide ground fires.",
    icon: ChartBarSquareIcon,
  },
];

const SENSOR_STACK = [
  {
    name: 'MODIS Aqua (and Terra)',
    resolution: '1 km nominal',
    window: 'Jul 2002 – 2026',
    role: "Main historical record from July 2002, scaled to NOAA-20 using each district's overlap ratio. Early Terra counts (Jan 2001–Jun 2002) appear in raw totals only.",
  },
  {
    name: 'VIIRS NOAA-20',
    resolution: '375 m high-res',
    window: 'Apr 2018 – 2026',
    role: 'Modern reference sensor. Its finer pixels catch smaller peatland and agricultural fires that 1 km sensors often miss.',
  },
  {
    name: 'SiPongi Burned Area',
    resolution: 'Hectares burned',
    window: '2016 – 2026',
    role: 'Official national fire monitoring records used to check satellite trends (0.90 provincial Spearman correlation).',
  },
];

export function AboutPage() {
  const { dataset } = useNiskalaData();
  const meta = dataset?.meta;

  return (
    <div className="flex flex-col gap-10 pb-8">
      {/* Editorial Header */}
      <header className="flex flex-col gap-3 max-w-3xl">
        <span className="font-brand text-[11px] uppercase tracking-[0.18em] text-[#A4FFF0]">
          ABOUT NISKALA
        </span>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
          <span className="font-brand tracking-[0.12em] mr-2">NISKALA</span>
          <span className="text-zinc-400 font-normal">—</span> Clear Fire History for West
          Kalimantan
        </h1>
        <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
          Named after the Sanskrit word for <em>steady and unshakeable</em>, Niskala turns 24+
          years of NASA satellite hotspot counts into a simple monthly calendar. It puts older and
          newer sensors on the same scale so you can easily tell a normal dry season from an
          unusually severe fire month.
        </p>
      </header>

      {/* Why It Exists + Key Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-7 flex">
          <Card title="Why Harmonization Matters" className="w-full">
            <div className="flex flex-col gap-3 text-xs sm:text-sm text-zinc-300 leading-relaxed">
              <p>
                In 2018, NASA began publishing higher-resolution{' '}
                <strong className="text-white">VIIRS NOAA-20 (375 m)</strong> detections alongside{' '}
                <strong className="text-white">MODIS (1 km)</strong>. Because sharper pixels spot
                smaller fires, raw hotspot counts jumped even when fire activity on the ground did
                not.
              </p>
              <p>
                If you compare a recent fire season directly against 2006 or 2015 without adjusting
                for that sensor change, older years look artificially quiet. Niskala converts
                pre-2018 MODIS Aqua counts to the NOAA-20 scale so all 14 West Kalimantan districts
                share one consistent timeline from July 2002 through 2026.
              </p>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-5 flex">
          <Card title="Operational Footprint" className="w-full">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="hover-row-glide rounded-lg bg-white/[0.025] border border-white/[0.08] hover:border-[#A4FFF0]/35 p-3">
                <div className="font-brand text-[10px] uppercase tracking-[0.1em] text-zinc-400">
                  Coverage
                </div>
                <div className="text-base font-semibold text-[#A4FFF0] mt-0.5">
                  {meta ? `${meta.districts.length} Regions` : '15 Regions'}
                </div>
                <div className="text-[11px] text-zinc-400 mt-0.5">Province + 14 districts</div>
              </div>

              <div className="hover-row-glide rounded-lg bg-white/[0.025] border border-white/[0.08] hover:border-[#A4FFF0]/35 p-3">
                <div className="font-brand text-[10px] uppercase tracking-[0.1em] text-zinc-400">
                  Archive Window
                </div>
                <div className="text-base font-semibold text-white mt-0.5">Jul 2002 – 2026</div>
                <div className="text-[11px] text-zinc-400 mt-0.5">
                  293 calibrated months (311 total)
                </div>
              </div>

              <div className="hover-row-glide rounded-lg bg-white/[0.025] border border-white/[0.08] hover:border-[#A4FFF0]/35 p-3">
                <div className="font-brand text-[10px] uppercase tracking-[0.1em] text-zinc-400">
                  LOYO Median Error
                </div>
                <div className="text-base font-semibold text-white mt-0.5">
                  {meta
                    ? `${meta.harmonization.validation_loyo_median_abs_pct_error.district_ratio}%`
                    : '19.6%'}
                </div>
                <div className="text-[11px] text-zinc-400 mt-0.5">
                  District ratio (vs. 27.6% single)
                </div>
              </div>

              <div className="hover-row-glide rounded-lg bg-white/[0.025] border border-white/[0.08] hover:border-[#A4FFF0]/35 p-3">
                <div className="font-brand text-[10px] uppercase tracking-[0.1em] text-zinc-400">
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
          <span className="font-brand text-[11px] uppercase tracking-[0.18em] text-[#A4FFF0]">
            CAPABILITIES
          </span>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">
            What Niskala Does
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
                  <span className="font-brand text-[11px] tracking-[0.16em] text-[#A4FFF0]">
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
      <Card title="Data Sources">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SENSOR_STACK.map((src) => (
            <div
              key={src.name}
              className="hover-row-glide rounded-lg bg-white/[0.025] border border-white/[0.08] hover:border-[#A4FFF0]/35 p-4 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-white">{src.name}</h3>
                <span className="font-brand text-[10px] uppercase tracking-[0.1em] text-[#A4FFF0] px-2.5 py-0.5 rounded-full bg-[#A4FFF0]/[0.07] border border-[#A4FFF0]/25">
                  {src.resolution}
                </span>
              </div>
              <div className="font-brand text-[10px] uppercase tracking-[0.1em] text-zinc-400">
                {src.window}
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">{src.role}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Bottom CTA Navigation */}
      <Card title="Explore the Data">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl leading-relaxed">
            Open the Anomaly Calendar to inspect monthly counts, check the 15-region calibration
            table, or read the full methodology in Docs.
          </p>
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link to="/calendar">
              <Button variant="mint" size="md" rightIcon={<ArrowUpRightIcon />}>
                Open Calendar
              </Button>
            </Link>
            <Link to="/docs">
              <Button variant="outline" size="md">
                Calibration Table
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
