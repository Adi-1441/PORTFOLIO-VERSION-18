// ==============================================================================
// ADITHYA MECHNEXUS V18.0 — ADMIN UNAUTHORIZED LANDING
// Displays exact user UUID and SQL command to grant admin clearance.
// ==============================================================================

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, LogOut, ArrowLeft, Terminal, Copy } from 'lucide-react';
import { useCursor } from '../context/CursorContext';
import { Link } from 'react-router-dom';

export const AdminUnauthorized: React.FC = () => {
  const { user, signOut, refreshAdminStatus } = useAuth();
  const { setMode } = useCursor();

  const grantSql = `INSERT INTO public.admin_users (user_id, role, email, enabled)
VALUES ('${user?.id || 'YOUR_USER_UUID'}', 'admin', '${user?.email || 'your-email@example.com'}', true)
ON CONFLICT (user_id) DO UPDATE SET enabled = true;`;

  const copySql = () => {
    navigator.clipboard.writeText(grantSql);
    alert('SQL copied to clipboard! Execute in Supabase SQL Editor.');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
      padding: '2rem',
    }}>
      <div className="glass-panel-elevated" style={{
        maxWidth: '640px',
        width: '100%',
        padding: '3rem 2.5rem',
        textAlign: 'center',
        border: '1px solid rgba(245, 158, 11, 0.4)',
        boxShadow: '0 0 35px rgba(245, 158, 11, 0.15)',
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'rgba(245, 158, 11, 0.12)',
          border: '1px solid rgba(245, 158, 11, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
          color: '#fbbf24',
        }}>
          <ShieldAlert size={28} />
        </div>

        <div className="hud-tag" style={{
          color: '#fbbf24',
          borderColor: 'rgba(245, 158, 11, 0.4)',
          background: 'rgba(245, 158, 11, 0.08)',
          marginBottom: '0.75rem',
        }}>
          AUTHORIZATION REFUSED // NOT IN ADMIN_USERS
        </div>

        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '0.75rem' }}>
          Elevated Clearance Required
        </h1>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
          Your Supabase Auth account is authenticated, but your unique user UUID is not registered
          as an enabled administrator in the <code style={{ color: 'var(--accent-cyan)' }}>public.admin_users</code> database table.
        </p>

        {user && (
          <div style={{
            background: 'rgba(6, 11, 20, 0.85)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-sm)',
            padding: '1.25rem',
            textAlign: 'left',
            marginBottom: '1.75rem',
          }}>
            <div className="vernier-badge" style={{ marginBottom: '0.4rem' }}>AUTHENTICATED IDENTITY</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#38bdf8', marginBottom: '0.25rem' }}>
              EMAIL: {user.email}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', wordBreak: 'break-all', marginBottom: '1rem' }}>
              USER UUID: {user.id}
            </div>

            <div className="vernier-badge" style={{ color: '#fbbf24', marginBottom: '0.4rem' }}>
              RESOLUTION: RUN THIS IN SUPABASE SQL EDITOR
            </div>
            <pre className="code-block" style={{ fontSize: '0.72rem', maxHeight: '100px', marginBottom: '0.75rem' }}>
              {grantSql}
            </pre>
            <button onClick={copySql} className="btn-secondary" style={{ fontSize: '0.72rem', padding: '0.35rem 0.75rem' }}>
              <Copy size={13} />
              <span>COPY GRANT SQL</span>
            </button>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => refreshAdminStatus()}
            onMouseEnter={() => setMode('button')}
            onMouseLeave={() => setMode('default')}
            className="btn-primary"
            style={{ fontSize: '0.8125rem' }}
          >
            RE-CHECK CLEARANCE
          </button>

          <button
            onClick={() => signOut()}
            onMouseEnter={() => setMode('button')}
            onMouseLeave={() => setMode('default')}
            className="btn-secondary"
            style={{ fontSize: '0.8125rem' }}
          >
            <LogOut size={15} />
            <span>SIGN OUT</span>
          </button>
        </div>
      </div>
    </div>
  );
};
