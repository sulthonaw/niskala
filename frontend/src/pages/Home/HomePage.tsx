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
  // Logic Layer: state & business operations isolated in custom hook
  const { count, increment, decrement, reset, isEven, isPositive, isZero } = useCounter({
    initialValue: 0,
    min: -10,
    max: 50,
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Hero Welcome Section */}
      <section style={{ textAlign: 'center', padding: '1rem 0' }}>
        <div style={{ display: 'inline-flex', marginBottom: '1rem' }}>
          <Badge variant="primary">
            <SparklesIcon style={{ width: '0.875rem', height: '0.875rem' }} />
            <span>Frontend Architecture Ready</span>
          </Badge>
        </div>
        <h1
          style={{
            fontSize: '2.5rem',
            fontWeight: 700,
            letterSpacing: '-0.025em',
            marginBottom: '0.75rem',
            color: 'var(--text-primary)',
          }}
        >
          Google Sans & Modular Architecture
        </h1>
        <p
          style={{
            fontSize: '1.125rem',
            color: 'var(--text-secondary)',
            maxWidth: '640px',
            margin: '0 auto',
          }}
        >
          Struktur frontend terpisah secara bersih antara <strong>UI (Presentational)</strong>,{' '}
          <strong>Logic (Custom Hooks)</strong>, dan <strong>Routes</strong> menggunakan{' '}
          <code>@heroicons/react</code>.
        </p>
      </section>

      {/* Grid of Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {/* Card 1: Interactive UI vs Logic Demo */}
        <Card
          title="Demo Pemisahan UI vs Logic"
          subtitle="Komponen Button murni menerima props, state dikelola oleh useCounter"
          icon={<ChartBarIcon style={{ width: '1.25rem', height: '1.25rem' }} />}
          footer={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Status State:</span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
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
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', padding: '1rem 0' }}>
            <div
              style={{
                fontSize: '3.5rem',
                fontWeight: 700,
                color: 'var(--primary)',
                lineHeight: 1,
              }}
            >
              {count}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
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
          icon={<RectangleStackIcon style={{ width: '1.25rem', height: '1.25rem' }} />}
        >
          <ul
            style={{
              listStyle: 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Badge variant="success">Font</Badge>
              <span style={{ fontSize: '0.925rem' }}>Google Sans terintegrasi via Google Fonts / CDN</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Badge variant="success">Ikon</Badge>
              <span style={{ fontSize: '0.925rem' }}>Heroicons v2 resmi terpasang (@heroicons/react)</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Badge variant="success">Router</Badge>
              <span style={{ fontSize: '0.925rem' }}>react-router-dom v7 dengan modular routing</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Badge variant="success">Struktur</Badge>
              <span style={{ fontSize: '0.925rem' }}>Separation of Concerns: UI, Hooks, Pages, Routes</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
