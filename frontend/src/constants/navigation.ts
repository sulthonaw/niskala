export interface NavLinkConfig {
  path: string;
  label: string;
  shortLabel: string;
  description: string;
}

export const APP_NAV_LINKS: NavLinkConfig[] = [
  {
    path: '/',
    label: 'OVERVIEW',
    shortLabel: 'OVERVIEW',
    description: 'Harmonized anomaly calendar & answer cards',
  },
  {
    path: '/catalog',
    label: 'VALIDATION',
    shortLabel: 'VALIDATION',
    description: 'District telemetry matrix & SiPongi checks',
  },
  {
    path: '/about',
    label: 'METHODOLOGY',
    shortLabel: 'METHOD',
    description: 'Harmonization pipeline & design tokens',
  },
];
