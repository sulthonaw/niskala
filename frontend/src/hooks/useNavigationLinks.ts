import { useLocation } from 'react-router-dom';
import { APP_NAV_LINKS } from '../constants/navigation';

export interface NavItem {
  path: string;
  label: string;
  shortLabel: string;
  description: string;
  isActive: boolean;
}

export function useNavigationLinks(): { navItems: NavItem[] } {
  const location = useLocation();

  const navItems: NavItem[] = APP_NAV_LINKS.map((link) => ({
    ...link,
    isActive: location.pathname === link.path,
  }));

  return { navItems };
}
