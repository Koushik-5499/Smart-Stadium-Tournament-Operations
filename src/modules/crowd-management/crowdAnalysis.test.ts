import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAlertLevel, getCongestedZones, getZoneDataFast, isRisingTrend, formatOccupancy, generateRerouteSuggestion } from './crowdAnalysis';
import { generateVolunteerAlerts } from './volunteerCopilot';
import * as geminiClient from '../../shared/geminiClient';
import type { ZoneDensity } from '../../shared/types';

vi.mock('../../shared/geminiClient', () => ({
  callGemini: vi.fn(),
}));

describe('crowdAnalysis.ts', () => {
  describe('getAlertLevel', () => {
    it('handles exactly the 85% boundary (high threshold)', () => {
      // 0.85 is the exact threshold for 'high'
      expect(getAlertLevel(0.85)).toBe('high');
    });

    it('handles 0% capacity', () => {
      expect(getAlertLevel(0.0)).toBe('low');
    });

    it('handles 100%+ capacity (overcapacity)', () => {
      expect(getAlertLevel(1.0)).toBe('critical');
      expect(getAlertLevel(1.5)).toBe('critical'); // Way over capacity
    });
  });

  describe('getCongestedZones', () => {
    it('correctly filters zones at or above 85%', () => {
      const zones: ZoneDensity[] = [
        { zoneId: 'z1', occupancyRate: 0.84 } as ZoneDensity,
        { zoneId: 'z2', occupancyRate: 0.85 } as ZoneDensity,
        { zoneId: 'z3', occupancyRate: 0.86 } as ZoneDensity,
      ];
      const congested = getCongestedZones(zones);
      expect(congested).toHaveLength(2);
      expect(congested.map(z => z.zoneId)).toEqual(['z2', 'z3']);
    });
  });

  describe('getZoneDataFast', () => {
    it('finds existing zone in O(1) map', () => {
      const zones = [{ zoneId: 'target' } as ZoneDensity, { zoneId: 'other' } as ZoneDensity];
      const result = getZoneDataFast('target', zones);
      expect(result).toBeDefined();
      expect(result?.zoneId).toBe('target');
    });

    it('returns undefined for missing sensor data (graceful fallback)', () => {
      const zones = [{ zoneId: 'other' } as ZoneDensity];
      const result = getZoneDataFast('target', zones);
      expect(result).toBeUndefined();
    });
  });

  describe('isRisingTrend', () => {
    it('returns true if the last 3 readings show consecutive increases', () => {
      expect(isRisingTrend([0.5, 0.6, 0.7, 0.8])).toBe(true);
    });

    it('returns false if not consistently rising', () => {
      expect(isRisingTrend([0.8, 0.7, 0.6])).toBe(false);
      expect(isRisingTrend([0.6, 0.8, 0.7])).toBe(false);
      expect(isRisingTrend([0.7, 0.7, 0.7])).toBe(false);
    });

    it('handles missing/short data safely', () => {
      expect(isRisingTrend([0.5, 0.6])).toBe(false);
      expect(isRisingTrend([])).toBe(false);
    });
  });

  describe('formatOccupancy', () => {
    it('formats numbers to percentage strings', () => {
      expect(formatOccupancy(0.85)).toBe('85%');
      expect(formatOccupancy(0)).toBe('0%');
      expect(formatOccupancy(1)).toBe('100%');
      expect(formatOccupancy(1.5)).toBe('150%'); // Overcapacity
    });
  });

  describe('generateRerouteSuggestion', () => {
    it('returns a fallback when all other zones are congested', async () => {
      const congested = { zoneId: 'z1', gate: 'Gate A', occupancyRate: 0.9, zoneName: 'Zone 1' } as ZoneDensity;
      const allZones = [
        congested,
        { zoneId: 'z2', gate: 'Gate B', occupancyRate: 0.95, zoneName: 'Zone 2' } as ZoneDensity,
      ];
      const result = generateRerouteSuggestion(congested, allZones);
      expect(result).toBe('All zones near capacity. Consider delaying entry at Gate A.');
    });

    it('suggests the least congested zone', () => {
      const congested = { zoneId: 'z1', gate: 'Gate A', occupancyRate: 0.9, zoneName: 'Zone 1' } as ZoneDensity;
      const allZones = [
        congested,
        { zoneId: 'z2', gate: 'Gate B', occupancyRate: 0.8, zoneName: 'Zone 2' } as ZoneDensity,
        { zoneId: 'z3', gate: 'Gate C', occupancyRate: 0.6, zoneName: 'Zone 3' } as ZoneDensity, // least congested
      ];
      const result = generateRerouteSuggestion(congested, allZones);
      expect(result).toBe('Redirect from Gate A to Gate C (Zone 3) — currently at 60% capacity.');
    });
  });
});

