import { useState } from 'react';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../shared/firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { t } from '../shared/i18n';
import type { SupportedLanguage } from '../shared/types';

interface Props {
  language: SupportedLanguage;
}

export default function LoginPage({ language }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setIsLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate('/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message || 'Google login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="card auth-card">
        <h1 className="page-title" style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
          {t('auth.signIn', language)}
        </h1>

        {error && (
          <div className="alert-banner danger" role="alert" style={{ marginBottom: 'var(--space-md)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleEmailLogin}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">{t('auth.email', language)}</label>
            <input
              id="email"
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              maxLength={254}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password" className="form-label">{t('auth.password', language)}</label>
            <input
              id="password"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              maxLength={128}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
            disabled={isLoading}
          >
            {isLoading ? '...' : t('auth.signIn', language)}
          </button>
        </form>

        <div className="auth-divider">or</div>

        <button
          type="button"
          className="btn btn-secondary"
          style={{ width: '100%', justifyContent: 'center' }}
          onClick={handleGoogleLogin}
          disabled={isLoading}
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
