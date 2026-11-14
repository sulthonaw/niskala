export interface NavLinkConfig {
  path: string;
  label: string;
  shortLabel: string;
  description: string;
}

export const APP_NAV_LINKS: NavLinkConfig[] = [
  {
    path: '/',
    label: 'HOME',
    shortLabel: 'HOME',
    description: 'Overview, harmonization & data sources',
  },
  {
    path: '/calendar',
    label: 'CALENDAR',
    shortLabel: 'CALENDAR',
    description: 'Interactive hotspot anomaly calendar & district rankings',
  },
];
