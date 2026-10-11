// ==============================================================================
// ADITHYA MECHNEXUS V18.0 — ADMIN PASSWORD RESET
// Sends password recovery token or updates user password after callback.
// ==============================================================================

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { KeyRound, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { useCursor } from '../context/CursorContext';

export const AdminResetPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  const { resetPasswordForEmail, updatePassword, session } = useAuth();
  const { setMode } = useCursor();

  // If user arrived via reset link with active recovery session
  const isUpdatingPassword = Boolean(session);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    setMessage(null);

    const result = await resetPasswordForEmail(email);
    if (result.success) {
      setStatus('success');
      setMessage('Recovery instructions have been transmitted to your email address.');
    } else {
      setStatus('error');
      setMessage(result.error || 'Failed to dispatch reset email.');
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) {
      setStatus('error');
      setMessage('Password must contain at least 8 characters.');
      return;
    }

    setStatus('loading');
    setMessage(null);

    const result = await updatePassword(newPassword);
    if (result.success) {
      setStatus('success');
      setMessage('Password successfully refreshed. You may proceed to sign in.');
    } else {
      setStatus('error');
      setMessage(result.error || 'Failed to update security credentials.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
      padding: '1.5rem',
    }}>
      <div className="glass-panel-elevated" style={{ width: '100%', maxWidth: '440px', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="hud-tag" style={{ marginBottom: '0.5rem' }}>
            CREDENTIAL RECOVERY
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800 }}>
            {isUpdatingPassword ? 'SET NEW PASSWORD' : 'RESET PASSWORD'}
          </h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            {isUpdatingPassword
              ? 'Enter your new administrative password.'
              : 'Enter your administrator email to receive a recovery link.'}
          </p>
        </div>

        {status === 'success' && (
          <div style={{
            background: 'rgba(52, 211, 153, 0.1)',
            border: '1px solid rgba(52, 211, 153, 0.4)',
            padding: '1rem',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#34d399',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            marginBottom: '1.5rem',
          }}>
            <CheckCircle2 size={16} />
            <span>{message}</span>
          </div>
        )}

        {status === 'error' && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            padding: '1rem',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#f87171',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            marginBottom: '1.5rem',
          }}>
            <AlertCircle size={16} />
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={isUpdatingPassword ? handleUpdatePassword : handleRequestReset}>
          {isUpdatingPassword ? (
            <div className="form-group">
              <label className="form-label">NEW PASSWORD (MIN 8 CHARS)</label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="form-input"
              />
            </div>
          ) : (
            <div className="form-group">
              <label className="form-label">ADMINISTRATOR EMAIL</label>
              <input
                type="email"
                required
                placeholder="admin@mechnexus.engineering"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            onMouseEnter={() => setMode('button')}
            onMouseLeave={() => setMode('default')}
            className="btn-primary"
            style={{ width: '100%', marginBottom: '1.5rem' }}
          >
            <KeyRound size={16} />
            <span>{status === 'loading' ? 'PROCESSING...' : isUpdatingPassword ? 'SAVE NEW PASSWORD' : 'DISPATCH RESET EMAIL'}</span>
          </button>

          <Link
            to="/admin/login"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
            }}
          >
            <ArrowLeft size={14} />
            <span>RETURN TO LOGIN</span>
          </Link>
        </form>
      </div>
    </div>
  );
};
