import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CacheService } from '../../utils/cache.js';

describe('CacheService', () => {
  let cache: CacheService;

  beforeEach(() => {
    cache = new CacheService({ ttlSeconds: 60 });
  });

  it('returns cached value on subsequent calls without re-fetching', async () => {
    const fetcher = vi.fn().mockResolvedValue('hello');

    const first = await cache.getOrSet('key', fetcher);
    const second = await cache.getOrSet('key', fetcher);

    expect(first).toBe('hello');
    expect(second).toBe('hello');
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('calls fetcher for different keys', async () => {
    const fetcherA = vi.fn().mockResolvedValue('A');
    const fetcherB = vi.fn().mockResolvedValue('B');

    expect(await cache.getOrSet('a', fetcherA)).toBe('A');
    expect(await cache.getOrSet('b', fetcherB)).toBe('B');
    expect(fetcherA).toHaveBeenCalledTimes(1);
    expect(fetcherB).toHaveBeenCalledTimes(1);
  });

  it('invalidates a single key', async () => {
    const fetcher = vi.fn().mockResolvedValue('value');

    await cache.getOrSet('k', fetcher);
    cache.invalidate('k');
    await cache.getOrSet('k', fetcher);

    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('flushes all keys on invalidateAll', async () => {
    const fetcher = vi.fn().mockResolvedValue('v');

    await cache.getOrSet('x', fetcher);
    await cache.getOrSet('y', fetcher);
    cache.invalidateAll();
    await cache.getOrSet('x', fetcher);
    await cache.getOrSet('y', fetcher);

    expect(fetcher).toHaveBeenCalledTimes(4);
  });

  it('bypasses cache when ttlSeconds is 0 (disabled mode)', async () => {
    const disabled = new CacheService({ ttlSeconds: 0 });
    const fetcher = vi.fn().mockResolvedValue('data');

    await disabled.getOrSet('k', fetcher);
    await disabled.getOrSet('k', fetcher);

    expect(fetcher).toHaveBeenCalledTimes(2);
  });
});
