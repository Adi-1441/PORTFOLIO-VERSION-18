// ==============================================================================
// ADITHYA MECHNEXUS V18.0 — ADMIN SYSTEM DIAGNOSTICS MODULE
// Live verification of Database, Auth, RLS clearance, and Storage services.
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { Activity, ShieldCheck, Database, HardDrive, Key, RefreshCw, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { adminService } from '../../services/admin.service';
import { ENV } from '../../env';

export const SystemDiagnostics: React.FC = () => {
  const [running, setRunning] = useState(false);
  const [report, setReport] = useState<any>(null);

  const runDiagnostics = async () => {
    setRunning(true);
    const result = await adminService.runDiagnostics();
    setReport(result);
    setRunning(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const renderStatus = (passed: boolean) => {
    if (passed) {
      return (
        <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#34d399', fontWeight: 600 }}>
          <CheckCircle2 size={16} />
          <span>PASS (OPERATIONAL)</span>
        </span>
      );
    }
    return (
      <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#f87171', fontWeight: 600 }}>
        <XCircle size={16} />
        <span>FAIL / UNINITIALIZED</span>
      </span>
    );
  };

  return (
    <div style={{ maxWidth: '820px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <div className="hud-tag">INTEGRITY & CONNECTIVITY VERIFICATION</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800 }}>
            System Diagnostics
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Live runtime audit of Database, Authentication, Row Level Security, and Storage buckets.
          </p>
        </div>

        <button onClick={runDiagnostics} disabled={running} className="btn-secondary" style={{ fontSize: '0.75rem' }}>
          <RefreshCw size={14} className={running ? 'anim-rotate-slow' : ''} />
          <span>{running ? 'PROBING...' : 'RE-RUN AUDIT'}</span>
        </button>
      </div>

      {report && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Environment Config Check */}
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Key size={18} color="var(--accent-cyan)" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>1. Environment Variables (.env)</h3>
              </div>
              {renderStatus(report.configured)}
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
              Validates that VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are present in the frontend bundle.
            </p>
            <div className="code-block" style={{ fontSize: '0.75rem' }}>
              URL: {ENV.supabaseUrl ? `${ENV.supabaseUrl.substring(0, 24)}...` : 'MISSING'}&#10;
              KEY: {ENV.supabaseAnonKey ? `${ENV.supabaseAnonKey.substring(0, 16)}...` : 'MISSING'}
            </div>
          </div>

          {/* Database Connection */}
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Database size={18} color="#38bdf8" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>2. PostgreSQL Database Connectivity</h3>
              </div>
              {renderStatus(report.dbConnected)}
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
              Executes a read query against the profile table to verify database health.
            </p>
            <div className="code-block" style={{ fontSize: '0.75rem' }}>
              {report.details.db || 'Probing database cluster...'}
            </div>
          </div>

          {/* Auth & Admin Clearance */}
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldCheck size={18} color="#34d399" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>3. Authentication & Admin Role Clearance</h3>
              </div>
              {renderStatus(report.adminAuthorized)}
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
              Verifies session tokens and checks whether current user UUID is registered in admin_users.
            </p>
            <div className="code-block" style={{ fontSize: '0.75rem' }}>
              AUTH: {report.details.auth || 'Probing session...'}&#10;
              ROLE: {report.details.role || 'Unverified'}
            </div>
          </div>

          {/* Storage Buckets */}
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <HardDrive size={18} color="#fbbf24" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>4. Supabase Storage Subsystem</h3>
              </div>
              {renderStatus(report.storageActive)}
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
              Lists buckets to verify permissions on project-media, research-media, and certificates.
            </p>
            <div className="code-block" style={{ fontSize: '0.75rem' }}>
              {report.details.storage || 'Probing buckets...'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
