import { Link } from 'react-router-dom';
import { ArrowLeftIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Button } from '../../components/ui/Button';

export function NotFoundPage() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        minHeight: '50vh',
        gap: '1.25rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '4rem',
          height: '4rem',
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'var(--warning-light)',
          color: 'var(--warning)',
        }}
      >
        <ExclamationTriangleIcon style={{ width: '2.25rem', height: '2.25rem' }} />
      </div>

      <div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>404</h1>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
          Halaman Tidak Ditemukan
        </h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem', maxWidth: '400px' }}>
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
