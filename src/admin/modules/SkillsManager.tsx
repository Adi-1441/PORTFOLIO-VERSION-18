// ==============================================================================
// ADITHYA MECHNEXUS V18.0 — ADMIN SKILLS MANAGER MODULE
// Full CRUD table for capability matrix with category grouping and tool tagging.
// ==============================================================================

import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, CheckCircle2, AlertCircle, X, Save } from 'lucide-react';
import { portfolioService } from '../../services/portfolio.service';
import { adminService } from '../../services/admin.service';
import { Skill, SkillLevel } from '../../types/database';

const CATEGORIES = [
  'CAD', 'FEA', 'CFD', 'THERMAL', 'CAE', 'MANUFACTURING',
  'METROLOGY', 'PLC', 'INDUSTRIAL AUTOMATION', 'ROBOTICS',
  'PROGRAMMING', 'AI × ENGINEERING', 'RESEARCH'
];

export const SkillsManager: React.FC = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSkill, setEditingSkill] = useState<Partial<Skill> | null>(null);
  const [toolsInput, setToolsInput] = useState('');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const loadSkills = async () => {
    setLoading(true);
    const data = await portfolioService.getSkills();
    setSkills(data);
    setLoading(false);
  };

  useEffect(() => {
    loadSkills();
  }, []);

  const handleEdit = (skill: Skill) => {
    setEditingSkill(skill);
    setToolsInput(skill.tools?.join(', ') || '');
  };

  const handleNew = () => {
    setEditingSkill({
      name: '',
      category: 'CAD',
      description: '',
      level: 'advanced',
      tools: [],
      display_order: skills.length,
      enabled: true,
    });
    setToolsInput('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSkill || !editingSkill.name) return;

    const tools = toolsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const payload = {
      ...editingSkill,
      tools,
    };

    let result;
    if (editingSkill.id) {
      result = await adminService.updateSkill(editingSkill.id, payload);
    } else {
      result = await adminService.createSkill(payload as any);
    }

    if (result.success) {
      setSaveStatus('Skill saved successfully.');
      setEditingSkill(null);
      await loadSkills();
      setTimeout(() => setSaveStatus(null), 3000);
    } else {
      alert(`Save error: ${result.error}`);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Permanently remove "${name}" from skills matrix?`)) return;
    const result = await adminService.deleteSkill(id);
    if (result.success) {
      await loadSkills();
    } else {
      alert(`Delete failed: ${result.error}`);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <div className="hud-tag">COMPETENCY MATRIX</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800 }}>
            Skills Matrix Management
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Manage mechanical disciplines, software proficiencies, and verification tiers.
          </p>
        </div>

        <button onClick={handleNew} className="btn-primary" style={{ fontSize: '0.8rem' }}>
          <Plus size={16} />
          <span>NEW SKILL ENTRY</span>
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

      {/* Editor Modal / Drawer */}
      {editingSkill && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(3, 7, 15, 0.85)',
          backdropFilter: 'blur(16px)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
        }}>
          <div className="glass-panel-elevated" style={{ maxWidth: '600px', width: '100%', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem' }}>
                {editingSkill.id ? 'Edit Skill Competency' : 'Register New Skill'}
              </h2>
              <button onClick={() => setEditingSkill(null)} style={{ color: 'var(--text-secondary)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">SKILL NAME *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Conjugate Heat Transfer"
                  value={editingSkill.name || ''}
                  onChange={(e) => setEditingSkill({ ...editingSkill, name: e.target.value })}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">CATEGORY</label>
                  <select
                    value={editingSkill.category || 'CAD'}
                    onChange={(e) => setEditingSkill({ ...editingSkill, category: e.target.value })}
                    className="form-select"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">PROFICIENCY LEVEL</label>
                  <select
                    value={editingSkill.level || 'advanced'}
                    onChange={(e) => setEditingSkill({ ...editingSkill, level: e.target.value as SkillLevel })}
                    className="form-select"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">DESCRIPTION</label>
                <textarea
                  rows={3}
                  value={editingSkill.description || ''}
                  onChange={(e) => setEditingSkill({ ...editingSkill, description: e.target.value })}
                  className="form-textarea"
                />
              </div>

              <div className="form-group">
                <label className="form-label">TOOLS & STANDARDS (COMMA-SEPARATED)</label>
                <input
                  type="text"
                  placeholder="e.g. SolidWorks, ANSYS Mechanical, ASME Y14.5"
                  value={toolsInput}
                  onChange={(e) => setToolsInput(e.target.value)}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setEditingSkill(null)} className="btn-secondary">
                  CANCEL
                </button>
                <button type="submit" className="btn-primary">
                  <Save size={15} />
                  <span>SAVE SKILL</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Skills Table */}
      <div className="glass-panel" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-medium)', background: 'rgba(6, 11, 20, 0.6)' }}>
              <th style={{ padding: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>NAME</th>
              <th style={{ padding: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>CATEGORY</th>
              <th style={{ padding: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>TIER</th>
              <th style={{ padding: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>TOOLS</th>
              <th style={{ padding: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {skills.map((skill) => (
              <tr key={skill.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{skill.name}</td>
                <td style={{ padding: '1rem' }}><span className="badge-tech badge-tech-cyan">{skill.category}</span></td>
                <td style={{ padding: '1rem', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>{skill.level}</td>
                <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{skill.tools?.join(', ') || '—'}</td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <button onClick={() => handleEdit(skill)} style={{ marginRight: '0.5rem', color: 'var(--accent-cyan)' }}>
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(skill.id, skill.name)} style={{ color: '#f87171' }}>
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
