import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseNavigationIntent, parseIntentLocally } from './intentParser';
import { callGemini } from '../../shared/geminiClient';

vi.mock('../../shared/geminiClient', () => ({
  callGemini: vi.fn(),
}));

describe('intentParser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('parseNavigationIntent', () => {
    it('returns parsed intent from Gemini on success (happy path)', async () => {
      const mockResponse = JSON.stringify({
        from: null,
        to: 'gate-a',
        type: 'navigation'
      });
      vi.mocked(callGemini).mockResolvedValueOnce(mockResponse);

      const result = await parseNavigationIntent('where is gate a');

      expect(result.to).toBe('gate-a');
      expect(result.type).toBe('navigation');
      expect(result.from).toBeNull();
    });

    it('falls back to local parsing on Gemini failure (error case)', async () => {
      vi.mocked(callGemini).mockRejectedValueOnce(new Error('API Error'));

      const result = await parseNavigationIntent('take me to food court');

      expect(result.to).toBe('food-north'); // Extracted locally
      expect(result.type).toBe('navigation');
    });
  });

  describe('parseIntentLocally', () => {
    it('matches known locations (edge case)', () => {
      const result = parseIntentLocally('i need the restroom');
      expect(result.to).toBe('restroom-n'); // Matches local dict
      expect(result.type).toBe('navigation');
    });

    it('returns null destination if no keywords match', () => {
      const result = parseIntentLocally('just saying hello');
      expect(result.to).toBeNull();
      expect(result.type).toBe('general-question');
    });
  });
});
