export function SatelliteIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <g transform="rotate(45 12 10.5)">
        <rect x="11.2" y="2.5" width="1.6" height="3.4" rx="0.8" />
        <rect x="9.5" y="5.5" width="5" height="8.5" rx="1.5" />
        <rect x="3.5" y="8.8" width="17" height="1.4" rx="0.7" />
        <rect x="2.2" y="7" width="5.8" height="5" rx="1.1" />
        <rect x="16" y="7" width="5.8" height="5" rx="1.1" />
        <circle cx="12" cy="14.9" r="1.4" />
      </g>
      <path d="M3 15.9A5.1 5.1 0 0 1 8.1 21H6.5A3.5 3.5 0 0 0 3 17.5v-1.6Zm0-3.5A8.6 8.6 0 0 1 11.6 21H10a7 7 0 0 0-7-7v-1.6Z" />
    </svg>
  );
}
