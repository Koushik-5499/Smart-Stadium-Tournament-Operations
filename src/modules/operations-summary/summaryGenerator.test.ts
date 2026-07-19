import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateDailySummary } from './summaryGenerator';
import { callGemini } from '../../shared/geminiClient';
import type { Incident, ZoneDensity } from '../../shared/types';

vi.mock('../../shared/geminiClient', () => ({
  callGemini: vi.fn(),
}));

describe('summaryGenerator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockIncidents: Incident[] = [
    { id: '1', title: 'Test', description: '', location: 'Gate A', reportedBy: 'u1', reportedAt: 0, status: 'resolved', severity: 2 }
  ];
  const mockCrowd: ZoneDensity[] = [];

  it('generates summary successfully (happy path)', async () => {
    vi.mocked(callGemini).mockResolvedValueOnce(JSON.stringify({
      overallStatus: 'green',
      crowdHighlights: 'Low crowd',
      incidentHighlights: 'Test',
      transportHighlights: 'Normal',
      sustainabilityHighlights: 'Green',
      keyRecommendations: ['Keep it up']
    }));

    const result = await generateDailySummary(mockCrowd, mockIncidents, []);
    expect(result.overallStatus).toBe('green');
  });

  it('handles API failure by returning fallback (error case)', async () => {
    vi.mocked(callGemini).mockRejectedValueOnce(new Error('API Error'));
    const result = await generateDailySummary(mockCrowd, mockIncidents, []);
    expect(result.overallStatus).toBe('yellow'); // based on the fallback
  });
});
