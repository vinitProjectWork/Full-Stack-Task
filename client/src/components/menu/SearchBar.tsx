import { Search, X, Loader2 } from 'lucide-react';
import { Select } from '../ui/Select';
import type { SelectOption } from '../ui/Select';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  isSearching?: boolean;
  categoryOptions: SelectOption[];
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
}

/** Search input + category dropdown in a single row. */
export function SearchBar({
  value,
  onChange,
  isSearching,
  categoryOptions,
  selectedCategory,
  onCategoryChange,
}: SearchBarProps) {
  return (
    <div className="flex gap-3 mb-6">
      {/* Search input */}
      <div className="relative flex-1">
        {isSearching ? (
          <Loader2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500 animate-spin" />
        ) : (
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        )}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search menu items..."
          className="w-full h-10 pl-10 pr-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
          aria-label="Search menu items"
        />
        {value && (
          <button
            onClick={() => onChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Category dropdown */}
      <div className="w-44 shrink-0">
        <Select
          options={categoryOptions}
          value={selectedCategory}
          onChange={onCategoryChange}
          placeholder="All Categories"
          aria-label="Filter by category"
        />
      </div>
    </div>
  );
}
