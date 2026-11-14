import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useNiskalaData } from '../../hooks/useNiskalaData';
import { formatPeakMonths } from '../../services/niskalaDataService';

export function CatalogPage() {
  const { dataset, loading } = useNiskalaData();

  if (loading || !dataset) {
    return (
      <div className="h-64 rounded-[22px] bg-white/[0.03] border border-white/[0.07]" />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#A4FFF0] mb-1.5">
            CALIBRATION &amp; VALIDATION MATRIX
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
            District Calibration &amp; SiPongi Correlation
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            VIIRS/MODIS shrinkage ratios and 2016–2025 Spearman correlations across all 15 regions.
          </p>
        </div>

        <Link to="/calendar">
          <Button variant="mint" size="sm">
            Back to Anomaly Calendar
          </Button>
        </Link>
      </header>

      <Card title="Regional Calibration Parameters" noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/[0.08] bg-black/40 font-mono text-[11px] uppercase tracking-wider text-zinc-400">
                <th className="py-3 px-4">Region</th>
                <th className="py-3 px-4">Shrunk Ratio</th>
                <th className="py-3 px-4">Raw Ratio</th>
                <th className="py-3 px-4">Normal Peak</th>
                <th className="py-3 px-4">SiPongi Spearman</th>
                <th className="py-3 px-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {dataset.meta.districts.map((dist) => {
                const spearman =
                  dist.slug === 'kalimantan-barat'
                    ? dataset.meta.sipongi.spearman_province_2016_2025
                    : dataset.meta.sipongi.per_district_spearman[dist.name];
                return (
                  <tr
                    key={dist.slug}
                    className="group transition-colors duration-200 hover:bg-white/[0.04]"
                  >
                    <td className="py-3 px-4 font-medium text-white transition-transform duration-200 group-hover:translate-x-1">
                      {dist.name}
                    </td>
                    <td className="py-3 px-4 font-mono text-[#A4FFF0] tabular-nums">
                      {dist.ratio.toFixed(3)}×
                    </td>
                    <td className="py-3 px-4 font-mono text-zinc-400 tabular-nums">
                      {dist.raw_ratio.toFixed(3)}×
                    </td>
                    <td className="py-3 px-4 font-mono text-zinc-300">
                      {formatPeakMonths(dist.peak_months)}
                    </td>
                    <td className="py-3 px-4 font-mono text-zinc-200 tabular-nums">
                      {spearman !== undefined ? spearman.toFixed(2) : '—'}
                    </td>
                    <td className="py-3 px-4">
                      <Link
                        to={`/calendar?region=${dist.slug}&focus=2026-10`}
                        className="hover-slide-underline inline-flex items-center gap-1 pb-0.5 text-[#A4FFF0] hover:text-white font-medium transition-colors"
                      >
                        <span>Inspect</span>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
