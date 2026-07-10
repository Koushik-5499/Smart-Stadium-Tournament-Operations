import { useState, useEffect, useCallback } from 'react';
import type { ZoneDensity } from '../types';
import { generateVolunteerAlerts, type VolunteerAlert } from '../../modules/crowd-management/volunteerCopilot';
import { DENSITY_THRESHOLDS } from '../constants';

export function useVolunteerAlerts(activeData: ZoneDensity[]) {
  const [alerts, setAlerts] = useState<VolunteerAlert[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [fanLanguage, setFanLanguage] = useState<string>('es');

  const analyzeCongestion = useCallback(async (data: ZoneDensity[], targetLang: string) => {
    const congested = data.filter(z => z.occupancyRate >= DENSITY_THRESHOLDS.high);
    if (congested.length === 0) {
      setAlerts([]);
      return;
    }

    setIsAnalyzing(true);
    try {
      const newAlerts = await generateVolunteerAlerts(congested, targetLang);
      setAlerts(newAlerts);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  useEffect(() => {
    analyzeCongestion(activeData, fanLanguage);
  }, [activeData, fanLanguage, analyzeCongestion]);

  return {
    alerts,
    isAnalyzing,
    fanLanguage,
    setFanLanguage,
  };
}
