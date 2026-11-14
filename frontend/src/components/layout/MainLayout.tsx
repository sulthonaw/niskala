import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export function MainLayout() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main
        style={{
          flex: 1,
          maxWidth: '1100px',
          width: '100%',
          margin: '0 auto',
          padding: '2rem 1.5rem',
        }}
      >
        <Outlet />
      </main>
      <footer
        style={{
          borderTop: '1px solid var(--border-color)',
          padding: '1.5rem',
          textAlign: 'center',
          fontSize: '0.875rem',
          color: 'var(--text-muted)',
          backgroundColor: 'var(--bg-secondary)',
        }}
      >
        <p>Niskala Frontend • Google Sans • UI & Logic Separated</p>
      </footer>
    </div>
  );
}
