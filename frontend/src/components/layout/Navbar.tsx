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
        return <HomeIcon className="w-4 h-4" />;
      case '/about':
        return <InformationCircleIcon className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2.5 font-bold text-lg text-slate-900 dark:text-slate-100 group"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 text-white shadow-xs transition-transform group-hover:scale-105">
            <SparklesIcon className="w-4 h-4" />
          </div>
          <span className="tracking-tight">Niskala</span>
        </Link>

        <nav className="flex items-center gap-1.5">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                item.isActive
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
              }`}
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
