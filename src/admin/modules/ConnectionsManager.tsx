// ==============================================================================
// ADITHYA MECHNEXUS V18.3 — PROFESSIONAL CONNECTIONS CMS MODULE
// Manage verified professional links, academic profiles, and CAD networks.
// ==============================================================================

import React, { useEffect, useState } from 'react';
import {
  Link2, Plus, Edit3, Trash2, CheckCircle2, AlertCircle, Save, X, ExternalLink
} from 'lucide-react';
import { adminService } from '../../services/admin.service';
import { Connection } from '../../types/database';

export const ConnectionsManager: React.FC = () => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingConn, setEditingConn] = useState<Connection | null>(null);

  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
    setLoading(true);
    const data = await adminService.getConnections();
    setConnections(data);
    setLoading(false);
  };

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleDelete = async (conn: Connection) => {
    if (!window.confirm(`Delete connection "${conn.name}"?`)) return;
    const res = await adminService.deleteConnection(conn.id);
    if (res.success) {
      setConnections(connections.filter(c => c.id !== conn.id));
      showFeedback('success', `Connection "${conn.name}" removed.`);
    } else {
      showFeedback('error', res.error || 'Failed to delete connection.');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingConn) return;

    if (editingConn.id) {
      const res = await adminService.updateConnection(editingConn.id, editingConn);
      if (res.success) {
        setConnections(connections.map(c => c.id === editingConn.id ? editingConn : c));
        setModalOpen(false);
        showFeedback('success', `Connection "${editingConn.name}" updated.`);
      } else {
        showFeedback('error', res.error || 'Failed to update connection.');
      }
    } else {
      const { id, created_at, updated_at, ...payload } = editingConn;
      const res = await adminService.createConnection({
        ...payload,
        display_order: connections.length,
      });
      if (res.success && res.data) {
        setConnections([...connections, res.data]);
        setModalOpen(false);
        showFeedback('success', `Connection "${res.data.name}" deployed.`);
      } else {
        showFeedback('error', res.error || 'Failed to create connection.');
      }
    }
  };

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            PROFESSIONAL NETWORKS & CONNECTIONS
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }}>
            MANAGE VERIFIED EXTERNAL DIRECTIVES, LINKEDIN, RESEARCHGATE, AND REPOSITORIES
          </p>
        </div>

        <button
          onClick={() => {
            setEditingConn({
              id: '',
              name: '',
              url: '',
              description: '',
              icon: 'Link2',
              display_order: connections.length,
              enabled: true,
              created_at: '',
              updated_at: '',
            });
            setModalOpen(true);
          }}
          className="btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
        >
          <Plus size={16} />
          <span>ADD CONNECTION</span>
        </button>
      </div>

      {feedback && (
        <div style={{
          padding: '1rem 1.25rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          backgroundColor: feedback.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          border: `1px solid ${feedback.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
          color: feedback.type === 'success' ? '#10b981' : '#ef4444',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.85rem',
        }}>
          {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{feedback.message}</span>
        </div>
      )}

      <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', letterSpacing: '1px' }}>
              <th style={{ padding: '0.75rem 0.5rem' }}>NAME</th>
              <th style={{ padding: '0.75rem 0.5rem' }}>DESTINATION (URL)</th>
              <th style={{ padding: '0.75rem 0.5rem' }}>DESCRIPTION</th>
              <th style={{ padding: '0.75rem 0.5rem' }}>STATUS</th>
              <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {connections.map((conn, idx) => (
              <tr
                key={conn.id || idx}
                style={{
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                  backgroundColor: idx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.01)',
                }}
              >
                <td style={{ padding: '0.75rem 0.5rem', verticalAlign: 'middle', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {conn.name}
                </td>

                <td style={{ padding: '0.75rem 0.5rem', verticalAlign: 'middle', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                  <a href={conn.url || '#'} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <span>{conn.url || '—'}</span>
                    {conn.url && <ExternalLink size={12} />}
                  </a>
                </td>

                <td style={{ padding: '0.75rem 0.5rem', verticalAlign: 'middle', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  {conn.description || '—'}
                </td>

                <td style={{ padding: '0.75rem 0.5rem', verticalAlign: 'middle' }}>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontFamily: 'var(--font-mono)',
                    backgroundColor: conn.enabled ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: conn.enabled ? '#10b981' : '#ef4444',
                    border: `1px solid ${conn.enabled ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                  }}>
                    {conn.enabled ? 'ACTIVE' : 'DISABLED'}
                  </span>
                </td>

                <td style={{ padding: '0.75rem 0.5rem', verticalAlign: 'middle', textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', gap: '6px' }}>
                    <button
                      onClick={() => {
                        setEditingConn(conn);
                        setModalOpen(true);
                      }}
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: 'var(--text-secondary)',
                        borderRadius: '4px',
                        padding: '6px',
                        cursor: 'pointer',
                      }}
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(conn)}
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#ef4444',
                        borderRadius: '4px',
                        padding: '6px',
                        cursor: 'pointer',
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && editingConn && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          backgroundColor: 'rgba(3, 7, 18, 0.85)',
          backdropFilter: 'blur(8px)',
        }}>
          <div style={{
            width: '100%',
            maxWidth: '550px',
            backgroundColor: 'var(--bg-steel)',
            border: '1px solid var(--border-cyan)',
            borderRadius: '12px',
            padding: '2rem',
            position: 'relative',
          }}>
            <button
              onClick={() => setModalOpen(false)}
              style={{
                position: 'absolute',
                top: '1.5rem',
                right: '1.5rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '6px',
                color: 'var(--text-secondary)',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <X size={16} />
            </button>

            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
              {editingConn.id ? `EDIT CONNECTION: ${editingConn.name}` : 'CREATE CONNECTION'}
            </h2>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">NETWORK NAME / PLATFORM</label>
                <input
                  type="text"
                  required
                  value={editingConn.name}
                  onChange={(e) => setEditingConn({ ...editingConn, name: e.target.value })}
                  placeholder="e.g. LinkedIn Professional, GitHub Engineering"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">TARGET URL</label>
                <input
                  type="url"
                  required
                  value={editingConn.url || ''}
                  onChange={(e) => setEditingConn({ ...editingConn, url: e.target.value })}
                  placeholder="https://..."
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">DESCRIPTION</label>
                <input
                  type="text"
                  value={editingConn.description || ''}
                  onChange={(e) => setEditingConn({ ...editingConn, description: e.target.value })}
                  placeholder="e.g. Verified engineering credentials and networks"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">STATUS</label>
                <select
                  value={editingConn.enabled ? 'enabled' : 'disabled'}
                  onChange={(e) => setEditingConn({ ...editingConn, enabled: e.target.value === 'enabled' })}
                  className="form-input"
                >
                  <option value="enabled">Active</option>
                  <option value="disabled">Disabled</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn-secondary"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  <Save size={16} />
                  <span>PERSIST CONNECTION</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
