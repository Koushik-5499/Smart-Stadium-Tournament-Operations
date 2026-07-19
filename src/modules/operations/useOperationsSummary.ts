import { useState, useCallback } from 'react';
import type { OperationsSummary } from '../../shared/types';
import { generateDailySummary } from '../operations-summary/summaryGenerator';
import { generateCrowdData } from '../crowd-management/CrowdSimulator';
import { generateTransportData } from '../sustainability-transport/sustainabilityMetrics';

// Demo incidents for summary
const DEMO_INCIDENTS_FOR_SUMMARY = [
  { id: '1', title: 'Medical emergency', description: 'Fan collapsed', location: 'Gate A', reportedAt: Date.now() - 300000, severity: 4 as const, status: 'in-progress' as const, reportedBy: 'Staff', aiSummary: '', aiRecommendation: '' },
  { id: '2', title: 'Overcrowding', description: 'South concourse congestion', location: 'South', reportedAt: Date.now() - 600000, severity: 3 as const, status: 'open' as const, reportedBy: 'Staff', aiSummary: '', aiRecommendation: '' },
];

export function useOperationsSummary() {
  const [summary, setSummary] = useState<OperationsSummary | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateSummary = useCallback(async () => {
    setIsGenerating(true);
    try {
      const crowdData = generateCrowdData();
      const transportData = generateTransportData();
      const result = await generateDailySummary(crowdData, DEMO_INCIDENTS_FOR_SUMMARY, transportData);
      setSummary(result);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    summary,
    isGenerating,
    generateSummary
  };
}
