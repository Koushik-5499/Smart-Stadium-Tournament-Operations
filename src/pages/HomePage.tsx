// PROBLEM STATEMENT ALIGNMENT: addresses "Dynamic Crowd Management" + "Multilingual Assistance" —
// primary Volunteer Co-pilot dashboard combining XAI crowd alerts with translated fan instructions.

/**
 * Volunteer Co-pilot Dashboard
 * 
 * Primary view for stadium volunteers. Monitors live crowd data,
 * triggers XAI alerts for congested gates, and provides multilingual
 * instructions to show to fans.
 */

import { useState, useEffect, useCallback } from 'react';
import type { SupportedLanguage, ZoneDensity } from '../shared/types';
import { generateCrowdData } from '../modules/crowd-management/CrowdSimulator';
import { getAlertLevel, formatOccupancy } from '../modules/crowd-management/crowdAnalysis';
import { generateVolunteerAlerts, type VolunteerAlert } from '../modules/crowd-management/volunteerCopilot';
import CsvUploader from '../shared/components/CsvUploader';
import StadiumMapEmbed from '../shared/components/StadiumMapEmbed';
import { SUPPORTED_LANGUAGES, DENSITY_THRESHOLDS, SEVERITY_COLORS } from '../shared/constants';

interface Props {
  language: SupportedLanguage;
}

export default function HomePage(_props: Props) {
  const [liveData, setLiveData] = useState<ZoneDensity[]>([]);
  const [customData, setCustomData] = useState<ZoneDensity[]>([]);
  const [alerts, setAlerts] = useState<VolunteerAlert[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // The language the volunteer wants to translate instructions INTO (for the fan)
  const [fanLanguage, setFanLanguage] = useState<string>('es');

  // Determine active data source (Custom CSV overrides live feed)
  const activeData = customData.length > 0 ? customData : liveData;

  // Poll live data if no custom data is active
  useEffect(() => {
    if (customData.length > 0) return;
    
    const update = () => setLiveData(generateCrowdData());
    update();
    const interval = setInterval(update, 5000);
    return () => clearInterval(interval);
  }, [customData]);

  // Trigger XAI Analysis when data changes and gates cross 80%
  const analyzeCongestion = useCallback(async (data: ZoneDensity[], targetLang: string) => {
    const congested = data.filter(z => z.occupancyRate >= DENSITY_THRESHOLDS.high); // >= 0.8
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

  // Run analysis when data or target language changes
  useEffect(() => {
    analyzeCongestion(activeData, fanLanguage);
  }, [activeData, fanLanguage, analyzeCongestion]);

  return (
    <div>
      <header className="page-header" style={{ marginBottom: 'var(--space-md)' }}>
        <h1 className="page-title">Volunteer Co-pilot</h1>
        <p className="page-subtitle">Real-time crowd monitoring & multilingual fan assistance</p>
      </header>

      <CsvUploader onDataLoaded={setCustomData} />

      <div className="grid grid-2" style={{ alignItems: 'start' }}>
        
        {/* Left Column: Alerts & Instructions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Action Center</h2>
              {isAnalyzing && <span className="spinner" style={{ width: '16px', height: '16px' }} />}
            </div>

            {alerts.length === 0 && !isAnalyzing ? (
              <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', padding: 'var(--space-md) 0' }}>
                All gates are currently operating below 80% capacity. No immediate actions required.
              </div>
            ) : (
              alerts.map(alert => (
                <div key={alert.zoneId} className={`alert-banner ${alert.severity === 'critical' ? 'danger' : 'warning'}`} style={{ marginBottom: 'var(--space-md)', flexDirection: 'column', alignItems: 'stretch' }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
                    <span aria-hidden="true" style={{ fontSize: '1.25rem', marginRight: 'var(--space-sm)' }}>⚠️</span>
                    <strong style={{ fontSize: 'var(--font-size-md)' }}>{alert.gate} ({alert.zoneId})</strong>
                  </div>
                  
                  <div style={{ background: 'var(--bg-card)', padding: 'var(--space-sm)', borderRadius: 'var(--radius-sm)', marginBottom: 'var(--space-sm)' }}>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>AI Reasoning</div>
                    <div style={{ fontSize: 'var(--font-size-sm)' }}>{alert.reasoning}</div>
                  </div>

                  <div style={{ background: 'var(--bg-card)', padding: 'var(--space-sm)', borderRadius: 'var(--radius-sm)', marginBottom: 'var(--space-sm)', borderLeft: '3px solid var(--accent-primary)' }}>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Recommended Action</div>
                    <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>{alert.action}</div>
                  </div>

                  <div style={{ marginTop: 'var(--space-sm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Fan Translation</span>
                      <select 
                        className="input" 
                        style={{ padding: '4px 8px', fontSize: 'var(--font-size-xs)', height: 'auto' }}
                        value={fanLanguage}
                        onChange={(e) => setFanLanguage(e.target.value)}
                      >
                        {SUPPORTED_LANGUAGES.map(lang => (
                          <option key={lang.code} value={lang.code}>{lang.name}</option>
                        ))}
                      </select>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.1)', padding: 'var(--space-md)', borderRadius: 'var(--radius-sm)', fontSize: '1.1rem', textAlign: 'center', fontWeight: 'bold' }}>
                      {alert.translatedInstruction.text}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-md)' }}>
                    <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => window.alert("Marked resolved. Alert will clear if capacity drops.")}>Mark Resolved</button>
                    <button className="btn btn-secondary btn-sm" style={{ flex: 1 }}>Escalate to Control Room</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Live Data & Map */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <StadiumMapEmbed liveData={liveData} alerts={alerts} />
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Live Gate Density</h2>
              <span className="card-badge" style={{ background: customData.length > 0 ? 'rgba(234,179,8,0.15)' : 'rgba(99, 102, 241, 0.15)', color: customData.length > 0 ? '#ca8a04' : 'var(--accent-primary-hover)' }}>
                {customData.length > 0 ? 'CSV Data' : 'Live Sensor Data'}
              </span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
              {activeData.map((zone) => {
                const level = getAlertLevel(zone.occupancyRate);
                return (
                  <div key={zone.zoneId} className="density-bar-container">
                    <div className="density-bar-header">
                      <span>{zone.gate} <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>({zone.zoneName})</span></span>
                      <span style={{ color: SEVERITY_COLORS[level === 'critical' ? 5 : level === 'high' ? 4 : level === 'medium' ? 3 : 1] }}>
                        {formatOccupancy(zone.occupancyRate)}
                      </span>
                    </div>
                    <div className="density-bar" role="progressbar" aria-valuenow={Math.round(zone.occupancyRate * 100)} aria-valuemin={0} aria-valuemax={100}>
                      <div className={`density-bar-fill ${level}`} style={{ width: `${zone.occupancyRate * 100}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
