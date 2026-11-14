import { useLocation } from 'react-router-dom';

export interface NavItem {
  path: string;
  label: string;
  isActive: boolean;
}

export function useNavigationLinks(): { navItems: NavItem[] } {
  const location = useLocation();

  const links = [
    { path: '/', label: 'Beranda' },
    { path: '/about', label: 'Tentang Arsitektur' },
  ];

  const navItems: NavItem[] = links.map((link) => ({
    ...link,
    isActive: location.pathname === link.path,
  }));

  return { navItems };
}
