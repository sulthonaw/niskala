import { useEffect, useRef, useState } from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { cn } from '../../../utils/formatters';

const GRID_COLS = 90;
const GRID_ROWS = 30;
const CYCLE_MS = 6800;
const SWEEP_MS = 3800;
const RESET_MS = 6000;

/**
 * 90×30 fine-grain geographic mosaic of the Indonesian Archipelago (94.6°E–141.4°E, 5.9°N–10.6°S).
 * '.' = ocean, '#' = Indonesian landmass, 'K' = West Kalimantan (target province).
 */
const INDONESIA_MOSAIC: readonly string[] = [
  '.###......................................................................................',
  '..#####...................................................................................',
  '...#####.................................###..............................................',
  '....#####................................###..............................................',
  '....######..............................####..............................................',
  '.....######............................######.............................................',
  '......#######..........................######.............................................',
  '.......#######........................#######.............#....###........................',
  '........########...........KKKKKKKKKK########...###########....###........................',
  '.........########..........KKKKKKKKKK#######....##########.....###........................',
  '..........########.........KKKKKKKKK########....###............###........................',
  '..........########..........KKKKKKK########.....##.....#........#.......###...............',
  '...........########.........KKKKKK#########.....#######...............######..............',
  '...........##########........KKKK#########......######................######.......#......',
  '............###########......KKK##########.....#####..................#######...#######...',
  '.............##########..#....K###########.....#####....................######.##########.',
  '..............########...#....############.....######.......###.#####.....###############.',
  '..............########...............####......###.###......###..#####.....##############.',
  '...............#######.........................###..##.......................############.',
  '................######.........................###....#........................##########.',
  '.................####...........................##................................#######.',
  '...................##..............................................................######.',
  '.....................#####..........................................................#####.',
  '....................###############.................................................#####.',
  '......................###############...............................................#####.',
  '...........................###########...............................................####.',
  '................................##########.......######..............................####.',
  '........................................##.####.#######.................................#.',
  '...............................................#.........##...............................',
  '...............................................###.....###................................',
];

const CORE_ANOMALY_LIST: ReadonlyArray<[number, number]> = [
  [29, 12],
  [30, 12],
  [30, 13],
  [31, 13],
  [30, 14],
  [31, 14],
];

const PERIMETER_ANOMALY_LIST: ReadonlyArray<[number, number]> = [
  [28, 11],
  [29, 11],
  [30, 11],
  [31, 11],
  [28, 12],
  [31, 12],
  [32, 12],
  [29, 13],
  [32, 13],
  [32, 14],
  [30, 15],
  [31, 15],
];

const ANOMALY_TRIGGER_COL = 31;

type ScanPhase = 'scanning' | 'detected' | 'resetting';

function fillCell(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  fill: string,
  stroke?: string
) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, size, size);
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.5, y + 0.5, Math.max(0, size - 1), Math.max(0, size - 1));
  }
}

/**
 * Hardware-accelerated <canvas> 90×30 orbital scanner mapped to the Indonesian archipelago.
 * Pre-renders the static map to an offscreen buffer and pauses automatically off-screen.
 */
