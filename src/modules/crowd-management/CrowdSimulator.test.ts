import { describe, it, expect } from 'vitest';
import { generateCrowdData } from './CrowdSimulator';

describe('CrowdSimulator', () => {
  it('generates crowd data with valid densities (happy path)', () => {
    const data = generateCrowdData();
    expect(data.length).toBeGreaterThan(0);
    expect(data[0]).toHaveProperty('zoneId');
    expect(data[0].occupancyRate).toBeGreaterThanOrEqual(0);
    expect(data[0].occupancyRate).toBeLessThanOrEqual(1);
    expect(data[0].currentCount).toBeLessThanOrEqual(data[0].capacity);
  });
});
