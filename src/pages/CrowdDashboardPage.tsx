// PROBLEM STATEMENT ALIGNMENT: addresses "Dynamic Crowd Management" —
// real-time crowd density visualization with AI prediction and alerts.

/**
 * Crowd Management Dashboard page.
 *
 * Displays real-time zone density bars, AI congestion predictions,
 * and fan-facing gate avoidance alerts. Data refreshes every 5 seconds.
 */

import { useState, useEffect, useCallback } from 'react';
import { t } from '../shared/i18n';
import type { SupportedLanguage, ZoneDensity, CrowdPrediction } from '../shared/types';
import { generateCrowdData } from '../modules/crowd-management/CrowdSimulator';
import { getAlertLevel, getCongestedZones, formatOccupancy, generateRerouteSuggestion } from '../modules/crowd-management/crowdAnalysis';
import { predictCongestion } from '../modules/crowd-management/crowdPrediction';
import { SEVERITY_COLORS } from '../shared/constants';

interface Props {
  language: SupportedLanguage;
}

export default function CrowdDashboardPage({ language }: Props) {
  const [crowdData, setCrowdData] = useState<ZoneDensity[]>([]);
  const [predictions, setPredictions] = useState<CrowdPrediction[]>([]);
  const [isLoadingPrediction, setIsLoadingPrediction] = useState(false);

  // Refresh crowd data every 5 seconds
  useEffect(() => {
    const update = () => setCrowdData(generateCrowdData());
    update();
    const interval = setInterval(update, 5000);
    return () => clearInterval(interval);
  }, []);

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
      <header className="page-header">
        <h1 className="page-title">{t('crowd.title', language)}</h1>
        <p className="page-subtitle">Real-time crowd density monitoring with AI congestion prediction</p>
      </header>

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

      {/* Stats row */}
      <div className="grid grid-4" style={{ marginBottom: 'var(--space-xl)' }}>
        <div className="stat-card">
          <div className="stat-label">Total Visitors</div>
          <div className="stat-value">{crowdData.reduce((s, z) => s + z.currentCount, 0).toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Average Occupancy</div>
          <div className="stat-value">
            {crowdData.length > 0
              ? formatOccupancy(crowdData.reduce((s, z) => s + z.occupancyRate, 0) / crowdData.length)
              : '—'}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Congested Zones</div>
          <div className="stat-value" style={{ color: congested.length > 0 ? 'var(--accent-danger)' : 'var(--accent-success)' }}>
            {congested.length}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active Zones</div>
          <div className="stat-value">{crowdData.length}</div>
        </div>
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
          {crowdData.map((zone) => {
            const level = getAlertLevel(zone.occupancyRate);
            return (
              <div key={zone.zoneId} className="density-bar-container">
                <div className="density-bar-header">
                  <span>{zone.zoneName}</span>
                  <span style={{ color: SEVERITY_COLORS[level === 'critical' ? 5 : level === 'high' ? 4 : level === 'medium' ? 3 : 1] }}>
                    {formatOccupancy(zone.occupancyRate)}
                  </span>
                </div>
                <div className="density-bar" role="progressbar" aria-valuenow={Math.round(zone.occupancyRate * 100)} aria-valuemin={0} aria-valuemax={100} aria-label={`${zone.zoneName} occupancy`}>
                  <div className={`density-bar-fill ${level}`} style={{ width: `${zone.occupancyRate * 100}%` }} />
                </div>
              </div>
            );
          })}
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
