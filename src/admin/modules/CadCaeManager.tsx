// ==============================================================================
// ADITHYA MECHNEXUS V18.0 — ADMIN CAD & CAE MANAGER MODULE
// Full CRUD table and simulation parameter manager.
// ==============================================================================

import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, CheckCircle2, X, Save, Image as ImageIcon } from 'lucide-react';
import { portfolioService } from '../../services/portfolio.service';
import { adminService } from '../../services/admin.service';
import { CadCae, CadCaeType } from '../../types/database';
import { UniversalMediaManager } from '../components/UniversalMediaManager';

export const CadCaeManager: React.FC = () => {
  const [entries, setEntries] = useState<CadCae[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingEntry, setEditingEntry] = useState<Partial<CadCae> | null>(null);
  const [editorTab, setEditorTab] = useState<'details' | 'media'>('details');
  const [mediaModalEntry, setMediaModalEntry] = useState<CadCae | null>(null);
  const [toolsInput, setToolsInput] = useState('');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    const data = await portfolioService.getCadCae();
    setEntries(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEdit = (entry: CadCae) => {
    setEditingEntry(entry);
    setEditorTab('details');
    setToolsInput(entry.tools_software?.join(', ') || '');
  };

  const handleNew = () => {
    setEditingEntry({
      title: '',
      slug: '',
      type: 'fea',
      description: '',
      boundary_conditions: '',
      materials: '',
      solver: 'ANSYS Mechanical APDL',
      simulation_parameters: {},
      mesh_details: {},
      results: '',
      tools_software: [],
      tags: [],
      featured: true,
      display_order: entries.length,
      enabled: true,
    });
    setEditorTab('details');
    setToolsInput('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEntry || !editingEntry.title || !editingEntry.slug) return;

    const tools_software = toolsInput.split(',').map(s => s.trim()).filter(Boolean);
    const payload = { ...editingEntry, tools_software };

    let result;
    if (editingEntry.id) {
      result = await adminService.updateCadCae(editingEntry.id, payload);
    } else {
      result = await adminService.createCadCae(payload as any);
    }

    if (result.success) {
      await loadData();
      if (!editingEntry.id && (result as any).data) {
        setEditingEntry((result as any).data);
        setEditorTab('media');
        setSaveStatus('Simulation registered! You can now upload FEA/CFD photos and solver videos below.');
      } else {
        setEditingEntry(null);
        setSaveStatus('Simulation record saved.');
      }
      setTimeout(() => setSaveStatus(null), 4000);
    } else {
      alert(`Save error: ${result.error}`);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Permanently remove simulation "${title}"?`)) return;
    const result = await adminService.deleteCadCae(id);
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
          <div className="hud-tag">MULTI-PHYSICS SIMULATION MANAGEMENT</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800 }}>
            CAD & CAE Simulations
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Manage FEA stress solutions, CFD fluid domains, boundary conditions, and solvers.
          </p>
        </div>

        <button onClick={handleNew} className="btn-primary" style={{ fontSize: '0.8rem' }}>
          <Plus size={16} />
          <span>NEW SIMULATION ENTRY</span>
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
      {editingEntry && (
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
          overflowY: 'auto',
        }}>
          <div className="glass-panel-elevated" style={{ maxWidth: '800px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem' }}>
                {editingEntry.id ? 'Edit Simulation Record' : 'Register New CAD/CAE Model'}
              </h2>
              <button onClick={() => setEditingEntry(null)} style={{ color: 'var(--text-secondary)' }}>
                <X size={20} />
              </button>
            </div>

            {/* Editor Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-medium)', paddingBottom: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setEditorTab('details')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  backgroundColor: editorTab === 'details' ? 'rgba(0, 229, 255, 0.15)' : 'transparent',
                  border: `1px solid ${editorTab === 'details' ? 'var(--border-cyan)' : 'transparent'}`,
                  color: editorTab === 'details' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>1. SIMULATION PARAMETERS</span>
              </button>
              <button
                type="button"
                onClick={() => setEditorTab('media')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  backgroundColor: editorTab === 'media' ? 'rgba(0, 229, 255, 0.15)' : 'transparent',
                  border: `1px solid ${editorTab === 'media' ? 'var(--border-cyan)' : 'transparent'}`,
                  color: editorTab === 'media' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease',
                }}
              >
                <ImageIcon size={14} />
                <span>2. PHOTOS & VIDEOS DOSSIER</span>
              </button>
            </div>

            {editorTab === 'media' ? (
              <div>
                {editingEntry.id ? (
                  <UniversalMediaManager
                    entityType="cad_cae"
                    entityId={editingEntry.id}
                  />
                ) : (
                  <div style={{
                    padding: '2.5rem 1.5rem',
                    textAlign: 'center',
                    backgroundColor: 'rgba(6, 11, 20, 0.6)',
                    border: '1px dashed var(--border-cyan)',
                    borderRadius: '8px',
                    margin: '1rem 0',
                  }}>
                    <ImageIcon size={36} style={{ margin: '0 auto 12px', color: 'var(--accent-cyan)', opacity: 0.8 }} />
                    <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
                      Step 1 Required Before Uploading Media
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 1.25rem' }}>
                      Please switch to "1. SIMULATION PARAMETERS" to enter a title and click "SAVE SIMULATION". Once saved, this record's database ID will unlock the 10-photo and 3-video upload studio.
                    </p>
                    <button
                      type="button"
                      onClick={() => setEditorTab('details')}
                      className="btn-primary"
                      style={{ fontSize: '0.8rem' }}
                    >
                      GO TO PARAMETERS
                    </button>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                  <button type="button" onClick={() => setEditingEntry(null)} className="btn-secondary">
                    CLOSE EDITOR
                  </button>
                </div>
              </div>
            ) : (

            <form onSubmit={handleSave}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">SIMULATION TITLE *</label>
                  <input
                    type="text"
                    required
                    value={editingEntry.title || ''}
                    onChange={(e) => setEditingEntry({
                      ...editingEntry,
                      title: e.target.value,
                      slug: editingEntry.slug || e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
                    })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">ANALYSIS TYPE</label>
                  <select
                    value={editingEntry.type || 'fea'}
                    onChange={(e) => setEditingEntry({ ...editingEntry, type: e.target.value as CadCaeType })}
                    className="form-select"
                  >
                    <option value="fea">FEA (Structural/Stress)</option>
                    <option value="cfd">CFD (Fluids/Aerodynamics)</option>
                    <option value="thermal">Thermal / Heat Transfer</option>
                    <option value="cad_modeling">CAD Solid Modeling</option>
                    <option value="meshing">Meshing Study</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">URL SLUG *</label>
                  <input
                    type="text"
                    required
                    value={editingEntry.slug || ''}
                    onChange={(e) => setEditingEntry({ ...editingEntry, slug: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">SOLVER PLATFORM</label>
                  <input
                    type="text"
                    placeholder="ANSYS Mechanical, Fluent, OpenFOAM"
                    value={editingEntry.solver || ''}
                    onChange={(e) => setEditingEntry({ ...editingEntry, solver: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">DESCRIPTION</label>
                <textarea
                  rows={3}
                  value={editingEntry.description || ''}
                  onChange={(e) => setEditingEntry({ ...editingEntry, description: e.target.value })}
                  className="form-textarea"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">BOUNDARY CONDITIONS</label>
                  <textarea
                    rows={2}
                    value={editingEntry.boundary_conditions || ''}
                    onChange={(e) => setEditingEntry({ ...editingEntry, boundary_conditions: e.target.value })}
                    className="form-textarea"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">MATERIAL PROPERTIES</label>
                  <textarea
                    rows={2}
                    value={editingEntry.materials || ''}
                    onChange={(e) => setEditingEntry({ ...editingEntry, materials: e.target.value })}
                    className="form-textarea"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">VERIFIED RESULTS & SAFETY FACTOR</label>
                <textarea
                  rows={2}
                  value={editingEntry.results || ''}
                  onChange={(e) => setEditingEntry({ ...editingEntry, results: e.target.value })}
                  className="form-textarea"
                />
              </div>

              <div className="form-group">
                <label className="form-label">SOFTWARE TOOLS (COMMA-SEPARATED)</label>
                <input
                  type="text"
                  placeholder="ANSYS Mechanical, SolidWorks"
                  value={toolsInput}
                  onChange={(e) => setToolsInput(e.target.value)}
                  className="form-input"
                />
              </div>

              {/* Universal Media Gallery Manager */}
              {editingEntry.id ? (
                <UniversalMediaManager
                  entityType="cad_cae"
                  entityId={editingEntry.id}
                />
              ) : (
                <div style={{
                  padding: '1rem',
                  marginTop: '1rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(6, 11, 20, 0.5)',
                  border: '1px dashed var(--border-subtle)',
                  color: 'var(--text-muted)',
                  fontSize: '0.8rem',
                  fontFamily: 'var(--font-mono)',
                  textAlign: 'center',
                }}>
                  [TIP] Save this simulation record first to begin attaching FEA/CFD photos and solver videos.
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setEditingEntry(null)} className="btn-secondary">
                  CANCEL
                </button>
                <button type="submit" className="btn-primary">
                  <Save size={15} />
                  <span>SAVE SIMULATION</span>
                </button>
              </div>
            </form>
            )}
          </div>
        </div>
      )}

      {/* Quick Media Upload Modal */}
      {mediaModalEntry && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1.5rem',
        }}>
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '900px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '2rem',
            border: '1px solid var(--border-cyan)',
            boxShadow: '0 0 40px rgba(0, 229, 255, 0.15)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-medium)', paddingBottom: '1rem' }}>
              <div>
                <div className="hud-tag" style={{ color: 'var(--accent-cyan)' }}>CAD & CAE MEDIA DOSSIER</div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, margin: '4px 0 0' }}>
                  {mediaModalEntry.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setMediaModalEntry(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                <X size={20} />
              </button>
            </div>

            <UniversalMediaManager
              entityType="cad_cae"
              entityId={mediaModalEntry.id}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={() => setMediaModalEntry(null)}
                className="btn-primary"
                style={{ fontSize: '0.8rem' }}
              >
                DONE / CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="glass-panel" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-medium)', background: 'rgba(6, 11, 20, 0.6)' }}>
              <th style={{ padding: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>TITLE</th>
              <th style={{ padding: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>TYPE</th>
              <th style={{ padding: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>MEDIA DOSSIER</th>
              <th style={{ padding: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>SOLVER</th>
              <th style={{ padding: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{entry.title}</td>
                <td style={{ padding: '1rem' }}><span className="badge-tech badge-tech-cyan">{entry.type.toUpperCase()}</span></td>
                <td style={{ padding: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => setMediaModalEntry(entry)}
                    className="btn-secondary"
                    style={{
                      padding: '5px 12px',
                      fontSize: '0.75rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: 'var(--accent-cyan)',
                      borderColor: 'rgba(0, 229, 255, 0.4)',
                      background: 'rgba(0, 229, 255, 0.08)',
                      cursor: 'pointer',
                    }}
                    title="Open FEA/CFD photo & video upload studio"
                  >
                    <ImageIcon size={14} />
                    <span>PHOTOS & VIDEOS</span>
                  </button>
                </td>
                <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{entry.solver || 'ANSYS'}</td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <button onClick={() => handleEdit(entry)} style={{ marginRight: '0.5rem', color: 'var(--accent-cyan)' }} title="Edit Parameters">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(entry.id, entry.title)} style={{ color: '#f87171' }} title="Delete Simulation">
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
