import { callGemini } from '../../shared/geminiClient';
import type { ZoneDensity } from '../../shared/types';
import { getAlertLevel } from './crowdAnalysis';

/**
 * Structured JSON response expected from the Volunteer Copilot XAI.
 */
export interface VolunteerAlert {
  zoneId: string;
  gate: string;
  /** Detailed explanation of WHY the alert fired (e.g. current count, threshold, rate of increase) */
  reasoning: string;
  /** Action for the volunteer to take */
  action: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  /** Action translated into the fan's language */
  translatedInstruction: {
    language: string;
    text: string;
  };
}

const SYSTEM_PROMPT = `You are the "Volunteer Co-pilot" AI for a FIFA World Cup 2026 stadium.
Your job is to assist a stadium volunteer who has no prior operational knowledge and faces language barriers.
You will receive real-time crowd density data for a specific gate that has crossed the 80% capacity threshold.
You must analyze the data and generate a structured JSON alert.

CRITICAL REQUIREMENTS:
1. Explainable AI (XAI): Provide a "reasoning" field explaining exactly WHY the alert fired based on the provided data. Explain the current count, capacity threshold, and rate of increase if available. Do not use generic text; explain the math/logic.
2. Provide a clear "action" for the volunteer (e.g., "Redirect incoming fans to Gate X").
3. Provide a "translatedInstruction" that the volunteer can show to a fan approaching the gate. Translate the instruction into the requested target language.

You MUST respond ONLY with a valid JSON array of alert objects, matching this structure:
[
  {
    "zoneId": "...",
    "gate": "...",
    "reasoning": "...",
    "action": "...",
    "severity": "high" | "critical",
    "translatedInstruction": {
      "language": "es",
      "text": "..."
    }
  }
]

FEW-SHOT EXAMPLES:
Input:
Target Language: es
Data: {"zoneId":"north-stand","gate":"Gate 7","currentCount":840,"capacity":1000,"occupancyRate":0.84,"trend":"+12% in 3 mins"}

Output:
[
  {
    "zoneId": "north-stand",
    "gate": "Gate 7",
    "reasoning": "Gate 7 is at 84% capacity (840/1000) and density increased 12% in the last 3 minutes. Action is required before it reaches critical levels.",
    "action": "Redirect incoming fans to Gate 8 which has lower occupancy.",
    "severity": "high",
    "translatedInstruction": {
      "language": "es",
      "text": "La Puerta 7 está llena. Por favor, diríjase a la Puerta 8 para entrar al estadio más rápido."
    }
  }
]
`;

/**
 * Analyzes congested zones and generates a Volunteer Alert using Gemini XAI.
 * 
 * @param congestedZones Array of zones currently over the threshold
 * @param targetLanguage The language code to translate the fan instruction into
 * @returns Array of structured VolunteerAlert objects
 */
export async function generateVolunteerAlerts(
  congestedZones: ZoneDensity[],
  targetLanguage: string = 'en'
): Promise<VolunteerAlert[]> {
  if (congestedZones.length === 0) return [];

  // Provide trend data if possible, for this simple implementation we just provide the live data.
  // In a real app we'd calculate trend using the sliding window from crowdAnalysis.ts.
  const dataStr = JSON.stringify({
    targetLanguage,
    data: congestedZones.map(z => ({
      zoneId: z.zoneId,
      gate: z.gate,
      currentCount: z.currentCount,
      capacity: z.capacity,
      occupancyRate: z.occupancyRate
    }))
  });

  // Ensure unique cache key based on data and language
  const cacheKey = `volunteer-alert-${targetLanguage}-${congestedZones.map(z => z.zoneId + Math.round(z.occupancyRate * 100)).join('-')}`;

  try {
    const response = await callGemini(SYSTEM_PROMPT, dataStr, cacheKey);
    const jsonStr = response.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(jsonStr);

    return (Array.isArray(parsed) ? parsed : [parsed]).map((p: any) => ({
      zoneId: String(p.zoneId ?? ''),
      gate: String(p.gate ?? ''),
      reasoning: String(p.reasoning ?? 'Alert triggered due to high density.'),
      action: String(p.action ?? 'Monitor situation.'),
      severity: (p.severity === 'critical' ? 'critical' : 'high') as 'high'|'critical',
      translatedInstruction: {
        language: String(p.translatedInstruction?.language ?? targetLanguage),
        text: String(p.translatedInstruction?.text ?? 'Please use another gate.')
      }
    }));
  } catch (error) {
    console.error('Failed to generate volunteer alert:', error);
    // Graceful fallback on API failure
    return congestedZones.map(z => ({
      zoneId: z.zoneId,
      gate: z.gate,
      reasoning: `Fallback: Gate reached ${Math.round(z.occupancyRate * 100)}% capacity (API unreachable).`,
      action: 'Redirect fans to nearest open gate.',
      severity: getAlertLevel(z.occupancyRate) as 'high' | 'critical',
      translatedInstruction: {
        language: targetLanguage,
        text: 'This gate is full. Please use another gate.'
      }
    }));
  }
}
