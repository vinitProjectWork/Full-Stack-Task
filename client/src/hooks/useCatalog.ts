import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { fetchJson } from '../api/client';
import type { CatalogResponse } from '../types';

export interface CatalogParams {
  locationId: string | null;
  page?: number;
  limit?: number;
  q?: string;
  category?: string | null;
}

/**
 * Fetches paginated catalog items grouped by category.
 * Supports server-side search, category filter, and pagination.
 * Uses keepPreviousData so the UI doesn't flash while navigating pages.
 */
export function useCatalog(params: CatalogParams) {
  const { locationId, page = 1, limit = 6, q = '', category } = params;
  const trimmed = q.trim();

  return useQuery({
    queryKey: ['catalog', locationId, page, limit, trimmed, category ?? ''],
    queryFn: ({ signal }) => {
      const sp = new URLSearchParams();
      if (locationId) sp.set('location_id', locationId);
      sp.set('page', String(page));
      sp.set('limit', String(limit));
      if (trimmed) sp.set('q', trimmed);
      if (category) sp.set('category', category);
      return fetchJson<CatalogResponse>(`/catalog?${sp.toString()}`, { signal });
    },
    enabled: !!locationId,
    staleTime: 0,
    placeholderData: keepPreviousData,
  });
}
