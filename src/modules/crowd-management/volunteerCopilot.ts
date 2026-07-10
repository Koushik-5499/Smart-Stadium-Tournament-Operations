import type { ZoneDensity } from '../../shared/types';
import { getAlertLevel } from './crowdAnalysis';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '../../shared/firebaseConfig';

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
    const functions = getFunctions(app);
    const generateAlerts = httpsCallable(functions, 'generateVolunteerAlerts');
    
  try {
    const result = await generateAlerts({ congestedZones, targetLanguage });
    const parsed = result.data as any[];

    return parsed.map((p: any) => ({
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
