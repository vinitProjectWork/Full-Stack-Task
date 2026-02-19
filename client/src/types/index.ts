/**
 * Shared TypeScript types for the client application.
 * These mirror the API response shapes defined on the server.
 */

export interface Location {
  id: string;
  name: string;
  address: string;
  timezone: string;
  status: 'ACTIVE';
}

export interface LocationsResponse {
  locations: Location[];
}

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

export interface CategoryInfo {
  id: string;
  name: string;
  itemCount: number;
}

export interface CategoriesResponse {
  locationId: string;
  categories: CategoryInfo[];
}
