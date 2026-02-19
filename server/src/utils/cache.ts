import NodeCache from 'node-cache';

interface CacheOptions {
  /** Time-to-live in seconds. Set to 0 to disable caching (useful for tests). */
  ttlSeconds: number;
}

/**
 * Thin wrapper around node-cache that exposes a `getOrSet` pattern.
 * When TTL is <= 0, caching is disabled — every call hits the fetcher.
 */
export class CacheService {
  private cache: NodeCache;
  private disabled: boolean;

  constructor(options: CacheOptions) {
    this.disabled = options.ttlSeconds <= 0;
    this.cache = new NodeCache({
      stdTTL: Math.max(options.ttlSeconds, 1),
      checkperiod: Math.max(options.ttlSeconds * 0.2, 1),
      useClones: false,
    });
  }

  /**
   * Returns the cached value for `key` if present, otherwise calls `fetcher`,
   * stores the result, and returns it.
   */
  async getOrSet<T>(key: string, fetcher: () => Promise<T>, ttl?: number): Promise<T> {
    if (this.disabled) {
      return fetcher();
    }

    const cached = this.cache.get<T>(key);
    if (cached !== undefined) {
      return cached;
    }

    const value = await fetcher();
    this.cache.set(key, value, ttl ?? 0); // 0 = use default stdTTL
    return value;
  }

  /** Remove a single cached entry. */
  invalidate(key: string): void {
    this.cache.del(key);
  }

  /** Flush all cached entries. */
  invalidateAll(): void {
    this.cache.flushAll();
  }

  /** Return hit/miss statistics (useful for debugging). */
  getStats(): NodeCache.Stats {
    return this.cache.getStats();
  }
}
