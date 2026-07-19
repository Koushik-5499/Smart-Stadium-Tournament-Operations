import { describe, it, expect, vi, beforeEach } from 'vitest';
import { predictCongestion } from './crowdPrediction';
import { callGemini } from '../../shared/geminiClient';
import type { ZoneDensity } from '../../shared/types';

vi.mock('../../shared/geminiClient', () => ({
  callGemini: vi.fn(),
}));

describe('predictCongestion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockData: ZoneDensity[] = [
    { zoneId: 'z1', zoneName: 'Zone 1', currentCount: 800, capacity: 1000, occupancyRate: 0.8, gate: 'A', timestamp: Date.now() },
  ];

  it('returns mapped predictions on success (happy path)', async () => {
    const mockResponse = JSON.stringify({
      predictions: [
        { zoneId: 'z1', predictedOccupancy: 0.9, minutesAhead: 15, confidence: 0.8, rerouteSuggestion: 'Use Gate B' }
      ]
    });
    vi.mocked(callGemini).mockResolvedValueOnce(mockResponse);

    const result = await predictCongestion(mockData);

    expect(result).toHaveLength(1);
    expect(result[0].zoneId).toBe('z1');
    expect(result[0].predictedOccupancy).toBe(0.9);
    expect(result[0].alertLevel).toBe('high'); // 0.9 >= 0.85 (high) but < 0.95 (critical)
  });

  it('handles missing fields in Gemini response (edge case)', async () => {
    const mockResponse = JSON.stringify({
      predictions: [
        { zoneId: 'z1' } // missing other fields
      ]
    });
    vi.mocked(callGemini).mockResolvedValueOnce(mockResponse);

    const result = await predictCongestion(mockData);

    expect(result).toHaveLength(1);
    expect(result[0].zoneId).toBe('z1');
    expect(result[0].predictedOccupancy).toBe(0); // fallback
    expect(result[0].alertLevel).toBe('low');
  });

  it('returns empty array on API failure (error case)', async () => {
    vi.mocked(callGemini).mockRejectedValueOnce(new Error('API Down'));

    const result = await predictCongestion(mockData);

    expect(result).toEqual([]);
  });
});
