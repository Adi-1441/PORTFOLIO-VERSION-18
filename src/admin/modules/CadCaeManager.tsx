// ==============================================================================
// ADITHYA MECHNEXUS V18.0 — ADMIN CAD & CAE MANAGER MODULE
// Full CRUD table and simulation parameter manager.
// ==============================================================================

import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, CheckCircle2, X, Save } from 'lucide-react';
import { portfolioService } from '../../services/portfolio.service';
import { adminService } from '../../services/admin.service';
import { CadCae, CadCaeType } from '../../types/database';

export const CadCaeManager: React.FC = () => {
  const [entries, setEntries] = useState<CadCae[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingEntry, setEditingEntry] = useState<Partial<CadCae> | null>(null);
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
      setSaveStatus('Simulation record saved.');
      setEditingEntry(null);
      await loadData();
      setTimeout(() => setSaveStatus(null), 3000);
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
              <th style={{ padding: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>SOLVER</th>
              <th style={{ padding: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{entry.title}</td>
                <td style={{ padding: '1rem' }}><span className="badge-tech badge-tech-cyan">{entry.type.toUpperCase()}</span></td>
                <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{entry.solver || 'ANSYS'}</td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <button onClick={() => handleEdit(entry)} style={{ marginRight: '0.5rem', color: 'var(--accent-cyan)' }}>
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(entry.id, entry.title)} style={{ color: '#f87171' }}>
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
