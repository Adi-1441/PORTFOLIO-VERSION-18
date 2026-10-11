import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[MECHNEXUS RUNTIME ERROR CAUGHT]:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '400px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <div className="glass-panel" style={{
            maxWidth: '560px',
            padding: '2.5rem',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            boxShadow: '0 0 30px rgba(239, 68, 68, 0.2)'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              color: '#ef4444'
            }}>
              <AlertTriangle size={28} />
            </div>

            <div className="hud-tag" style={{
              color: '#ef4444',
              borderColor: 'rgba(239, 68, 68, 0.4)',
              background: 'rgba(239, 68, 68, 0.08)'
            }}>
              SYSTEM DIAGNOSTIC EXCEPTION
            </div>

            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
              {this.props.fallbackTitle || 'Subsystem Interruption'}
            </h2>

            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.925rem' }}>
              An unexpected engineering subsystem fault was trapped. The system remains protected.
            </p>

            {this.state.error?.message && (
              <pre className="code-block" style={{
                marginBottom: '1.5rem',
                textAlign: 'left',
                fontSize: '0.75rem',
                maxHeight: '120px',
                overflowY: 'auto',
                color: '#fca5a5'
              }}>
                {this.state.error.message}
              </pre>
            )}

            <button
              onClick={this.handleReset}
              className="btn-secondary"
              style={{
                borderColor: 'rgba(239, 68, 68, 0.5)',
                color: '#fca5a5'
              }}
            >
              <RefreshCw size={16} />
              RE-INITIALIZE SUBSYSTEM
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
