import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-monochrome-cosmos text-white antialiased overflow-x-clip">
      <Navbar />

      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 pt-28 md:pt-20 pb-6 min-w-0">
        <Outlet />
      </main>

      <footer className="border-t border-white/[0.08] py-4 px-4 sm:px-6">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-zinc-500 text-center sm:text-left">
          <span>NISKALA · West Kalimantan Harmonized Hotspot Anomaly Calendar (2002–2026)</span>
          <span className="font-mono">NOAA-20 Equivalent · 2003–2025 LOYO Baseline</span>
        </div>
      </footer>
    </div>
  );
}
