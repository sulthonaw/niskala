import { Link } from 'react-router-dom';
import {
  HomeIcon,
  InformationCircleIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { useNavigationLinks } from '../../hooks/useNavigationLinks';

export function Navbar() {
  const { navItems } = useNavigationLinks();

  const getIcon = (path: string) => {
    switch (path) {
      case '/':
        return <HomeIcon style={{ width: '1.25rem', height: '1.25rem' }} />;
      case '/about':
        return <InformationCircleIcon style={{ width: '1.25rem', height: '1.25rem' }} />;
      default:
        return null;
    }
  };

  return (
    <header
      style={{
        borderBottom: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-primary)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '1rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.625rem',
            fontWeight: 700,
            fontSize: '1.25rem',
            color: 'var(--text-primary)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '2.25rem',
              height: '2.25rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
            }}
          >
            <SparklesIcon style={{ width: '1.25rem', height: '1.25rem' }} />
          </div>
          <span>Niskala</span>
        </Link>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 0.875rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: item.isActive ? 'var(--primary)' : 'var(--text-secondary)',
                backgroundColor: item.isActive ? 'var(--primary-light)' : 'transparent',
                transition: 'all 0.15s ease',
              }}
            >
              {getIcon(item.path)}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
