import { Link } from 'react-router-dom';
import { ArrowLeftIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Button } from '../../components/ui/Button';

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center text-center min-h-[50vh] gap-5 py-12">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/40">
        <ExclamationTriangleIcon className="w-8 h-8" />
      </div>

      <div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-2">
          404
        </h1>
        <h2 className="text-lg font-medium text-slate-600 dark:text-slate-400">
          Halaman Tidak Ditemukan
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-500 mt-1 max-w-sm">
          Rute yang Anda cari tidak tersedia atau telah dipindahkan.
        </p>
      </div>

      <Link to="/">
        <Button variant="primary" leftIcon={<ArrowLeftIcon />}>
          Kembali ke Beranda
        </Button>
      </Link>
    </div>
  );
}
