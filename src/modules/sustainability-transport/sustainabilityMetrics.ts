// PROBLEM STATEMENT ALIGNMENT: addresses "Sustainability & Transportation Intelligence" —
// simulated waste/carbon data and AI-recommended shuttle/parking routing.

/**
 * Simulated sustainability metrics and transport load data.
 *
 * Generates realistic environmental and transportation data to
 * power the sustainability dashboard and transport optimizer.
 *
 * @module sustainability-transport/sustainabilityMetrics
 */

import type { SustainabilityData, TransportRoute } from '../../shared/types';
import { STADIUM_ZONES } from '../../shared/constants';

/**
 * Generates simulated sustainability metrics for all zones.
 *
 * @returns Array of sustainability data per zone
 */
export function generateSustainabilityData(): SustainabilityData[] {
  const now = Date.now();

  return STADIUM_ZONES.map((zone) => {
    const baseWaste = zone.capacity * 0.002; // ~2g waste per person
    const fluctuation = 0.7 + Math.random() * 0.6;

    const wasteKg = Math.round(baseWaste * fluctuation);
    const recycledKg = Math.round(wasteKg * (0.3 + Math.random() * 0.35));
    const energyKwh = Math.round(zone.capacity * 0.05 * fluctuation);
    const carbonKg = Math.round(energyKwh * 0.42 + (wasteKg - recycledKg) * 0.58);

    return {
      zoneId: zone.id,
      zoneName: zone.name,
      wasteKg,
      recycledKg,
      carbonKg,
      energyKwh,
      timestamp: now,
    };
  });
}

/**
 * Generates simulated transport route data.
 *
 * @returns Array of transport route statuses
 */
export function generateTransportData(): TransportRoute[] {
  const routes: TransportRoute[] = [
    {
      routeId: 'shuttle-1',
      routeName: 'Airport Express Shuttle',
      type: 'shuttle',
      currentLoad: Math.round(40 + Math.random() * 50),
      capacity: 100,
      estimatedWaitMinutes: Math.round(5 + Math.random() * 15),
    },
    {
      routeId: 'shuttle-2',
      routeName: 'City Center Shuttle',
      type: 'shuttle',
      currentLoad: Math.round(30 + Math.random() * 60),
      capacity: 100,
      estimatedWaitMinutes: Math.round(3 + Math.random() * 12),
    },
    {
      routeId: 'shuttle-3',
      routeName: 'Hotel District Shuttle',
      type: 'shuttle',
      currentLoad: Math.round(20 + Math.random() * 40),
      capacity: 80,
      estimatedWaitMinutes: Math.round(8 + Math.random() * 20),
    },
    {
      routeId: 'parking-a',
      routeName: 'Parking Lot A (North)',
      type: 'parking',
      currentLoad: Math.round(600 + Math.random() * 300),
      capacity: 1000,
      estimatedWaitMinutes: Math.round(2 + Math.random() * 8),
    },
    {
      routeId: 'parking-b',
      routeName: 'Parking Lot B (South)',
      type: 'parking',
      currentLoad: Math.round(400 + Math.random() * 400),
      capacity: 1000,
      estimatedWaitMinutes: Math.round(1 + Math.random() * 5),
    },
    {
      routeId: 'metro-1',
      routeName: 'Metro Line 1 — Stadium Station',
      type: 'metro',
      currentLoad: Math.round(200 + Math.random() * 300),
      capacity: 600,
      estimatedWaitMinutes: Math.round(2 + Math.random() * 6),
    },
  ];

  return routes;
}
