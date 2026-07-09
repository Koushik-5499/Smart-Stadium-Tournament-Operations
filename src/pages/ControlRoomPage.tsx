// PROBLEM STATEMENT ALIGNMENT: addresses "Real-Time Decision Support (Control Room Copilot)" —
// staff-facing dashboard with AI-powered incident management.

/**
 * Control Room Dashboard page.
 *
 * Auth-gated staff dashboard for incident management with AI
 * summarization, severity ranking, and action recommendations.
 */

import { useState, useCallback } from 'react';
import { t } from '../shared/i18n';
import type { SupportedLanguage, Incident, SeverityLevel } from '../shared/types';
import type { User } from 'firebase/auth';
import { rankIncidents, countBySeverity, hasCriticalIncident } from '../modules/control-room/incidentPrioritizer';
import { analyzeIncident } from '../modules/control-room/incidentAnalyzer';
import { SEVERITY_LABELS, SEVERITY_COLORS } from '../shared/constants';
import { sanitizeInput } from '../shared/validators';
import { Link } from 'react-router-dom';

interface Props {
  language: SupportedLanguage;
  user: User | null;
}

// Sample incidents for demo
const DEMO_INCIDENTS: Incident[] = [
  { id: '1', title: 'Medical emergency near Gate A', description: 'Fan collapsed near gate entrance, paramedics called.', location: 'Gate A', reportedAt: Date.now() - 300000, severity: 4, status: 'in-progress', aiSummary: 'Medical emergency: fan collapse at Gate A', aiRecommendation: 'Dispatch medical team and clear surrounding area', reportedBy: 'Security Officer' },
  { id: '2', title: 'Overcrowding at South Concourse', description: 'South concourse congestion increasing rapidly, fans unable to move freely.', location: 'South Concourse', reportedAt: Date.now() - 600000, severity: 3, status: 'open', aiSummary: 'Crowd congestion at South Concourse', aiRecommendation: 'Open secondary gates and redirect flow via North route', reportedBy: 'Crowd Monitor' },
  { id: '3', title: 'Broken escalator Level 2', description: 'Escalator to Level 2 east wing has stopped working.', location: 'East Wing', reportedAt: Date.now() - 1200000, severity: 2, status: 'open', aiSummary: 'Escalator malfunction in East Wing', aiRecommendation: 'Post signage directing to elevators and stairs', reportedBy: 'Maintenance' },
  { id: '4', title: 'Suspicious package near Exit B', description: 'Unattended bag found near emergency exit B.', location: 'Exit B', reportedAt: Date.now() - 60000, severity: 5, status: 'open', aiSummary: 'Security alert: unattended bag at Exit B', aiRecommendation: 'Evacuate 50m radius, notify bomb squad, alert security', reportedBy: 'Security Patrol' },
];

export default function ControlRoomPage({ language, user }: Props) {
  const [incidents, setIncidents] = useState<Incident[]>(DEMO_INCIDENTS);
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Auth gate
  if (!user) {
    return (
      <div className="auth-container">
        <div className="card auth-card" style={{ textAlign: 'center' }}>
          <h2 style={{ marginBottom: 'var(--space-md)' }}>🛡️ {t('auth.staffOnly', language)}</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-lg)' }}>
            Please sign in with your staff credentials to access the Control Room.
          </p>
          <Link to="/login" className="btn btn-primary">{t('auth.signIn', language)}</Link>
        </div>
      </div>
    );
  }

  const ranked = rankIncidents(incidents);
  const counts = countBySeverity(incidents);
  const isCritical = hasCriticalIncident(incidents);

  const handleSubmit = useCallback(async () => {
    if (!newTitle.trim() || !newDescription.trim()) return;
    setIsAnalyzing(true);

    try {
      const analysis = await analyzeIncident(sanitizeInput(newDescription));

      const newIncident: Incident = {
        id: `inc-${Date.now()}`,
        title: sanitizeInput(newTitle),
        description: sanitizeInput(newDescription),
        location: sanitizeInput(newLocation) || 'Unknown',
        reportedAt: Date.now(),
        severity: analysis.suggestedSeverity as SeverityLevel,
        status: 'open',
        aiSummary: analysis.summary,
        aiRecommendation: analysis.recommendation,
        reportedBy: user.email ?? 'Staff',
      };

      setIncidents((prev) => [newIncident, ...prev]);
      setNewTitle('');
      setNewDescription('');
      setNewLocation('');
      setShowForm(false);
    } finally {
      setIsAnalyzing(false);
    }
  }, [newTitle, newDescription, newLocation, user.email]);

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">{t('nav.controlRoom', language)}</h1>
        <p className="page-subtitle">AI-powered incident management and real-time decision support</p>
      </header>

      {isCritical && (
        <div className="alert-banner danger" role="alert" aria-live="assertive">
          ⚠️ CRITICAL INCIDENT ACTIVE — Immediate attention required
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-4" style={{ marginBottom: 'var(--space-xl)' }}>
        {([5, 4, 3, 2] as const).map((sev) => (
          <div key={sev} className="stat-card">
            <div className="stat-label">{SEVERITY_LABELS[sev]}</div>
            <div className="stat-value" style={{ color: SEVERITY_COLORS[sev] }}>{counts[sev]}</div>
          </div>
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
  );
}
