import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
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

export function SelectDropdown({
  id,
  value,
  options,
  onChange,
  ariaLabel,
  className = '',
}: SelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = options.find((opt) => opt.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
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

      {open && (
        <div
          role="listbox"
          aria-labelledby={id}
          className="absolute right-0 left-0 mt-1.5 z-40 rounded-lg border border-white/[0.14] bg-[#0b0d11]/98 shadow-2xl overflow-hidden"
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
                      <span className="font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded border border-white/[0.1] bg-white/[0.04] text-zinc-400 shrink-0">
                        {opt.hint}
                      </span>
                    )}
                  </span>
                  {isSelected && <CheckIcon className="w-4 h-4 text-[#A4FFF0] shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
