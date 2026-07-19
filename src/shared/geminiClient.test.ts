import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { callGemini } from './geminiClient';
import { getCachedResponse } from './cache';

vi.mock('./cache', () => ({
  getCachedResponse: vi.fn(),
  setCachedResponse: vi.fn(),
}));

describe('geminiClient', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('returns cached response if available (happy path)', async () => {
    vi.mocked(getCachedResponse).mockReturnValueOnce('cached_response');
    
    const result = await callGemini('sys', 'user', 'cache_key');
    expect(result).toBe('cached_response');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('calls API and returns text if not in cache', async () => {
    vi.mocked(getCachedResponse).mockReturnValueOnce(null);
    
    const mockFetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ text: 'api_response' })
    });
    global.fetch = mockFetch;

    const result = await callGemini('sys', 'user', 'cache_key');
    
    expect(mockFetch).toHaveBeenCalled();
    expect(result).toBe('api_response');
  });

  it('throws error on API failure (error case)', async () => {
    vi.mocked(getCachedResponse).mockReturnValueOnce(null);
    
    const mockFetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => { throw new Error('invalid json'); }
    });
    global.fetch = mockFetch;

    await expect(callGemini('sys', 'user', 'cache_key')).rejects.toThrow('Gemini proxy error (500):');
  });
});
