// PROBLEM STATEMENT ALIGNMENT: addresses "Dynamic Crowd Management" —
// threshold detection, trend analysis, and alert generation.

/**
 * Pure business logic for crowd density analysis.
 *
 * Contains testable, side-effect-free functions for threshold
 * detection, trend analysis, and alert level determination.
 *
 * @module crowd-management/crowdAnalysis
 */

import { DENSITY_THRESHOLDS } from '../../shared/constants';
import type { ZoneDensity, CrowdPrediction } from '../../shared/types';

/**
 * Determines the alert level for a given occupancy rate.
 *
 * @param occupancyRate - Current occupancy (0.0 – 1.0)
 * @returns Alert level string
 */
export function getAlertLevel(occupancyRate: number): CrowdPrediction['alertLevel'] {
  if (occupancyRate >= DENSITY_THRESHOLDS.critical) return 'critical';
  if (occupancyRate >= DENSITY_THRESHOLDS.high) return 'high';
  if (occupancyRate >= DENSITY_THRESHOLDS.medium) return 'medium';
  return 'low';
}

/**
 * Checks if any zone exceeds the high-density threshold.
 *
 * @param zones - Array of current zone density readings
 * @returns Array of zones that are in 'high' or 'critical' alert
 */
export function getCongestedZones(zones: ZoneDensity[]): ZoneDensity[] {
  return zones.filter(
    (z) => z.occupancyRate >= DENSITY_THRESHOLDS.high,
  );
}

/**
 * Detects an upward trend in occupancy over a window of readings.
 * A trend is "rising" if the last 3+ readings show consecutive increases.
 *
 * @param readings - Historical occupancy readings (newest last)
 * @returns true if the trend is rising
 */
export function isRisingTrend(readings: number[]): boolean {
  if (readings.length < 3) return false;

  const recent = readings.slice(-3);
  return recent[1] > recent[0] && recent[2] > recent[1];
}

/**
 * Generates a rerouting suggestion for a congested zone.
 * Picks the least-occupied neighboring zone's gate.
 *
 * @param congestedZone - The zone with high density
 * @param allZones - All current zone readings
 * @returns A human-readable reroute suggestion
 */
export function generateRerouteSuggestion(
  congestedZone: ZoneDensity,
  allZones: ZoneDensity[],
): string {
  const alternatives = allZones
    .filter((z) => z.zoneId !== congestedZone.zoneId && z.occupancyRate < DENSITY_THRESHOLDS.medium)
    .sort((a, b) => a.occupancyRate - b.occupancyRate);

  if (alternatives.length === 0) {
    return `All zones near capacity. Consider delaying entry at ${congestedZone.gate}.`;
  }

  const best = alternatives[0];
  return `Redirect from ${congestedZone.gate} to ${best.gate} (${best.zoneName}) — currently at ${Math.round(best.occupancyRate * 100)}% capacity.`;
}

/**
 * Formats an occupancy rate as a percentage string.
 *
 * @param rate - Occupancy rate (0.0 – 1.0)
 * @returns Formatted percentage string (e.g., "73%")
 */
export function formatOccupancy(rate: number): string {
  return `${Math.round(rate * 100)}%`;
}
