import { InformationCircleIcon } from '@heroicons/react/24/outline';
import type { MetaData } from '../../../types/niskala';
import { Card } from '../../../components/ui/Card';

export interface LimitationsFooterCardProps {
  meta: MetaData;
}

export function LimitationsFooterCard({ meta }: LimitationsFooterCardProps) {
  return (
    <Card
      title="Data Limitations & Sources"
      headerAction={
        <InformationCircleIcon className="w-5 h-5 text-zinc-400" />
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
        <ul className="flex flex-col gap-2 text-zinc-300 list-disc pl-4">
          {meta.limitations.map((item) => (
            <li key={item} className="leading-relaxed">
              {item}
            </li>
          ))}
        </ul>

        <div className="flex flex-col justify-between gap-3 rounded-2xl bg-black/40 border border-white/[0.08] p-4">
          <div className="flex flex-col gap-1.5">
            <div className="font-mono text-[11px] uppercase tracking-wider text-zinc-400">
              Official Data Sources
            </div>
            <ul className="flex flex-col gap-1 text-zinc-300">
              {meta.sources.map((src) => (
                <li key={src}>{src}</li>
              ))}
            </ul>
          </div>
          <p className="text-[11px] text-zinc-400 border-t border-white/[0.08] pt-3 leading-relaxed">
            {meta.firms_citation}
          </p>
        </div>
      </div>
    </Card>
  );
}
