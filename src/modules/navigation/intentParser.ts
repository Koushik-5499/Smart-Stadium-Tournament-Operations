// PROBLEM STATEMENT ALIGNMENT: addresses "Smart Indoor Navigation" —
// Gemini-powered intent parsing for natural-language navigation queries.

/**
 * Intent parser for navigation chatbot queries.
 *
 * Uses the Gemini API to understand free-text navigation queries
 * (e.g., "How do I get to Gate 12 from here?") and extract structured
 * routing parameters.
 *
 * @module navigation/intentParser
 */

import { callGemini } from '../../shared/geminiClient';

/** Parsed navigation intent from a user query. */
export interface NavigationIntent {
  from: string | null;
  to: string | null;
  type: 'navigation' | 'facility-search' | 'general-question';
  originalQuery: string;
}

const INTENT_SYSTEM_PROMPT = `You are an intent parser for a stadium navigation chatbot at FIFA World Cup 2026.
Parse the user's query and extract navigation parameters.

Available locations: Gate A, Gate B, Gate C, Gate D, Gate E (VIP), Gate 12,
Main Lobby, North Concourse, South Concourse, Section 101, Section 202,
Section 303, Restroom (North), Restroom (South), Food Court North,
Food Court South, Medical Station 1, Emergency Exit.

Respond ONLY in this JSON format:
{
  "from": "location-id or null if not specified",
  "to": "location-id or null",
  "type": "navigation | facility-search | general-question"
}

Location ID mapping:
gate-a, gate-b, gate-c, gate-d, gate-e, gate-12, lobby-main,
concourse-n, concourse-s, section-101, section-202, section-303,
restroom-n, restroom-s, food-north, food-south, medical-1, exit-emergency

If the user asks about a facility type (e.g., "where's the nearest restroom"),
set type to "facility-search" and set "to" to the nearest matching location ID.
If the user just asks a general question, set type to "general-question".`;

/**
 * Parses a user's navigation query using Gemini for intent understanding.
 *
 * @param query - The user's free-text query
 * @returns Parsed navigation intent
 */
export async function parseNavigationIntent(query: string): Promise<NavigationIntent> {
  const cacheKey = `nav-intent-${query.toLowerCase().trim()}`;

  try {
    const response = await callGemini(INTENT_SYSTEM_PROMPT, query, cacheKey);

    const jsonStr = response.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(jsonStr);

    return {
      from: parsed.from ?? null,
      to: parsed.to ?? null,
      type: parsed.type ?? 'general-question',
      originalQuery: query,
    };
  } catch {
    // Fallback: simple keyword matching
    return parseIntentLocally(query);
  }
}

/**
 * Local (offline) fallback for intent parsing using keyword matching.
 * Used when the Gemini API is unavailable.
 *
 * @param query - The user's query
 * @returns Best-effort parsed intent
 */
export function parseIntentLocally(query: string): NavigationIntent {
  const q = query.toLowerCase();

  const locationKeywords: Record<string, string> = {
    'gate a': 'gate-a',
    'gate b': 'gate-b',
    'gate c': 'gate-c',
    'gate d': 'gate-d',
    'gate e': 'gate-e',
    'gate 12': 'gate-12',
    'lobby': 'lobby-main',
    'restroom': 'restroom-n',
    'bathroom': 'restroom-n',
    'food': 'food-north',
    'food court': 'food-north',
    'medical': 'medical-1',
    'first aid': 'medical-1',
    'exit': 'exit-emergency',
    'section 101': 'section-101',
    'section 202': 'section-202',
    'section 303': 'section-303',
    'concourse': 'concourse-n',
  };

  let to: string | null = null;
  let from: string | null = null;

  for (const [keyword, id] of Object.entries(locationKeywords)) {
    if (q.includes(keyword)) {
      if (q.includes('from') && q.indexOf(keyword) > q.indexOf('from')) {
        from = id;
      } else {
        to = to ?? id;
      }
    }
  }

  const isNavigation = q.includes('get to') || q.includes('go to') || q.includes('find') ||
    q.includes('where') || q.includes('how do i') || q.includes('directions') ||
    q.includes('navigate');

  return {
    from: from ?? 'lobby-main',
    to,
    type: to ? 'navigation' : isNavigation ? 'facility-search' : 'general-question',
    originalQuery: query,
  };
}
