/**
 * Custom hook for live crowd density data with CSV override support.
 *
 * Encapsulates the polling interval for simulated crowd data and
 * the ability to override it with user-uploaded CSV data.
 * Separates data-fetching concerns from presentational components
 * (Single Responsibility Principle).
 *
 * @module shared/hooks/useCrowdData
 */

import { useState, useEffect } from 'react';
import type { ZoneDensity } from '../types';
import { generateCrowdData } from '../../modules/crowd-management/CrowdSimulator';

/** Polling interval for live crowd data (milliseconds). */
const POLL_INTERVAL_MS = 5000;

/**
 * Manages live crowd data with optional CSV override.
 *
 * @returns Object containing live data, custom data setter, and the
 *          currently active data source.
 */
export function useCrowdData() {
  const [liveData, setLiveData] = useState<ZoneDensity[]>([]);
  const [customData, setCustomData] = useState<ZoneDensity[]>([]);

  // The active data source: CSV override takes priority
  const activeData = customData.length > 0 ? customData : liveData;

  // Poll live data if no custom data is active
  useEffect(() => {
    if (customData.length > 0) return;

    const update = () => setLiveData(generateCrowdData());
    update();
    const interval = setInterval(update, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [customData]);

  return {
    liveData,
    customData,
    setCustomData,
    activeData,
  };
}
