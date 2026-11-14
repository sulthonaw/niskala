import {
  CodeBracketIcon,
  CpuChipIcon,
  FolderIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { Card } from '../../components/ui/Card';

export function AboutPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header>
        <h1
          style={{
            fontSize: '2rem',
            fontWeight: 700,
            marginBottom: '0.5rem',
            color: 'var(--text-primary)',
          }}
        >
          Arsitektur Frontend
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Dokumentasi pembagian tanggung jawab antara UI, Logic, dan Routing.
        </p>
      </header>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem',
        }}
      >
        <Card
          title="1. UI Layer (src/components/ui/)"
          subtitle="Presentational Components"
          icon={<FolderIcon style={{ width: '1.25rem', height: '1.25rem' }} />}
        >
          <p style={{ fontSize: '0.925rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Komponen murni (dumb components) seperti <code>Button</code>, <code>Card</code>, dan{' '}
            <code>Badge</code>. Komponen-komponen ini tidak memiliki business logic ataupun
            side-effects, hanya menerima props dan render visual secara konsisten.
          </p>
        </Card>

        <Card
          title="2. Logic Layer (src/hooks/)"
          subtitle="Business Rules & State"
          icon={<CpuChipIcon style={{ width: '1.25rem', height: '1.25rem' }} />}
        >
          <p style={{ fontSize: '0.925rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Seluruh state management, kalkulasi, validasi, dan API call diisolasi ke dalam custom
            hooks (contoh: <code>useCounter</code>, <code>useNavigationLinks</code>). Kode logika
            dapat diuji (unit tested) secara independen tanpa ketergantungan DOM.
          </p>
        </Card>

        <Card
          title="3. Routing Layer (src/routes/)"
          subtitle="Pohon Navigasi Terpusat"
          icon={<CodeBracketIcon style={{ width: '1.25rem', height: '1.25rem' }} />}
        >
          <p style={{ fontSize: '0.925rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Konfigurasi rute diatur secara deklaratif melalui <code>react-router-dom</code> di dalam{' '}
            <code>src/routes/AppRoutes.tsx</code>, membungkus setiap halaman dengan{' '}
            <code>MainLayout</code> dan menyediakan fallback 404 otomatis.
          </p>
        </Card>

        <Card
          title="4. Tipografi & Ikon"
          subtitle="Google Sans & Heroicons"
          icon={<InformationCircleIcon style={{ width: '1.25rem', height: '1.25rem' }} />}
        >
          <p style={{ fontSize: '0.925rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Tipografi menggunakan <strong>Google Sans</strong> melalui webfont CDN berkecepatan tinggi,
            serta iconset SVG modern dari <strong>Heroicons</strong> (outline & solid) untuk antarmuka yang
            presisi.
          </p>
        </Card>
      </div>
    </div>
  );
}
