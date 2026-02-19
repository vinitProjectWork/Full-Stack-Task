import { useQuery } from '@tanstack/react-query';
import { fetchJson } from '../api/client';
import type { LocationsResponse } from '../types';

/** Fetches active locations — cached for 5 minutes. */
export function useLocations() {
  return useQuery({
    queryKey: ['locations'],
    queryFn: ({ signal }) => fetchJson<LocationsResponse>('/locations', { signal }),
    staleTime: 5 * 60 * 1000,
  });
}
