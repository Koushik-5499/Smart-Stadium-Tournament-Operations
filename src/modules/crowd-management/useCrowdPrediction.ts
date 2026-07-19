import { useState, useCallback } from 'react';
import type { CrowdPrediction, ZoneDensity } from '../../shared/types';
import { predictCongestion } from './crowdPrediction';

export function useCrowdPrediction(crowdData: ZoneDensity[]) {
  const [predictions, setPredictions] = useState<CrowdPrediction[]>([]);
  const [isLoadingPrediction, setIsLoadingPrediction] = useState(false);

  const generatePrediction = useCallback(async () => {
    if (crowdData.length === 0) return;
    setIsLoadingPrediction(true);
    try {
      const preds = await predictCongestion(crowdData);
      setPredictions(preds);
    } finally {
      setIsLoadingPrediction(false);
    }
  }, [crowdData]);

  return {
    predictions,
    isLoadingPrediction,
    generatePrediction
  };
}
