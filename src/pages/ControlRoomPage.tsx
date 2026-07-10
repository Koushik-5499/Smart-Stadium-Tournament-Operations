// PROBLEM STATEMENT ALIGNMENT: addresses "Real-Time Decision Support (Control Room Copilot)" —
// staff-facing dashboard with AI-powered incident management.

/**
 * Control Room Dashboard page.
 *
 * Auth-gated staff dashboard for incident management with AI
 * summarization, severity ranking, and action recommendations.
 */

import { useState } from 'react';
import { t } from '../shared/i18n';
import type { SupportedLanguage } from '../shared/types';
import type { User } from 'firebase/auth';
import { SEVERITY_LABELS, SEVERITY_COLORS } from '../shared/constants';
import { useIncidents } from '../shared/hooks/useIncidents';
import AuthGate from '../shared/components/AuthGate';
import PageHeader from '../shared/components/PageHeader';
import StatCard from '../shared/components/StatCard';

interface Props {
  language: SupportedLanguage;
  user: User | null;
}

export default function ControlRoomPage({ language, user }: Props) {
  const { ranked, counts, isCritical, isAnalyzing, submitIncident } = useIncidents(user);
  
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newLocation, setNewLocation] = useState('');

  const handleSubmit = async () => {
    const success = await submitIncident(newTitle, newDescription, newLocation);
    if (success) {
      setNewTitle('');
      setNewDescription('');
      setNewLocation('');
      setShowForm(false);
    }
  };

  return (
    <AuthGate user={user} language={language} icon="🛡️">
    <div>
      <PageHeader
        title={t('nav.controlRoom', language)}
        subtitle="AI-powered incident management and real-time decision support"
      />

      {isCritical && (
        <div className="alert-banner danger" role="alert" aria-live="assertive">
          ⚠️ CRITICAL INCIDENT ACTIVE — Immediate attention required
        </div>
      )}

      <div className="grid grid-4" style={{ marginBottom: 'var(--space-xl)' }}>
        {([5, 4, 3, 2] as const).map((sev) => (
          <StatCard key={sev} label={SEVERITY_LABELS[sev]} value={counts[sev]} color={SEVERITY_COLORS[sev]} />
        ))}
      </div>

      <div className="grid grid-2">
        {/* Incident Feed */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">{t('incident.title', language)}</h2>
            <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
              + {t('incident.new', language)}
            </button>
          </div>

          {ranked.map((inc) => (
            <div key={inc.id} className="incident-item" role="article" aria-label={`Incident: ${inc.title}`}>
              <div
                className="incident-severity-dot"
                style={{ backgroundColor: SEVERITY_COLORS[inc.severity] }}
                aria-label={`Severity: ${SEVERITY_LABELS[inc.severity]}`}
              />
              <div className="incident-content">
                <div className="incident-title">{inc.title}</div>
                <div className="incident-meta">
                  {inc.location} · {SEVERITY_LABELS[inc.severity]} ·{' '}
                  <span className={`status-badge ${inc.status === 'open' ? 'red' : inc.status === 'in-progress' ? 'yellow' : 'green'}`}>
                    {inc.status}
                  </span>
                </div>
                {inc.aiSummary && (
                  <div className="incident-ai-summary">
                    🤖 {inc.aiSummary}
                    {inc.aiRecommendation && <><br /><strong>Action:</strong> {inc.aiRecommendation}</>}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* New Incident Form */}
        {showForm && (
          <div className="card">
            <h2 className="card-title" style={{ marginBottom: 'var(--space-md)' }}>{t('incident.new', language)}</h2>
            <div className="form-group">
              <label htmlFor="incident-title" className="form-label">Title</label>
              <input id="incident-title" type="text" className="form-input" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Brief incident title" maxLength={200} />
            </div>
            <div className="form-group">
              <label htmlFor="incident-desc" className="form-label">Description</label>
              <textarea id="incident-desc" className="form-textarea form-input" value={newDescription} onChange={(e) => setNewDescription(e.target.value)} placeholder="Detailed description of the incident..." maxLength={2000} />
            </div>
            <div className="form-group">
              <label htmlFor="incident-location" className="form-label">{t('incident.location', language)}</label>
              <input id="incident-location" type="text" className="form-input" value={newLocation} onChange={(e) => setNewLocation(e.target.value)} placeholder="e.g., Gate A, South Concourse" maxLength={100} />
            </div>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={isAnalyzing || !newTitle.trim()}>
              {isAnalyzing ? 'AI Analyzing...' : 'Submit & AI Analyze'}
            </button>
          </div>
        )}
      </div>
    </div>
    </AuthGate>
  );
}
