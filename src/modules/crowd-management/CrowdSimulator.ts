// PROBLEM STATEMENT ALIGNMENT: addresses "Dynamic Crowd Management" —
// real-time crowd density simulation, congestion prediction, and rerouting.

/**
 * Crowd density simulation using mock sensor data.
 *
 * Generates realistic crowd density readings for each stadium zone,
 * simulating IoT sensor feeds that update periodically.
 *
 * @module crowd-management/CrowdSimulator
 */

import { STADIUM_ZONES } from '../../shared/constants';
import type { ZoneDensity } from '../../shared/types';

/**
 * Generates a simulated density reading for all stadium zones.
 * Each zone gets a randomized but realistic occupancy based on
 * time-of-day patterns and random fluctuation.
 *
 * @returns Array of zone density readings
 */
export function generateCrowdData(): ZoneDensity[] {
  const now = Date.now();

  return STADIUM_ZONES.map((zone) => {
    // Base occupancy varies by zone type and simulated time
    const baseOccupancy = getBaseOccupancy(zone.id);
    // Add random fluctuation (±15%)
    const fluctuation = (Math.random() - 0.5) * 0.3;
    const occupancyRate = Math.max(0.05, Math.min(1.0, baseOccupancy + fluctuation));
    const currentCount = Math.round(zone.capacity * occupancyRate);

    return {
      zoneId: zone.id,
      zoneName: zone.name,
      currentCount,
      capacity: zone.capacity,
      occupancyRate,
      timestamp: now,
      gate: zone.gate,
    };
  });
}

/**
 * Returns a base occupancy rate for a zone, simulating typical patterns.
 * VIP and food courts have lower base density; main stands are busier.
 *
 * @param zoneId - The zone identifier
 * @returns Base occupancy rate (0.0 – 1.0)
 */
function getBaseOccupancy(zoneId: string): number {
  const patterns: Record<string, number> = {
    'north-stand': 0.75,
    'south-stand': 0.70,
    'east-wing': 0.65,
    'west-wing': 0.60,
    'vip-section': 0.45,
    'concourse-main': 0.55,
    'food-court-1': 0.50,
    'food-court-2': 0.40,
  };
  return patterns[zoneId] ?? 0.5;
}
