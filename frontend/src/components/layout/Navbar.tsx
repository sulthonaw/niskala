import { Link } from 'react-router-dom';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';
import { GitHubIcon } from '../ui/GitHubIcon';
import { GITHUB_REPO_URL } from '../../constants/docsSections';
import { useNavigationLinks } from '../../hooks/useNavigationLinks';
import { cn } from '../../utils/formatters';

export function Navbar() {
  const { navItems } = useNavigationLinks();
  const isCalendarPage = navItems.some(
    (item) => item.path === '/calendar' && item.isActive
  );

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-[#080a0c]/92 backdrop-blur-xl border-b border-white/[0.08]">
      <div className="relative z-10 max-w-[1440px] mx-auto">
        {/* Desktop & Top Mobile Row */}
        <div className="px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          {/* Left: Brand Identity */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <img
              src="/favicon-earth.png"
              alt="NISKALA Earth"
              className="w-6 h-6 shrink-0 transition-transform duration-300 group-hover:scale-105"
            />
            <span className="font-brand text-base sm:text-lg font-bold tracking-[0.22em] text-white group-hover:text-[#A4FFF0] transition-colors">
              NISKALA
            </span>
          </Link>

          {/* Center: Full-Height Unwrapped Nav (Active Bar Lights Up Navbar Bottom Border) */}
          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-stretch h-full gap-7"
          >
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'relative flex items-center px-1 text-xs font-medium tracking-[0.12em] transition-colors duration-200',
                  item.isActive
                    ? 'text-[#A4FFF0]'
                    : 'hover-slide-underline text-zinc-400 hover:text-zinc-100 [--underline-color:rgba(164,255,240,0.75)]'
                )}
              >
                <span>{item.label}</span>
                {item.isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute bottom-[-1px] inset-x-0 h-[2px] bg-[#A4FFF0]"
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* Right: Clean Actions (GitHub + Quick Calendar Jump) */}
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noreferrer"
              aria-label="Open NISKALA GitHub Repository"
              title="GitHub Repository"
              className="hover-slide-fill [--slide-bg:rgba(164,255,240,0.1)] inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-white/[0.12] bg-white/[0.03] hover:border-[#A4FFF0]/45 text-xs font-medium text-zinc-300 hover:text-white"
            >
              <GitHubIcon className="w-4 h-4 text-zinc-200" />
              <span className="hidden lg:inline">GitHub</span>
            </a>

            {!isCalendarPage && (
              <Link
                to="/calendar"
                className="group hover-slide-fill [--slide-bg:rgba(255,255,255,0.28)] hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-[#A4FFF0] text-[#050507] text-xs font-semibold tracking-wide"
              >
                <CalendarDaysIcon className="w-4 h-4 stroke-[2] transition-transform duration-200 group-hover:translate-x-0.5" />
                <span>Open Calendar</span>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Unwrapped Nav Row (Active Bar Lights Up Navbar Bottom Border) */}
        <nav
          aria-label="Mobile navigation"
          className="md:hidden flex items-center justify-between gap-2 px-4 border-t border-white/[0.06] overflow-x-auto"
        >
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'relative py-2.5 text-[10px] font-medium tracking-[0.06em] whitespace-nowrap transition-colors',
                item.isActive
                  ? 'text-[#A4FFF0]'
                  : 'hover-slide-underline text-zinc-400 hover:text-zinc-100'
              )}
            >
              <span>{item.shortLabel}</span>
              {item.isActive && (
                <span
                  aria-hidden="true"
                  className="absolute bottom-[-1px] inset-x-0 h-[2px] bg-[#A4FFF0]"
                />
              )}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
