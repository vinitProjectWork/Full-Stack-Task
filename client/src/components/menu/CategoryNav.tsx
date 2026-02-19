import { motion } from 'framer-motion';
import type { CategoryInfo } from '../../types';

interface CategoryNavProps {
  categories: CategoryInfo[];
  activeId: string | null;
  onSelect: (id: string | null) => void;
}

/**
 * Horizontally scrollable category tabs with an "All" option.
 * Uses framer-motion `layoutId` for a smooth active-indicator animation.
 */
export function CategoryNav({ categories, activeId, onSelect }: CategoryNavProps) {
  const totalItems = categories.reduce((sum, c) => sum + c.itemCount, 0);

  const pills: { id: string | null; label: string; count: number }[] = [
    { id: null, label: 'All', count: totalItems },
    ...categories.map((cat) => ({ id: cat.id, label: cat.name, count: cat.itemCount })),
  ];

  return (
    <nav className="mb-6 -mx-4 px-4" aria-label="Menu categories">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {pills.map((pill) => {
          const isActive = activeId === pill.id;
          return (
            <button
              key={pill.id ?? '__all__'}
              onClick={() => onSelect(pill.id)}
              className={`relative shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                isActive
                  ? 'text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 bg-gray-100 dark:bg-gray-800/60'
              }`}
              aria-pressed={isActive}
            >
              {isActive && (
                <motion.span
                  layoutId="activeCategoryPill"
                  className="absolute inset-0 bg-amber-600 dark:bg-amber-500 rounded-full"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                />
              )}
              <span className="relative z-10">
                {pill.label}
                <span className="ml-1.5 opacity-60">({pill.count})</span>
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
