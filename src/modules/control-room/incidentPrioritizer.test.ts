/**
 * Unit tests for incidentPrioritizer.ts
 */

import { describe, it, expect } from 'vitest';
import { rankIncidents, countBySeverity, hasCriticalIncident } from './incidentPrioritizer';
import type { Incident, SeverityLevel } from '../../shared/types';

describe('incidentPrioritizer.ts', () => {
  const mockIncidents: Incident[] = [
    { id: '1', title: 'Low Priority', description: '', location: '', reportedAt: 100, severity: 2 as SeverityLevel, status: 'open', reportedBy: 'Staff' },
    { id: '2', title: 'Critical', description: '', location: '', reportedAt: 200, severity: 5 as SeverityLevel, status: 'open', reportedBy: 'Staff' },
    { id: '3', title: 'Critical Older', description: '', location: '', reportedAt: 50, severity: 5 as SeverityLevel, status: 'open', reportedBy: 'Staff' },
    { id: '4', title: 'Resolved', description: '', location: '', reportedAt: 300, severity: 5 as SeverityLevel, status: 'resolved', reportedBy: 'Staff' },
    { id: '5', title: 'Medium', description: '', location: '', reportedAt: 150, severity: 3 as SeverityLevel, status: 'open', reportedBy: 'Staff' },
  ];

  describe('rankIncidents', () => {
    it('ranks open/in-progress critical incidents first, sorted by newest', () => {
      const ranked = rankIncidents(mockIncidents);
      
      expect(ranked[0].id).toBe('2'); // Critical, newest
      expect(ranked[1].id).toBe('3'); // Critical, older
      expect(ranked[2].id).toBe('5'); // Medium
      expect(ranked[3].id).toBe('1'); // Low
      expect(ranked[4].id).toBe('4'); // Resolved (always last)
    });
  });

  describe('countBySeverity', () => {
    it('returns accurate counts for active incidents', () => {
      const counts = countBySeverity(mockIncidents);
      
      expect(counts[5]).toBe(2); // Two open criticals
      expect(counts[4]).toBe(0);
      expect(counts[3]).toBe(1); // One open medium
      expect(counts[2]).toBe(1); // One open low
      expect(counts[1]).toBe(0);
    });

    it('ignores resolved incidents in counts', () => {
      const resolvedOnly: Incident[] = [
        { ...mockIncidents[3] }
      ];
      const counts = countBySeverity(resolvedOnly);
      expect(counts[5]).toBe(0);
    });
  });

  describe('hasCriticalIncident', () => {
    it('returns true if any open/in-progress incident is severity 5', () => {
      expect(hasCriticalIncident(mockIncidents)).toBe(true);
    });

    it('returns false if critical incidents are all resolved', () => {
      const resolvedOnly: Incident[] = [
        { ...mockIncidents[3] }
      ];
      expect(hasCriticalIncident(resolvedOnly)).toBe(false);
    });

    it('returns false if no critical incidents exist', () => {
      const noCriticals: Incident[] = mockIncidents.filter(i => i.severity < 5);
      expect(hasCriticalIncident(noCriticals)).toBe(false);
    });
  });
});
