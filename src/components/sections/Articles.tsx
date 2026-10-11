// ==============================================================================
// ADITHYA MECHNEXUS V18.0 — TECHNICAL ARTICLES SECTION
// Drafts NEVER appear publicly. Strict published-only pipeline.
// ==============================================================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Clock, Calendar, ArrowRight, X } from 'lucide-react';
import { useCursor } from '../../context/CursorContext';
import { Article } from '../../types/database';

interface ArticlesProps {
  articles: Article[];
}

export const Articles: React.FC<ArticlesProps> = ({ articles }) => {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const { setMode } = useCursor();

  // Safety filter: verify strictly published and enabled
  const publicArticles = articles.filter(a => a.status === 'published' && a.enabled);

  return (
    <section id="articles" className="section-padding" style={{ position: 'relative', zIndex: 10 }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ marginBottom: '3.5rem' }}>
          <div className="hud-tag">
            <BookOpen size={14} />
            <span>PUBLICATIONS & TECHNICAL DOSSIERS</span>
          </div>
          <h2 className="section-title">ENGINEERING ARTICLES</h2>
          <p className="section-subtitle">
            Rigorous mathematical proofs, finite element discretization treatises, and automation architecture analyses.
          </p>
        </div>

        {/* Articles Grid */}
        <div className="grid-cards">
          {publicArticles.map((article, idx) => (
            <motion.div
              key={article.id || idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              onMouseEnter={() => setMode('card')}
              onMouseLeave={() => setMode('default')}
              onClick={() => setSelectedArticle(article)}
              className="glass-panel card-interactive"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '2rem',
                cursor: 'pointer',
              }}
            >
              <div>
                {/* Meta Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span className="badge-tech badge-tech-cyan">
                    {article.category}
                  </span>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.6875rem',
                    color: 'var(--text-muted)',
                  }}>
                    <Clock size={12} />
                    <span>{article.reading_time || 4} MIN READ</span>
                  </div>
                </div>

                {/* Title */}
                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  lineHeight: 1.35,
                  marginBottom: '1rem',
                }}>
                  {article.title}
                </h3>

                {/* Excerpt */}
                <p style={{
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                  marginBottom: '1.5rem',
                }}>
                  {article.excerpt}
                </p>
              </div>

              {/* Bottom Actions */}
              <div style={{
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: '1.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                color: 'var(--accent-cyan)',
              }}>
                <span>READ TECHNICAL DOSSIER</span>
                <ArrowRight size={15} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Article Reader Modal */}
      <AnimatePresence>
        {selectedArticle && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(3, 7, 15, 0.92)',
              backdropFilter: 'blur(20px)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.5rem',
              overflowY: 'auto',
            }}
            onClick={() => setSelectedArticle(null)}
          >
            <motion.article
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              className="glass-panel-elevated"
              style={{
                maxWidth: '820px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                padding: '3rem 2.5rem',
                position: 'relative',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedArticle(null)}
                style={{
                  position: 'absolute',
                  top: '1.5rem',
                  right: '1.5rem',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'rgba(148, 163, 184, 0.1)',
                  border: '1px solid var(--border-medium)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-secondary)',
                }}
              >
                <X size={18} />
              </button>

              <div style={{ marginBottom: '2rem' }}>
                <span className="badge-tech badge-tech-cyan" style={{ marginBottom: '0.75rem' }}>
                  {selectedArticle.category}
                </span>
                <h1 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(1.5rem, 2.5vw, 2.1rem)',
                  lineHeight: 1.25,
                  marginBottom: '1rem',
                }}>
                  {selectedArticle.title}
                </h1>
                <div style={{
                  display: 'flex',
                  gap: '1.25rem',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                }}>
                  <span>AUTHOR: {selectedArticle.author}</span>
                  <span>EST. READING: {selectedArticle.reading_time} MIN</span>
                </div>
              </div>

              {/* Render article markdown content cleanly */}
              <div style={{
                color: 'var(--text-primary)',
                fontSize: '0.95rem',
                lineHeight: 1.8,
                whiteSpace: 'pre-line',
              }}>
                {selectedArticle.content}
              </div>
            </motion.article>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
