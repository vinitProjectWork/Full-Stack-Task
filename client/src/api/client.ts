const BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Lightweight fetch wrapper with error handling.
 * All API calls go through this function for consistent behaviour.
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function fetchJson<T>(
  path: string,
  options?: { signal?: AbortSignal },
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, { signal: options?.signal });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(
      res.status,
      body?.error?.message || `Request failed (${res.status})`,
    );
  }

  return res.json() as Promise<T>;
}
