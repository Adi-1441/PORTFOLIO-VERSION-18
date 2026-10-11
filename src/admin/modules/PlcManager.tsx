// ==============================================================================
// ADITHYA MECHNEXUS V18.0 — ADMIN PLC & AUTOMATION MANAGER
// Manage PLC controller sequences, I/O channels, and hardware mechatronics.
// ==============================================================================

import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, CheckCircle2, X, Save } from 'lucide-react';
import { portfolioService } from '../../services/portfolio.service';
import { adminService } from '../../services/admin.service';
import { PlcAutomation, ProgrammingType } from '../../types/database';
import { UniversalMediaManager } from '../components/UniversalMediaManager';

export const PlcManager: React.FC = () => {
  const [entries, setEntries] = useState<PlcAutomation[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingEntry, setEditingEntry] = useState<Partial<PlcAutomation> | null>(null);
  const [inputsText, setInputsText] = useState('');
  const [outputsText, setOutputsText] = useState('');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    const data = await portfolioService.getPlcAutomation();
    setEntries(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEdit = (entry: PlcAutomation) => {
    setEditingEntry(entry);
    setInputsText(entry.inputs?.join('\n') || '');
    setOutputsText(entry.outputs?.join('\n') || '');
  };

  const handleNew = () => {
    setEditingEntry({
      title: '',
      slug: '',
      description: '',
      controller: 'Rockwell Micro820',
      programming_type: 'ladder_logic',
      inputs: [],
      outputs: [],
      logic_description: '',
      sequence_description: '',
      hardware: [],
      software: [],
      results: '',
      tags: [],
      featured: true,
      display_order: entries.length,
      enabled: true,
    });
    setInputsText('');
    setOutputsText('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEntry || !editingEntry.title || !editingEntry.slug) return;

    const inputs = inputsText.split('\n').map(s => s.trim()).filter(Boolean);
    const outputs = outputsText.split('\n').map(s => s.trim()).filter(Boolean);

    const payload = { ...editingEntry, inputs, outputs };

    let result;
    if (editingEntry.id) {
      result = await adminService.updatePlc(editingEntry.id, payload);
    } else {
      result = await adminService.createPlc(payload as any);
    }

    if (result.success) {
      setSaveStatus('PLC cell record saved.');
      setEditingEntry(null);
      await loadData();
      setTimeout(() => setSaveStatus(null), 3000);
    } else {
      alert(`Save error: ${result.error}`);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Permanently remove PLC entry "${title}"?`)) return;
    const result = await adminService.deletePlc(id);
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
          <div className="hud-tag">AUTOMATION SEQUENCE CONTROL</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800 }}>
            PLC & Industrial Automation
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Manage ladder diagram state machines, sensor I/O channels, and actuator timing.
          </p>
        </div>

        <button onClick={handleNew} className="btn-primary" style={{ fontSize: '0.8rem' }}>
          <Plus size={16} />
          <span>NEW PLC CELL</span>
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
                {editingEntry.id ? 'Edit PLC Routine' : 'Register New PLC Cell'}
              </h2>
              <button onClick={() => setEditingEntry(null)} style={{ color: 'var(--text-secondary)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">CELL / SYSTEM TITLE *</label>
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
                  <label className="form-label">PROGRAMMING LANGUAGE</label>
                  <select
                    value={editingEntry.programming_type || 'ladder_logic'}
                    onChange={(e) => setEditingEntry({ ...editingEntry, programming_type: e.target.value as ProgrammingType })}
                    className="form-select"
                  >
                    <option value="ladder_logic">Ladder Logic (LD)</option>
                    <option value="structured_text">Structured Text (ST)</option>
                    <option value="function_block">Function Block (FBD)</option>
                    <option value="sfc">Sequential Function Chart (SFC)</option>
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
                  <label className="form-label">CONTROLLER HARDWARE</label>
                  <input
                    type="text"
                    value={editingEntry.controller || ''}
                    onChange={(e) => setEditingEntry({ ...editingEntry, controller: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">OVERVIEW DESCRIPTION</label>
                <textarea
                  rows={2}
                  value={editingEntry.description || ''}
                  onChange={(e) => setEditingEntry({ ...editingEntry, description: e.target.value })}
                  className="form-textarea"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">INPUT CHANNELS (ONE PER LINE)</label>
                  <textarea
                    rows={4}
                    placeholder="DI_00: Cycle Start&#10;DI_01: E-Stop"
                    value={inputsText}
                    onChange={(e) => setInputsText(e.target.value)}
                    className="form-textarea"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">OUTPUT CHANNELS (ONE PER LINE)</label>
                  <textarea
                    rows={4}
                    placeholder="DO_00: Motor Contactor&#10;DO_01: Solenoid Valve"
                    value={outputsText}
                    onChange={(e) => setOutputsText(e.target.value)}
                    className="form-textarea"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">STATE-MACHINE LOGIC DESCRIPTION</label>
                <textarea
                  rows={2}
                  value={editingEntry.logic_description || ''}
                  onChange={(e) => setEditingEntry({ ...editingEntry, logic_description: e.target.value })}
                  className="form-textarea"
                />
              </div>

              <div className="form-group">
                <label className="form-label">SEQUENCE STEPPING</label>
                <textarea
                  rows={2}
                  value={editingEntry.sequence_description || ''}
                  onChange={(e) => setEditingEntry({ ...editingEntry, sequence_description: e.target.value })}
                  className="form-textarea"
                />
              </div>

              {/* Universal Media Gallery Manager */}
              {editingEntry.id ? (
                <UniversalMediaManager
                  entityType="plc"
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
                  [TIP] Save this automation routine first to begin attaching wiring schematics, ladder logic photos, and HMI test videos.
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setEditingEntry(null)} className="btn-secondary">
                  CANCEL
                </button>
                <button type="submit" className="btn-primary">
                  <Save size={15} />
                  <span>SAVE PLC ROUTINE</span>
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
              <th style={{ padding: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>CONTROLLER</th>
              <th style={{ padding: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>LANGUAGE</th>
              <th style={{ padding: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{entry.title}</td>
                <td style={{ padding: '1rem', color: 'var(--accent-cyan)' }}>{entry.controller}</td>
                <td style={{ padding: '1rem' }}><span className="badge-tech badge-tech-cyan">{entry.programming_type.replace('_', ' ').toUpperCase()}</span></td>
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
