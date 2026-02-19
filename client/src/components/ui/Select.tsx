import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  sublabel?: string;
}

interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  size?: 'sm' | 'md';
  'aria-label'?: string;
}

export function Select({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  disabled = false,
  icon,
  size = 'md',
  'aria-label': ariaLabel,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [focusedIdx, setFocusedIdx] = useState(-1);

  const selected = options.find((o) => o.value === value);
  const prevValueRef = useRef(value);

  const close = useCallback(() => {
    setOpen(false);
    setFocusedIdx(-1);
  }, []);

  // Close dropdown if value changes externally (e.g. parent resets category)
  useEffect(() => {
    if (prevValueRef.current !== value && open) {
      close();
    }
    prevValueRef.current = value;
  }, [value, open, close]);

  // Measure space and decide direction when opening
  const openDropdown = useCallback(() => {
    if (!containerRef.current) {
      setOpen(true);
      return;
    }
    const rect = containerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const dropdownMaxH = 240; // max-h-60 = 15rem = 240px
    setDropUp(spaceBelow < dropdownMaxH && rect.top > spaceBelow);
    setOpen(true);
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close();
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open, close]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, close]);

  // Scroll focused item into view
  useEffect(() => {
    if (!open || focusedIdx < 0 || !listRef.current) return;
    const items = listRef.current.querySelectorAll('[role="option"]');
    items[focusedIdx]?.scrollIntoView?.({ block: 'nearest' });
  }, [focusedIdx, open]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (disabled) return;

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (!open) {
          openDropdown();
          setFocusedIdx(options.findIndex((o) => o.value === value));
        } else if (focusedIdx >= 0) {
          onChange(options[focusedIdx].value);
          close();
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!open) {
          openDropdown();
          setFocusedIdx(0);
        } else {
          setFocusedIdx((prev) => Math.min(prev + 1, options.length - 1));
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (open) {
          setFocusedIdx((prev) => Math.max(prev - 1, 0));
        }
        break;
    }
  }

  const heightCls = size === 'sm' ? 'h-8' : 'h-10';
  const textCls = size === 'sm' ? 'text-xs' : 'text-sm';
  const padLeft = icon ? 'pl-9' : 'pl-3';

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <button
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => !disabled && (open ? close() : openDropdown())}
        onKeyDown={handleKeyDown}
        className={`w-full ${heightCls} ${padLeft} pr-8 flex items-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 ${textCls} text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer`}
      >
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
            {icon}
          </span>
        )}
        <span className={selected ? '' : 'text-gray-400'}>
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown
          className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <ul
          ref={listRef}
          role="listbox"
          aria-label={ariaLabel}
          className={`absolute z-50 w-full max-h-60 overflow-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg py-1 scrollbar-hide ${
            dropUp ? 'bottom-full mb-1' : 'top-full mt-1'
          }`}
        >
          {options.map((opt, idx) => {
            const isSelected = opt.value === value;
            const isFocused = idx === focusedIdx;

            return (
              <li
                key={opt.value || '__all__'}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setFocusedIdx(idx)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => {
                  e.stopPropagation();
                  close();
                  onChange(opt.value);
                }}
                className={`flex items-center justify-between gap-2 px-3 py-2 ${textCls} cursor-pointer transition-colors ${
                  isFocused
                    ? 'bg-amber-50 dark:bg-amber-900/20'
                    : ''
                } ${
                  isSelected
                    ? 'text-amber-600 dark:text-amber-400 font-medium'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                <div className="flex flex-col min-w-0">
                  <span className="truncate">{opt.label}</span>
                  {opt.sublabel && (
                    <span className="text-xs text-gray-400 dark:text-gray-500 truncate">
                      {opt.sublabel}
                    </span>
                  )}
                </div>
                {isSelected && <Check className="w-4 h-4 shrink-0 text-amber-500" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