describe('volunteerCopilot.ts', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('handles empty input gracefully without calling Gemini', async () => {
    const alerts = await generateVolunteerAlerts([]);
    expect(alerts).toEqual([]);
    expect(geminiClient.callGemini).not.toHaveBeenCalled();
  });

  it('generates structured JSON via Gemini on success', async () => {
    const mockJson = JSON.stringify([{
      zoneId: 'z1',
      gate: 'Gate 1',
      reasoning: 'Testing reasoning',
      action: 'Test action',
      severity: 'high',
      translatedInstruction: { language: 'fr', text: 'Bonjour' }
    }]);
    
    vi.mocked(geminiClient.callGemini).mockResolvedValueOnce(mockJson);

    const zones = [{ zoneId: 'z1', gate: 'Gate 1', occupancyRate: 0.85 }] as ZoneDensity[];
    const alerts = await generateVolunteerAlerts(zones, 'fr');
    
    expect(alerts).toHaveLength(1);
    expect(alerts[0].reasoning).toBe('Testing reasoning');
    expect(alerts[0].translatedInstruction.language).toBe('fr');
  });

  it('handles Gemini API failure gracefully with a fallback alert', async () => {
    vi.mocked(geminiClient.callGemini).mockRejectedValueOnce(new Error('API Timeout'));
    
    const zones = [{ zoneId: 'z1', gate: 'Gate 1', occupancyRate: 0.85 }] as ZoneDensity[];
    const alerts = await generateVolunteerAlerts(zones, 'es');
    
    expect(alerts).toHaveLength(1);
    expect(alerts[0].reasoning).toContain('Fallback: Gate reached 85% capacity (API unreachable)');
    expect(alerts[0].translatedInstruction.language).toBe('es');
  });

  it('handles simultaneous alerts for multiple gates', async () => {
    const mockJson = JSON.stringify([
      { zoneId: 'z1', severity: 'high', translatedInstruction: {} },
      { zoneId: 'z2', severity: 'critical', translatedInstruction: {} }
    ]);
    vi.mocked(geminiClient.callGemini).mockResolvedValueOnce(mockJson);

    const zones = [
      { zoneId: 'z1', occupancyRate: 0.81 } as ZoneDensity,
      { zoneId: 'z2', occupancyRate: 0.95 } as ZoneDensity
    ];
    
    const alerts = await generateVolunteerAlerts(zones, 'en');
    expect(alerts).toHaveLength(2);
    expect(alerts[0].zoneId).toBe('z1');
    expect(alerts[1].zoneId).toBe('z2');
  });
  
  it('handles malformed translation request (e.g. unsupported language)', async () => {
    // If we request a weird language like "klingon", the API should still return JSON and fallback
    const mockJson = JSON.stringify([{
      zoneId: 'z1',
      translatedInstruction: { language: 'klingon', text: 'Qapla!' }
    }]);
    vi.mocked(geminiClient.callGemini).mockResolvedValueOnce(mockJson);

    const zones = [{ zoneId: 'z1', occupancyRate: 0.85 }] as ZoneDensity[];
    const alerts = await generateVolunteerAlerts(zones, 'klingon');
    expect(alerts[0].translatedInstruction.language).toBe('klingon');
  });
});
