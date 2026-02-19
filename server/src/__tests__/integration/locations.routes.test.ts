import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

// Mock external dependencies
vi.mock('../../services/square.client.js', () => ({
  squareClient: { get: vi.fn(), post: vi.fn() },
}));

vi.mock('../../config/env.js', () => ({
  env: {
    PORT: 4000,
    SQUARE_ACCESS_TOKEN: 'test-token',
    SQUARE_ENVIRONMENT: 'sandbox' as const,
    SQUARE_BASE_URL: 'https://connect.squareupsandbox.com/v2',
    CACHE_TTL_SECONDS: 0, // disable caching
    NODE_ENV: 'test',
  },
}));

import { createApp } from '../../app.js';
import { squareClient } from '../../services/square.client.js';

const app = createApp();

describe('API Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -----------------------------------------------------------------------
  // GET /api/health
  // -----------------------------------------------------------------------

  describe('GET /api/health', () => {
    it('returns 200 with status ok', async () => {
      const res = await request(app).get('/api/health');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.timestamp).toBeDefined();
    });
  });

  // -----------------------------------------------------------------------
  // GET /api/locations
  // -----------------------------------------------------------------------

  describe('GET /api/locations', () => {
    it('returns only ACTIVE locations', async () => {
      vi.mocked(squareClient.get).mockResolvedValueOnce({
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
              status: 'INACTIVE',
            },
          ],
        },
      });

      const res = await request(app).get('/api/locations');

      expect(res.status).toBe(200);
      expect(res.body.locations).toHaveLength(1);
      expect(res.body.locations[0]).toEqual({
        id: 'LOC_1',
        name: 'Downtown',
        address: '123 Main St, New York, NY, 10001',
        timezone: 'America/New_York',
        status: 'ACTIVE',
      });
    });

    it('returns structured error when Square API fails', async () => {
      const { SquareApiError } = await import('../../utils/errors.js');
      vi.mocked(squareClient.get).mockRejectedValueOnce(
        new SquareApiError(502, 'Square: UNAUTHORIZED', 'Invalid token'),
      );

      const res = await request(app).get('/api/locations');

      expect(res.status).toBe(502);
      expect(res.body.error.code).toBe('SQUARE_API_ERROR');
    });
  });

  // -----------------------------------------------------------------------
  // GET /api/catalog
  // -----------------------------------------------------------------------

  describe('GET /api/catalog', () => {
    it('returns 400 when location_id is missing', async () => {
      const res = await request(app).get('/api/catalog');

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('BAD_REQUEST');
    });
  });
});
