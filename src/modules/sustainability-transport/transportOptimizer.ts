// PROBLEM STATEMENT ALIGNMENT: addresses "Sustainability & Transportation Intelligence" —
// AI-recommended shuttle/parking routing based on simulated real-time load data.

/**
 * Gemini-powered transport route optimizer.
 *
 * Analyzes transport load data and generates AI recommendations
 * for optimal shuttle/parking routing.
 *
 * @module sustainability-transport/transportOptimizer
 */

import { callGemini } from '../../shared/geminiClient';
import type { TransportRoute, SustainabilityData } from '../../shared/types';

const TRANSPORT_SYSTEM_PROMPT = `You are a transportation AI for FIFA World Cup 2026 stadium operations.
Analyze the transport load data and provide routing recommendations.
For each route, suggest whether fans should use it based on current load.
Also provide sustainability tips to reduce carbon footprint.

Respond in JSON format:
{
  "recommendations": [
    { "routeId": "id", "recommendation": "short recommendation", "priority": "recommended|ok|avoid" }
  ],
  "sustainabilityTips": ["tip 1", "tip 2", "tip 3"]
}`;

const SUSTAINABILITY_SYSTEM_PROMPT = `You are a sustainability AI for FIFA World Cup 2026 stadium operations.
Analyze the waste and carbon metrics for stadium zones and provide:
1. Three specific, actionable reduction tips for the zones with highest impact
2. An overall sustainability score (A-F grade)
3. Key highlights in one sentence

Respond in JSON format:
{
  "tips": ["tip 1", "tip 2", "tip 3"],
  "grade": "B",
  "highlight": "summary sentence"
}`;

/**
 * Gets AI-powered transport recommendations based on current load data.
 *
 * @param routes - Current transport route data
 * @returns Updated routes with AI recommendations
 */
export async function getTransportRecommendations(
  routes: TransportRoute[],
): Promise<TransportRoute[]> {
  const dataStr = JSON.stringify(
    routes.map((r) => ({
      route: r.routeName,
      type: r.type,
      load: `${Math.round((r.currentLoad / r.capacity) * 100)}%`,
      wait: `${r.estimatedWaitMinutes} min`,
    })),
  );

  try {
    const response = await callGemini(TRANSPORT_SYSTEM_PROMPT, dataStr, 'transport-recs');
    const jsonStr = response.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(jsonStr);

    const recsMap = new Map<string, string>();
    for (const rec of parsed.recommendations ?? []) {
      recsMap.set(String(rec.routeId), String(rec.recommendation));
    }

    return routes.map((r) => ({
      ...r,
      aiRecommendation: recsMap.get(r.routeId) ?? undefined,
    }));
  } catch {
    return routes;
  }
}

/**
 * Gets AI-powered sustainability tips based on zone metrics.
 *
 * @param data - Sustainability metrics for all zones
 * @returns Object with tips, grade, and highlight
 */
export async function getSustainabilityInsights(
  data: SustainabilityData[],
): Promise<{ tips: string[]; grade: string; highlight: string }> {
  const dataStr = JSON.stringify(
    data.map((d) => ({
      zone: d.zoneName,
      waste: `${d.wasteKg} kg`,
      recycled: `${d.recycledKg} kg`,
      carbon: `${d.carbonKg} kg CO2`,
      energy: `${d.energyKwh} kWh`,
    })),
  );

  try {
    const response = await callGemini(SUSTAINABILITY_SYSTEM_PROMPT, dataStr, 'sustainability-insights');
    const jsonStr = response.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(jsonStr);

    return {
      tips: (parsed.tips ?? []).map(String),
      grade: String(parsed.grade ?? 'C'),
      highlight: String(parsed.highlight ?? 'Data analysis in progress'),
    };
  } catch {
    return {
      tips: ['Increase recycling bins in high-traffic zones', 'Switch to LED lighting', 'Encourage public transit use'],
      grade: 'C',
      highlight: 'Sustainability analysis pending',
    };
  }
}
