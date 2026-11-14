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
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 font-brand text-[10px] sm:text-[11px] uppercase tracking-[0.14em]">
          <span className="text-[#A4FFF0]">UNIFIED SENSOR SWATH</span>
          <span className="text-zinc-600">/</span>
          <span className="text-zinc-400">MODIS + VIIRS 28×6 FOCAL PLANE</span>
        </div>

        <div className="flex items-center gap-3 font-brand text-[10px] uppercase tracking-[0.12em]">
          {scanState.phase === 'detected' && (
            <span className="inline-flex items-center gap-1.5 text-[#FF6060]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF6060]" />
              ALERT · ANOMALY LOCKED
            </span>
          )}
          {scanState.phase === 'scanning' && (
            <span className="inline-flex items-center gap-1.5 text-[#A4FFF0]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#A4FFF0]" />
              SCANNING SECTOR
            </span>
          )}
          {scanState.phase === 'resetting' && (
            <span className="inline-flex items-center gap-1.5 text-zinc-500">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
              NEXT ORBIT PASS
            </span>
          )}
        </div>
      </div>

      {/* Single Unified Micro-Cell Matrix */}
      <div className="relative">
        <div
          ref={containerRef}
          className="relative overflow-hidden rounded-2xl bg-[#0e1012]/80 backdrop-blur-md border border-white/[0.11] p-2.5 sm:p-3.5"
        >
          {/* Smooth Hardware-Accelerated Vertical Scan Beam */}
          <div
            ref={beamRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-24 z-20 transition-opacity duration-200"
            style={{ opacity: 0 }}
          >
            <div className="w-full h-full bg-gradient-to-r from-transparent via-[#A4FFF0]/[0.04] to-[#A4FFF0]/[0.12] border-r border-[#A4FFF0]/45" />
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
                      'relative aspect-square rounded-[3px] border transition-colors duration-200',
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
                        className="pointer-events-none absolute inset-[2px] rounded-[2px] border border-white/35"
                      />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Clean Glassmorphic Anomaly Callout */}
        <div
          aria-live="polite"
          className={cn(
            'pointer-events-none mt-2.5 sm:mt-0 sm:absolute sm:z-30 sm:left-4 sm:bottom-4 transition-all duration-300 ease-out',
            showAlert ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1.5'
          )}
        >
          <div className="inline-flex items-center gap-2.5 rounded-xl bg-[#0e1012]/90 backdrop-blur-md border border-[#E5484D]/45 px-3.5 py-2 shadow-xl">
            <span className="w-2 h-2 rounded-full bg-[#FF6060] shrink-0" />
            <div className="flex flex-col leading-tight">
              <span className="font-brand text-[10px] uppercase tracking-[0.14em] text-[#FF6060]">
                ANOMALY ZONE DETECTED
              </span>
              <span className="font-brand text-[10px] uppercase tracking-[0.1em] text-zinc-300 mt-0.5">
                KETAPANG · 8.1× ABOVE BASELINE
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Harmonization Legend & Caption */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-4 text-xs text-zinc-400">
        <p className="max-w-2xl leading-relaxed">
          MODIS Aqua (<span className="font-medium text-zinc-200">1 km</span>) counts are scaled by
          district factor <span className="font-medium text-[#A4FFF0]">r</span> to match VIIRS NOAA-20
          (<span className="font-medium text-zinc-200">375 m</span>), so real fire spikes stand out
          without sensor-change jumps.
        </p>

        <div className="flex items-center gap-3.5 font-brand text-[10px] uppercase tracking-[0.1em] shrink-0">
          <span className="inline-flex items-center gap-1.5 text-zinc-400">
            <span className="w-2.5 h-2.5 rounded-[3px] bg-[#0b1118] border border-white/20" />
            Nominal
          </span>
          <span className="inline-flex items-center gap-1.5 text-[#A4FFF0]">
            <span className="w-2.5 h-2.5 rounded-[3px] bg-[#A4FFF0]/25 border border-[#A4FFF0]/60" />
            Sweep
          </span>
          <span className="inline-flex items-center gap-1.5 text-[#FF6060]">
            <span className="w-2.5 h-2.5 rounded-[3px] bg-[#E5484D]/85 border border-[#FF787D]" />
            Anomaly
          </span>
        </div>
      </div>
    </div>
  );
}
