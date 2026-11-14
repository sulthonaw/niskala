import type { AnomalyClass } from '../types/niskala';

export const MONTH_SHORT_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

export const CLASS_COLOR: Record<AnomalyClass, string> = {
  [-2]: '#256abf',
  [-1]: '#9ec5f4',
  [0]: '#f0efec',
  [1]: '#f4b4a2',
  [2]: '#e34948',
  [3]: '#8e1f1f',
};

export const CLASS_SHORT_LABEL: Record<AnomalyClass, string> = {
  [-2]: 'Much below normal',
  [-1]: 'Below normal',
  [0]: 'Near normal',
  [1]: 'Above normal',
  [2]: 'Well above normal',
  [3]: 'Extreme',
};

export const CLASS_LEGEND_ITEMS: Array<{
  cls: AnomalyClass;
  label: string;
  color: string;
}> = [
  { cls: -2, label: 'Much below (<0.33x)', color: '#256abf' },
  { cls: -1, label: 'Below (0.33-0.67x)', color: '#9ec5f4' },
  { cls: 0, label: 'Near normal (0.67-1.5x)', color: '#f0efec' },
  { cls: 1, label: 'Above (1.5-3x)', color: '#f4b4a2' },
  { cls: 2, label: 'Well above (3-6x)', color: '#e34948' },
  { cls: 3, label: 'Extreme (>6x)', color: '#8e1f1f' },
];

export function isLightSwatch(cls: AnomalyClass | null): boolean {
  return cls === -1 || cls === 0 || cls === 1;
}
