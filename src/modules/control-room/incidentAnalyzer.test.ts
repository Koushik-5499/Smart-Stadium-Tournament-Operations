import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analyzeIncident } from './incidentAnalyzer';
import { callGemini } from '../../shared/geminiClient';

vi.mock('../../shared/geminiClient', () => ({
  callGemini: vi.fn(),
}));

describe('analyzeIncident', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns structured analysis from Gemini (happy path)', async () => {
    const mockResponse = JSON.stringify({
      summary: 'Medical Emergency',
      suggestedSeverity: 5,
      category: 'medical',
      recommendation: 'Dispatch medics',
    });
    vi.mocked(callGemini).mockResolvedValueOnce(mockResponse);

    const result = await analyzeIncident('Someone collapsed near gate A');

    expect(result.summary).toBe('Medical Emergency');
    expect(result.suggestedSeverity).toBe(5);
    expect(result.category).toBe('medical');
  });

  it('handles missing/malformed response (edge case)', async () => {
    const mockResponse = JSON.stringify({
      summary: 'Unknown',
      // missing other fields
    });
    vi.mocked(callGemini).mockResolvedValueOnce(mockResponse);

    const result = await analyzeIncident('Something happened');

    expect(result.summary).toBe('Unknown');
    expect(result.suggestedSeverity).toBe(3); // default is 3 now according to implementation
    expect(result.category).toBe('other'); // default
  });

  it('returns fallback analysis on API failure (error case)', async () => {
    vi.mocked(callGemini).mockRejectedValueOnce(new Error('API Error'));

    const result = await analyzeIncident('Broken seat');

    expect(result.suggestedSeverity).toBe(3); // The fallback is usually severity 3
    expect(result.recommendation).toBeDefined();
  });
});
