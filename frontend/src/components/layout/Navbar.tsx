import { Link } from 'react-router-dom';
import { useNavigationLinks } from '../../hooks/useNavigationLinks';
import { cn } from '../../utils/formatters';
import { Badge } from '../ui/Badge';

export function Navbar() {
  const { navItems } = useNavigationLinks();

  return (
    <header className="sticky top-0 z-50 bg-[#050507]/85 backdrop-blur-xl border-b border-white/[0.08]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-5 min-w-0">
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <span className="text-lg font-bold tracking-[0.22em] text-white group-hover:text-[#A4FFF0] transition-colors">
              NISKALA
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[11px] font-medium tracking-wider transition-all duration-150 border',
                  item.isActive
                    ? 'bg-white/[0.18] text-white border-white/[0.15]'
                    : 'bg-white/[0.04] text-zinc-300 border-white/[0.1] hover:bg-white/[0.1] hover:text-white'
                )}
              >
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="mint" showDot className="hidden sm:inline-flex">
            <span className="text-zinc-400">Region:</span>
            <span className="text-white">West Kalimantan</span>
          </Badge>
          <Badge variant="neutral" className="font-mono">
            Data through 2026-11-13
          </Badge>
        </div>
      </div>

      {/* Mobile Pill Nav */}
      <nav className="md:hidden flex items-center gap-2 px-4 pb-3 overflow-x-auto">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              'px-3.5 py-1 rounded-full text-[11px] font-medium tracking-wider whitespace-nowrap border transition-colors',
              item.isActive
                ? 'bg-white/[0.18] text-white border-white/[0.16]'
                : 'bg-white/[0.04] text-zinc-300 border-white/[0.1]'
            )}
          >
            {item.shortLabel}
          </Link>
        ))}
      </nav>
    </header>
  );
}
