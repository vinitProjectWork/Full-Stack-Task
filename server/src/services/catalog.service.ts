import { squareClient } from './square.client.js';
import { CacheService } from '../utils/cache.js';
import { env } from '../config/env.js';
import { BadRequestError } from '../utils/errors.js';
import type {
  SquareCatalogObject,
  SquareSearchCatalogResponse,
} from '../types/square.types.js';
import type {
  MenuItem,
  MenuItemVariation,
  CategoryWithItems,
  CatalogResponse,
  CategoryInfo,
  CategoriesResponse,
  PaginationMeta,
} from '../types/api.types.js';

const cache = new CacheService({ ttlSeconds: env.CACHE_TTL_SECONDS });

const DEFAULT_PAGE_SIZE = 6;

export interface CatalogQueryParams {
  locationId: string;
  page?: number;
  limit?: number;
  q?: string;
  category?: string;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function getCatalogByLocation(
  params: CatalogQueryParams,
): Promise<CatalogResponse> {
  const { locationId, page = 1, limit = DEFAULT_PAGE_SIZE, q, category } = params;

  if (!locationId) {
    throw new BadRequestError('location_id query parameter is required');
  }

  const allItems = await getAllMenuItemsForLocation(locationId);

  let items = allItems;

  // Filter by category (uses category ID)
  if (category) {
    items = items.filter((item) => item.categoryId === category);
    console.log(`[Category] "${category}" → ${items.length}/${allItems.length} items`);
  }

  // Filter by search query
  if (q) {
    const query = q.toLowerCase().trim();
    items = items.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query),
    );
    console.log(`[Search] "${q}" → ${items.length} items matched`);
  }

  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * limit;
  const pageItems = items.slice(start, start + limit);

  const pagination: PaginationMeta = {
    currentPage: safePage,
    totalPages,
    totalItems,
    itemsPerPage: limit,
    hasNextPage: safePage < totalPages,
    hasPrevPage: safePage > 1,
  };

  const grouped = groupByCategory(pageItems);

  console.log(
    `[Catalog] Page ${safePage}/${totalPages} — ${pageItems.length} items (${totalItems} total)${q ? ` [search: "${q}"]` : ''}`,
  );

  return { locationId, categories: grouped, pagination };
}

export async function getCategoriesByLocation(
  locationId: string,
): Promise<CategoriesResponse> {
  if (!locationId) {
    throw new BadRequestError('location_id query parameter is required');
  }

  return cache.getOrSet(`categories:${locationId}`, async () => {
    const allItems = await getAllMenuItemsForLocation(locationId);

    const catMap = new Map<string, { id: string; name: string; count: number }>();
    for (const item of allItems) {
      const existing = catMap.get(item.category);
      if (existing) {
        existing.count++;
      } else {
        catMap.set(item.category, {
          id: item.categoryId ?? 'uncategorized',
          name: item.category,
          count: 1,
        });
      }
    }

    const categories: CategoryInfo[] = [...catMap.values()].map((c) => ({
      id: c.id,
      name: c.name,
      itemCount: c.count,
    }));

    return { locationId, categories };
  });
}

export async function searchCatalogItems(
  locationId: string,
  query: string,
): Promise<CatalogResponse> {
  return getCatalogByLocation({ locationId, q: query, page: 1, limit: 100 });
}

export function __resetCacheForTesting(): void {
  cache.invalidateAll();
}

// ---------------------------------------------------------------------------
// Internal: fetch and cache all menu items for a location
// ---------------------------------------------------------------------------

interface InternalMenuItem extends MenuItem {
  categoryId?: string;
}

async function getAllMenuItemsForLocation(
  locationId: string,
): Promise<InternalMenuItem[]> {
  return cache.getOrSet(`items:${locationId}`, async () => {
    const [itemsResult, categoryMap] = await Promise.all([
      fetchAllCatalogItems(),
      fetchCategoryMap(),
    ]);

    const { items, relatedObjects } = itemsResult;

    console.log(
      `[Square] Fetched ${items.length} items, ${relatedObjects.length} related objects, ${categoryMap.size} categories`,
    );

    // Merge categories from related_objects into the separately fetched map
    for (const obj of relatedObjects) {
      if (obj.type === 'CATEGORY' && obj.category_data && !categoryMap.has(obj.id)) {
        categoryMap.set(obj.id, { id: obj.id, name: obj.category_data.name });
      }
    }

    const imageMap = buildImageMap(relatedObjects);

    const locationItems = items
      .filter((item) => isItemAtLocation(item, locationId))
      .map((item) => toMenuItem(item, categoryMap, imageMap));

    console.log(
      `[Square] ${locationItems.length}/${items.length} items match location ${locationId}`,
    );

    return locationItems;
  });
}

// ---------------------------------------------------------------------------
// Square API interaction
// ---------------------------------------------------------------------------

const SQUARE_PAGE_SIZE = 100;

/**
 * Fetches ALL catalog ITEM objects, handling cursor-based pagination.
 */
