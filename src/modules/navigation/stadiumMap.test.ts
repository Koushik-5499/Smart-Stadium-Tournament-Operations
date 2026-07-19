import { describe, it, expect } from 'vitest';
import { findRoute, resolveLocation, getAllLocations } from './stadiumMap';

describe('stadiumMap', () => {
  describe('findRoute', () => {
    it('finds a route between two known locations (happy path)', () => {
      const route = findRoute('gate-a', 'food-north');
      expect(route).toBeDefined();
      expect(route?.length).toBeGreaterThan(0);
    });

    it('returns null for unknown locations (edge case)', () => {
      const route = findRoute('unknown-1', 'gate-a');
      expect(route).toBeNull();
    });
  });

  describe('resolveLocation', () => {
    it('resolves location ID by exact name', () => {
      const id = resolveLocation('Gate A');
      expect(id).toBe('gate-a');
    });

    it('resolves location ID by type match', () => {
      const id = resolveLocation('restroom');
      expect(id).toBeDefined();
    });

    it('returns null if not found (error case)', () => {
      const id = resolveLocation('mars');
      expect(id).toBeNull();
    });
  });

  describe('getAllLocations', () => {
    it('returns all locations', () => {
      const locs = getAllLocations();
      expect(locs.length).toBeGreaterThan(0);
    });
  });
});
