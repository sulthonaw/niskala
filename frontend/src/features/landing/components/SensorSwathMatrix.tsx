import { useEffect, useRef, useState } from 'react';
import { cn } from '../../../utils/formatters';

const GRID_COLS = 28;
const GRID_ROWS = 6;
const CYCLE_MS = 6400;
const SWEEP_MS = 3500;
const RESET_MS = 5600;

// Hotspot target cluster revealed strictly as the orbital scan crosses it
const CORE_ANOMALY_CELLS = new Set(['18-2', '19-2', '18-3', '19-3']);
const PERIMETER_ANOMALY_CELLS = new Set([
  '17-2',
  '20-2',
  '18-1',
  '19-1',
  '17-3',
  '20-3',
  '18-4',
  '19-4',
]);
const ANOMALY_TRIGGER_COL = 19;

type ScanPhase = 'scanning' | 'detected' | 'resetting';

interface ScanState {
  scanCol: number;
  phase: ScanPhase;
}

/**
 * Single unified NASA orbital focal-plane scanner with progressive cell acquisition
 * and a restrained tactical anomaly alert triggered only when the beam hits the cluster.
 */
export function SensorSwathMatrix() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const beamRef = useRef<HTMLDivElement | null>(null);

  const [scanState, setScanState] = useState<ScanState>(() => {
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return { scanCol: GRID_COLS - 1, phase: 'detected' };
    }
    return { scanCol: -1, phase: 'scanning' };
  });

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return undefined;
    }

    let rafId = 0;
    let startTime = 0;

    const frame = (now: number) => {
      if (!startTime) startTime = now;
      const elapsed = (now - startTime) % CYCLE_MS;

      let nextCol = GRID_COLS;
      let nextPhase: ScanPhase = 'scanning';

      if (elapsed < SWEEP_MS) {
        const progress = elapsed / SWEEP_MS;
        nextCol = Math.min(GRID_COLS - 1, Math.floor(progress * GRID_COLS));
        nextPhase = nextCol >= ANOMALY_TRIGGER_COL ? 'detected' : 'scanning';

        if (beamRef.current && containerRef.current) {
          const width = containerRef.current.clientWidth;
          const beamX = -width * 0.08 + progress * (width * 1.12);
          beamRef.current.style.opacity = '1';
          beamRef.current.style.transform = `translate3d(${beamX.toFixed(1)}px, 0, 0)`;
        }
      } else if (elapsed < RESET_MS) {
        nextCol = GRID_COLS;
        nextPhase = 'detected';
        if (beamRef.current) {
          beamRef.current.style.opacity = '0';
        }
      } else {
        nextCol = -1;
        nextPhase = 'resetting';
        if (beamRef.current) {
          beamRef.current.style.opacity = '0';
        }
      }

      setScanState((prev) =>
        prev.scanCol === nextCol && prev.phase === nextPhase
          ? prev
          : { scanCol: nextCol, phase: nextPhase }
      );

      rafId = requestAnimationFrame(frame);
    };

    rafId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const showAlert = scanState.phase === 'detected';

  return (
    <div className="relative py-6 sm:py-8 border-y border-white/[0.08]">
      {/* Instrument Header Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.18em]">
          <span className="text-[#A4FFF0]">UNIFIED SENSOR SWATH</span>
          <span className="text-zinc-600">/</span>
          <span className="text-zinc-400">MODIS + VIIRS 28×6 FOCAL PLANE</span>
        </div>

        <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.14em]">
          {scanState.phase === 'detected' && (
            <span className="inline-flex items-center gap-1.5 text-[#FF6060]">
              <span className="w-1.5 h-1.5 bg-[#FF6060]" />
              ALERT · ANOMALY LOCKED
            </span>
          )}
          {scanState.phase === 'scanning' && (
            <span className="inline-flex items-center gap-1.5 text-[#A4FFF0]">
              <span className="w-1.5 h-1.5 bg-[#A4FFF0]" />
              SCANNING SECTOR
            </span>
          )}
          {scanState.phase === 'resetting' && (
            <span className="inline-flex items-center gap-1.5 text-zinc-500">
              <span className="w-1.5 h-1.5 bg-zinc-500" />
              NEXT ORBIT PASS
            </span>
          )}
        </div>
      </div>

      {/* Single Unified Micro-Cell Matrix */}
      <div className="relative">
        <div
          ref={containerRef}
          className="relative overflow-hidden bg-[#04070c] border border-white/[0.09] p-2 sm:p-2.5"
        >
          {/* Smooth Hardware-Accelerated Vertical Scan Beam */}
          <div
            ref={beamRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-24 z-20 transition-opacity duration-200"
            style={{ opacity: 0 }}
          >
            <div className="w-full h-full bg-gradient-to-r from-transparent via-[#A4FFF0]/[0.07] to-[#A4FFF0]/[0.24] border-r border-[#A4FFF0]/80" />
          </div>

          <div
            className="grid gap-[3px] sm:gap-1"
            style={{
              gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))`,
            }}
          >
            {Array.from({ length: GRID_ROWS }).map((_, rowIdx) =>
              Array.from({ length: GRID_COLS }).map((__, colIdx) => {
                const key = `${colIdx}-${rowIdx}`;
                const isResetting = scanState.phase === 'resetting';
                const hasScanned = !isResetting && colIdx <= scanState.scanCol;
                const isCore = CORE_ANOMALY_CELLS.has(key);
                const isPerimeter = PERIMETER_ANOMALY_CELLS.has(key);

                const inScanTrail =
                  !isResetting &&
                  scanState.scanCol >= 0 &&
                  colIdx <= scanState.scanCol &&
                  colIdx >= scanState.scanCol - 2;

                const lockCore = hasScanned && isCore;
                const lockWarm = hasScanned && isPerimeter;

                return (
                  <div
                    key={key}
                    className={cn(
                      'relative aspect-square rounded-[1px] border transition-colors duration-200',
                      lockCore
                        ? 'bg-[#E5484D]/85 border-[#FF787D]'
                        : lockWarm
                          ? 'bg-[#FF9C33]/25 border-[#FF9C33]/55'
                          : inScanTrail
                            ? 'bg-[#A4FFF0]/[0.14] border-[#A4FFF0]/45'
                            : 'bg-[#0b1118] border-white/[0.06]'
                    )}
                  >
                    {lockCore && (
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-[2px] border border-white/35"
                      />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Restrained Film-Style Compact Anomaly Alert (docked cleanly below grid on mobile, overlaid bottom-left on sm+) */}
        <div
          aria-live="polite"
          className={cn(
            'pointer-events-none mt-2 sm:mt-0 sm:absolute sm:z-30 sm:left-4 sm:bottom-4 transition-all duration-300 ease-out',
            showAlert ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1.5'
          )}
        >
          <div className="relative inline-flex w-auto items-stretch bg-[#120608]/95 border border-[#E5484D]/75 shadow-lg overflow-hidden">
            {/* Slim Film-Style Diagonal Hazard Stripes (Left) */}
            <span
              aria-hidden="true"
              className="w-2 shrink-0 border-r border-[#E5484D]/35"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(-45deg, rgba(229,72,77,0.85) 0, rgba(229,72,77,0.85) 3px, transparent 3px, transparent 6px)',
              }}
            />

            <div className="flex items-center gap-2.5 px-3 py-1.5">
              {/* Crisp Warning Triangle SVG */}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="w-4 h-4 shrink-0 text-[#FF6060]"
                aria-hidden="true"
              >
                <path
                  d="M12 3.5L21 19.5H3L12 3.5Z"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinejoin="miter"
                />
                <path
                  d="M12 9.5V13.5"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinecap="square"
                />
                <rect x="11.1" y="15.8" width="1.8" height="1.8" fill="currentColor" />
              </svg>

              <div className="flex flex-col leading-tight">
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#FF6060]">
                  DANGER · ANOMALY ZONE
                </span>
                <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-zinc-300 mt-0.5">
                  KETAPANG · 8.1× ABOVE BASELINE
                </span>
              </div>
            </div>

            {/* Slim Film-Style Diagonal Hazard Stripes (Right) */}
            <span
              aria-hidden="true"
              className="w-2 shrink-0 border-l border-[#E5484D]/35"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(-45deg, rgba(229,72,77,0.85) 0, rgba(229,72,77,0.85) 3px, transparent 3px, transparent 6px)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Bottom Harmonization Legend & Caption */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-4 text-xs text-zinc-400">
        <p className="max-w-2xl leading-relaxed">
          MODIS (<span className="font-mono text-zinc-200">1 km</span>) and VIIRS NOAA-20 (
          <span className="font-mono text-zinc-200">375 m</span>) passes converge onto one spatial
          grid using scale factor <span className="font-mono text-[#A4FFF0]">r</span> so true
          thermal spikes stand out cleanly.
        </p>

        <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-wider shrink-0">
          <span className="inline-flex items-center gap-1.5 text-zinc-400">
            <span className="w-2 h-2 bg-[#0b1118] border border-white/20" />
            Nominal
          </span>
          <span className="inline-flex items-center gap-1.5 text-[#A4FFF0]">
            <span className="w-2 h-2 bg-[#A4FFF0]/25 border border-[#A4FFF0]/60" />
            Sweep
          </span>
          <span className="inline-flex items-center gap-1.5 text-[#FF6060]">
            <span className="w-2 h-2 bg-[#E5484D]/85 border border-[#FF787D]" />
            Anomaly
          </span>
        </div>
      </div>
    </div>
  );
}
