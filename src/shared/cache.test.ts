/**
 * Unit tests for shared/cache.ts
 *
 * Tests TTL behavior, capacity limits (LRU eviction), and explicit clear.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getCachedResponse, setCachedResponse, clearCache, getCacheSize } from './cache';

describe('cache.ts', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    clearCache();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('stores and retrieves a value', () => {
    setCachedResponse('key1', 'value1');
    expect(getCachedResponse('key1')).toBe('value1');
    expect(getCacheSize()).toBe(1);
  });

  it('returns null for missing key', () => {
    expect(getCachedResponse('missing')).toBeNull();
  });

  it('expires items after TTL', () => {
    setCachedResponse('key1', 'value1', 5000);
    expect(getCachedResponse('key1')).toBe('value1');

    // Advance time past TTL
    vi.advanceTimersByTime(5001);

    expect(getCachedResponse('key1')).toBeNull();
    expect(getCacheSize()).toBe(0); // getCachedResponse should evict expired
  });

  it('evicts oldest items when max size (200) is reached', () => {
    // Fill the cache exactly to limit
    for (let i = 0; i < 200; i++) {
      setCachedResponse(`key${i}`, `value${i}`);
    }
    expect(getCacheSize()).toBe(200);
    expect(getCachedResponse('key0')).toBe('value0'); // Still there

    // Add one more
    setCachedResponse('key200', 'value200');

    expect(getCacheSize()).toBe(200); // Size capped at 200
    // The oldest key (key0) should have been evicted
    expect(getCachedResponse('key0')).toBeNull();
    // The newest key should be present
    expect(getCachedResponse('key200')).toBe('value200');
  });

  it('clears all items', () => {
    setCachedResponse('a', '1');
    setCachedResponse('b', '2');
    expect(getCacheSize()).toBe(2);

    clearCache();
    expect(getCacheSize()).toBe(0);
    expect(getCachedResponse('a')).toBeNull();
  });
});
