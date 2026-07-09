/**
 * In-memory cache with TTL (time-to-live) for GenAI responses.
 *
 * Caches repeated/idempotent Gemini responses (e.g., common navigation
 * queries, FAQ-style prompts) to reduce redundant API calls and latency.
 *
 * @module shared/cache
 */

interface CacheEntry {
  value: string;
  expiresAt: number;
}

/** Default TTL: 5 minutes. */
const DEFAULT_TTL_MS = 5 * 60 * 1000;

/** Maximum cache size to prevent memory leaks. */
const MAX_CACHE_SIZE = 200;

const cache = new Map<string, CacheEntry>();

/**
 * Retrieves a cached response if it exists and hasn't expired.
 *
 * @param key - The cache key
 * @returns The cached value, or null if miss/expired
 */
export function getCachedResponse(key: string): string | null {
  const entry = cache.get(key);
  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }

  return entry.value;
}

/**
 * Stores a response in the cache with a TTL.
 *
 * @param key - The cache key
 * @param value - The response text to cache
 * @param ttlMs - Time-to-live in milliseconds (default: 5 minutes)
 */
export function setCachedResponse(
  key: string,
  value: string,
  ttlMs: number = DEFAULT_TTL_MS,
): void {
  // Evict oldest entries if cache is full
  if (cache.size >= MAX_CACHE_SIZE) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey !== undefined) {
      cache.delete(oldestKey);
    }
  }

  cache.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  });
}

/**
 * Clears all entries from the cache.
 * Useful for testing and admin operations.
 */
export function clearCache(): void {
  cache.clear();
}

/**
 * Returns the current cache size (for monitoring).
 *
 * @returns Number of entries in the cache
 */
export function getCacheSize(): number {
  return cache.size;
}
