// ==============================================================================
// ADITHYA MECHNEXUS V18.0 — ADMIN CERTIFICATIONS MANAGER
// Manage accredited engineering credentials and verification URLs.
// ==============================================================================

import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, CheckCircle2, X, Save } from 'lucide-react';
import { portfolioService } from '../../services/portfolio.service';
import { adminService } from '../../services/admin.service';
import { Certification } from '../../types/database';

export const CertsManager: React.FC = () => {
  const [certs, setCerts] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCert, setEditingCert] = useState<Partial<Certification> | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    const data = await portfolioService.getCertifications();
    setCerts(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEdit = (cert: Certification) => {
    setEditingCert(cert);
  };

  const handleNew = () => {
    setEditingCert({
      title: '',
      issuer: 'Coursera / Engineering Simulation',
      credential_id: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
      verification_url: 'https://coursera.org',
      display_order: certs.length,
      enabled: true,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCert || !editingCert.title || !editingCert.issuer) return;

    let result;
    if (editingCert.id) {
      result = await adminService.updateCert(editingCert.id, editingCert);
    } else {
      result = await adminService.createCert(editingCert as any);
    }

    if (result.success) {
      setSaveStatus('Certification record saved.');
      setEditingCert(null);
      await loadData();
      setTimeout(() => setSaveStatus(null), 3000);
    } else {
      alert(`Save error: ${result.error}`);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Permanently remove certification "${title}"?`)) return;
    const result = await adminService.deleteCert(id);
    if (result.success) {
      await loadData();
    } else {
      alert(`Delete failed: ${result.error}`);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <div className="hud-tag">CREDENTIAL VERIFICATION</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800 }}>
            Certifications Management
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Register accredited credentials, verification URLs, and issuer metadata.
          </p>
        </div>

        <button onClick={handleNew} className="btn-primary" style={{ fontSize: '0.8rem' }}>
          <Plus size={16} />
          <span>NEW CERTIFICATION</span>
        </button>
      </div>

      {saveStatus && (
        <div style={{
          background: 'rgba(52, 211, 153, 0.1)',
          border: '1px solid rgba(52, 211, 153, 0.4)',
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#34d399',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.8rem',
          marginBottom: '1.5rem',
        }}>
          <CheckCircle2 size={16} />
          <span>{saveStatus}</span>
        </div>
      )}

      {/* Editor Modal */}
      {editingCert && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(3, 7, 15, 0.88)',
          backdropFilter: 'blur(20px)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
        }}>
          <div className="glass-panel-elevated" style={{ maxWidth: '600px', width: '100%', padding: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem' }}>
                {editingCert.id ? 'Edit Certificate' : 'Register New Certificate'}
              </h2>
              <button onClick={() => setEditingCert(null)} style={{ color: 'var(--text-secondary)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">CERTIFICATE TITLE *</label>
                <input
                  type="text"
                  required
                  value={editingCert.title || ''}
                  onChange={(e) => setEditingCert({ ...editingCert, title: e.target.value })}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">ISSUER ORGANIZATION *</label>
                  <input
                    type="text"
                    required
                    value={editingCert.issuer || ''}
                    onChange={(e) => setEditingCert({ ...editingCert, issuer: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">CREDENTIAL ID</label>
                  <input
                    type="text"
                    value={editingCert.credential_id || ''}
                    onChange={(e) => setEditingCert({ ...editingCert, credential_id: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">ISSUE DATE</label>
                  <input
                    type="date"
                    value={editingCert.date || ''}
                    onChange={(e) => setEditingCert({ ...editingCert, date: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">VERIFICATION URL</label>
                  <input
                    type="url"
                    value={editingCert.verification_url || ''}
                    onChange={(e) => setEditingCert({ ...editingCert, verification_url: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">DESCRIPTION / COVERED COMPETENCIES</label>
                <textarea
                  rows={3}
                  value={editingCert.description || ''}
                  onChange={(e) => setEditingCert({ ...editingCert, description: e.target.value })}
                  className="form-textarea"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setEditingCert(null)} className="btn-secondary">
                  CANCEL
                </button>
                <button type="submit" className="btn-primary">
                  <Save size={15} />
                  <span>SAVE CERTIFICATE</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="glass-panel" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-medium)', background: 'rgba(6, 11, 20, 0.6)' }}>
              <th style={{ padding: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>TITLE</th>
              <th style={{ padding: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>ISSUER</th>
              <th style={{ padding: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>ID</th>
              <th style={{ padding: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {certs.map((cert) => (
              <tr key={cert.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{cert.title}</td>
                <td style={{ padding: '1rem' }}><span className="badge-tech badge-tech-cyan">{cert.issuer}</span></td>
                <td style={{ padding: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>{cert.credential_id || '—'}</td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <button onClick={() => handleEdit(cert)} style={{ marginRight: '0.5rem', color: 'var(--accent-cyan)' }}>
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(cert.id, cert.title)} style={{ color: '#f87171' }}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
