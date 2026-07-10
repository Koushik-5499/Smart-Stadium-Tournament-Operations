import { useState, useCallback } from 'react';
import type { Incident, SeverityLevel } from '../types';
import { rankIncidents, countBySeverity, hasCriticalIncident } from '../../modules/control-room/incidentPrioritizer';
import { analyzeIncident } from '../../modules/control-room/incidentAnalyzer';
import { sanitizeInput } from '../validators';
import type { User } from 'firebase/auth';

// Sample incidents for demo
const DEMO_INCIDENTS: Incident[] = [
  { id: '1', title: 'Medical emergency near Gate A', description: 'Fan collapsed near gate entrance, paramedics called.', location: 'Gate A', reportedAt: Date.now() - 300000, severity: 4, status: 'in-progress', aiSummary: 'Medical emergency: fan collapse at Gate A', aiRecommendation: 'Dispatch medical team and clear surrounding area', reportedBy: 'Security Officer' },
  { id: '2', title: 'Overcrowding at South Concourse', description: 'South concourse congestion increasing rapidly, fans unable to move freely.', location: 'South Concourse', reportedAt: Date.now() - 600000, severity: 3, status: 'open', aiSummary: 'Crowd congestion at South Concourse', aiRecommendation: 'Open secondary gates and redirect flow via North route', reportedBy: 'Crowd Monitor' },
  { id: '3', title: 'Broken escalator Level 2', description: 'Escalator to Level 2 east wing has stopped working.', location: 'East Wing', reportedAt: Date.now() - 1200000, severity: 2, status: 'open', aiSummary: 'Escalator malfunction in East Wing', aiRecommendation: 'Post signage directing to elevators and stairs', reportedBy: 'Maintenance' },
  { id: '4', title: 'Suspicious package near Exit B', description: 'Unattended bag found near emergency exit B.', location: 'Exit B', reportedAt: Date.now() - 60000, severity: 5, status: 'open', aiSummary: 'Security alert: unattended bag at Exit B', aiRecommendation: 'Evacuate 50m radius, notify bomb squad, alert security', reportedBy: 'Security Patrol' },
];

export function useIncidents(user: User | null) {
  const [incidents, setIncidents] = useState<Incident[]>(DEMO_INCIDENTS);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const ranked = rankIncidents(incidents);
  const counts = countBySeverity(incidents);
  const isCritical = hasCriticalIncident(incidents);

  const submitIncident = useCallback(async (
    title: string,
    description: string,
    location: string
  ) => {
    if (!title.trim() || !description.trim()) return false;
    setIsAnalyzing(true);

    try {
      const analysis = await analyzeIncident(sanitizeInput(description));

      const newIncident: Incident = {
        id: `inc-${Date.now()}`,
        title: sanitizeInput(title),
        description: sanitizeInput(description),
        location: sanitizeInput(location) || 'Unknown',
        reportedAt: Date.now(),
        severity: analysis.suggestedSeverity as SeverityLevel,
        status: 'open',
        aiSummary: analysis.summary,
        aiRecommendation: analysis.recommendation,
        reportedBy: user?.email ?? 'Staff',
      };

      setIncidents((prev) => [newIncident, ...prev]);
      return true;
    } finally {
      setIsAnalyzing(false);
    }
  }, [user?.email]);

  return {
    ranked,
    counts,
    isCritical,
    isAnalyzing,
    submitIncident,
  };
}
