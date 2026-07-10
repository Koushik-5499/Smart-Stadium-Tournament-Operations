// PROBLEM STATEMENT ALIGNMENT: addresses "Real-Time Decision Support" —
// incident severity scoring, ranking, and AI-generated action recommendations.

/**
 * Pure business logic for incident prioritization.
 *
 * Scores and ranks incidents by severity, recency, and status.
 * All functions are side-effect-free and independently testable.
 *
 * @module control-room/incidentPrioritizer
 */

import type { Incident, SeverityLevel } from '../../shared/types';

/**
 * Weight multipliers for severity levels.
 * Critical incidents (5) get 5x weight, info (1) gets 1x.
 */
const SEVERITY_WEIGHTS: Record<SeverityLevel, number> = {
  1: 1,
  2: 2,
  3: 4,
  4: 7,
  5: 10,
};

/**
 * Calculates a priority score for an incident based on severity,
 * recency, and status. Higher score = higher priority.
 *
 * @param incident - The incident to score
 * @returns Priority score (higher = more urgent)
 */
export function calculatePriorityScore(incident: Incident): number {
  const severityWeight = SEVERITY_WEIGHTS[incident.severity] ?? 1;

  // Recency boost: incidents in the last 30 minutes get a boost
  const ageMinutes = (Date.now() - incident.reportedAt) / 60000;
  const recencyBoost = Math.max(0, 1 - ageMinutes / 60);

  // Status multiplier: open incidents are more urgent
  const statusMultiplier = incident.status === 'open' ? 1.5 : incident.status === 'in-progress' ? 1.0 : 0.3;

  return severityWeight * (1 + recencyBoost) * statusMultiplier;
}

/**
 * Sorts incidents by priority score (highest first).
 *
 * @param incidents - Array of incidents to sort
 * @returns New array sorted by priority (descending)
 */
export function rankIncidents(incidents: Incident[]): Incident[] {
  return [...incidents].sort(
    (a, b) => calculatePriorityScore(b) - calculatePriorityScore(a),
  );
}

/**
 * Filters incidents by minimum severity level.
 *
 * @param incidents - Array of incidents
 * @param minSeverity - Minimum severity to include
 * @returns Filtered array
 */
export function filterBySeverity(
  incidents: Incident[],
  minSeverity: SeverityLevel,
): Incident[] {
  return incidents.filter((i) => i.severity >= minSeverity);
}

/**
 * Returns a count of incidents grouped by severity level.
 *
 * @param incidents - Array of incidents
 * @returns Record mapping severity level to count
 */
export function countBySeverity(
  incidents: Incident[],
): Record<SeverityLevel, number> {
  const counts: Record<SeverityLevel, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  for (const incident of incidents) {
    if (incident.status !== 'resolved') {
      counts[incident.severity] = (counts[incident.severity] ?? 0) + 1;
    }
  }

  return counts;
}

/**
 * Checks if any incident in the list is critical (severity 5) and open.
 *
 * @param incidents - Array of incidents
 * @returns true if a critical open incident exists
 */
export function hasCriticalIncident(incidents: Incident[]): boolean {
  return incidents.some((i) => i.severity === 5 && i.status !== 'resolved');
}
