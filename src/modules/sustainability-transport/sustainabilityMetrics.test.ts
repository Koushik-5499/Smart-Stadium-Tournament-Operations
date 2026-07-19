import { describe, it, expect } from 'vitest';
import { generateSustainabilityData, generateTransportData } from './sustainabilityMetrics';

describe('sustainabilityMetrics', () => {
  it('generates valid sustainability data (happy path)', () => {
    const data = generateSustainabilityData();
    expect(data.length).toBeGreaterThan(0);
    expect(data[0]).toHaveProperty('zoneId');
    expect(data[0].wasteKg).toBeGreaterThanOrEqual(0);
    expect(data[0].carbonKg).toBeGreaterThanOrEqual(0);
  });

  it('generates valid transport data (happy path)', () => {
    const routes = generateTransportData();
    expect(routes.length).toBeGreaterThan(0);
    expect(routes[0]).toHaveProperty('routeId');
    expect(routes[0].currentLoad).toBeGreaterThanOrEqual(0);
    expect(routes[0].capacity).toBeGreaterThan(0);
  });
});
