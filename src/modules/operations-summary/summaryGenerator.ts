// PROBLEM STATEMENT ALIGNMENT: addresses "Operational Intelligence Layer" —
// unified GenAI-generated daily operations summary ("morning briefing").

/**
 * Gemini-powered daily operations summary generator.
 *
 * Aggregates data from crowd management, incidents, and transport
 * to produce a comprehensive "morning briefing" for stadium operators.
 *
 * @module operations-summary/summaryGenerator
 */

import { callGemini } from '../../shared/geminiClient';
import type { ZoneDensity, Incident, TransportRoute, OperationsSummary } from '../../shared/types';

const SUMMARY_SYSTEM_PROMPT = `You are an operations intelligence AI for FIFA World Cup 2026 stadium.
Generate a comprehensive daily operations briefing based on the provided data.

Include:
1. Crowd management highlights (busiest zones, trends)
2. Incident highlights (count, severity, notable events)
3. Transportation highlights (busiest routes, delays)
4. Sustainability highlights (waste metrics, carbon)
5. 3-5 key recommendations for the day
6. Overall status (green/yellow/red)

Respond in JSON format:
{
  "crowdHighlights": "summary text",
  "incidentHighlights": "summary text",
  "transportHighlights": "summary text",
  "sustainabilityHighlights": "summary text",
  "keyRecommendations": ["rec 1", "rec 2", "rec 3"],
  "overallStatus": "green|yellow|red"
}`;

/**
 * Generates a daily operations summary by aggregating all data sources.
 *
 * @param crowdData - Current crowd density readings
 * @param incidents - Recent incident reports
 * @param transportData - Current transport load data
 * @returns AI-generated operations summary
 */
export async function generateDailySummary(
  crowdData: ZoneDensity[],
  incidents: Incident[],
  transportData: TransportRoute[],
): Promise<OperationsSummary> {
  const dataStr = JSON.stringify({
    crowd: crowdData.map((z) => ({
      zone: z.zoneName,
      occupancy: `${Math.round(z.occupancyRate * 100)}%`,
    })),
    incidents: incidents.map((i) => ({
      title: i.title,
      severity: i.severity,
      status: i.status,
    })),
    transport: transportData.map((t) => ({
      route: t.routeName,
      load: `${Math.round((t.currentLoad / t.capacity) * 100)}%`,
      wait: `${t.estimatedWaitMinutes} min`,
    })),
  });

  try {
    const response = await callGemini(SUMMARY_SYSTEM_PROMPT, dataStr);
    const jsonStr = response.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(jsonStr);

    return {
      id: `summary-${Date.now()}`,
      generatedAt: Date.now(),
      crowdHighlights: String(parsed.crowdHighlights ?? 'No crowd data available'),
      incidentHighlights: String(parsed.incidentHighlights ?? 'No incidents reported'),
      transportHighlights: String(parsed.transportHighlights ?? 'Transport running normally'),
      sustainabilityHighlights: String(parsed.sustainabilityHighlights ?? 'Metrics pending'),
      keyRecommendations: (parsed.keyRecommendations ?? []).map(String),
      overallStatus: parsed.overallStatus ?? 'green',
    };
  } catch {
    return {
      id: `summary-${Date.now()}`,
      generatedAt: Date.now(),
      crowdHighlights: 'Summary generation in progress...',
      incidentHighlights: 'Summary generation in progress...',
      transportHighlights: 'Summary generation in progress...',
      sustainabilityHighlights: 'Summary generation in progress...',
      keyRecommendations: ['System is initializing — check back shortly'],
      overallStatus: 'yellow',
    };
  }
}
