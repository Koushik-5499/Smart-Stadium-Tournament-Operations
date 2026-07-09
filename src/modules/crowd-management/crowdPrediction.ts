// PROBLEM STATEMENT ALIGNMENT: addresses "Dynamic Crowd Management" —
// AI-powered congestion prediction 10-15 minutes ahead.

/**
 * Gemini-powered crowd congestion prediction.
 *
 * Sends density trend data to the Gemini API and receives
 * congestion predictions 10-15 minutes ahead with rerouting suggestions.
 *
 * @module crowd-management/crowdPrediction
 */

import { callGemini } from '../../shared/geminiClient';
import type { ZoneDensity, CrowdPrediction } from '../../shared/types';
import { getAlertLevel } from './crowdAnalysis';

const PREDICTION_SYSTEM_PROMPT = `You are a crowd management AI for a FIFA World Cup 2026 stadium.
Analyze the provided zone density data and predict congestion levels 10-15 minutes ahead.
For each zone that may become congested, provide:
1. Predicted occupancy percentage
2. Confidence level (low/medium/high)
3. A specific rerouting suggestion

Respond in JSON format:
{
  "predictions": [
    {
      "zoneId": "zone-id",
      "predictedOccupancy": 0.85,
      "minutesAhead": 12,
      "confidence": 0.8,
      "rerouteSuggestion": "Redirect fans to Gate B..."
    }
  ]
}`;

/**
 * Calls Gemini to predict crowd congestion based on current density data.
 *
 * @param currentData - Current density readings for all zones
 * @returns Array of AI-generated crowd predictions
 */
export async function predictCongestion(
  currentData: ZoneDensity[],
): Promise<CrowdPrediction[]> {
  const dataStr = JSON.stringify(
    currentData.map((z) => ({
      zone: z.zoneName,
      occupancy: `${Math.round(z.occupancyRate * 100)}%`,
      count: z.currentCount,
      capacity: z.capacity,
      gate: z.gate,
    })),
  );

  const cacheKey = `crowd-prediction-${currentData.map((z) => Math.round(z.occupancyRate * 10)).join('-')}`;

  try {
    const response = await callGemini(PREDICTION_SYSTEM_PROMPT, dataStr, cacheKey);

    // Parse JSON from the response (handle markdown code blocks)
    const jsonStr = response.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(jsonStr);

    return (parsed.predictions ?? []).map((p: Record<string, unknown>) => ({
      zoneId: String(p.zoneId ?? ''),
      predictedOccupancy: Number(p.predictedOccupancy ?? 0),
      minutesAhead: Number(p.minutesAhead ?? 10),
      confidence: Number(p.confidence ?? 0.5),
      rerouteSuggestion: String(p.rerouteSuggestion ?? ''),
      alertLevel: getAlertLevel(Number(p.predictedOccupancy ?? 0)),
    }));
  } catch {
    // Return empty predictions on failure (don't break the dashboard)
    return [];
  }
}
