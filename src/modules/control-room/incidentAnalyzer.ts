// PROBLEM STATEMENT ALIGNMENT: addresses "Real-Time Decision Support" —
// AI-generated incident summaries, severity assessment, and action recommendations.

/**
 * Gemini-powered incident analysis for the Control Room Copilot.
 *
 * Ingests incident report text and uses GenAI to summarize, assess
 * severity, and suggest next actions.
 *
 * @module control-room/incidentAnalyzer
 */

import { callGemini } from '../../shared/geminiClient';

/** AI analysis result for an incident. */
export interface IncidentAnalysis {
  summary: string;
  suggestedSeverity: number;
  recommendation: string;
  category: string;
}

const INCIDENT_SYSTEM_PROMPT = `You are an AI assistant for the Control Room at FIFA World Cup 2026 stadium operations.
Analyze the incident report and provide:
1. A one-line summary (max 15 words)
2. Suggested severity (1-5 scale: 1=info, 2=low, 3=medium, 4=high, 5=critical)
3. A specific, actionable recommendation (one sentence)
4. Category (medical, security, crowd, infrastructure, weather, other)

Respond in JSON format:
{
  "summary": "Brief summary",
  "suggestedSeverity": 3,
  "recommendation": "Action to take",
  "category": "category"
}`;

/**
 * Analyzes an incident report using Gemini AI.
 *
 * @param reportText - The raw incident report text
 * @returns AI-generated analysis with summary, severity, and recommendation
 */
export async function analyzeIncident(reportText: string): Promise<IncidentAnalysis> {
  try {
    const response = await callGemini(INCIDENT_SYSTEM_PROMPT, reportText);

    const jsonStr = response.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(jsonStr);

    return {
      summary: String(parsed.summary ?? 'Incident reported'),
      suggestedSeverity: Math.min(5, Math.max(1, Number(parsed.suggestedSeverity ?? 3))),
      recommendation: String(parsed.recommendation ?? 'Investigate and assess'),
      category: String(parsed.category ?? 'other'),
    };
  } catch {
    return {
      summary: 'Incident report received',
      suggestedSeverity: 3,
      recommendation: 'Review and assess manually',
      category: 'other',
    };
  }
}
