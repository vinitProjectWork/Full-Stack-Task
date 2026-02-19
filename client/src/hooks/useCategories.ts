import { useQuery } from '@tanstack/react-query';
import { fetchJson } from '../api/client';
import type { CategoriesResponse } from '../types';

/** Fetches category list with item counts for a given location. */
export function useCategories(locationId: string | null) {
  return useQuery({
    queryKey: ['categories', locationId],
    queryFn: ({ signal }) =>
      fetchJson<CategoriesResponse>(
        `/catalog/categories?location_id=${locationId}`,
        { signal },
      ),
    enabled: !!locationId,
    staleTime: 5 * 60 * 1000,
  });
}
