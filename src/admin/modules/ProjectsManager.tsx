// ==============================================================================
// ADITHYA MECHNEXUS V18.0 — ADMIN PROJECTS MANAGER MODULE
// Full CRUD table and editor for engineering case studies.
// ==============================================================================

import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, CheckCircle2, X, Save, Image as ImageIcon } from 'lucide-react';
import { portfolioService } from '../../services/portfolio.service';
import { adminService } from '../../services/admin.service';
import { Project, ProjectStatus } from '../../types/database';
import { UniversalMediaManager } from '../components/UniversalMediaManager';

export const ProjectsManager: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProject, setEditingProject] = useState<Partial<Project> | null>(null);
  const [editorTab, setEditorTab] = useState<'details' | 'media'>('details');
  const [mediaModalProject, setMediaModalProject] = useState<Project | null>(null);
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
    setEditorTab('details');
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
      await loadProjects();
      if (!editingProject.id && (result as any).data) {
        setEditingProject((result as any).data);
        setEditorTab('media');
        setSaveStatus('Project created! You can now upload photos and videos to this dossier below.');
      } else {
        setEditingProject(null);
        setSaveStatus('Project saved successfully.');
      }
      setTimeout(() => setSaveStatus(null), 4000);
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <span className="vernier-badge" style={{ color: 'var(--accent-cyan)' }}>CASE STUDY EDITOR</span>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', marginTop: '4px' }}>
                  {editingProject.id ? `Edit: ${editingProject.title || 'Case Study'}` : 'Create New Project'}
                </h2>
              </div>
              <button onClick={() => setEditingProject(null)} style={{ color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {/* Editor Navigation Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
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
                  transition: 'all 0.15s ease',
                }}
              >
                1. CASE STUDY SPECIFICATIONS
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
                {editingProject.id ? (
                  <UniversalMediaManager
                    entityType="projects"
                    entityId={editingProject.id}
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
                      Please switch to "1. CASE STUDY SPECIFICATIONS" to provide a title and click "SAVE CASE STUDY". Once saved, this project's database ID will unlock the 10-photo and 3-video upload studio.
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
                  <button type="button" onClick={() => setEditingProject(null)} className="btn-secondary">
                    CLOSE EDITOR
                  </button>
                </div>
              </div>
            ) : (

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

              {/* Universal Media Gallery Manager */}
              {editingProject.id ? (
                <UniversalMediaManager
                  entityType="projects"
                  entityId={editingProject.id}
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
                  [TIP] Save this case study first to begin attaching photos and videos to its dossier.
                </div>
              )}

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
            )}
          </div>
        </div>
      )}

      {/* Quick Media Upload Modal */}
      {mediaModalProject && (
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
                <div className="hud-tag" style={{ color: 'var(--accent-cyan)' }}>UNIVERSAL MEDIA DOSSIER</div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, margin: '4px 0 0' }}>
                  {mediaModalProject.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setMediaModalProject(null)}
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
              entityType="projects"
              entityId={mediaModalProject.id}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={() => setMediaModalProject(null)}
                className="btn-primary"
                style={{ fontSize: '0.8rem' }}
              >
                DONE / CLOSE
              </button>
            </div>
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
              <th style={{ padding: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>MEDIA DOSSIER</th>
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
                <td style={{ padding: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => setMediaModalProject(project)}
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
                    title="Open photo & video upload studio for this project"
                  >
                    <ImageIcon size={14} />
                    <span>PHOTOS & VIDEOS</span>
                  </button>
                </td>
                <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{project.tools_software?.slice(0, 2).join(', ') || '—'}</td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <button onClick={() => handleEdit(project)} style={{ marginRight: '0.5rem', color: 'var(--accent-cyan)' }} title="Edit Specifications">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(project.id, project.title)} style={{ color: '#f87171' }} title="Delete Project">
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
