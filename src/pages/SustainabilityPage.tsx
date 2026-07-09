// PROBLEM STATEMENT ALIGNMENT: addresses "Sustainability & Transportation Intelligence" —
// waste/carbon dashboard and AI-recommended shuttle/parking routing.

/**
 * Sustainability & Transportation page.
 *
 * Combined dashboard showing waste/carbon metrics per zone with
 * AI-generated reduction tips, and transport load with AI routing.
 */

import { useState, useEffect, useCallback } from 'react';
import { t } from '../shared/i18n';
import type { SupportedLanguage, SustainabilityData, TransportRoute } from '../shared/types';
import { generateSustainabilityData, generateTransportData } from '../modules/sustainability-transport/sustainabilityMetrics';
import { getSustainabilityInsights, getTransportRecommendations } from '../modules/sustainability-transport/transportOptimizer';
import { calculateRecyclingRate, formatCarbon } from '../modules/sustainability-transport/carbonCalculator';

interface Props {
  language: SupportedLanguage;
}

export default function SustainabilityPage({ language }: Props) {
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

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">{t('sustainability.title', language)} & {t('transport.title', language)}</h1>
        <p className="page-subtitle">Environmental metrics and AI-powered transportation intelligence</p>
      </header>

      {/* Stats */}
      <div className="grid grid-4" style={{ marginBottom: 'var(--space-xl)' }}>
        <div className="stat-card">
          <div className="stat-label">{t('sustainability.waste', language)}</div>
          <div className="stat-value">{totalWaste.toLocaleString()} kg</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Recycling Rate</div>
          <div className="stat-value" style={{ color: 'var(--accent-success)' }}>{calculateRecyclingRate(totalWaste, totalRecycled)}%</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">{t('sustainability.carbon', language)}</div>
          <div className="stat-value">{formatCarbon(totalCarbon)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Energy Usage</div>
          <div className="stat-value">{totalEnergy.toLocaleString()} kWh</div>
        </div>
      </div>

      <div className="grid grid-2">
        {/* Sustainability by zone */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Zone Metrics</h2>
            <button className="btn btn-primary btn-sm" onClick={handleGetInsights} disabled={isLoadingInsights}>
              {isLoadingInsights ? '…' : '🤖 AI Insights'}
            </button>
          </div>

          {/* Chart visualization */}
          <div className="chart-placeholder" aria-label="Zone sustainability chart">
            <div className="chart-bars">
              {susData.map((d) => (
                <div key={d.zoneId} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div
                    className="chart-bar"
                    style={{
                      height: `${Math.min(100, (d.carbonKg / (totalCarbon / susData.length)) * 50)}px`,
                      background: `linear-gradient(to top, var(--accent-success), ${d.carbonKg > totalCarbon / susData.length ? 'var(--accent-warning)' : 'var(--accent-secondary)'})`,
                    }}
                    role="img"
                    aria-label={`${d.zoneName}: ${d.carbonKg} kg CO2`}
                  />
                  <span style={{ fontSize: '9px', color: 'var(--text-muted)', writingMode: 'vertical-rl', maxHeight: 60, overflow: 'hidden' }}>
                    {d.zoneName}
                  </span>
                </div>
              ))}
            </div>
            <span>Carbon emissions by zone (kg CO₂)</span>
          </div>

          {/* AI Insights */}
          {insights && (
            <div style={{ marginTop: 'var(--space-md)' }}>
              <div className="briefing-section">
                <div className="briefing-section-title">
                  Sustainability Grade: <span style={{ fontSize: 'var(--font-size-2xl)' }}>{insights.grade}</span>
                </div>
                <div className="briefing-text">{insights.highlight}</div>
              </div>
              <div className="briefing-section">
                <div className="briefing-section-title">{t('sustainability.tips', language)}</div>
                <ul className="recommendation-list">
                  {insights.tips.map((tip, i) => (
                    <li key={i} className="recommendation-item">{tip}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Transport Routes */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">{t('transport.title', language)}</h2>
          </div>

          {transportData.map((route) => {
            const loadPercent = Math.round((route.currentLoad / route.capacity) * 100);
            const level = loadPercent >= 85 ? 'critical' : loadPercent >= 70 ? 'high' : loadPercent >= 50 ? 'medium' : 'low';
            return (
              <div key={route.routeId} style={{ marginBottom: 'var(--space-md)' }}>
                <div className="density-bar-container">
                  <div className="density-bar-header">
                    <span>
                      {route.type === 'shuttle' ? '🚌' : route.type === 'parking' ? '🅿️' : '🚇'}{' '}
                      {route.routeName}
                    </span>
                    <span>{loadPercent}% · {route.estimatedWaitMinutes} min wait</span>
                  </div>
                  <div className="density-bar" role="progressbar" aria-valuenow={loadPercent} aria-valuemin={0} aria-valuemax={100} aria-label={`${route.routeName} load`}>
                    <div className={`density-bar-fill ${level}`} style={{ width: `${loadPercent}%` }} />
                  </div>
                </div>
                {route.aiRecommendation && (
                  <div className="incident-ai-summary" style={{ marginTop: 4 }}>
                    🤖 {route.aiRecommendation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
