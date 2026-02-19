import { useState, useMemo, useRef, useCallback } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './context/ThemeContext';
import { Layout } from './components/layout/Layout';
import { LocationSelector } from './components/menu/LocationSelector';
import { SearchBar } from './components/menu/SearchBar';
import { MenuSection } from './components/menu/MenuSection';
import { MenuSkeleton } from './components/ui/Skeleton';
import { ErrorState } from './components/ui/ErrorState';
import { EmptyState } from './components/ui/EmptyState';
import { Pagination } from './components/ui/Pagination';
import { useLocations } from './hooks/useLocations';
import { useCatalog } from './hooks/useCatalog';
import { useCategories } from './hooks/useCategories';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useDebounce } from './hooks/useDebounce';
import type { SelectOption } from './components/ui/Select';

const DEFAULT_PAGE_SIZE = 12;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

// ---------------------------------------------------------------------------
// Inner app — needs to be inside QueryClientProvider
// ---------------------------------------------------------------------------

function MenuApp() {
  const [locationId, setLocationId] = useLocalStorage<string | null>(
    'selectedLocationId',
    null,
  );
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const contentRef = useRef<HTMLDivElement>(null);

  const locations = useLocations();
  const categories = useCategories(locationId);

  const debouncedSearch = useDebounce(searchQuery, 300);
  const catalog = useCatalog({
    locationId,
    page: currentPage,
    limit: pageSize,
    q: debouncedSearch,
    category: activeCategory,
  });

  const filteredCategories = catalog.data?.categories ?? [];
  const pagination = catalog.data?.pagination;
  const showSkeleton = catalog.isFetching && (!catalog.data || catalog.isPlaceholderData);

  const categoryOptions: SelectOption[] = useMemo(() => {
    if (!categories.data?.categories) return [];
    const total = categories.data.categories.reduce((s, c) => s + c.itemCount, 0);
    return [
      { value: '', label: `All Categories (${total})` },
      ...categories.data.categories.map((c) => ({
        value: c.id,
        label: `${c.name} (${c.itemCount})`,
      })),
    ];
  }, [categories.data?.categories]);

  const handleLocationChange = useCallback(
    (id: string) => {
      setLocationId(id);
      setActiveCategory(null);
      setSearchQuery('');
      setCurrentPage(1);
    },
    [setLocationId],
  );

  const handleCategoryClick = useCallback((categoryId: string | null) => {
    setActiveCategory(categoryId);
    setCurrentPage(1);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  }, []);

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <Layout
      locationSelector={
        <LocationSelector
          locations={locations.data?.locations ?? []}
          selectedId={locationId}
          onSelect={handleLocationChange}
          isLoading={locations.isLoading}
        />
      }
    >
      {/* Error: locations */}
      {locations.isError && (
        <ErrorState
          message="Failed to load locations"
          onRetry={() => locations.refetch()}
        />
      )}

      {/* Prompt to select location */}
      {!locationId && !locations.isLoading && !locations.isError && (
        <EmptyState message="Select a location to view the menu" />
      )}

      {/* Search bar + category filter */}
      {locationId && !catalog.isError && (
        <SearchBar
          value={searchQuery}
          onChange={handleSearchChange}
          isSearching={catalog.isFetching && !!debouncedSearch}
          categoryOptions={categoryOptions}
          selectedCategory={activeCategory ?? ''}
          onCategoryChange={(val) => handleCategoryClick(val || null)}
        />
      )}

      <div ref={contentRef}>
        {/* Loading skeleton — shown on initial load, page/category/search transitions */}
        {showSkeleton && <MenuSkeleton />}

        {/* Error: catalog */}
        {catalog.isError && (
          <ErrorState
            message="Failed to load menu items"
            onRetry={() => catalog.refetch()}
          />
        )}

        {/* Content — hidden while skeleton is visible */}
        {!showSkeleton && (
          <>
            {/* Empty states */}
            {catalog.data && filteredCategories.length === 0 && (
              <EmptyState
                message={
                  debouncedSearch
                    ? `No items match "${debouncedSearch}"`
                    : activeCategory
                      ? 'No items in this category'
                      : 'No menu items available for this location'
                }
              />
            )}

            {/* Menu sections */}
            {filteredCategories.map((cat) => (
              <MenuSection key={cat.id} category={cat} />
            ))}

            {/* Pagination */}
            {pagination && (
              <Pagination
                meta={pagination}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                isLoading={catalog.isFetching}
              />
            )}
          </>
        )}
      </div>
    </Layout>
  );
}

// ---------------------------------------------------------------------------
// Root component — providers
// ---------------------------------------------------------------------------

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <MenuApp />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
