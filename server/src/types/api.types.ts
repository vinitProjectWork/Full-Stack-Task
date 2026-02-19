/**
 * Application-level API response types.
 * These are the shapes returned by our endpoints — decoupled from Square's schema.
 */

// ---------------------------------------------------------------------------
// GET /api/locations
// ---------------------------------------------------------------------------

export interface LocationResponse {
  id: string;
  name: string;
  address: string;
  timezone: string;
  status: 'ACTIVE';
}

export interface LocationsListResponse {
  locations: LocationResponse[];
}

// ---------------------------------------------------------------------------
// GET /api/catalog
// ---------------------------------------------------------------------------

export interface MenuItemVariation {
  id: string;
  name: string;
  priceMoney: {
    amount: number;
    currency: string;
  };
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: string;
  imageUrl: string | null;
  variations: MenuItemVariation[];
}

export interface CategoryWithItems {
  id: string;
  name: string;
  items: MenuItem[];
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface CatalogResponse {
  locationId: string;
  categories: CategoryWithItems[];
  pagination: PaginationMeta;
}

// ---------------------------------------------------------------------------
// GET /api/catalog/categories
// ---------------------------------------------------------------------------

export interface CategoryInfo {
  id: string;
  name: string;
  itemCount: number;
}

export interface CategoriesResponse {
  locationId: string;
  categories: CategoryInfo[];
}

// ---------------------------------------------------------------------------
// Error response
// ---------------------------------------------------------------------------

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: string;
  };
}
