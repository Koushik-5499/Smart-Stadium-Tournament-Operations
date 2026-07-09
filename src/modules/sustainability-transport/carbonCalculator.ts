// PROBLEM STATEMENT ALIGNMENT: addresses "Sustainability & Transportation Intelligence" —
// carbon estimation formulas and waste/recycling metrics.

/**
 * Pure business logic for carbon footprint and waste estimation.
 *
 * Provides testable, side-effect-free functions for calculating
 * environmental impact metrics per stadium zone.
 *
 * @module sustainability-transport/carbonCalculator
 */

/** Carbon emission factors (kg CO2 per unit). */
const EMISSION_FACTORS = {
  /** kg CO2 per kWh of electricity. */
  electricity: 0.42,
  /** kg CO2 per kg of waste sent to landfill. */
  wasteLandfill: 0.58,
  /** kg CO2 saved per kg of recycled material. */
  recyclingOffset: -0.31,
  /** kg CO2 per vehicle-km for shuttle buses. */
  shuttlePerKm: 0.089,
  /** kg CO2 per parked car (average event duration). */
  parkedCar: 2.3,
} as const;

/**
 * Calculates the carbon footprint for a zone based on energy, waste, and recycling.
 *
 * @param energyKwh - Energy consumed in kWh
 * @param wasteKg - Total waste generated in kg
 * @param recycledKg - Waste recycled in kg
 * @returns Total carbon footprint in kg CO2
 */
export function calculateCarbonFootprint(
  energyKwh: number,
  wasteKg: number,
  recycledKg: number,
): number {
  const energyCarbon = energyKwh * EMISSION_FACTORS.electricity;
  const wasteCarbon = (wasteKg - recycledKg) * EMISSION_FACTORS.wasteLandfill;
  const recyclingOffset = recycledKg * EMISSION_FACTORS.recyclingOffset;

  return Math.max(0, energyCarbon + wasteCarbon + recyclingOffset);
}

/**
 * Calculates the recycling rate as a percentage.
 *
 * @param wasteKg - Total waste in kg
 * @param recycledKg - Recycled waste in kg
 * @returns Recycling rate percentage (0-100)
 */
export function calculateRecyclingRate(wasteKg: number, recycledKg: number): number {
  if (wasteKg <= 0) return 0;
  return Math.round((recycledKg / wasteKg) * 100);
}

/**
 * Estimates transport carbon for a number of shuttles and parked cars.
 *
 * @param shuttleTrips - Number of shuttle trips
 * @param avgTripKm - Average trip distance in km
 * @param parkedCars - Number of parked cars
 * @returns Transport carbon in kg CO2
 */
export function calculateTransportCarbon(
  shuttleTrips: number,
  avgTripKm: number,
  parkedCars: number,
): number {
  return (shuttleTrips * avgTripKm * EMISSION_FACTORS.shuttlePerKm) +
    (parkedCars * EMISSION_FACTORS.parkedCar);
}

/**
 * Formats a carbon value with appropriate units.
 *
 * @param carbonKg - Carbon in kg
 * @returns Formatted string (e.g., "1.2 tonnes CO₂" or "450 kg CO₂")
 */
export function formatCarbon(carbonKg: number): string {
  if (carbonKg >= 1000) {
    return `${(carbonKg / 1000).toFixed(1)} tonnes CO₂`;
  }
  return `${Math.round(carbonKg)} kg CO₂`;
}
