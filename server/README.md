# PerDiem Menu — Server

Express + TypeScript API that proxies the **Square Catalog API** and serves restaurant menu data.

## Tech Stack

| Layer   | Technology                              |
| ------- | --------------------------------------- |
| Runtime | Node.js · Express · TypeScript          |
| Testing | Vitest · Supertest                      |
| DevOps  | Docker                                  |

## Architecture

```
src/
├── config/       # Environment validation (dotenv)
├── middleware/    # Request logging, global error handler
├── routes/       # HTTP route definitions
├── services/     # Business logic (Square integration, caching)
├── types/        # TypeScript interfaces (Square API & app responses)
└── utils/        # CacheService wrapper, custom error classes
```

- **Service Layer Pattern** — Business logic is isolated from the HTTP layer and fully testable.
- **Secure Proxy** — The Square access token never leaves the server. All API calls are proxied.
- **In-Memory Caching** — Generic `CacheService` wraps `node-cache` with a `getOrSet` pattern. Default TTL is 5 minutes.
- **Pagination** — Transparently fetches all pages using Square's cursor-based pagination.
- **Error Mapping** — Square API errors are translated to typed `AppError` responses.
- **Request Logging** — Every request is logged with method, path, status code, and duration.

## Setup

### Prerequisites

- **Node.js 18+**
- **npm 9+**
- A [Square Developer](https://developer.squareup.com) account (free)

### 1. Install

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and set your Square **Sandbox** access token:

```
SQUARE_ACCESS_TOKEN=<your_sandbox_token>
SQUARE_ENVIRONMENT=sandbox
PORT=4000
```

### 3. Run

```bash
npm run dev          # development with hot-reload
npm run build        # compile TypeScript
npm start            # run compiled output
```

The API will be available at **http://localhost:4000**.

## API Endpoints

| Method | Path                                    | Description                    |
| ------ | --------------------------------------- | ------------------------------ |
| GET    | `/api/locations`                        | Active locations (simplified)  |
| GET    | `/api/catalog?location_id=X`            | Menu items grouped by category |
| GET    | `/api/catalog/categories?location_id=X` | Categories with item counts    |
| GET    | `/api/health`                           | Health check                   |

## Testing

```bash
npm test             # unit + integration tests
npm run test:watch   # watch mode
```

## Docker

```bash
docker compose up --build
```

## Seed Scripts

```bash
npm run seed             # seed all data
npm run seed:catalog     # seed catalog items
npm run seed:images      # seed images
```
