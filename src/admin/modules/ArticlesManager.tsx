// ==============================================================================
// ADITHYA MECHNEXUS V18.0 — ADMIN ARTICLES MANAGER
// Strict Draft / Published lifecycle. Drafts are never public.
// ==============================================================================

import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, CheckCircle2, X, Save, Eye, EyeOff } from 'lucide-react';
import { portfolioService } from '../../services/portfolio.service';
import { adminService } from '../../services/admin.service';
import { Article, ArticleStatus } from '../../types/database';
import { supabase, isSupabaseReady } from '../../lib/supabase';
import { SEED_ARTICLES } from '../../services/seed-data';

export const ArticlesManager: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingArticle, setEditingArticle] = useState<Partial<Article> | null>(null);
  const [tagsInput, setTagsInput] = useState('');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    if (!isSupabaseReady()) {
      setArticles(SEED_ARTICLES);
      setLoading(false);
      return;
    }

    try {
      // In Admin, fetch ALL articles including drafts
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('display_order', { ascending: true });

      if (error || !data) {
        setArticles(SEED_ARTICLES);
      } else {
        setArticles(data as Article[]);
      }
    } catch {
      setArticles(SEED_ARTICLES);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEdit = (art: Article) => {
    setEditingArticle(art);
    setTagsInput(art.tags?.join(', ') || '');
  };

  const handleNew = () => {
    setEditingArticle({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      category: 'COMPUTATIONAL MECHANICS',
      tags: [],
      author: 'Adithya G',
      reading_time: 4,
      status: 'draft', // Defaults safely to DRAFT
      display_order: articles.length,
      enabled: true,
    });
    setTagsInput('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArticle || !editingArticle.title || !editingArticle.slug || !editingArticle.content) return;

    const tags = tagsInput.split(',').map(s => s.trim()).filter(Boolean);
    const payload = {
      ...editingArticle,
      tags,
      published_at: editingArticle.status === 'published' ? new Date().toISOString() : null,
    };

    let result;
    if (editingArticle.id) {
      result = await adminService.updateArticle(editingArticle.id, payload);
    } else {
      result = await adminService.createArticle(payload as any);
    }

    if (result.success) {
      setSaveStatus('Article persisted to database.');
      setEditingArticle(null);
      await loadData();
      setTimeout(() => setSaveStatus(null), 3000);
    } else {
      alert(`Save error: ${result.error}`);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Permanently remove article "${title}"?`)) return;
    const result = await adminService.deleteArticle(id);
    if (result.success) {
      await loadData();
    } else {
      alert(`Delete failed: ${result.error}`);
    }
  };

  const toggleStatus = async (article: Article) => {
    const nextStatus: ArticleStatus = article.status === 'published' ? 'draft' : 'published';
    const result = await adminService.updateArticle(article.id, {
      status: nextStatus,
      published_at: nextStatus === 'published' ? new Date().toISOString() : null,
    });

    if (result.success) {
      await loadData();
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <div className="hud-tag">PUBLICATION LIFECYCLE</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800 }}>
            Articles & Technical Dossiers
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Author research dossiers. Drafts are completely hidden from public access until explicitly published.
          </p>
        </div>

        <button onClick={handleNew} className="btn-primary" style={{ fontSize: '0.8rem' }}>
          <Plus size={16} />
          <span>NEW ARTICLE DRAFT</span>
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
      {editingArticle && (
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
          <div className="glass-panel-elevated" style={{ maxWidth: '840px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem' }}>
                {editingArticle.id ? 'Edit Technical Dossier' : 'Compose New Article'}
              </h2>
              <button onClick={() => setEditingArticle(null)} style={{ color: 'var(--text-secondary)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">ARTICLE TITLE *</label>
                  <input
                    type="text"
                    required
                    value={editingArticle.title || ''}
                    onChange={(e) => setEditingArticle({
                      ...editingArticle,
                      title: e.target.value,
                      slug: editingArticle.slug || e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
                    })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">PUBLICATION STATUS</label>
                  <select
                    value={editingArticle.status || 'draft'}
                    onChange={(e) => setEditingArticle({ ...editingArticle, status: e.target.value as ArticleStatus })}
                    className="form-select"
                  >
                    <option value="draft">DRAFT (Hidden from Public)</option>
                    <option value="published">PUBLISHED (Live on Site)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">URL SLUG *</label>
                  <input
                    type="text"
                    required
                    value={editingArticle.slug || ''}
                    onChange={(e) => setEditingArticle({ ...editingArticle, slug: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">CATEGORY</label>
                  <input
                    type="text"
                    value={editingArticle.category || 'COMPUTATIONAL MECHANICS'}
                    onChange={(e) => setEditingArticle({ ...editingArticle, category: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">EXCERPT / ABSTRACT</label>
                <textarea
                  rows={2}
                  value={editingArticle.excerpt || ''}
                  onChange={(e) => setEditingArticle({ ...editingArticle, excerpt: e.target.value })}
                  className="form-textarea"
                />
              </div>

              <div className="form-group">
                <label className="form-label">FULL CONTENT (SUPPORTS MARKDOWN) *</label>
                <textarea
                  rows={8}
                  required
                  placeholder="## Section Heading&#10;&#10;Detailed computational proof..."
                  value={editingArticle.content || ''}
                  onChange={(e) => setEditingArticle({ ...editingArticle, content: e.target.value })}
                  className="form-textarea"
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">TAGS (COMMA-SEPARATED)</label>
                <input
                  type="text"
                  placeholder="FEA, Mesh Independence, Numerical Methods"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setEditingArticle(null)} className="btn-secondary">
                  CANCEL
                </button>
                <button type="submit" className="btn-primary">
                  <Save size={15} />
                  <span>SAVE ARTICLE</span>
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
              <th style={{ padding: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>CATEGORY</th>
              <th style={{ padding: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>STATUS</th>
              <th style={{ padding: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((art) => (
              <tr key={art.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{art.title}</td>
                <td style={{ padding: '1rem' }}><span className="badge-tech badge-tech-cyan">{art.category}</span></td>
                <td style={{ padding: '1rem' }}>
                  <button
                    onClick={() => toggleStatus(art)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '0.2rem 0.6rem',
                      borderRadius: 'var(--radius-xs)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      background: art.status === 'published' ? 'rgba(52, 211, 153, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                      color: art.status === 'published' ? '#34d399' : '#fbbf24',
                      border: `1px solid ${art.status === 'published' ? 'rgba(52, 211, 153, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                    }}
                    title="Click to toggle status"
                  >
                    {art.status === 'published' ? <Eye size={12} /> : <EyeOff size={12} />}
                    <span>{art.status.toUpperCase()}</span>
                  </button>
                </td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <button onClick={() => handleEdit(art)} style={{ marginRight: '0.5rem', color: 'var(--accent-cyan)' }}>
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(art.id, art.title)} style={{ color: '#f87171' }}>
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
