import type { ReactNode } from 'react';
import { UtensilsCrossed } from 'lucide-react';
import { ThemeToggle } from '../ui/ThemeToggle';

interface HeaderProps {
  locationSelector: ReactNode;
}

/** Sticky top bar with branding, location selector, and theme toggle. */
export function Header({ locationSelector }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2 shrink-0">
            <UtensilsCrossed className="w-6 h-6 text-amber-600 dark:text-amber-500" />
            <span className="text-lg font-bold text-gray-900 dark:text-gray-100 hidden sm:inline">
              PerDiem
            </span>
          </div>

          {/* Location selector — fills remaining space */}
          <div className="flex-1 max-w-xs">{locationSelector}</div>

          {/* Theme toggle */}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
