import React from 'react';
import { AlertCircle, ShieldAlert, WifiOff, Settings, RefreshCw } from 'lucide-react';

export type ErrorClassification = 'database' | 'permission' | 'network' | 'config' | 'generic';

interface ErrorStateProps {
  type?: ErrorClassification;
  title?: string;
  message?: string;
  details?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  type = 'generic',
  title,
  message,
  details,
  onRetry,
}) => {
  const getBadgeAndIcon = () => {
    switch (type) {
      case 'permission':
        return {
          tag: 'SECURITY // RLS PERMISSION DENIED (42501)',
          color: '#f59e0b',
          icon: <ShieldAlert size={26} />,
          defaultTitle: 'Row Level Security Clearance Required',
          defaultMessage: 'Access to this dataset requires elevated administrative credentials or valid session token.',
        };
      case 'network':
        return {
          tag: 'TELEMETRY // NETWORK FAULT',
          color: '#38bdf8',
          icon: <WifiOff size={26} />,
          defaultTitle: 'Network Communication Timeout',
          defaultMessage: 'Unable to establish an encrypted socket with the Supabase database cluster.',
        };
      case 'config':
        return {
          tag: 'SYSTEM // CONFIGURATION DEFICIT',
          color: '#a855f7',
          icon: <Settings size={26} />,
          defaultTitle: 'Environment Keys Not Initialized',
          defaultMessage: 'VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be populated in the root .env file.',
        };
      case 'database':
      default:
        return {
          tag: 'DATABASE // QUERY FAULT',
          color: '#ef4444',
          icon: <AlertCircle size={26} />,
          defaultTitle: 'Database Query Interrupted',
          defaultMessage: 'An error occurred while executing the PostgreSQL query against the active schema.',
        };
    }
  };

  const meta = getBadgeAndIcon();

  return (
    <div className="glass-panel" style={{
      padding: '3rem 2rem',
      textAlign: 'center',
      borderColor: `${meta.color}55`,
      boxShadow: `0 0 25px ${meta.color}22`,
      margin: '1.5rem 0'
    }}>
      <div style={{
        width: '52px',
        height: '52px',
        borderRadius: 'var(--radius-sm)',
        background: `${meta.color}15`,
        border: `1px solid ${meta.color}66`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 1.25rem',
        color: meta.color
      }}>
        {meta.icon}
      </div>

      <div className="hud-tag" style={{
        color: meta.color,
        borderColor: `${meta.color}66`,
        background: `${meta.color}12`,
        marginBottom: '0.75rem'
      }}>
        {meta.tag}
      </div>

      <h3 style={{
        fontFamily: 'var(--font-display)',
        fontSize: '1.25rem',
        marginBottom: '0.5rem',
        color: 'var(--text-primary)'
      }}>
        {title || meta.defaultTitle}
      </h3>

      <p style={{
        color: 'var(--text-secondary)',
        fontSize: '0.875rem',
        maxWidth: '520px',
        margin: '0 auto 1.25rem',
        lineHeight: 1.5
      }}>
        {message || meta.defaultMessage}
      </p>

      {details && (
        <pre className="code-block" style={{
          maxWidth: '580px',
          margin: '0 auto 1.5rem',
          textAlign: 'left',
          fontSize: '0.75rem',
          maxHeight: '100px',
          overflowY: 'auto'
        }}>
          {details}
        </pre>
      )}

      {onRetry && (
        <button onClick={onRetry} className="btn-secondary" style={{ borderColor: `${meta.color}66` }}>
          <RefreshCw size={15} />
          RETRY QUERY
        </button>
      )}
    </div>
  );
};
