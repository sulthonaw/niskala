export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

export function formatDistanceKm(km: number): string {
  if (km >= 1_000_000) {
    return `${(km / 1_000_000).toFixed(2)}M km`;
  }
  if (km >= 1_000) {
    return `${(km / 1_000).toFixed(1)}K km`;
  }
  return `${km.toFixed(0)} km`;
}

export function formatVelocity(kmPerSec: number): string {
  return `${kmPerSec.toFixed(2)} km/s`;
}

export function formatUtcClock(date: Date): string {
  return date.toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
