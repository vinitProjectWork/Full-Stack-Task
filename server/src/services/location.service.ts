import { squareClient } from './square.client.js';
import { CacheService } from '../utils/cache.js';
import { env } from '../config/env.js';
import type {
  SquareListLocationsResponse,
  SquareLocation,
} from '../types/square.types.js';
import type { LocationResponse } from '../types/api.types.js';

const cache = new CacheService({ ttlSeconds: env.CACHE_TTL_SECONDS });
const CACHE_KEY = 'locations:active';

/**
 * Fetches all active locations from the Square Locations API.
 * Results are cached to avoid redundant network calls.
 */
export async function getActiveLocations(): Promise<LocationResponse[]> {
  return cache.getOrSet(CACHE_KEY, async () => {
    const { data } = await squareClient.get<SquareListLocationsResponse>('/locations');

    return (data.locations ?? [])
      .filter((loc) => loc.status === 'ACTIVE')
      .map(toLocationResponse);
  });
}

// ---------------------------------------------------------------------------
// Mappers
// ---------------------------------------------------------------------------

/** Converts a Square Location into our simplified API format. */
function toLocationResponse(loc: SquareLocation): LocationResponse {
  const addr = loc.address;
  const parts = [
    addr?.address_line_1,
    addr?.locality,
    addr?.administrative_district_level_1,
    addr?.postal_code,
  ].filter(Boolean);

  return {
    id: loc.id,
    name: loc.name || 'Unnamed Location',
    address: parts.join(', ') || 'No address available',
    timezone: loc.timezone || 'UTC',
    status: 'ACTIVE',
  };
}
