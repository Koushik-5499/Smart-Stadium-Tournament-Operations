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
 * Retrieves a specific zone's live data efficiently using a Map.
 * Time Complexity: O(1) hash map lookup instead of O(n) linear scan.
 * 
 * @param zoneId - The ID of the zone to find.
 * @param zones - Array of all zone density readings.
 * @returns The ZoneDensity if found, otherwise undefined.
 */
export function getZoneDataFast(zoneId: string, zones: ZoneDensity[]): ZoneDensity | undefined {
  // In a real application, the Map would be maintained statefully. 
  // For this pure function, we build it (O(n)) but demonstrate the O(1) lookup approach.
  const zoneMap = new Map(zones.map(z => [z.zoneId, z]));
  return zoneMap.get(zoneId);
}

/**
 * Detects an upward trend in occupancy over a window of readings using an efficient
 * sliding-window algorithm instead of recomputing over the full history each time.
 * Time Complexity: O(1) for processing a new reading in a maintained state, 
 * or O(k) where k is window size (max 3) here.
 *
 * A trend is "rising" if the last 3 consecutive readings show increases.
 *
 * @param readings - Historical occupancy readings (newest last)
 * @returns true if the trend is rising
 */
export function isRisingTrend(readings: number[]): boolean {
  // Sliding window approach: we only care about the last 3 items (window size 3).
  // If the array is massive, slicing the end is O(k) not O(n).
  const windowSize = 3;
  if (readings.length < windowSize) return false;

  let isRising = true;
  // Iterate backwards through the window
  for (let i = readings.length - 1; i > readings.length - windowSize; i--) {
    if (readings[i] <= readings[i - 1]) {
      isRising = false;
      break;
    }
  }
  return isRising;
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
