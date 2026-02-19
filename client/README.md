# PerDiem Menu — Client

React + Vite frontend that displays a restaurant's menu items from the PerDiem Menu API, filtered by location and category.

## Tech Stack

| Layer   | Technology                                         |
| ------- | -------------------------------------------------- |
| UI      | React 19 · Vite · Tailwind CSS v4 · TanStack Query |
| Testing | Vitest · React Testing Library · Playwright         |

## Architecture

```
src/
├── api/          # Typed fetch wrapper with error handling
├── components/   # UI components (layout, menu, ui primitives)
├── context/      # Theme provider (dark mode)
├── hooks/        # Data-fetching hooks (React Query)
├── lib/          # Utility functions (formatPrice, cn)
└── types/        # Shared TypeScript types mirroring API responses
```

- **React Query** — Manages server state with built-in caching, loading/error states, and refetch.
- **Mobile-First** — All components designed for 375 px viewports first, then enhanced for tablet/desktop.
- **Dark Mode** — Persisted to `localStorage`, respects system `prefers-color-scheme`.
- **Client-Side Search** — Instant filtering on already-fetched data by name or description.
- **Smooth Animations** — Category pill transitions and card enter/exit via Framer Motion.
- **Accessibility** — ARIA labels, `role` attributes, keyboard navigation, semantic HTML.

## Setup

### Prerequisites

- **Node.js 18+**
- **npm 9+**
- The [server](../server) running on port 4000 (for API data)

### 1. Install

```bash
npm install
```

### 2. Run

```bash
npm run dev          # Vite dev server on http://localhost:3000
npm run build        # production build
npm run preview      # preview production build
```

The Vite dev server proxies `/api` requests to `http://localhost:4000`, so make sure the server is running.

To point at a different API host, set the `VITE_API_URL` environment variable:

```bash
VITE_API_URL=http://your-api-host:4000/api npm run dev
```

## Testing

```bash
npm test             # unit tests
npm run test:watch   # watch mode
npm run test:e2e     # end-to-end tests (Playwright, starts server automatically)
```

## Docker

```bash
docker compose up --build
```

## Features

- Dark mode toggle with persistence
- Loading skeletons & error states with retry
- Smooth animations (Framer Motion)
- Accessibility (ARIA labels, roles, keyboard nav)
- Client-side search/filter bar