async function fetchAllCatalogItems(): Promise<{
  items: SquareCatalogObject[];
  relatedObjects: SquareCatalogObject[];
}> {
  const allItems: SquareCatalogObject[] = [];
  const allRelated: SquareCatalogObject[] = [];
  let cursor: string | undefined;
  let page = 0;

  do {
    page++;
    const body: Record<string, unknown> = {
      object_types: ['ITEM'],
      include_related_objects: true,
      limit: SQUARE_PAGE_SIZE,
    };
    if (cursor) body.cursor = cursor;

    const { data } = await squareClient.post<SquareSearchCatalogResponse>(
      '/catalog/search',
      body,
    );

    const pageItems = data.objects?.length ?? 0;
    const pageRelated = data.related_objects?.length ?? 0;
    console.log(
      `[Square] API page ${page}: ${pageItems} items, ${pageRelated} related${data.cursor ? ' (more pages)' : ' (last page)'}`,
    );

    if (data.objects) allItems.push(...data.objects);
    if (data.related_objects) allRelated.push(...data.related_objects);
    cursor = data.cursor;
  } while (cursor);

  return { items: allItems, relatedObjects: allRelated };
}

/**
 * Fetches ALL CATEGORY objects separately to build a reliable id→name map.
 * This is the primary source of category data (not related_objects).
 */
async function fetchCategoryMap(): Promise<Map<string, { id: string; name: string }>> {
  const map = new Map<string, { id: string; name: string }>();
  let cursor: string | undefined;

  do {
    const body: Record<string, unknown> = {
      object_types: ['CATEGORY'],
      limit: SQUARE_PAGE_SIZE,
    };
    if (cursor) body.cursor = cursor;

    const { data } = await squareClient.post<SquareSearchCatalogResponse>(
      '/catalog/search',
      body,
    );

    if (data.objects) {
      for (const obj of data.objects) {
        if (obj.category_data) {
          map.set(obj.id, { id: obj.id, name: obj.category_data.name });
        }
      }
    }
    cursor = data.cursor;
  } while (cursor);

  console.log(`[Square] Fetched ${map.size} category objects: [${[...map.values()].map((c) => c.name).join(', ')}]`);

  return map;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isItemAtLocation(obj: SquareCatalogObject, locationId: string): boolean {
  if (obj.absent_at_location_ids?.includes(locationId)) return false;
  if (obj.present_at_all_locations) return true;
  if (obj.present_at_location_ids && obj.present_at_location_ids.length > 0) {
    return obj.present_at_location_ids.includes(locationId);
  }
  return true;
}

function buildImageMap(related: SquareCatalogObject[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const obj of related) {
    if (obj.type === 'IMAGE' && obj.image_data?.url) {
      map.set(obj.id, obj.image_data.url);
    }
  }
  return map;
}

/**
 * Resolves the category ID for an item, checking multiple Square API fields
 * for compatibility across API versions.
 */
function resolveCategoryId(item: SquareCatalogObject): string | undefined {
  const data = item.item_data;
  if (!data) return undefined;

  // 1. Newer API: categories array
  if (data.categories && data.categories.length > 0) {
    return data.categories[0].id;
  }

  // 2. Reporting category
  if (data.reporting_category?.id) {
    return data.reporting_category.id;
  }

  // 3. Legacy: category_id (deprecated but may still be present)
  if (data.category_id) {
    return data.category_id;
  }

  return undefined;
}

function toMenuItem(
  item: SquareCatalogObject,
  categoryMap: Map<string, { id: string; name: string }>,
  imageMap: Map<string, string>,
): InternalMenuItem {
  const data = item.item_data!;

  const categoryId = resolveCategoryId(item);
  const category = categoryId ? categoryMap.get(categoryId) : undefined;

  const imageUrl = data.image_ids?.length
    ? (imageMap.get(data.image_ids[0]) ?? null)
    : null;

  const variations: MenuItemVariation[] = (data.variations ?? []).map((v) => ({
    id: v.id,
    name: v.item_variation_data?.name || 'Regular',
    priceMoney: {
      amount: v.item_variation_data?.price_money?.amount ?? 0,
      currency: v.item_variation_data?.price_money?.currency ?? 'USD',
    },
  }));

  return {
    id: item.id,
    name: data.name,
    description: data.description || '',
    category: category?.name || 'Uncategorized',
    categoryId: category?.id,
    imageUrl,
    variations,
  };
}

function groupByCategory(items: InternalMenuItem[]): CategoryWithItems[] {
  const groups = new Map<string, CategoryWithItems>();

  for (const item of items) {
    if (!groups.has(item.category)) {
      groups.set(item.category, {
        id: item.categoryId ?? 'uncategorized',
        name: item.category,
        items: [],
      });
    }
    groups.get(item.category)!.items.push(item);
  }

  return Array.from(groups.values()).sort((a, b) => {
    if (a.name === 'Uncategorized') return 1;
    if (b.name === 'Uncategorized') return -1;
    return a.name.localeCompare(b.name);
  });
}
