import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { useNiskalaData } from '../../hooks/useNiskalaData';

export function AboutPage() {
  const { dataset } = useNiskalaData();
  const harm = dataset?.meta.harmonization;

  return (
    <div className="flex flex-col gap-6">
      <header>
        <Badge variant="mint" showDot className="mb-2">
          METHODOLOGY &amp; DESIGN SYSTEM
        </Badge>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
          Niskala Harmonization &amp; UI Architecture
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Static React + Vite + TypeScript frontend consuming pre-computed pipeline outputs.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card title="Sensor Harmonization Formula">
          <div className="flex flex-col gap-2 text-xs text-zinc-300 leading-relaxed">
            <p>
              <strong className="text-white">Reference:</strong>{' '}
              {harm?.reference ?? 'VIIRS NOAA-20 (375 m)'}
            </p>
            <p>
              <strong className="text-white">MODIS Reference:</strong>{' '}
              {harm?.modis_reference ?? 'MODIS Aqua (1 km)'}
            </p>
            <p>
              <strong className="text-white">Overlap Window:</strong>{' '}
              {harm?.overlap ?? '2018-04 to 2025-12'}
            </p>
            <code className="mt-1 rounded-xl bg-black/50 border border-white/[0.08] p-3 font-mono text-[#A4FFF0]">
              {harm?.formula ?? 'H = Aqua x r_district before 2018-04; H = NOAA-20 from 2018-04'}
            </code>
          </div>
        </Card>

        <Card title="Baseline & Anomaly Scale">
          <div className="flex flex-col gap-2 text-xs text-zinc-300 leading-relaxed">
            <p>
              <strong className="text-white">Method:</strong>{' '}
              {dataset?.meta.baseline_method ??
                'leave-one-year-out mean per district and calendar month'}
            </p>
            <p>
              <strong className="text-white">Baseline Years:</strong>{' '}
              {dataset ? `${dataset.meta.baseline_years[0]}–${dataset.meta.baseline_years[1]}` : '2003–2025'}
            </p>
            <p>
              <strong className="text-white">Data Generated:</strong>{' '}
              {dataset?.meta.generated_local ?? '—'}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