export function SensorSwathMatrix() {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [phase, setPhase] = useState<ScanPhase>(() => {
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return 'detected';
    }
    return 'scanning';
  });

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrapper || !canvas) return undefined;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return undefined;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const baseBuffer = document.createElement('canvas');
    const scannedBuffer = document.createElement('canvas');
    const baseCtx = baseBuffer.getContext('2d', { alpha: false });
    const scannedCtx = scannedBuffer.getContext('2d', { alpha: false });
    if (!baseCtx || !scannedCtx) return undefined;

    let cssW = 0;
    let cssH = 0;
    let dpr = 1;
    let gap = 2;
    let cellSize = 10;
    let offsetX = 0;

    const buildBuffers = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      cssW = wrapper.clientWidth;
      if (cssW <= 0) return;

      gap = cssW >= 640 ? 2 : 1;
      cellSize = Math.max(3, (cssW - gap * (GRID_COLS - 1)) / GRID_COLS);
      const gridW = GRID_COLS * cellSize + (GRID_COLS - 1) * gap;
      offsetX = (cssW - gridW) / 2;
      cssH = Math.ceil(GRID_ROWS * cellSize + (GRID_ROWS - 1) * gap);

      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      canvas.style.height = `${cssH}px`;

      baseBuffer.width = canvas.width;
      baseBuffer.height = canvas.height;
      scannedBuffer.width = canvas.width;
      scannedBuffer.height = canvas.height;

      baseCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      scannedCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      baseCtx.fillStyle = '#090d13';
      baseCtx.fillRect(0, 0, cssW, cssH);
      scannedCtx.fillStyle = '#090d13';
      scannedCtx.fillRect(0, 0, cssW, cssH);

      for (let r = 0; r < GRID_ROWS; r += 1) {
        const row = INDONESIA_MOSAIC[r];
        const y = r * (cellSize + gap);
        for (let c = 0; c < GRID_COLS; c += 1) {
          const x = offsetX + c * (cellSize + gap);
          const ch = row[c];
          if (ch === 'K') {
            fillCell(baseCtx, x, y, cellSize, '#122028', 'rgba(164,255,240,0.28)');
            fillCell(scannedCtx, x, y, cellSize, 'rgba(164,255,240,0.22)', 'rgba(164,255,240,0.55)');
          } else if (ch === '#') {
            fillCell(baseCtx, x, y, cellSize, '#101822', 'rgba(255,255,255,0.09)');
            fillCell(scannedCtx, x, y, cellSize, '#182433', 'rgba(255,255,255,0.16)');
          } else {
            fillCell(baseCtx, x, y, cellSize, '#06090f', 'rgba(255,255,255,0.02)');
            fillCell(scannedCtx, x, y, cellSize, '#06090f', 'rgba(255,255,255,0.02)');
          }
        }
      }
    };

    const renderFrame = (scanCol: number, currentPhase: ScanPhase, beamProgress: number | null) => {
      if (cssW <= 0 || cssH <= 0) return;

      // 1. Blit unscanned archipelago base buffer
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.drawImage(baseBuffer, 0, 0);

      const isResetting = currentPhase === 'resetting';

      // 2. Blit already-scanned strip via single GPU drawImage copy
      if (!isResetting && scanCol >= 0) {
        const maxCol = Math.min(GRID_COLS - 1, scanCol);
        const clipCssW =
          maxCol >= GRID_COLS - 1
            ? cssW
            : Math.min(cssW, offsetX + (maxCol + 1) * (cellSize + gap));
        const clipPx = Math.max(0, Math.round(clipCssW * dpr));
        if (clipPx > 0) {
          ctx.drawImage(scannedBuffer, 0, 0, clipPx, canvas.height, 0, 0, clipPx, canvas.height);
        }
      }
      ctx.restore();

      if (!isResetting && scanCol >= 0) {
        const maxCol = Math.min(GRID_COLS - 1, scanCol);
        const trailStart = Math.max(0, maxCol - 3);

        // 3. Draw only active 4-col sweep trail (at most 120 tiny rects)
        if (beamProgress !== null) {
          for (let c = trailStart; c <= maxCol; c += 1) {
            const x = offsetX + c * (cellSize + gap);
            for (let r = 0; r < GRID_ROWS; r += 1) {
              const ch = INDONESIA_MOSAIC[r][c];
              const y = r * (cellSize + gap);
              if (ch === '#' || ch === 'K') {
                fillCell(ctx, x, y, cellSize, 'rgba(164,255,240,0.24)', 'rgba(164,255,240,0.6)');
              } else {
                fillCell(ctx, x, y, cellSize, 'rgba(164,255,240,0.05)');
              }
            }
          }
        }

        // 4. Draw West Kalimantan anomaly cells (only 18 cells)
        for (const [c, r] of PERIMETER_ANOMALY_LIST) {
          if (c <= maxCol) {
            fillCell(
              ctx,
              offsetX + c * (cellSize + gap),
              r * (cellSize + gap),
              cellSize,
              'rgba(255,156,51,0.35)',
              'rgba(255,156,51,0.65)'
            );
          }
        }
        for (const [c, r] of CORE_ANOMALY_LIST) {
          if (c <= maxCol) {
            fillCell(
              ctx,
              offsetX + c * (cellSize + gap),
              r * (cellSize + gap),
              cellSize,
              'rgba(229,72,77,0.92)',
              '#FF787D'
            );
          }
        }
      }

      // 5. Crisp orbital sweep beam
      if (beamProgress !== null) {
        const beamW = cssW >= 640 ? 96 : 64;
        const beamX = -cssW * 0.06 + beamProgress * (cssW * 1.12);
        const grad = ctx.createLinearGradient(beamX - beamW, 0, beamX, 0);
        grad.addColorStop(0, 'rgba(164,255,240,0)');
        grad.addColorStop(0.7, 'rgba(164,255,240,0.05)');
        grad.addColorStop(1, 'rgba(164,255,240,0.16)');
        ctx.fillStyle = grad;
        ctx.fillRect(beamX - beamW, 0, beamW, cssH);

        ctx.fillStyle = 'rgba(164,255,240,0.6)';
        ctx.fillRect(beamX - 1, 0, 1.25, cssH);
      }
    };

    buildBuffers();

    const resizeObserver = new ResizeObserver(() => {
      buildBuffers();
      if (prefersReduced) {
        renderFrame(GRID_COLS - 1, 'detected', null);
      }
    });
    resizeObserver.observe(wrapper);

    if (prefersReduced) {
      renderFrame(GRID_COLS - 1, 'detected', null);
      return () => resizeObserver.disconnect();
    }

    let rafId = 0;
    let isVisible = true;
    let startTime = 0;
    let lastPhase: ScanPhase = 'scanning';

    const tick = (now: number) => {
      if (!isVisible) {
        rafId = 0;
        return;
      }

      if (!startTime) startTime = now;
      const elapsed = (now - startTime) % CYCLE_MS;

      let nextCol = GRID_COLS;
      let nextPhase: ScanPhase = 'scanning';
      let beamProgress: number | null = null;

      if (elapsed < SWEEP_MS) {
        beamProgress = elapsed / SWEEP_MS;
        nextCol = Math.min(GRID_COLS - 1, Math.floor(beamProgress * GRID_COLS));
        nextPhase = nextCol >= ANOMALY_TRIGGER_COL ? 'detected' : 'scanning';
      } else if (elapsed < RESET_MS) {
        nextCol = GRID_COLS;
        nextPhase = 'detected';
      } else {
        nextCol = -1;
        nextPhase = 'resetting';
      }

      renderFrame(nextCol, nextPhase, beamProgress);

      if (nextPhase !== lastPhase) {
        lastPhase = nextPhase;
        setPhase(nextPhase);
      }

      rafId = requestAnimationFrame(tick);
    };

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        isVisible = Boolean(entry?.isIntersecting);
        if (isVisible && rafId === 0) {
          rafId = requestAnimationFrame(tick);
        }
      },
      { rootMargin: '120px 0px' }
    );
    intersectionObserver.observe(wrapper);

    rafId = requestAnimationFrame(tick);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
    };
  }, []);

  const showAlert = phase === 'detected';

  return (
    <div className="relative py-5 sm:py-6 border-y border-white/[0.08]">
      {/* Instrument Header Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3.5">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 font-brand text-[10px] sm:text-[11px] uppercase tracking-[0.14em]">
          <span className="text-[#A4FFF0]">INDONESIA ORBITAL SWATH</span>
          <span className="text-zinc-600">/</span>
          <span className="text-zinc-400">MODIS + VIIRS 90×30 ARCHIPELAGO MOSAIC</span>
        </div>

        <div className="flex items-center gap-3 font-brand text-[10px] uppercase tracking-[0.12em]">
          {phase === 'detected' && (
            <span className="inline-flex items-center gap-1.5 text-white">
              <ExclamationTriangleIcon className="w-3.5 h-3.5 text-[#FF9C33] shrink-0" />
              ALERT · WEST KALIMANTAN LOCKED
            </span>
          )}
          {phase === 'scanning' && (
            <span className="inline-flex items-center gap-1.5 text-[#A4FFF0]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#A4FFF0]" />
              SCANNING ARCHIPELAGO
            </span>
          )}
          {phase === 'resetting' && (
            <span className="inline-flex items-center gap-1.5 text-zinc-500">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
              NEXT ORBIT PASS
            </span>
          )}
        </div>
      </div>

      {/* Archipelago Mosaic focal plane */}
      <div className="relative">
        <div className="relative overflow-hidden rounded-2xl bg-[#090d13] border border-white/[0.11] p-2 sm:p-3.5">
          {/* Top coordinate bar overlay */}
          <div className="pointer-events-none flex items-center justify-between text-[9px] font-brand uppercase tracking-[0.14em] text-zinc-500 pb-2 px-0.5">
            <span>94.6°E · SABANG</span>
            <span className="text-[#A4FFF0]/80">TARGET · KALIMANTAN BARAT</span>
            <span>141.4°E · MERAUKE</span>
          </div>

          <div ref={wrapperRef} className="w-full">
            <canvas
              ref={canvasRef}
              role="img"
              aria-label="Orbital scan across Indonesian archipelago locking onto fire anomaly in West Kalimantan"
              className="block w-full"
            />
          </div>
        </div>

        {/* Glassmorphic West Kalimantan Alert docked in the empty SW Indian Ocean corner */}
        <div
          aria-live="polite"
          className={cn(
            'pointer-events-none mt-2.5 sm:mt-0 sm:absolute sm:z-30 sm:left-4 sm:bottom-4 transition-all duration-300 ease-out',
            showAlert ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1.5'
          )}
        >
          <div className="inline-flex items-center gap-2.5 rounded-xl bg-[#0e1012]/95 border border-white/[0.16] px-3.5 py-2 shadow-xl">
            <ExclamationTriangleIcon className="w-4 h-4 text-[#FF9C33] shrink-0" />
            <div className="flex flex-col leading-tight">
              <span className="font-brand text-[10px] uppercase tracking-[0.14em] text-white">
                WEST KALIMANTAN ANOMALY LOCKED
              </span>
              <span className="font-brand text-[10px] uppercase tracking-[0.1em] text-white mt-0.5">
                KETAPANG · 8.1× ABOVE BASELINE
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Harmonization Legend & Caption */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3.5 text-xs text-zinc-400">
        <p className="max-w-2xl leading-relaxed">
          MODIS Aqua (<span className="font-medium text-zinc-200">1 km</span>) counts are scaled by
          district factor <span className="font-medium text-[#A4FFF0]">r</span> to match VIIRS NOAA-20
          (<span className="font-medium text-zinc-200">375 m</span>), isolating real fire spikes in
          West Kalimantan without sensor-change jumps.
        </p>

        <div className="flex flex-wrap items-center gap-3.5 font-brand text-[10px] uppercase tracking-[0.1em] shrink-0">
          <span className="inline-flex items-center gap-1.5 text-zinc-400">
            <span className="w-2.5 h-2.5 rounded-[2px] bg-[#101822] border border-white/20" />
            Indonesia
          </span>
          <span className="inline-flex items-center gap-1.5 text-[#A4FFF0]">
            <span className="w-2.5 h-2.5 rounded-[2px] bg-[#A4FFF0]/22 border border-[#A4FFF0]/60" />
            Kalbar
          </span>
          <span className="inline-flex items-center gap-1.5 text-[#FF6060]">
            <span className="w-2.5 h-2.5 rounded-[2px] bg-[#E5484D]/90 border border-[#FF787D]" />
            Anomaly
          </span>
        </div>
      </div>
    </div>
  );
}
