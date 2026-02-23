# PerDiem Menu — Server

Express + TypeScript API that securely proxies the **Square Catalog API** and serves restaurant menu data. The Square access token never leaves the server — all API calls to Square are proxied through this backend.

## Table of Contents

- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Setup](#setup)
- [API Endpoints](#api-endpoints)
- [Caching Strategy](#caching-strategy)
- [Error Handling](#error-handling)
- [TestingCaching Strategy](#testing)
- [Docker](#docker)
- [Seed Scripts](#seed-scripts)
- [Architecture Decisions & Trade-offs](#architecture-decisions--trade-offs)
- [Assumptions & Limitations](#assumptions--limitations)

## Tech Stack


| Layer   | Technology                                              |
| ------- | ------------------------------------------------------- |
| Runtime | Node.js 18+ · Express 5 · TypeScript 5                  |
| HTTP    | Axios (Square API client) · Helmet · CORS · Compression |
| Caching | node-cache (in-memory with configurable TTL)            |
| Testing | Vitest · Supertest                                      |
| DevOps  | Docker · docker-compose                                 |


## Architecture

```
src/
├── config/
│   └── env.ts               # Environment validation (dotenv) — fails fast on missing vars
├── middleware/
│   ├── errorHandler.ts       # Global error handler — maps AppError to structured JSON
│   └── requestLogger.ts      # Logs method, path, status code, and duration per request
├── routes/
│   ├── index.ts              # Route registrar — mounts /locations and /catalog
│   ├── locations.routes.ts   # GET /api/locations
│   └── catalog.routes.ts     # GET /api/catalog, GET /api/catalog/categories
├── services/
│   ├── square.client.ts      # Pre-configured Axios instance for Square API
│   ├── location.service.ts   # Fetches and caches active locations
│   └── catalog.service.ts    # Fetches, filters, paginates, and caches catalog items
├── scripts/
│   ├── seed.ts               # Run all seeders
│   ├── seed-catalog.ts       # Seeds categories and menu items via Square Batch Upsert
│   └── seed-images.ts        # Uploads food images to catalog items
├── types/
│   ├── square.types.ts       # TypeScript interfaces for Square API responses
│   └── api.types.ts          # TypeScript interfaces for our API responses
├── utils/
│   ├── cache.ts              # Generic CacheService with getOrSet pattern
│   └── errors.ts             # Custom error classes (AppError, BadRequestError, SquareApiError)
├── app.ts                    # Express app factory — middleware, routes, error handler
└── index.ts                  # Entry point — loads dotenv, starts HTTP server
```

### Key Patterns

- **Service Layer Pattern** — Business logic (Square API integration, data transformation, caching) is isolated from HTTP route handlers and fully testable in isolation.
- **Secure Proxy** — The Square access token is stored in `.env` and never sent to the frontend. All Square API calls go through this server.
- **Factory Pattern** — `createApp()` returns a configured Express instance, making it easy to spin up in tests with Supertest.
- **Transparent Pagination** — Square's cursor-based pagination is handled internally; the server fetches all pages and then applies its own page/limit pagination for the frontend.
- **Error Mapping** — Square API errors are caught and translated into typed `AppError` subclasses (`SquareApiError`, `BadRequestError`, `NotFoundError`) with consistent JSON responses.

## Setup

### Prerequisites

- **Node.js 18+** (tested with Node.js 24)
- **npm 9+**
- A free [Square Developer](https://developer.squareup.com) account

### 1. Install

```bash
cd server
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and add your Square **Sandbox** access token:

```env
SQUARE_ACCESS_TOKEN=<your_sandbox_access_token>
SQUARE_ENVIRONMENT=sandbox
PORT=4000
CACHE_TTL_SECONDS=300
```

You can get the token from:

1. Go to [developer.squareup.com](https://developer.squareup.com)
2. Create or open an application
3. Navigate to **Credentials** → **Sandbox Access Token**
4. Copy the token

### 3. Seed Test Data (Optional)

If your Square Sandbox has no catalog items:

```bash
npm run seed              # seeds categories, menu items, and images
```

This creates 6 categories (Appetizers, Mains, Pasta, Desserts, Drinks, Sides) with 34 menu items and uploads food images for each.

### 4. Run

```bash
npm run dev               # development with hot-reload (tsx watch)
npm run build             # compile TypeScript to dist/
npm start                 # run compiled output (production)
```

The API will be available at **[http://localhost:4000](http://localhost:4000)**.

## API Endpoints

### `GET /api/locations`

Returns all **active** locations from Square.

**Response:**

```json
{
  "locations": [
    {
      "id": "LA0082JDC62NR",
      "name": "Default Test Account",
      "address": "1600 Pennsylvania Ave, Washington, DC 20500",
      "timezone": "America/New_York",
      "status": "ACTIVE"
    }
  ]
}
```

### `GET /api/catalog`

Returns paginated menu items grouped by category for a location.

**Query Parameters:**


| Parameter     | Required | Default | Description                                |
| ------------- | -------- | ------- | ------------------------------------------ |
| `location_id` | Yes      | —       | Square location ID                         |
| `page`        | No       | `1`     | Page number                                |
| `limit`       | No       | `6`     | Items per page                             |
| `q`           | No       | —       | Search query (filters by name/description) |
| `category`    | No       | —       | Category ID to filter by                   |


**Response:**

```json
{
  "locationId": "LA0082JDC62NR",
  "categories": [
    {
      "id": "CAT_ID",
      "name": "Appetizers",
      "items": [
        {
          "id": "ITEM_ID",
          "name": "Bruschetta",
          "description": "Toasted bread topped with tomatoes and basil",
          "categoryId": "CAT_ID",
          "categoryName": "Appetizers",
          "imageUrl": "https://items-images-sandbox...",
          "variations": [
            { "id": "VAR_ID", "name": "Regular", "priceMoney": { "amount": 950, "currency": "USD" } }
          ]
        }
      ]
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalItems": 15,
    "pageSize": 6,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### `GET /api/catalog/categories`

Returns categories with item counts for a location.

**Query Parameters:**


| Parameter     | Required | Description        |
| ------------- | -------- | ------------------ |
| `location_id` | Yes      | Square location ID |


**Response:**

```json
{
  "locationId": "LA0082JDC62NR",
  "categories": [
    { "id": "CAT_ID", "name": "Appetizers", "itemCount": 5 },
    { "id": "CAT_ID2", "name": "Mains", "itemCount": 8 }
  ]
}
```

### `GET /api/health`

Health check endpoint.

**Response:** `{ "status": "ok" }`

## Caching Strategy

- Uses `node-cache` with a configurable TTL (default: **5 minutes**).
- The `CacheService` class wraps `node-cache` with a `getOrSet` pattern — if a cached value exists and hasn't expired, it's returned immediately without hitting Square's API.
- Cache key format: `locations` for locations, `catalog:<locationId>` for catalog data, `categories:<locationId>` for categories.
- Setting `CACHE_TTL_SECONDS=0` disables caching entirely (useful for tests).
- Cache is flushed on server restart.

## Error Handling

All errors follow a consistent JSON structure:

```json
{
  "error": {
    "code": "BAD_REQUEST",
    "message": "location_id query parameter is required",
    "details": "optional additional context"
  }
}
```

**Error classes:**


| Class             | HTTP Status | Code               | When                                |
| ----------------- | ----------- | ------------------ | ----------------------------------- |
| `BadRequestError` | 400         | `BAD_REQUEST`      | Missing or invalid query parameters |
| `NotFoundError`   | 404         | `NOT_FOUND`        | Resource not found                  |
| `SquareApiError`  | 502+        | `SQUARE_API_ERROR` | Square API returned an error        |
| Unknown errors    | 500         | `INTERNAL_ERROR`   | Unexpected/unhandled errors         |


## Testing

```bash
npm test                  # run all tests (unit + integration)
npm run test:watch        # watch mode
```

### Test Structure

```
src/__tests__/
├── unit/
│   ├── cache.test.ts             # CacheService: getOrSet, TTL expiry, invalidation, disabled mode
│   ├── catalog.service.test.ts   # Catalog: location filtering, category joining, image resolution,
│   │                             #   price mapping, pagination cursor handling
│   └── location.service.test.ts  # Locations: ACTIVE filter, address formatting, missing fields,
│                                 #   empty/undefined response handling
└── integration/
    └── locations.routes.test.ts  # Full HTTP tests: /api/health, /api/locations,
                                  #   /api/catalog error states (via Supertest)
```

**Unit tests** mock the Square API client (`squareClient.post`) and validate business logic in isolation.
**Integration tests** use Supertest to test the full Express stack (middleware → routes → services → response).

## Docker

```bash
docker compose up --build
```

The Dockerfile uses a multi-stage build:

1. **Build stage** — Installs all dependencies, compiles TypeScript
2. **Production stage** — Copies only compiled output and production dependencies

The container exposes port **4000** and reads configuration from `.env`.

## Seed Scripts


| Command                | Description                                  |
| ---------------------- | -------------------------------------------- |
| `npm run seed`         | Run all seeders (catalog + images)           |
| `npm run seed:catalog` | Seed categories and menu items only          |
| `npm run seed:images`  | Upload food images to existing catalog items |


The catalog seeder creates **6 categories** and **34 menu items** via Square's `BatchUpsertCatalogObjects` API. The image seeder downloads food photos and uploads them via Square's `CreateCatalogImage` endpoint.

## Architecture Decisions & Trade-offs


| Decision                         | Rationale                                                                                                                                                   |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **In-memory caching over Redis** | Simpler deployment for a single-instance app. Redis would be needed for horizontal scaling.                                                                 |
| **Fetch-all-then-paginate**      | Square's cursor pagination is handled server-side; all items are fetched and cached, then paginated for the client. Works well for menus with < 1000 items. |
| **Axios over Square SDK**        | Demonstrates direct REST API integration and gives full control over request/response handling.                                                             |
| **Express 5**                    | Latest stable version with improved async error handling.                                                                                                   |
| **dotenv v16**                   | Pinned to v16 for API stability; v17 introduced breaking changes with environment injection.                                                                |
| **ESM modules**                  | Uses `"type": "module"` with `.js` extensions in imports for native ES module support.                                                                      |
| **Service layer pattern**        | Clean separation between HTTP routing and business logic makes the codebase testable and maintainable.                                                      |


## Assumptions & Limitations

- Items where neither `present_at_all_locations` nor `present_at_location_ids` is set are treated as available at all locations (Square's default behavior). Items are excluded only if explicitly listed in `absent_at_location_ids`.
- The server is designed for single-instance deployment. For multi-instance setups, the in-memory cache should be replaced with Redis.
- Pagination is applied after fetching all items from Square and caching them. For catalogs with thousands of items, a streaming approach would be more memory-efficient.
- The search endpoint filters cached items in-memory by name and description (case-insensitive substring match).
- Category assignment relies on Square's `category_id` field on each `ITEM` object. Items without a category are grouped under "Uncategorized".

