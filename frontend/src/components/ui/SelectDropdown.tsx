import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/24/solid';
import { cn } from '../../utils/formatters';

export interface SelectOption {
  value: string;
  label: string;
  hint?: string;
}

export interface SelectDropdownProps {
  id?: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  ariaLabel?: string;
  className?: string;
}

interface MenuPosition {
  left: number;
  width: number;
  top?: number;
  bottom?: number;
}

export function SelectDropdown({
  id,
  value,
  options,
  onChange,
  ariaLabel,
  className = '',
}: SelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<MenuPosition | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const selected = options.find((opt) => opt.value === value) ?? options[0];

  useLayoutEffect(() => {
    if (!open) return undefined;

    const handleReposition = () => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const estimatedHeight = Math.min(options.length * 38 + 12, 288);
      const openUpward = spaceBelow < estimatedHeight && rect.top > spaceBelow;

      setMenuPos(
        openUpward
          ? {
              left: rect.left,
              width: rect.width,
              bottom: window.innerHeight - rect.top + 6,
            }
          : {
              left: rect.left,
              width: rect.width,
              top: rect.bottom + 6,
            }
      );
    };

    handleReposition();
    window.addEventListener('resize', handleReposition);
    window.addEventListener('scroll', handleReposition, true);
    return () => {
      window.removeEventListener('resize', handleReposition);
      window.removeEventListener('scroll', handleReposition, true);
    };
  }, [open, options.length]);

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!containerRef.current?.contains(target) && !menuRef.current?.contains(target)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setOpen((prev) => !prev);
    }
  };

  const listbox =
    open && menuPos && typeof document !== 'undefined'
      ? createPortal(
          <div
            ref={menuRef}
            role="listbox"
            aria-labelledby={id}
            style={{
              position: 'fixed',
              left: `${menuPos.left}px`,
              width: `${menuPos.width}px`,
              top: menuPos.top !== undefined ? `${menuPos.top}px` : undefined,
              bottom: menuPos.bottom !== undefined ? `${menuPos.bottom}px` : undefined,
            }}
            className="z-[9999] rounded-lg border border-white/[0.16] bg-[#0b0d11]/98 backdrop-blur-xl shadow-[0_20px_48px_rgba(0,0,0,0.88)] overflow-hidden"
          >
            <div className="max-h-72 overflow-y-auto py-1">
              {options.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onChange(opt.value);
                      setOpen(false);
                    }}
                    className={cn(
                      'hover-slide-fill w-full flex items-center justify-between gap-3 px-3.5 py-2 text-left text-[13px] transition-all duration-200 hover:pl-5 cursor-pointer',
                      isSelected
                        ? 'bg-[#A4FFF0]/[0.12] text-[#A4FFF0]'
                        : 'text-zinc-200 hover:text-white'
                    )}
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <span className="truncate">{opt.label}</span>
                      {opt.hint && (
                        <span className="font-brand text-[10px] uppercase tracking-[0.1em] px-2 py-0.5 rounded-full border border-white/[0.1] bg-white/[0.04] text-zinc-400 shrink-0">
                          {opt.hint}
                        </span>
                      )}
                    </span>
                    {isSelected && <CheckIcon className="w-4 h-4 text-[#A4FFF0] shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <button
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((prev) => !prev)}
        onKeyDown={handleTriggerKeyDown}
        className={cn(
          'w-full flex items-center justify-between gap-3 rounded-lg px-4 py-2.5 text-sm text-left transition-all duration-200 cursor-pointer border',
          'bg-[#0b0d11]/95 text-white',
          open
            ? 'border-[#A4FFF0]/80'
            : 'border-white/[0.12] hover:border-white/[0.28]'
        )}
      >
        <span className="truncate font-medium">{selected?.label ?? value}</span>
        <ChevronDownIcon
          className={cn(
            'w-4 h-4 shrink-0 text-zinc-400 transition-transform duration-200',
            open && 'rotate-180 text-[#A4FFF0]'
          )}
        />
      </button>

      {listbox}
    </div>
  );
}
