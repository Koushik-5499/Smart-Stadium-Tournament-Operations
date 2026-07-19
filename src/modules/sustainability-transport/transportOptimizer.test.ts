import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getTransportRecommendations, getSustainabilityInsights } from './transportOptimizer';
import { callGemini } from '../../shared/geminiClient';
import type { TransportRoute, SustainabilityData } from '../../shared/types';

vi.mock('../../shared/geminiClient', () => ({
  callGemini: vi.fn(),
}));

describe('transportOptimizer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockRoutes: TransportRoute[] = [
    { routeId: 'r1', routeName: 'Shuttle 1', type: 'shuttle', capacity: 100, currentLoad: 90, estimatedWaitMinutes: 10 },
  ];

  describe('getTransportRecommendations', () => {
    it('returns recommendations (happy path)', async () => {
      vi.mocked(callGemini).mockResolvedValueOnce(JSON.stringify({
        recommendations: [{ routeId: 'r1', recommendation: 'Avoid', priority: 'avoid' }]
      }));
      const result = await getTransportRecommendations(mockRoutes);
      expect(result[0].aiRecommendation).toBe('Avoid');
    });

    it('returns original routes on failure (error case)', async () => {
      vi.mocked(callGemini).mockRejectedValueOnce(new Error('API Down'));
      const result = await getTransportRecommendations(mockRoutes);
      expect(result[0].aiRecommendation).toBeUndefined();
    });
  });

  describe('getSustainabilityInsights', () => {
    const mockData: SustainabilityData[] = [
      { zoneId: 'z1', zoneName: 'Z1', wasteKg: 100, recycledKg: 50, carbonKg: 10, energyKwh: 100, timestamp: 0 }
    ];

    it('returns insights (happy path)', async () => {
      vi.mocked(callGemini).mockResolvedValueOnce(JSON.stringify({
        tips: ['Do X'], grade: 'A', highlight: 'Great'
      }));
      const result = await getSustainabilityInsights(mockData);
      expect(result.grade).toBe('A');
    });

    it('returns fallback insights on failure (error case)', async () => {
      vi.mocked(callGemini).mockRejectedValueOnce(new Error('API Down'));
      const result = await getSustainabilityInsights(mockData);
      expect(result.grade).toBe('C');
    });
  });
});
