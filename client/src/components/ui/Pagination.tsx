import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Select } from './Select';
import type { PaginationMeta } from '../../types';

const PAGE_SIZE_OPTIONS = [
  // { value: '6', label: '6' },
  { value: '12', label: '12' },
  { value: '24', label: '24' },
  { value: '48', label: '48' },
];

interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  isLoading?: boolean;
}

/**
 * Renders page numbers with prev/next arrows and a page-size selector.
 */
export function Pagination({ meta, onPageChange, onPageSizeChange, isLoading }: PaginationProps) {
  const { currentPage, totalPages, totalItems, itemsPerPage } = meta;

  if (totalItems === 0) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const pages = totalPages > 1 ? getPageRange(currentPage, totalPages) : [];

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-8 mb-4">
      <div className="flex items-center gap-3">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Showing {startItem}–{endItem} of {totalItems} items
        </p>

        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-400 dark:text-gray-500">Per page</span>
          <div className="w-[70px]">
            <Select
              options={PAGE_SIZE_OPTIONS}
              value={String(itemsPerPage)}
              onChange={(val) => onPageSizeChange(Number(val))}
              disabled={isLoading}
              size="sm"
              aria-label="Items per page"
            />
          </div>
        </div>
      </div>

      {totalPages > 1 && (
        <nav className="flex items-center gap-1" aria-label="Pagination">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!meta.hasPrevPage || isLoading}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {pages.map((p, i) =>
            p === 'ellipsis' ? (
              <span
                key={`ellipsis-${i}`}
                className="px-2 text-gray-400 dark:text-gray-500 select-none"
              >
                ...
              </span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                disabled={isLoading}
                aria-current={p === currentPage ? 'page' : undefined}
                className={`min-w-[36px] h-9 rounded-lg text-sm font-medium transition-colors ${
                  p === currentPage
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                } disabled:cursor-not-allowed`}
              >
                {p}
              </button>
            ),
          )}

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!meta.hasNextPage || isLoading}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </nav>
      )}
    </div>
  );
}

/** Generates a page range with ellipsis for large page counts. */
function getPageRange(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | 'ellipsis')[] = [];

  pages.push(1);

  if (current > 3) {
    pages.push('ellipsis');
  }

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < total - 2) {
    pages.push('ellipsis');
  }

  pages.push(total);

  return pages;
}
