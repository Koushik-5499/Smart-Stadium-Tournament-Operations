/**
 * Reusable authentication gate component.
 *
 * Extracted from ControlRoomPage and OperationsPage which both
 * render an identical auth-required card for non-authenticated users
 * (DRY / Open-Closed principle).
 *
 * @module shared/components/AuthGate
 */

import { Link } from 'react-router-dom';
import type { User } from 'firebase/auth';
import { t } from '../i18n';
import type { SupportedLanguage } from '../types';

interface Props {
  user: User | null;
  language: SupportedLanguage;
  icon: string;
  children: React.ReactNode;
}

/**
 * Renders children only if the user is authenticated.
 * Otherwise shows a sign-in prompt.
 */
export default function AuthGate({ user, language, icon, children }: Props) {
  if (!user) {
    return (
      <div className="auth-container" role="alert" aria-live="polite">
        <div className="card auth-card" style={{ textAlign: 'center' }}>
          <h2 style={{ marginBottom: 'var(--space-md)' }}>
            {icon} {t('auth.staffOnly', language)}
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-lg)' }}>
            Please sign in with your staff credentials to access this page.
          </p>
          <Link to="/login" className="btn btn-primary">
            {t('auth.signIn', language)}
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
