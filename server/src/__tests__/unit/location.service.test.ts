import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../services/square.client.js', () => ({
  squareClient: { get: vi.fn() },
}));

vi.mock('../../config/env.js', () => ({
  env: { CACHE_TTL_SECONDS: 0 },
}));

import { getActiveLocations } from '../../services/location.service.js';
import { squareClient } from '../../services/square.client.js';

const mockLocationsResponse = {
  data: {
    locations: [
      {
        id: 'LOC_1',
        name: 'Downtown',
        address: {
          address_line_1: '123 Main St',
          locality: 'New York',
          administrative_district_level_1: 'NY',
          postal_code: '10001',
        },
        timezone: 'America/New_York',
        status: 'ACTIVE',
      },
      {
        id: 'LOC_2',
        name: 'Closed Branch',
        address: { address_line_1: '789 Elm St' },
        timezone: 'America/Chicago',
        status: 'INACTIVE',
      },
      {
        id: 'LOC_3',
        name: 'Airport Kiosk',
        status: 'ACTIVE',
      },
    ],
  },
};

describe('LocationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('filters out INACTIVE locations', async () => {
    vi.mocked(squareClient.get).mockResolvedValueOnce(mockLocationsResponse);

    const result = await getActiveLocations();

    expect(result).toHaveLength(2);
    expect(result.every((loc) => loc.status === 'ACTIVE')).toBe(true);
  });

  it('formats address from parts', async () => {
    vi.mocked(squareClient.get).mockResolvedValueOnce(mockLocationsResponse);

    const result = await getActiveLocations();
    const downtown = result.find((l) => l.id === 'LOC_1')!;

    expect(downtown.address).toBe('123 Main St, New York, NY, 10001');
  });

  it('handles locations with no address', async () => {
    vi.mocked(squareClient.get).mockResolvedValueOnce(mockLocationsResponse);

    const result = await getActiveLocations();
    const kiosk = result.find((l) => l.id === 'LOC_3')!;

    expect(kiosk.address).toBe('No address available');
    expect(kiosk.name).toBe('Airport Kiosk');
  });

  it('defaults timezone to UTC when not provided', async () => {
    vi.mocked(squareClient.get).mockResolvedValueOnce(mockLocationsResponse);

    const result = await getActiveLocations();
    const kiosk = result.find((l) => l.id === 'LOC_3')!;

    expect(kiosk.timezone).toBe('UTC');
  });

  it('handles empty locations array from Square', async () => {
    vi.mocked(squareClient.get).mockResolvedValueOnce({
      data: { locations: [] },
    });

    const result = await getActiveLocations();
    expect(result).toEqual([]);
  });

  it('handles undefined locations from Square', async () => {
    vi.mocked(squareClient.get).mockResolvedValueOnce({
      data: {},
    });

    const result = await getActiveLocations();
    expect(result).toEqual([]);
  });
});
