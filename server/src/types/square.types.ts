/**
 * Type definitions for Square API responses.
 * These mirror the relevant subset of the Square Connect API v2 schemas.
 *
 * @see https://developer.squareup.com/reference/square
 */

// ---------------------------------------------------------------------------
// Locations API
// ---------------------------------------------------------------------------

export interface SquareAddress {
  address_line_1?: string;
  locality?: string;
  administrative_district_level_1?: string;
  postal_code?: string;
  country?: string;
}

export interface SquareLocation {
  id: string;
  name?: string;
  address?: SquareAddress;
  timezone?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface SquareListLocationsResponse {
  locations?: SquareLocation[];
}

// ---------------------------------------------------------------------------
// Catalog API
// ---------------------------------------------------------------------------

export interface SquareMoney {
  amount: number;
  currency: string;
}

export interface SquareItemVariationData {
  item_id: string;
  name: string;
  price_money?: SquareMoney;
  ordinal?: number;
}

export interface SquareItemData {
  name: string;
  description?: string;
  /** @deprecated Use `categories` array instead. */
  category_id?: string;
  /** Newer Square API versions return categories as an array of references. */
  categories?: { id: string; ordinal?: number }[];
  /** Reporting category reference (another possible location for category ID). */
  reporting_category?: { id: string };
  image_ids?: string[];
  variations?: SquareCatalogObject[];
}

export interface SquareCategoryData {
  name: string;
}

export interface SquareImageData {
  url?: string;
  name?: string;
}

export interface SquareCatalogObject {
  type: 'ITEM' | 'CATEGORY' | 'IMAGE' | 'ITEM_VARIATION' | string;
  id: string;
  present_at_all_locations?: boolean;
  present_at_location_ids?: string[];
  absent_at_location_ids?: string[];
  item_data?: SquareItemData;
  category_data?: SquareCategoryData;
  image_data?: SquareImageData;
  item_variation_data?: SquareItemVariationData;
}

export interface SquareSearchCatalogResponse {
  objects?: SquareCatalogObject[];
  related_objects?: SquareCatalogObject[];
  cursor?: string;
}
