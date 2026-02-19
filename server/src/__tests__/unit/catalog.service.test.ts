import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies before importing the module under test
vi.mock('../../services/square.client.js', () => ({
  squareClient: { post: vi.fn() },
}));

vi.mock('../../config/env.js', () => ({
  env: {
    CACHE_TTL_SECONDS: 0, // disable caching for predictable tests
  },
}));

import {
  getCatalogByLocation,
  getCategoriesByLocation,
} from '../../services/catalog.service.js';
import { squareClient } from '../../services/square.client.js';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const itemsResponse = {
  data: {
    objects: [
      {
        type: 'ITEM',
        id: 'ITEM_1',
        present_at_all_locations: true,
        item_data: {
          name: 'Burger',
          description: 'A juicy beef burger',
          category_id: 'CAT_1',
          image_ids: ['IMG_1'],
          variations: [
            {
              type: 'ITEM_VARIATION',
              id: 'VAR_1',
              item_variation_data: {
                item_id: 'ITEM_1',
                name: 'Regular',
                price_money: { amount: 1250, currency: 'USD' },
              },
            },
          ],
        },
      },
      {
        type: 'ITEM',
        id: 'ITEM_2',
        present_at_location_ids: ['OTHER_LOC'],
        item_data: {
          name: 'Pizza',
          description: 'Wood-fired pizza',
          category_id: 'CAT_1',
          variations: [],
        },
      },
    ],
    related_objects: [
      { type: 'CATEGORY', id: 'CAT_1', category_data: { name: 'Mains' } },
      {
        type: 'IMAGE',
        id: 'IMG_1',
        image_data: { url: 'https://example.com/burger.jpg' },
      },
    ],
  },
};

const categoriesResponse = {
  data: {
    objects: [
      { type: 'CATEGORY', id: 'CAT_1', category_data: { name: 'Mains' } },
    ],
  },
};

const emptyCategoriesResponse = { data: { objects: [] } };

function mockStandardCalls() {
  vi.mocked(squareClient.post)
    .mockResolvedValueOnce(itemsResponse)
    .mockResolvedValueOnce(categoriesResponse);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('CatalogService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCatalogByLocation', () => {
    it('filters items to only those at the requested location', async () => {
      mockStandardCalls();

      const result = await getCatalogByLocation({ locationId: 'LOC_1' });

      expect(result.locationId).toBe('LOC_1');
      expect(result.categories).toHaveLength(1);
      expect(result.categories[0].items).toHaveLength(1);
      expect(result.categories[0].items[0].name).toBe('Burger');
    });

    it('joins category names from related objects', async () => {
      mockStandardCalls();

      const result = await getCatalogByLocation({ locationId: 'LOC_1' });

      expect(result.categories[0].name).toBe('Mains');
      expect(result.categories[0].items[0].category).toBe('Mains');
    });

    it('resolves image URLs from related objects', async () => {
      mockStandardCalls();

      const result = await getCatalogByLocation({ locationId: 'LOC_1' });

      expect(result.categories[0].items[0].imageUrl).toBe(
        'https://example.com/burger.jpg',
      );
    });

    it('maps variation price data correctly', async () => {
      mockStandardCalls();

      const result = await getCatalogByLocation({ locationId: 'LOC_1' });
      const variation = result.categories[0].items[0].variations[0];

      expect(variation.name).toBe('Regular');
      expect(variation.priceMoney).toEqual({ amount: 1250, currency: 'USD' });
    });

    it('throws BadRequestError when location_id is empty', async () => {
      await expect(getCatalogByLocation({ locationId: '' })).rejects.toThrow(
        'location_id query parameter is required',
      );
    });

    it('handles pagination via cursor', async () => {
      const page1 = {
        data: {
          objects: [
            {
              type: 'ITEM',
              id: 'P1',
              present_at_all_locations: true,
              item_data: { name: 'Item 1', variations: [] },
            },
          ],
          related_objects: [],
          cursor: 'page2',
        },
      };
      const page2 = {
        data: {
          objects: [
            {
              type: 'ITEM',
              id: 'P2',
              present_at_all_locations: true,
              item_data: { name: 'Item 2', variations: [] },
            },
          ],
          related_objects: [],
        },
      };

      vi.mocked(squareClient.post)
        .mockResolvedValueOnce(page1)       // fetchAllCatalogItems — page 1
        .mockResolvedValueOnce(emptyCategoriesResponse) // fetchCategoryMap
        .mockResolvedValueOnce(page2);       // fetchAllCatalogItems — page 2

      const result = await getCatalogByLocation({ locationId: 'LOC_X' });
      const allItems = result.categories.flatMap((c) => c.items);

      expect(allItems).toHaveLength(2);
      expect(squareClient.post).toHaveBeenCalledTimes(3);
    });
  });

  describe('getCategoriesByLocation', () => {
    it('returns categories with correct item counts', async () => {
      mockStandardCalls();

      const result = await getCategoriesByLocation('LOC_1');

      expect(result.locationId).toBe('LOC_1');
      expect(result.categories).toHaveLength(1);
      expect(result.categories[0]).toMatchObject({
        id: 'CAT_1',
        name: 'Mains',
        itemCount: 1,
      });
    });
  });
});
