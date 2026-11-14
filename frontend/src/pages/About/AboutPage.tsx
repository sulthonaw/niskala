import {
  CodeBracketIcon,
  CpuChipIcon,
  FolderIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { Card } from '../../components/ui/Card';

export function AboutPage() {
  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-2">
          Arsitektur Frontend
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
          Dokumentasi pembagian tanggung jawab antara UI, Logic, Routing, dan Styling Tailwind CSS v4.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card
          title="1. UI Layer (src/components/ui/)"
          subtitle="Presentational Components"
          icon={<FolderIcon className="w-5 h-5" />}
        >
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Komponen murni (dumb components) seperti <code>Button</code>, <code>Card</code>, dan{' '}
            <code>Badge</code>. Menggunakan utility classes Tailwind CSS v4, tidak memuat business
            logic, dan hanya menerima props.
          </p>
        </Card>

        <Card
          title="2. Logic Layer (src/hooks/)"
          subtitle="Business Rules & State"
          icon={<CpuChipIcon className="w-5 h-5" />}
        >
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Seluruh state management, kalkulasi, validasi, dan API call diisolasi ke dalam custom
            hooks (seperti <code>useCounter</code>, <code>useNavigationLinks</code>) sehingga dapat
            diuji secara mandiri tanpa ketergantungan UI.
          </p>
        </Card>

        <Card
          title="3. Routing Layer (src/routes/)"
          subtitle="Pohon Navigasi Terpusat"
          icon={<CodeBracketIcon className="w-5 h-5" />}
        >
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Konfigurasi rute diatur secara deklaratif melalui <code>react-router-dom</code> di dalam{' '}
            <code>src/routes/AppRoutes.tsx</code>, membungkus setiap halaman dengan{' '}
            <code>MainLayout</code> dan menyediakan fallback 404 otomatis.
          </p>
        </Card>

        <Card
          title="4. Styling & Tipografi"
          subtitle="Tailwind CSS v4 & Google Sans"
          icon={<SparklesIcon className="w-5 h-5" />}
        >
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Didukung oleh <strong>Tailwind CSS v4</strong> berbasis engine Oxide berkecepatan tinggi,
            font <strong>Google Sans</strong> via directive <code>@theme</code>, serta ikon vektor
            SVG dari <strong>Heroicons</strong>.
          </p>
        </Card>
      </div>
    </div>
  );
}
