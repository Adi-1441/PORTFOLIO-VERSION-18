import React from 'react';
import { Database, Plus } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Telemetry Records Found',
  message = 'There are currently no records available in this database view.',
  actionLabel,
  onAction,
  icon,
}) => {
  return (
    <div className="glass-panel" style={{
      padding: '3.5rem 2rem',
      textAlign: 'center',
      borderStyle: 'dashed',
      borderColor: 'var(--border-medium)',
      margin: '1.5rem 0'
    }}>
      <div style={{
        width: '52px',
        height: '52px',
        borderRadius: 'var(--radius-sm)',
        background: 'rgba(0, 229, 255, 0.05)',
        border: '1px solid var(--border-cyan)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 1.25rem',
        color: 'var(--accent-cyan)'
      }}>
        {icon || <Database size={24} />}
      </div>

      <div className="hud-tag" style={{ marginBottom: '0.5rem' }}>
        STATUS: 0 RECORDS ACTIVE
      </div>

      <h3 style={{
        fontFamily: 'var(--font-display)',
        fontSize: '1.25rem',
        marginBottom: '0.5rem',
        color: 'var(--text-primary)'
      }}>
        {title}
      </h3>

      <p style={{
        color: 'var(--text-secondary)',
        fontSize: '0.875rem',
        maxWidth: '460px',
        margin: '0 auto 1.5rem'
      }}>
        {message}
      </p>

      {actionLabel && onAction && (
        <button onClick={onAction} className="btn-secondary">
          <Plus size={16} />
          {actionLabel}
        </button>
      )}
    </div>
  );
};
