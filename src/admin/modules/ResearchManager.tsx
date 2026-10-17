// ==============================================================================
// ADITHYA MECHNEXUS V18.3 — SCIENTIFIC RESEARCH CMS MODULE
// Full CRUD management for peer-reviewed studies, methodology, and citations.
// ==============================================================================

import React, { useEffect, useState } from 'react';
import {
  BookOpen, Plus, Edit3, Trash2, CheckCircle2, AlertCircle, Save, X, ExternalLink, Image as ImageIcon
} from 'lucide-react';
import { adminService } from '../../services/admin.service';
import { Research, ResearchStatus } from '../../types/database';
import { UniversalMediaManager } from '../components/UniversalMediaManager';

export const ResearchManager: React.FC = () => {
  const [researchList, setResearchList] = useState<Research[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingResearch, setEditingResearch] = useState<Research | null>(null);
  const [editorTab, setEditorTab] = useState<'details' | 'media'>('details');
  const [mediaModalResearch, setMediaModalResearch] = useState<Research | null>(null);
  const [tagsInput, setTagsInput] = useState('');
  const [refsInput, setRefsInput] = useState('');
  const [doiInput, setDoiInput] = useState('');

  useEffect(() => {
    loadResearch();
  }, []);

  const loadResearch = async () => {
    setLoading(true);
    const data = await adminService.getResearch();
    setResearchList(data);
    setLoading(false);
  };

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleOpenEdit = (res: Research) => {
    setEditingResearch(res);
    setEditorTab('details');
    setTagsInput((res.tags || []).join(', '));
    setRefsInput((res.references || []).join('\n'));
    setDoiInput(res.publication_info?.doi || '');
    setModalOpen(true);
  };

  const handleOpenNew = () => {
    setEditingResearch({
      id: '',
      title: '',
      slug: '',
      abstract: '',
      objective: '',
      methodology: '',
      materials: '',
      experimental_setup: '',
      results: '',
      analysis: '',
      conclusion: '',
      status: 'published',
      publication_info: {},
      references: [],
      tags: [],
      thumbnail_url: null,
      featured: true,
      display_order: researchList.length,
      enabled: true,
      created_at: '',
      updated_at: '',
    });
    setEditorTab('details');
    setTagsInput('');
    setRefsInput('');
    setDoiInput('');
    setModalOpen(true);
  };

  const handleDelete = async (res: Research) => {
    if (!window.confirm(`Delete research paper "${res.title}"?`)) return;
    const result = await adminService.deleteResearch(res.id);
    if (result.success) {
      setResearchList(researchList.filter(r => r.id !== res.id));
      showFeedback('success', `Study "${res.title}" deleted.`);
    } else {
      showFeedback('error', result.error || 'Failed to delete research.');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingResearch) return;

    const parsedTags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const parsedRefs = refsInput
      .split('\n')
      .map(r => r.trim())
      .filter(Boolean);

    const pubInfo = {
      ...(editingResearch.publication_info || {}),
      doi: doiInput.trim() || undefined,
    };

    const payload = {
      ...editingResearch,
      tags: parsedTags,
      references: parsedRefs,
      publication_info: pubInfo,
    };

    if (editingResearch.id) {
      const result = await adminService.updateResearch(editingResearch.id, payload);
      if (result.success) {
        setResearchList(researchList.map(r => r.id === editingResearch.id ? payload : r));
        setModalOpen(false);
        showFeedback('success', `Study "${payload.title}" updated.`);
      } else {
        showFeedback('error', result.error || 'Failed to update research.');
      }
    } else {
      const { id, created_at, updated_at, ...createPayload } = payload;
      const result = await adminService.createResearch(createPayload);
      if (result.success && result.data) {
        setResearchList([...researchList, result.data]);
        setEditingResearch(result.data);
        setEditorTab('media');
        showFeedback('success', `Study "${result.data.title}" deployed! You can now attach experimental photos and validation videos below.`);
      } else {
        showFeedback('error', result.error || 'Failed to create research.');
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
            SCIENTIFIC RESEARCH REPOSITORY
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }}>
            MANAGE PEER-REVIEWED STUDIES, EXPERIMENTAL PROCEDURES, AND NUMERICAL REPORTS
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
        >
          <Plus size={16} />
          <span>ADD RESEARCH INVESTIGATION</span>
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

      {/* Studies Table */}
      <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', letterSpacing: '1px' }}>
              <th style={{ padding: '0.75rem 0.5rem' }}>TITLE & ABSTRACT</th>
              <th style={{ padding: '0.75rem 0.5rem' }}>STATUS</th>
              <th style={{ padding: '0.75rem 0.5rem' }}>MEDIA DOSSIER</th>
              <th style={{ padding: '0.75rem 0.5rem' }}>TAGS</th>
              <th style={{ padding: '0.75rem 0.5rem' }}>FEATURED</th>
              <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {researchList.map((res, idx) => (
              <tr
                key={res.id || idx}
                style={{
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                  backgroundColor: idx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.01)',
                }}
              >
                <td style={{ padding: '0.75rem 0.5rem', verticalAlign: 'middle', maxWidth: '380px' }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    {res.title}
                  </div>
                  {res.abstract && (
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {res.abstract}
                    </div>
                  )}
                </td>

                <td style={{ padding: '0.75rem 0.5rem', verticalAlign: 'middle' }}>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    backgroundColor: res.status === 'published' ? 'rgba(0, 229, 255, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                    color: res.status === 'published' ? 'var(--accent-cyan)' : '#f59e0b',
                    border: `1px solid ${res.status === 'published' ? 'var(--border-cyan)' : 'rgba(245, 158, 11, 0.3)'}`,
                  }}>
                    {res.status}
                  </span>
                </td>

                <td style={{ padding: '0.75rem 0.5rem', verticalAlign: 'middle' }}>
                  <button
                    type="button"
                    onClick={() => setMediaModalResearch(res)}
                    className="btn-secondary"
                    style={{
                      padding: '4px 10px',
                      fontSize: '0.75rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: 'var(--accent-cyan)',
                      borderColor: 'rgba(0, 229, 255, 0.4)',
                      background: 'rgba(0, 229, 255, 0.08)',
                      cursor: 'pointer',
                    }}
                    title="Open research experimental media upload studio"
                  >
                    <ImageIcon size={13} />
                    <span>PHOTOS & VIDEOS</span>
                  </button>
                </td>

                <td style={{ padding: '0.75rem 0.5rem', verticalAlign: 'middle' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {(res.tags || []).slice(0, 3).map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        style={{
                          padding: '1px 6px',
                          borderRadius: '3px',
                          fontSize: '10px',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          color: 'var(--text-muted)',
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </td>

                <td style={{ padding: '0.75rem 0.5rem', verticalAlign: 'middle' }}>
                  <span style={{
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    color: res.featured ? '#10b981' : 'var(--text-muted)',
                  }}>
                    {res.featured ? 'YES' : 'NO'}
                  </span>
                </td>

                <td style={{ padding: '0.75rem 0.5rem', verticalAlign: 'middle', textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', gap: '6px' }}>
                    <button
                      onClick={() => handleOpenEdit(res)}
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
                      onClick={() => handleDelete(res)}
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

      {/* Edit / New Modal */}
      {modalOpen && editingResearch && (
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
            maxWidth: '750px',
            maxHeight: '90vh',
            backgroundColor: 'var(--bg-steel)',
            border: '1px solid var(--border-cyan)',
            borderRadius: '12px',
            padding: '2rem',
            overflowY: 'auto',
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

            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
              {editingResearch.id ? `EDIT INVESTIGATION: ${editingResearch.title}` : 'DEPLOY RESEARCH INVESTIGATION'}
            </h2>

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
                <span>1. SCIENTIFIC SPECIFICATIONS</span>
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
                {editingResearch.id ? (
                  <UniversalMediaManager
                    entityType="research"
                    entityId={editingResearch.id}
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
                      Please switch to "1. SCIENTIFIC SPECIFICATIONS" to enter a title and click "PERSIST RESEARCH DOSSIER". Once saved, this study's database ID will unlock the 10-photo and 3-video upload studio.
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
                  <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">
                    CLOSE EDITOR
                  </button>
                </div>
              </div>
            ) : (

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">RESEARCH TITLE</label>
                <input
                  type="text"
                  required
                  value={editingResearch.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    const slug = !editingResearch.id
                      ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
                      : editingResearch.slug;
                    setEditingResearch({ ...editingResearch, title, slug });
                  }}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">SLUG</label>
                  <input
                    type="text"
                    required
                    value={editingResearch.slug}
                    onChange={(e) => setEditingResearch({ ...editingResearch, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">STATUS</label>
                  <select
                    value={editingResearch.status}
                    onChange={(e) => setEditingResearch({ ...editingResearch, status: e.target.value as ResearchStatus })}
                    className="form-input"
                  >
                    <option value="published">Published</option>
                    <option value="ongoing">Ongoing / In Review</option>
                    <option value="completed">Completed</option>
                    <option value="planned">Planned</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">ABSTRACT</label>
                <textarea
                  rows={4}
                  value={editingResearch.abstract || ''}
                  onChange={(e) => setEditingResearch({ ...editingResearch, abstract: e.target.value })}
                  placeholder="Comprehensive scientific abstract..."
                  className="form-textarea"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">RESEARCH OBJECTIVE</label>
                  <textarea
                    rows={3}
                    value={editingResearch.objective || ''}
                    onChange={(e) => setEditingResearch({ ...editingResearch, objective: e.target.value })}
                    className="form-textarea"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">METHODOLOGY & NUMERICAL SCHEMES</label>
                  <textarea
                    rows={3}
                    value={editingResearch.methodology || ''}
                    onChange={(e) => setEditingResearch({ ...editingResearch, methodology: e.target.value })}
                    className="form-textarea"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">RESULTS & EMPIRICAL FINDINGS</label>
                  <textarea
                    rows={3}
                    value={editingResearch.results || ''}
                    onChange={(e) => setEditingResearch({ ...editingResearch, results: e.target.value })}
                    className="form-textarea"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">CONCLUSION</label>
                  <textarea
                    rows={3}
                    value={editingResearch.conclusion || ''}
                    onChange={(e) => setEditingResearch({ ...editingResearch, conclusion: e.target.value })}
                    className="form-textarea"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">TOPIC TAGS (COMMA SEPARATED)</label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="CFD, Thermo-mechanical, Riblets"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">DOI IDENTIFIER (IF PUBLISHED)</label>
                  <input
                    type="text"
                    value={doiInput}
                    onChange={(e) => setDoiInput(e.target.value)}
                    placeholder="10.1016/j.applthermaleng.2024.120045"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">PRIMARY REFERENCES & CITATIONS (ONE PER LINE)</label>
                <textarea
                  rows={3}
                  value={refsInput}
                  onChange={(e) => setRefsInput(e.target.value)}
                  placeholder="Author, A. (Year). Title of paper..."
                  className="form-textarea"
                />
              </div>

              {/* Universal Media Gallery Manager */}
              {editingResearch?.id ? (
                <UniversalMediaManager
                  entityType="research"
                  entityId={editingResearch.id}
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
                  [TIP] Save this research paper first to begin attaching laboratory experimental photos, micrography, and validation videos.
                </div>
              )}

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
                  <span>PERSIST RESEARCH DOSSIER</span>
                </button>
              </div>
            </form>
            )}
          </div>
        </div>
      )}

      {/* Quick Media Upload Modal */}
      {mediaModalResearch && (
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
                <div className="hud-tag" style={{ color: 'var(--accent-cyan)' }}>RESEARCH MEDIA DOSSIER</div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, margin: '4px 0 0' }}>
                  {mediaModalResearch.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setMediaModalResearch(null)}
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
              entityType="research"
              entityId={mediaModalResearch.id}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={() => setMediaModalResearch(null)}
                className="btn-primary"
                style={{ fontSize: '0.8rem' }}
              >
                DONE / CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
