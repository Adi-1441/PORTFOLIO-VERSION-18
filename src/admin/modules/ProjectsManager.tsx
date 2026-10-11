// ==============================================================================
// ADITHYA MECHNEXUS V18.0 — ADMIN PROJECTS MANAGER MODULE
// Full CRUD table and editor for engineering case studies.
// ==============================================================================

import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, CheckCircle2, X, Save } from 'lucide-react';
import { portfolioService } from '../../services/portfolio.service';
import { adminService } from '../../services/admin.service';
import { Project, ProjectStatus } from '../../types/database';

export const ProjectsManager: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProject, setEditingProject] = useState<Partial<Project> | null>(null);
  const [toolsInput, setToolsInput] = useState('');
  const [materialsInput, setMaterialsInput] = useState('');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const loadProjects = async () => {
    setLoading(true);
    const data = await portfolioService.getProjects();
    setProjects(data);
    setLoading(false);
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setToolsInput(project.tools_software?.join(', ') || '');
    setMaterialsInput(project.materials?.join(', ') || '');
  };

  const handleNew = () => {
    setEditingProject({
      title: '',
      slug: '',
      short_description: '',
      full_description: '',
      problem_statement: '',
      objective: '',
      methodology: '',
      engineering_approach: '',
      tools_software: [],
      materials: [],
      parameters: {},
      results: '',
      learning_outcome: '',
      status: 'completed',
      category: 'MECHANICAL DESIGN',
      tags: [],
      featured: true,
      display_order: projects.length,
      enabled: true,
    });
    setToolsInput('');
    setMaterialsInput('');
  };

  const handleTitleChange = (title: string) => {
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    setEditingProject(prev => prev ? { ...prev, title, slug: prev.slug || slug } : null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject || !editingProject.title || !editingProject.slug) return;

    const tools_software = toolsInput.split(',').map(s => s.trim()).filter(Boolean);
    const materials = materialsInput.split(',').map(s => s.trim()).filter(Boolean);

    const payload = {
      ...editingProject,
      tools_software,
      materials,
    };

    let result;
    if (editingProject.id) {
      result = await adminService.updateProject(editingProject.id, payload);
    } else {
      result = await adminService.createProject(payload as any);
    }

    if (result.success) {
      setSaveStatus('Project saved successfully.');
      setEditingProject(null);
      await loadProjects();
      setTimeout(() => setSaveStatus(null), 3000);
    } else {
      alert(`Save error: ${result.error}`);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Permanently remove project "${title}"?`)) return;
    const result = await adminService.deleteProject(id);
    if (result.success) {
      await loadProjects();
    } else {
      alert(`Delete failed: ${result.error}`);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <div className="hud-tag">CASE STUDY MANAGEMENT</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800 }}>
            Projects Administration
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Register new technical case studies, FEA/CFD models, and empirical engineering tests.
          </p>
        </div>

        <button onClick={handleNew} className="btn-primary" style={{ fontSize: '0.8rem' }}>
          <Plus size={16} />
          <span>NEW PROJECT CASE STUDY</span>
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
      {editingProject && (
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
                {editingProject.id ? 'Edit Case Study' : 'Create New Project'}
              </h2>
              <button onClick={() => setEditingProject(null)} style={{ color: 'var(--text-secondary)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">PROJECT TITLE *</label>
                  <input
                    type="text"
                    required
                    value={editingProject.title || ''}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">URL SLUG *</label>
                  <input
                    type="text"
                    required
                    value={editingProject.slug || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, slug: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">CATEGORY</label>
                  <input
                    type="text"
                    value={editingProject.category || 'MECHANICAL DESIGN'}
                    onChange={(e) => setEditingProject({ ...editingProject, category: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">STATUS</label>
                  <select
                    value={editingProject.status || 'completed'}
                    onChange={(e) => setEditingProject({ ...editingProject, status: e.target.value as ProjectStatus })}
                    className="form-select"
                  >
                    <option value="completed">Completed</option>
                    <option value="in_progress">In Progress</option>
                    <option value="planned">Planned</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">SHORT SUMMARY DESCRIPTION *</label>
                <textarea
                  rows={2}
                  required
                  value={editingProject.short_description || ''}
                  onChange={(e) => setEditingProject({ ...editingProject, short_description: e.target.value })}
                  className="form-textarea"
                />
              </div>

              <div className="form-group">
                <label className="form-label">FULL TECHNICAL DESCRIPTION</label>
                <textarea
                  rows={4}
                  value={editingProject.full_description || ''}
                  onChange={(e) => setEditingProject({ ...editingProject, full_description: e.target.value })}
                  className="form-textarea"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">PROBLEM STATEMENT</label>
                  <textarea
                    rows={2}
                    value={editingProject.problem_statement || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, problem_statement: e.target.value })}
                    className="form-textarea"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">ENGINEERING OBJECTIVE</label>
                  <textarea
                    rows={2}
                    value={editingProject.objective || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, objective: e.target.value })}
                    className="form-textarea"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">NUMERICAL / EXPERIMENTAL METHODOLOGY</label>
                <textarea
                  rows={2}
                  value={editingProject.methodology || ''}
                  onChange={(e) => setEditingProject({ ...editingProject, methodology: e.target.value })}
                  className="form-textarea"
                />
              </div>

              <div className="form-group">
                <label className="form-label">QUANTIFIED RESULTS & VALIDATION</label>
                <textarea
                  rows={2}
                  value={editingProject.results || ''}
                  onChange={(e) => setEditingProject({ ...editingProject, results: e.target.value })}
                  className="form-textarea"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">TOOLS & SOFTWARE (COMMA-SEPARATED)</label>
                  <input
                    type="text"
                    placeholder="SolidWorks, ANSYS Mechanical, MATLAB"
                    value={toolsInput}
                    onChange={(e) => setToolsInput(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">MATERIALS TESTED (COMMA-SEPARATED)</label>
                  <input
                    type="text"
                    placeholder="Carbon Steel, Copper C10100"
                    value={materialsInput}
                    onChange={(e) => setMaterialsInput(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setEditingProject(null)} className="btn-secondary">
                  CANCEL
                </button>
                <button type="submit" className="btn-primary">
                  <Save size={15} />
                  <span>SAVE CASE STUDY</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Projects Table */}
      <div className="glass-panel" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-medium)', background: 'rgba(6, 11, 20, 0.6)' }}>
              <th style={{ padding: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>TITLE</th>
              <th style={{ padding: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>CATEGORY</th>
              <th style={{ padding: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>STATUS</th>
              <th style={{ padding: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>TOOLS</th>
              <th style={{ padding: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{project.title}</td>
                <td style={{ padding: '1rem' }}><span className="badge-tech badge-tech-cyan">{project.category}</span></td>
                <td style={{ padding: '1rem' }}>
                  <span className={project.status === 'completed' ? 'badge-status-completed' : 'badge-status-progress'}>
                    {project.status.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{project.tools_software?.slice(0, 2).join(', ') || '—'}</td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <button onClick={() => handleEdit(project)} style={{ marginRight: '0.5rem', color: 'var(--accent-cyan)' }}>
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(project.id, project.title)} style={{ color: '#f87171' }}>
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
