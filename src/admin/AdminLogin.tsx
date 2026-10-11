// ==============================================================================
// ADITHYA MECHNEXUS V18.0 — ADMIN LOGIN PORTAL
// Real Supabase Auth login with zero fake mockups.
// ==============================================================================

import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, KeyRound, ArrowLeft, AlertCircle, Cpu } from 'lucide-react';
import { useCursor } from '../context/CursorContext';
import { isSupabaseReady } from '../lib/supabase';

export const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { signIn } = useAuth();
  const { setMode } = useCursor();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please enter both administrative credentials.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    const result = await signIn(email, password);

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setErrorMessage(result.error || 'Authentication rejected by security policy.');
      setLoading(false);
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
      position: 'relative',
    }}>
      {/* Background Engineering Caliper Grid */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          linear-gradient(to right, rgba(0, 229, 255, 0.04) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(0, 229, 255, 0.04) 1px, transparent 1px)
        `,
        backgroundSize: '30px 30px',
        pointerEvents: 'none',
      }} />

      <div className="glass-panel-elevated" style={{
        width: '100%',
        maxWidth: '440px',
        padding: '2.5rem',
        position: 'relative',
        zIndex: 10,
      }}>
        {/* Brand Icon */}
        <div style={{
          width: '52px',
          height: '52px',
          borderRadius: '12px',
          background: 'rgba(0, 229, 255, 0.1)',
          border: '1px solid var(--border-cyan)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
          color: 'var(--accent-cyan)',
        }}>
          <Shield size={28} />
        </div>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="hud-tag" style={{ marginBottom: '0.5rem' }}>
            MECHNEXUS CONTROL CMS
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.5rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            marginBottom: '0.35rem',
          }}>
            SECURITY AUTHENTICATION
          </h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            Enter authorized administrator credentials to manage portfolio telemetry.
          </p>
        </div>

        {/* Database Unconfigured Diagnostic Alert */}
        {!isSupabaseReady() && (
          <div style={{
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: 'var(--radius-xs)',
            padding: '0.85rem',
            marginBottom: '1.5rem',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            color: '#fbbf24',
          }}>
            <strong>NOTICE:</strong> Supabase credentials not yet populated in .env. Run migrations in your Supabase project and provide credentials.
          </div>
        )}

        {/* Error Feedback */}
        {errorMessage && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            borderRadius: 'var(--radius-xs)',
            padding: '0.85rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#f87171',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
          }}>
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">ADMINISTRATOR EMAIL</label>
            <input
              type="email"
              required
              placeholder="admin@mechnexus.engineering"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label">PASSWORD</label>
            <input
              type="password"
              required
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              autoComplete="current-password"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
            <Link
              to="/admin/reset-password"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                color: 'var(--accent-cyan)',
              }}
            >
              Reset Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            onMouseEnter={() => setMode('button')}
            onMouseLeave={() => setMode('default')}
            className="btn-primary"
            style={{ width: '100%', marginBottom: '1.5rem' }}
          >
            <KeyRound size={16} />
            <span>{loading ? 'AUTHENTICATING...' : 'AUTHORIZE ACCESS'}</span>
          </button>

          <Link
            to="/portfolio"
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
            <span>RETURN TO PUBLIC PORTFOLIO</span>
          </Link>
        </form>
      </div>
    </div>
  );
};
