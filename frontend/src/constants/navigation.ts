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
    description: 'Planetary overview & telemetry showcase',
  },
  {
    path: '/about',
    label: 'ABOUT',
    shortLabel: 'ABOUT',
    description: 'What NISKALA is, mission & satellite architecture',
  },
  {
    path: '/calendar',
    label: 'CALENDAR',
    shortLabel: 'CALENDAR',
    description: 'Harmonized anomaly calendar & answer cards',
  },
  {
    path: '/catalog',
    label: 'VALIDATION',
    shortLabel: 'VALIDATION',
    description: 'District telemetry matrix & SiPongi checks',
  },
  {
    path: '/docs',
    label: 'DOCS',
    shortLabel: 'DOCS',
    description: 'Documentation, harmonization formula & repository',
  },
];
