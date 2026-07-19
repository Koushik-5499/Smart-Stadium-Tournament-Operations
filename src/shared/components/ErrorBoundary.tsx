import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="alert-banner danger" style={{ margin: 'var(--space-xl)' }} role="alert">
          <div>
            <h2 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-sm)' }}>Something went wrong</h2>
            <p style={{ fontSize: 'var(--font-size-sm)' }}>
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            <button
              className="btn btn-secondary btn-sm"
              style={{ marginTop: 'var(--space-md)' }}
              onClick={() => this.setState({ hasError: false })}
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
