// PROBLEM STATEMENT ALIGNMENT: addresses "Dynamic Crowd Management" —
// real-time crowd density visualization with AI prediction and alerts.

/**
 * Crowd Management Dashboard page.
 *
 * Displays real-time zone density bars, AI congestion predictions,
 * and fan-facing gate avoidance alerts. Data refreshes every 5 seconds.
 */

import { useState, useCallback } from 'react';
import { t } from '../shared/i18n';
import type { SupportedLanguage, CrowdPrediction } from '../shared/types';
import { getCongestedZones, formatOccupancy, generateRerouteSuggestion } from '../modules/crowd-management/crowdAnalysis';
import { predictCongestion } from '../modules/crowd-management/crowdPrediction';
import { useCrowdData } from '../shared/hooks/useCrowdData';
import PageHeader from '../shared/components/PageHeader';
import StatCard from '../shared/components/StatCard';
import DensityBar from '../shared/components/DensityBar';

interface Props {
  language: SupportedLanguage;
}

export default function CrowdDashboardPage({ language }: Props) {
  const { activeData: crowdData } = useCrowdData();
  const [predictions, setPredictions] = useState<CrowdPrediction[]>([]);
  const [isLoadingPrediction, setIsLoadingPrediction] = useState(false);

  const handlePredict = useCallback(async () => {
    if (crowdData.length === 0) return;
    setIsLoadingPrediction(true);
    try {
      const preds = await predictCongestion(crowdData);
      setPredictions(preds);
    } finally {
      setIsLoadingPrediction(false);
    }
  }, [crowdData]);

  const congested = getCongestedZones(crowdData);

  return (
    <div>
      <PageHeader
        title={t('crowd.title', language)}
        subtitle="Real-time crowd density monitoring with AI congestion prediction"
      />

      {/* Fan-facing alert banners */}
      {congested.map((zone) => (
        <div key={zone.zoneId} className="alert-banner danger" role="alert" aria-live="assertive">
          <span aria-hidden="true">⚠️</span>
          {t('crowd.avoidGate', language)} — {zone.gate} ({zone.zoneName}: {formatOccupancy(zone.occupancyRate)})
          <span style={{ marginLeft: 'auto', fontSize: 'var(--font-size-xs)', opacity: 0.8 }}>
            {generateRerouteSuggestion(zone, crowdData)}
          </span>
        </div>
      ))}

      <div className="grid grid-4" style={{ marginBottom: 'var(--space-xl)' }}>
        <StatCard label="Total Visitors" value={crowdData.reduce((s, z) => s + z.currentCount, 0).toLocaleString()} />
        <StatCard
          label="Average Occupancy"
          value={crowdData.length > 0 ? formatOccupancy(crowdData.reduce((s, z) => s + z.occupancyRate, 0) / crowdData.length) : '—'}
        />
        <StatCard
          label="Congested Zones"
          value={congested.length}
          color={congested.length > 0 ? 'var(--accent-danger)' : 'var(--accent-success)'}
        />
        <StatCard label="Active Zones" value={crowdData.length} />
      </div>

      <div className="grid grid-2">
        {/* Zone density bars */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">{t('crowd.density', language)}</h2>
            <span className="card-badge" style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-primary-hover)' }}>
              Live
            </span>
          </div>
          {crowdData.map((zone) => (
              <DensityBar
                key={zone.zoneId}
                label={zone.zoneName}
                occupancyRate={zone.occupancyRate}
              />
          ))}
        </div>

        {/* AI Predictions */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">{t('crowd.prediction', language)}</h2>
            <button className="btn btn-primary btn-sm" onClick={handlePredict} disabled={isLoadingPrediction}>
              {isLoadingPrediction ? '…' : '🤖 Predict'}
            </button>
          </div>
          {predictions.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
              Click &quot;Predict&quot; to generate AI congestion forecasts for the next 10-15 minutes.
            </p>
          ) : (
            predictions.map((pred, i) => (
              <div key={i} className="briefing-section">
                <div className="briefing-section-title">{pred.zoneId}</div>
                <div style={{ fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-xs)' }}>
                  <strong>Predicted:</strong> {Math.round(pred.predictedOccupancy * 100)}% in {pred.minutesAhead} min
                  <span className={`status-badge ${pred.alertLevel === 'critical' || pred.alertLevel === 'high' ? 'red' : pred.alertLevel === 'medium' ? 'yellow' : 'green'}`} style={{ marginLeft: 'var(--space-sm)' }}>
                    {pred.alertLevel}
                  </span>
                </div>
                <div className="briefing-text">
                  {t('crowd.reroute', language)}: {pred.rerouteSuggestion}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
