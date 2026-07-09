/**
 * Root application component.
 *
 * Sets up routing, the sidebar navigation, language context,
 * and lazy-loaded module pages for efficiency.
 */

import { useState, useEffect, lazy, Suspense, useCallback } from 'react';
import { Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from './shared/firebaseConfig';
import { t, getTextDirection } from './shared/i18n';
import type { SupportedLanguage } from './shared/types';
import { SUPPORTED_LANGUAGES } from './shared/constants';

/* ── Lazy-loaded pages (efficiency: faster initial load) ─────── */
const HomePage = lazy(() => import('./pages/HomePage'));
const CrowdDashboardPage = lazy(() => import('./pages/CrowdDashboardPage'));
const NavigationChatPage = lazy(() => import('./pages/NavigationChatPage'));
const ControlRoomPage = lazy(() => import('./pages/ControlRoomPage'));
const ChatAssistantPage = lazy(() => import('./pages/ChatAssistantPage'));
const SustainabilityPage = lazy(() => import('./pages/SustainabilityPage'));
const OperationsPage = lazy(() => import('./pages/OperationsPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));

/** Loading fallback for Suspense. */
function LoadingFallback() {
  return (
    <div className="loading-container" role="status" aria-label="Loading page">
      <div className="spinner" />
      <span>Loading...</span>
    </div>
  );
}

export default function App() {
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Listen to auth state changes
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return unsub;
  }, []);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const dir = getTextDirection(language);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  return (
    <div className="app-layout" dir={dir} lang={language}>
      {/* Skip navigation link (Accessibility) */}
      <a href="#main-content" className="skip-nav">
        Skip to main content
      </a>

      {/* Sidebar Navigation */}
      <nav
        className={`sidebar ${sidebarOpen ? 'open' : ''}`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="sidebar-header">
          <NavLink to="/" className="sidebar-logo" aria-label="Smart Stadium Home">
            <div className="sidebar-logo-icon" aria-hidden="true">⚽</div>
            <div>
              <span className="sidebar-logo-text">{t('app.title', language)}</span>
              <span className="sidebar-logo-subtitle">{t('app.subtitle', language)}</span>
            </div>
          </NavLink>
        </div>

        <div className="sidebar-nav">
          <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="nav-link-icon" aria-hidden="true">🏠</span>
            {t('nav.home', language)}
          </NavLink>
          <NavLink to="/crowd" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="nav-link-icon" aria-hidden="true">👥</span>
            {t('nav.crowd', language)}
          </NavLink>
          <NavLink to="/navigation" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="nav-link-icon" aria-hidden="true">🗺️</span>
            {t('nav.navigation', language)}
          </NavLink>
          <NavLink to="/chat" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="nav-link-icon" aria-hidden="true">💬</span>
            {t('nav.chat', language)}
          </NavLink>
          <NavLink to="/sustainability" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="nav-link-icon" aria-hidden="true">🌱</span>
            {t('nav.sustainability', language)}
          </NavLink>

          {/* Staff-only routes */}
          <div style={{ marginTop: 'var(--space-md)', padding: '0 var(--space-lg)', marginBottom: 'var(--space-xs)' }}>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Staff
            </span>
          </div>
          <NavLink to="/control-room" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="nav-link-icon" aria-hidden="true">🛡️</span>
            {t('nav.controlRoom', language)}
          </NavLink>
          <NavLink to="/operations" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="nav-link-icon" aria-hidden="true">📊</span>
            {t('nav.operations', language)}
          </NavLink>
        </div>

        <div className="sidebar-footer">
          {/* Language Switcher (Accessibility + Multilingual) */}
          <div style={{ marginBottom: 'var(--space-sm)' }}>
            <label
              id="language-switcher-label"
              style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', display: 'block', marginBottom: 'var(--space-xs)' }}
            >
              {t('language.select', language)}
            </label>
            <div className="language-switcher" role="radiogroup" aria-labelledby="language-switcher-label">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  className={`language-btn ${language === lang.code ? 'active' : ''}`}
                  onClick={() => setLanguage(lang.code)}
                  role="radio"
                  aria-checked={language === lang.code}
                  aria-label={`Switch to ${lang.name}`}
                >
                  {lang.name}
                </button>
              ))}
            </div>
          </div>

          {/* Auth button */}
          {user ? (
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
              <div style={{ marginBottom: '4px' }}>{user.email}</div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => auth.signOut()}
                style={{ width: '100%' }}
              >
                {t('nav.logout', language)}
              </button>
            </div>
          ) : (
            <NavLink to="/login" className="btn btn-primary btn-sm" style={{ width: '100%', textAlign: 'center' }}>
              {t('nav.login', language)}
            </NavLink>
          )}
        </div>
      </nav>

      {/* Mobile nav toggle */}
      <button
        className="mobile-nav-toggle"
        onClick={toggleSidebar}
        aria-label="Toggle navigation menu"
        aria-expanded={sidebarOpen}
      >
        {sidebarOpen ? '✕' : '☰'}
      </button>

      {/* Main Content */}
      <main id="main-content" className="main-content" role="main">
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<HomePage language={language} />} />
            <Route path="/crowd" element={<CrowdDashboardPage language={language} />} />
            <Route path="/navigation" element={<NavigationChatPage language={language} />} />
            <Route path="/chat" element={<ChatAssistantPage language={language} />} />
            <Route path="/sustainability" element={<SustainabilityPage language={language} />} />
            <Route path="/control-room" element={<ControlRoomPage language={language} user={user} />} />
            <Route path="/operations" element={<OperationsPage language={language} user={user} />} />
            <Route path="/login" element={<LoginPage language={language} />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}
