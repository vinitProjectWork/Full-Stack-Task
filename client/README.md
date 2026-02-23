# PerDiem Menu — Client

A mobile-friendly single-page application built with React + Vite that displays a restaurant's menu items from the Square Catalog API. Users can browse items by location and category, search for dishes, and toggle dark mode.

## Table of Contents

- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Features](#features)
- [Setup](#setup)
- [Testing](#testing)
- [Docker](#docker)
- [Component Overview](#component-overview)
- [State Management](#state-management)
- [Architecture Decisions & Trade-offs](#architecture-decisions--trade-offs)
- [Assumptions & Limitations](#assumptions--limitations)

## Tech Stack

| Layer       | Technology                                              |
| ----------- | ------------------------------------------------------- |
| Framework   | React 19 · Vite 7 · TypeScript 5                       |
| Styling     | Tailwind CSS v4 · PostCSS                               |
| Data        | TanStack React Query v5                                 |
| Animations  | Framer Motion                                           |
| Icons       | Lucide React                                            |
| Testing     | Vitest · React Testing Library · Playwright (e2e)       |
| DevOps      | Docker · nginx (production serving)                     |

## Architecture

```
src/
├── api/
│   └── client.ts             # Typed fetch wrapper with error handling
├── components/
│   ├── layout/
│   │   ├── Header.tsx        # App header — branding, location selector, theme toggle
│   │   └── Layout.tsx        # Page layout wrapper
│   ├── menu/
│   │   ├── CategoryNav.tsx   # Horizontally scrollable category pills (Framer Motion)
│   │   ├── LocationSelector.tsx  # Custom dropdown to pick a Square location
│   │   ├── MenuItemCard.tsx  # Item card — image, name, description, price, variations
│   │   ├── MenuSection.tsx   # Category heading + grid of MenuItemCards
│   │   └── SearchBar.tsx     # Search input with category filter dropdown
│   └── ui/
│       ├── EmptyState.tsx    # "No items found" placeholder
│       ├── ErrorState.tsx    # Error message with retry button
│       ├── Pagination.tsx    # Page navigation with page size selector
│       ├── Select.tsx        # Accessible custom combobox (keyboard + ARIA)
│       ├── Skeleton.tsx      # Loading skeleton shimmer animations
│       └── ThemeToggle.tsx   # Dark/light mode toggle button
├── context/
│   └── ThemeContext.tsx      # Dark mode context — persists to localStorage
├── hooks/
│   ├── useCatalog.ts         # React Query hook for menu items (paginated, searchable)
│   ├── useCategories.ts      # React Query hook for category list
│   ├── useDebounce.ts        # Debounce hook for search input
│   ├── useLocalStorage.ts    # Generic localStorage hook with SSR safety
│   └── useLocations.ts       # React Query hook for Square locations
├── lib/
│   └── utils.ts              # formatPrice (cents → $X.XX), cn (class name merge)
├── types/
│   └── index.ts              # TypeScript interfaces mirroring API response shapes
├── App.tsx                   # Root component — providers, state wiring, layout
├── main.tsx                  # React DOM entry point
├── index.css                 # Tailwind v4 imports + custom dark mode variant
└── vite-env.d.ts             # Vite type declarations
```

## Features

### Core

- **Location Selector** — Fetches active locations from `/api/locations`. Selected location is persisted in `localStorage` so it survives page refreshes.
- **Category Navigation** — Categories are fetched from `/api/catalog/categories`. Displayed as a filter dropdown alongside the search bar with item counts per category.
- **Menu Items** — Items are fetched from `/api/catalog` and displayed grouped by category in a responsive card grid.
- **Item Cards** — Each card displays:
  - Item name
  - Description (truncated with "Read more" / "Show less" toggle)
  - Image (with a tasteful placeholder icon if unavailable)
  - Price from the first variation, formatted as currency (e.g., `$12.50`)
  - Multiple variations shown inline (e.g., "Small $4.00 · Medium $5.00 · Large $6.00")
- **Pagination** — Server-side pagination with page numbers, prev/next buttons, and a configurable page size selector (6, 12, 24, 48 items per page).

### Search & Filtering

- **Search Bar** — Debounced (300ms) search that filters menu items by name or description via the server-side search endpoint.
- **Category Filter** — Dropdown within the search bar to filter by a specific category.
- **Combined Filtering** — Search query and category filter can be used together.

### UI / UX

- **Mobile-First Design** — Designed for 375px viewports first, progressively enhanced for tablet (md) and desktop (lg) breakpoints. Card grid: 1 column on mobile → 2 on tablet → 3 on desktop.
- **Dark Mode** — Toggle button in the header. Persists preference to `localStorage` and respects the system's `prefers-color-scheme` on first visit.
- **Loading Skeletons** — Shimmer animations on cards and UI elements while data is fetching.
- **Error States** — Descriptive error messages with a retry button to re-fetch data.
- **Empty States** — Contextual messages ("Select a location", "No items match search", "No items in this category").
- **Smooth Transitions** — Category pill animations via Framer Motion. Smooth scroll-to-top on page change.
- **Accessibility** — ARIA labels on all interactive elements, `role="combobox"` / `role="listbox"` on custom select, keyboard navigation (arrow keys, Enter, Escape), semantic HTML (`<article>`, `<section>`, `<header>`, `<nav>`), screen reader support.

### Bonus Features

- Search/filter bar for menu items
- Dark mode toggle with persistence
- Smooth animations (Framer Motion)
- Docker support
- E2E tests (Playwright)
- Comprehensive unit and component tests
- Accessible custom combobox component with keyboard navigation

## Setup

### Prerequisites

- **Node.js 18+** (tested with Node.js 24)
- **npm 9+**
- The [server](../server) running on port 4000 (for API data)

### 1. Install

```bash
cd client
npm install
```

### 2. Run

```bash
npm run dev               # Vite dev server on http://localhost:3000
npm run build             # production build (TypeScript check + Vite build)
npm run preview           # preview the production build locally
```

The Vite dev server proxies all `/api` requests to `http://localhost:4000`, so **make sure the server is running first**.

### Custom API Host

To point at a different API host (e.g., for staging), set the `VITE_API_URL` environment variable:

```bash
VITE_API_URL=http://your-api-host:4000/api npm run dev
```

## Testing

### Unit & Component Tests

```bash
npm test                  # run all unit + component tests
npm run test:watch        # watch mode for development
```

### Test Structure

```
src/__tests__/
├── setup.ts                          # Test setup — imports jest-dom matchers
├── components/
│   ├── EmptyState.test.tsx           # Renders empty message with different strings
│   ├── ErrorState.test.tsx           # Error message, retry button, ARIA alert role
│   ├── LocationSelector.test.tsx     # Loading skeleton, dropdown options, selection, selected value
│   ├── MenuItemCard.test.tsx         # Image, name, price, description truncation, variations
│   └── SearchBar.test.tsx            # Placeholder, keystroke callbacks, clear button
└── lib/
    └── utils.test.ts                 # formatPrice (zero, large amounts, cents, EUR), cn helper
```

**Component tests** render React components with `@testing-library/react` and `@testing-library/user-event`, verifying DOM output and user interactions.
**Utility tests** validate pure functions (`formatPrice`, `cn`) with various edge cases.

### End-to-End Tests (Playwright)

```bash
npm run test:e2e          # runs against both server + client (auto-started)
```

E2E tests live in `e2e/menu.spec.ts` and verify the full user flow through a real browser:

```
e2e/
└── menu.spec.ts
    ├── loads the page with the PerDiem header
    ├── shows location selector
    ├── shows empty state before selecting a location
    ├── loads menu items after selecting a location
    ├── search bar filters menu items
    ├── dark mode toggle switches theme
    └── health endpoint returns ok
```

Playwright auto-starts both the server (port 4000) and client (port 3000) before running tests (configured in `playwright.config.ts`).

## Docker

```bash
docker compose up --build
```

The Dockerfile uses a multi-stage build:

1. **Build stage** — Installs dependencies, compiles TypeScript, builds production bundle with Vite
2. **Serve stage** — Uses nginx Alpine to serve the static files

The container exposes port **80** (mapped to `3000` in docker-compose). The nginx config handles:
- Serving static assets from `/usr/share/nginx/html`
- Client-side routing (SPA fallback to `index.html`)
- Proxying `/api` requests to the server container

## Component Overview

| Component          | Purpose                                                        |
| ------------------ | -------------------------------------------------------------- |
| `App`              | Root — wraps with QueryClientProvider + ThemeProvider, manages state |
| `Layout`           | Page shell — header + content area with max-width constraint   |
| `Header`           | Branding, location selector slot, dark mode toggle             |
| `LocationSelector` | Custom dropdown using the `Select` combobox component          |
| `SearchBar`        | Text input with clear button + category filter dropdown        |
| `CategoryNav`      | Scrollable category pills with animated active indicator       |
| `MenuSection`      | Category heading + responsive grid of `MenuItemCard`s          |
| `MenuItemCard`     | Item display — image/placeholder, name, description, price     |
| `Pagination`       | Page navigation — page numbers, prev/next, page size selector  |
| `Select`           | Reusable accessible combobox (button → listbox dropdown)       |
| `Skeleton`         | Loading placeholders with shimmer animation                    |
| `ErrorState`       | Error message with optional retry button                       |
| `EmptyState`       | Centered placeholder message for no-data scenarios             |
| `ThemeToggle`      | Sun/Moon icon button that toggles dark mode                    |

## State Management

| State                | Managed By        | Persisted          |
| -------------------- | ----------------- | ------------------ |
| Selected location    | `useLocalStorage` | `localStorage`     |
| Active category      | `useState`        | No (resets on location change) |
| Search query         | `useState` + `useDebounce` | No          |
| Current page         | `useState`        | No (resets on filter change) |
| Page size            | `useState`        | No                 |
| Dark mode preference | `ThemeContext`     | `localStorage`     |
| Server data (locations, catalog, categories) | TanStack React Query | In-memory query cache |

**React Query** handles all server state — caching, background refetching, loading/error states, and stale-while-revalidate. No manual state management for API data.

## Architecture Decisions & Trade-offs

| Decision | Rationale |
| --- | --- |
| **React Query over Redux/Zustand** | Server state management (caching, loading, error, refetch) is handled declaratively. No boilerplate for actions/reducers. |
| **Tailwind CSS v4** | Utility-first styling with zero runtime cost. v4 uses `@import "tailwindcss"` and `@custom-variant` for dark mode. |
| **Custom Select component** | Native `<select>` doesn't support styling or keyboard navigation customization. Built a fully accessible combobox with ARIA roles. |
| **Debounced search (300ms)** | Prevents API calls on every keystroke. The 300ms delay balances responsiveness with server load. |
| **Server-side search** | The search query is sent to the server API (`?q=term`) rather than filtering client-side only. This ensures search works with paginated data across all pages. |
| **Vite over CRA/Next.js** | Fast HMR, native ESM, lightweight configuration. No SSR needed for this SPA. |
| **Framer Motion** | Smooth, declarative animations for category transitions. Used sparingly to avoid performance overhead. |
| **Mobile-first breakpoints** | Base styles target 375px; `md:` and `lg:` breakpoints progressively enhance for larger screens. |

## Assumptions & Limitations

- The client expects the server API to be available at `/api` (proxied through Vite in development, nginx in production).
- `localStorage` is used for persistence (location selection, dark mode). This means preferences are per-browser, not per-user.
- The search debounce is 300ms. Users with very fast typing may notice a brief delay before results update.
- Images from Square's Sandbox CDN may load slowly or return placeholder images.
- The app does not implement authentication or access control. All data is publicly accessible.
- Pagination resets to page 1 when changing category, search query, or location to avoid showing stale pages.
