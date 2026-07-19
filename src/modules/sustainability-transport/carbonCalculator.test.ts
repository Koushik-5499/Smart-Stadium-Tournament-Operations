import { describe, it, expect } from 'vitest';
import { calculateCarbonFootprint, calculateRecyclingRate, formatCarbon } from './carbonCalculator';

describe('carbonCalculator', () => {
  describe('calculateCarbonFootprint', () => {
    it('calculates footprint correctly (happy path)', () => {
      const footprint = calculateCarbonFootprint(100, 50, 10);
      expect(footprint).toBeGreaterThan(0);
    });

    it('handles zero values (edge case)', () => {
      const footprint = calculateCarbonFootprint(0, 0, 0);
      expect(footprint).toBe(0);
    });
  });

  describe('calculateRecyclingRate', () => {
    it('calculates rate correctly', () => {
      const rate = calculateRecyclingRate(100, 30);
      expect(rate).toBe(30);
    });

    it('returns 0 if waste is 0 (error case)', () => {
      const rate = calculateRecyclingRate(0, 0);
      expect(rate).toBe(0);
    });
  });

  describe('formatCarbon', () => {
    it('formats as kg for small values', () => {
      expect(formatCarbon(500)).toBe('500 kg CO₂');
    });

    it('formats as tonnes for large values', () => {
      expect(formatCarbon(2000)).toBe('2.0 tonnes CO₂');
    });
  });
});
