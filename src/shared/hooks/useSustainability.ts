import { useState, useEffect, useCallback } from 'react';
import type { SustainabilityData, TransportRoute } from '../types';
import { generateSustainabilityData, generateTransportData } from '../../modules/sustainability-transport/sustainabilityMetrics';
import { getSustainabilityInsights, getTransportRecommendations } from '../../modules/sustainability-transport/transportOptimizer';

export function useSustainability() {
  const [susData, setSusData] = useState<SustainabilityData[]>([]);
  const [transportData, setTransportData] = useState<TransportRoute[]>([]);
  const [insights, setInsights] = useState<{ tips: string[]; grade: string; highlight: string } | null>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);

  useEffect(() => {
    setSusData(generateSustainabilityData());
    setTransportData(generateTransportData());
  }, []);

  const handleGetInsights = useCallback(async () => {
    setIsLoadingInsights(true);
    try {
      const [susInsights, transportRecs] = await Promise.all([
        getSustainabilityInsights(susData),
        getTransportRecommendations(transportData),
      ]);
      setInsights(susInsights);
      setTransportData(transportRecs);
    } finally {
      setIsLoadingInsights(false);
    }
  }, [susData, transportData]);

  const totalWaste = susData.reduce((s, d) => s + d.wasteKg, 0);
  const totalRecycled = susData.reduce((s, d) => s + d.recycledKg, 0);
  const totalCarbon = susData.reduce((s, d) => s + d.carbonKg, 0);
  const totalEnergy = susData.reduce((s, d) => s + d.energyKwh, 0);

  return {
    susData,
    transportData,
    insights,
    isLoadingInsights,
    handleGetInsights,
    totals: {
      waste: totalWaste,
      recycled: totalRecycled,
      carbon: totalCarbon,
      energy: totalEnergy,
    }
  };
}
