// ==============================================================================
// ADITHYA MECHNEXUS V18.0 — ADMIN PLC & AUTOMATION MANAGER
// Manage PLC controller sequences, I/O channels, and hardware mechatronics.
// ==============================================================================

import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, CheckCircle2, X, Save, Image as ImageIcon } from 'lucide-react';
import { portfolioService } from '../../services/portfolio.service';
import { adminService } from '../../services/admin.service';
import { PlcAutomation, ProgrammingType } from '../../types/database';
import { UniversalMediaManager } from '../components/UniversalMediaManager';

export const PlcManager: React.FC = () => {
  const [entries, setEntries] = useState<PlcAutomation[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingEntry, setEditingEntry] = useState<Partial<PlcAutomation> | null>(null);
  const [editorTab, setEditorTab] = useState<'details' | 'media'>('details');
  const [mediaModalEntry, setMediaModalEntry] = useState<PlcAutomation | null>(null);
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
    setEditorTab('details');
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
    setEditorTab('details');
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
      await loadData();
      if (!editingEntry.id && (result as any).data) {
        setEditingEntry((result as any).data);
        setEditorTab('media');
        setSaveStatus('PLC cell registered! You can now upload wiring photos and HMI videos below.');
      } else {
        setEditingEntry(null);
        setSaveStatus('PLC cell record saved.');
      }
      setTimeout(() => setSaveStatus(null), 4000);
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
                <span>1. CONTROLLER & LOGIC SPECIFICATIONS</span>
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
                    entityType="plc"
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
                      Please switch to "1. CONTROLLER & LOGIC SPECIFICATIONS" to enter a title and click "SAVE PLC ROUTINE". Once saved, this routine's database ID will unlock the 10-photo and 3-video upload studio.
                    </p>
                    <button
                      type="button"
                      onClick={() => setEditorTab('details')}
                      className="btn-primary"
                      style={{ fontSize: '0.8rem' }}
                    >
                      GO TO SPECIFICATIONS
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
                <div className="hud-tag" style={{ color: 'var(--accent-cyan)' }}>PLC & AUTOMATION MEDIA DOSSIER</div>
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
              entityType="plc"
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
              <th style={{ padding: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>CONTROLLER</th>
              <th style={{ padding: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>MEDIA DOSSIER</th>
              <th style={{ padding: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>LANGUAGE</th>
              <th style={{ padding: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{entry.title}</td>
                <td style={{ padding: '1rem', color: 'var(--accent-cyan)' }}>{entry.controller}</td>
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
                    title="Open PLC ladder/wiring photo & video upload studio"
                  >
                    <ImageIcon size={14} />
                    <span>PHOTOS & VIDEOS</span>
                  </button>
                </td>
                <td style={{ padding: '1rem' }}><span className="badge-tech badge-tech-cyan">{entry.programming_type.replace('_', ' ').toUpperCase()}</span></td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <button onClick={() => handleEdit(entry)} style={{ marginRight: '0.5rem', color: 'var(--accent-cyan)' }} title="Edit Specifications">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(entry.id, entry.title)} style={{ color: '#f87171' }} title="Delete Routine">
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
