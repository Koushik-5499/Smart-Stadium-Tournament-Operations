// PROBLEM STATEMENT ALIGNMENT: addresses "Operational Intelligence Layer" —
// unified GenAI-generated daily operations summary ("morning briefing").

/**
 * Operations Summary page.
 *
 * Staff-facing "morning briefing" dashboard that aggregates crowd,
 * incident, and transport data into an AI-generated summary.
 */

import { useState, useCallback } from 'react';
import { t } from '../shared/i18n';
import type { SupportedLanguage, OperationsSummary } from '../shared/types';
import type { User } from 'firebase/auth';
import { generateDailySummary } from '../modules/operations-summary/summaryGenerator';
import { generateCrowdData } from '../modules/crowd-management/CrowdSimulator';
import { generateTransportData } from '../modules/sustainability-transport/sustainabilityMetrics';
import AuthGate from '../shared/components/AuthGate';
import PageHeader from '../shared/components/PageHeader';

// Demo incidents for summary
const DEMO_INCIDENTS_FOR_SUMMARY = [
  { id: '1', title: 'Medical emergency', description: 'Fan collapsed', location: 'Gate A', reportedAt: Date.now() - 300000, severity: 4 as const, status: 'in-progress' as const, reportedBy: 'Staff', aiSummary: '', aiRecommendation: '' },
  { id: '2', title: 'Overcrowding', description: 'South concourse congestion', location: 'South', reportedAt: Date.now() - 600000, severity: 3 as const, status: 'open' as const, reportedBy: 'Staff', aiSummary: '', aiRecommendation: '' },
];

interface Props {
  language: SupportedLanguage;
  user: User | null;
}

export default function OperationsPage({ language, user }: Props) {
  const [summary, setSummary] = useState<OperationsSummary | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = useCallback(async () => {
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

  return (
    <AuthGate user={user} language={language} icon="📊">
    <div>
      <PageHeader
        title={t('operations.title', language)}
        subtitle="AI-generated daily operations briefing for stadium management"
      />

      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <button className="btn btn-primary" onClick={handleGenerate} disabled={isGenerating}>
          {isGenerating ? (
            <>
              <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
              Generating...
            </>
          ) : (
            <>🤖 {t('operations.generate', language)}</>
          )}
        </button>
      </div>

      {summary && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
            <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, position: 'relative', zIndex: 1 }}>
              {t('operations.briefing', language)}
            </h2>
            <span className={`status-badge ${summary.overallStatus}`}>
              {summary.overallStatus.toUpperCase()}
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)' }}>
              Generated: {new Date(summary.generatedAt).toLocaleString()}
            </span>
          </div>

          <div className="grid grid-2">
            <div className="briefing-section">
              <div className="briefing-section-title">👥 Crowd Management</div>
              <div className="briefing-text">{summary.crowdHighlights}</div>
            </div>

            <div className="briefing-section">
              <div className="briefing-section-title">🛡️ Incidents</div>
              <div className="briefing-text">{summary.incidentHighlights}</div>
            </div>

            <div className="briefing-section">
              <div className="briefing-section-title">🚌 Transportation</div>
              <div className="briefing-text">{summary.transportHighlights}</div>
            </div>

            <div className="briefing-section">
              <div className="briefing-section-title">🌱 Sustainability</div>
              <div className="briefing-text">{summary.sustainabilityHighlights}</div>
            </div>
          </div>

          <div className="card" style={{ marginTop: 'var(--space-lg)' }}>
            <h3 className="card-title" style={{ marginBottom: 'var(--space-md)' }}>Key Recommendations</h3>
            <ul className="recommendation-list">
              {summary.keyRecommendations.map((rec, i) => (
                <li key={i} className="recommendation-item">{rec}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
    </AuthGate>
  );
}
