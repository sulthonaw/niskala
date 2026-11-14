import {
  ArrowPathIcon,
  ChartBarIcon,
  MinusIcon,
  PlusIcon,
  RectangleStackIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useCounter } from '../../hooks/useCounter';

export function HomePage() {
  const { count, increment, decrement, reset, isEven, isPositive, isZero } = useCounter({
    initialValue: 0,
    min: -10,
    max: 50,
  });

  return (
    <div className="flex flex-col gap-8">
      {/* Hero Welcome Section */}
      <section className="text-center py-4">
        <div className="inline-flex mb-3">
          <Badge variant="primary">
            <SparklesIcon className="w-3.5 h-3.5" />
            <span>Tailwind CSS v4 + Google Sans</span>
          </Badge>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-3">
          Modular Frontend Architecture
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Struktur frontend terpisah secara bersih antara <strong>UI (Presentational)</strong>,{' '}
          <strong>Logic (Custom Hooks)</strong>, dan <strong>Routes</strong> dengan utilitas{' '}
          <strong>Tailwind CSS v4</strong>.
        </p>
      </section>

      {/* Grid of Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Interactive UI vs Logic Demo */}
        <Card
          title="Demo Pemisahan UI vs Logic"
          subtitle="Komponen Button murni menerima props, state dikelola oleh useCounter"
          icon={<ChartBarIcon className="w-5 h-5" />}
          footer={
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-slate-500 dark:text-slate-400">Status State:</span>
              <div className="flex items-center gap-2">
                <Badge variant={isEven ? 'success' : 'default'}>
                  {isEven ? 'Genap' : 'Ganjil'}
                </Badge>
                <Badge variant={isPositive ? 'primary' : isZero ? 'default' : 'warning'}>
                  {isPositive ? 'Positif' : isZero ? 'Nol' : 'Negatif'}
                </Badge>
              </div>
            </div>
          }
        >
          <div className="flex flex-col items-center gap-6 py-4">
            <div className="text-6xl font-bold text-blue-600 dark:text-blue-400 tabular-nums tracking-tight">
              {count}
            </div>

            <div className="flex items-center gap-3 flex-wrap justify-center">
              <Button
                variant="outline"
                onClick={decrement}
                leftIcon={<MinusIcon />}
              >
                Kurang
              </Button>
              <Button
                variant="primary"
                onClick={increment}
                leftIcon={<PlusIcon />}
              >
                Tambah
              </Button>
              <Button
                variant="ghost"
                onClick={reset}
                leftIcon={<ArrowPathIcon />}
              >
                Reset
              </Button>
            </div>
          </div>
        </Card>

        {/* Card 2: Feature Overview */}
        <Card
          title="Komponen & Fitur Terpasang"
          subtitle="Teknologi yang telah terkonfigurasi di proyek"
          icon={<RectangleStackIcon className="w-5 h-5" />}
        >
          <ul className="flex flex-col gap-3">
            <li className="flex items-center gap-3">
              <Badge variant="success">Styling</Badge>
              <span className="text-sm text-slate-700 dark:text-slate-300">
                Tailwind CSS v4 via <code>@tailwindcss/vite</code>
              </span>
            </li>
            <li className="flex items-center gap-3">
              <Badge variant="success">Font</Badge>
              <span className="text-sm text-slate-700 dark:text-slate-300">
                Google Sans terkonfigurasi dalam <code>@theme</code>
              </span>
            </li>
            <li className="flex items-center gap-3">
              <Badge variant="success">Ikon</Badge>
              <span className="text-sm text-slate-700 dark:text-slate-300">
                Heroicons v2 resmi terpasang (@heroicons/react)
              </span>
            </li>
            <li className="flex items-center gap-3">
              <Badge variant="success">Router</Badge>
              <span className="text-sm text-slate-700 dark:text-slate-300">
                react-router-dom v7 dengan modular routing
              </span>
            </li>
            <li className="flex items-center gap-3">
              <Badge variant="success">Arsitektur</Badge>
              <span className="text-sm text-slate-700 dark:text-slate-300">
                Separation of Concerns: UI, Hooks, Pages, Routes
              </span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
