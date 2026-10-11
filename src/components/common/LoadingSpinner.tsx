import React from 'react';

interface LoadingSpinnerProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  label = 'INITIALIZING SYSTEM TELEMETRY...', 
  size = 'md' 
}) => {
  const pixelSize = size === 'sm' ? 24 : size === 'lg' ? 64 : 40;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      gap: '1.25rem'
    }}>
      <div style={{
        position: 'relative',
        width: pixelSize,
        height: pixelSize
      }}>
        {/* Outer Bearing Ring */}
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          border: '2px dashed rgba(0, 229, 255, 0.4)',
          animation: 'rotate-slow 6s linear infinite'
        }} />
        {/* Inner Precision Arc */}
        <div style={{
          position: 'absolute',
          inset: size === 'sm' ? 3 : size === 'lg' ? 8 : 5,
          borderRadius: '50%',
          border: '2px solid transparent',
          borderTopColor: 'var(--accent-cyan)',
          borderRightColor: 'var(--accent-blue)',
          animation: 'rotate-reverse 1.2s cubic-bezier(0.5, 0.1, 0.4, 0.9) infinite'
        }} />
        {/* Center Caliper Dot */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: size === 'sm' ? 4 : 6,
          height: size === 'sm' ? 4 : 6,
          borderRadius: '50%',
          backgroundColor: 'var(--accent-cyan)',
          boxShadow: '0 0 8px var(--accent-cyan)'
        }} />
      </div>

      {label && (
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: size === 'sm' ? '0.6875rem' : '0.8125rem',
          letterSpacing: '0.14em',
          color: 'var(--text-secondary)',
          textTransform: 'uppercase'
        }}>
          {label}
        </span>
      )}
    </div>
  );
};
