// ==============================================================================
// ADITHYA MECHNEXUS V18.3 — SCIENTIFIC & APPLIED RESEARCH SECTION
// Peer-reviewed studies, experimental validation, and multi-physics analysis.
// ==============================================================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ExternalLink, FileText, ChevronRight, CheckCircle2, FlaskConical, Layers, ArrowUpRight, X } from 'lucide-react';
import { useCursor } from '../../context/CursorContext';
import { Research as ResearchType } from '../../types/database';
import { UniversalMediaGallery } from '../common/UniversalMediaGallery';

interface ResearchProps {
  entries: ResearchType[];
}

export const Research: React.FC<ResearchProps> = ({ entries }) => {
  const { setMode } = useCursor();
  const [selectedResearch, setSelectedResearch] = useState<ResearchType | null>(null);
  const [activeTag, setActiveTag] = useState<string>('ALL');

  // Derive unique tags
  const allTags = ['ALL', ...Array.from(new Set(entries.flatMap(r => r.tags || [])))];

  const filteredEntries = activeTag === 'ALL'
    ? entries
    : entries.filter(r => r.tags?.includes(activeTag));

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return { label: 'PUBLISHED', color: 'var(--accent-cyan)', bg: 'rgba(0, 229, 255, 0.1)', border: 'rgba(0, 229, 255, 0.3)' };
      case 'completed':
        return { label: 'COMPLETED', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.3)' };
      case 'ongoing':
        return { label: 'IN REVIEW / ONGOING', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.3)' };
      default:
        return { label: 'PLANNED', color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.1)', border: 'rgba(148, 163, 184, 0.3)' };
    }
  };

  return (
    <section id="research" className="section-padding" style={{ position: 'relative', zIndex: 10 }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ marginBottom: '3rem' }}>
          <div className="hud-tag">
            <BookOpen size={14} />
            <span>INVESTIGATIVE LABORATORY & LITERATURE</span>
          </div>
          <h2 className="section-title">SCIENTIFIC & APPLIED RESEARCH</h2>
          <p className="section-subtitle">
            Rigorous thermo-mechanical investigations, Navier-Stokes turbulent boundary interactions,
            material failure mechanics, and experimentally validated numerical simulations.
          </p>

          {/* Filter Bar */}
          {allTags.length > 2 && (
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              marginTop: '1.5rem',
            }}>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(tag)}
                  onMouseEnter={() => setMode('button')}
                  onMouseLeave={() => setMode('default')}
                  style={{
                    padding: '6px 14px',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    background: activeTag === tag ? 'rgba(0, 229, 255, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    color: activeTag === tag ? 'var(--accent-cyan)' : 'var(--text-muted)',
                    border: `1px solid ${activeTag === tag ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.1)'}`,
                    borderRadius: '4px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Research Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '2rem',
        }}>
          {filteredEntries.map((item, idx) => {
            const badge = getStatusBadge(item.status);
            return (
              <motion.div
                key={item.id || idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="glass-panel"
                style={{
                  padding: '2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderRadius: '12px',
                  border: '1px solid var(--border-steel)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Top Corner Technical Index */}
                <div style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1.25rem',
                  fontSize: '10px',
                  fontFamily: 'var(--font-mono)',
                  color: 'rgba(255, 255, 255, 0.25)',
                  letterSpacing: '1px',
                }}>
                  EXP-REF//{String(idx + 1).padStart(2, '0')}
                </div>

                <div>
                  {/* Status Badge */}
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    backgroundColor: badge.bg,
                    border: `1px solid ${badge.border}`,
                    color: badge.color,
                    fontSize: '10px',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 600,
                    letterSpacing: '1px',
                    marginBottom: '1rem',
                  }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: badge.color }} />
                    {badge.label}
                  </div>

                  {/* Title */}
                  <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: 600,
                    lineHeight: 1.4,
                    color: 'var(--text-primary)',
                    marginBottom: '1rem',
                  }}>
                    {item.title}
                  </h3>

                  {/* Abstract Snippet */}
                  {item.abstract && (
                    <p style={{
                      fontSize: '0.9rem',
                      lineHeight: 1.6,
                      color: 'var(--text-secondary)',
                      marginBottom: '1.5rem',
                      display: '-webkit-box',
                      WebkitLineClamp: 4,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}>
                      {item.abstract}
                    </p>
                  )}

                  {/* Methodology highlight */}
                  {item.methodology && (
                    <div style={{
                      padding: '10px 14px',
                      background: 'rgba(255, 255, 255, 0.02)',
                      borderLeft: '2px solid var(--accent-cyan)',
                      borderRadius: '0 4px 4px 0',
                      marginBottom: '1.25rem',
                      fontSize: '0.8rem',
                      color: 'var(--text-muted)',
                      fontFamily: 'var(--font-mono)',
                    }}>
                      <div style={{ color: 'var(--text-primary)', marginBottom: '4px', fontWeight: 600 }}>
                        METHODOLOGY:
                      </div>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.methodology}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {item.tags && item.tags.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '1.5rem' }}>
                      {item.tags.slice(0, 4).map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          style={{
                            padding: '3px 8px',
                            borderRadius: '3px',
                            background: 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            fontSize: '11px',
                            color: 'var(--text-muted)',
                            fontFamily: 'var(--font-mono)',
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Universal Research Media Gallery */}
                  <UniversalMediaGallery
                    entityType="research"
                    entityId={item.id}
                    title={item.title}
                  />
                </div>

                {/* Card Action */}
                <div style={{
                  paddingTop: '1rem',
                  borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <button
                    onClick={() => setSelectedResearch(item)}
                    onMouseEnter={() => setMode('inspect')}
                    onMouseLeave={() => setMode('default')}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--accent-cyan)',
                      fontSize: '12px',
                      fontFamily: 'var(--font-mono)',
                      letterSpacing: '1px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    <span>ANALYZE STUDY</span>
                    <ChevronRight size={14} />
                  </button>

                  {item.publication_info?.doi && (
                    <a
                      href={`https://doi.org/${item.publication_info.doi}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: 'var(--text-muted)',
                        fontSize: '11px',
                        fontFamily: 'var(--font-mono)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        textDecoration: 'none',
                      }}
                    >
                      <span>DOI</span>
                      <ArrowUpRight size={12} />
                    </a>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Deep-Dive Investigation Modal */}
      <AnimatePresence>
        {selectedResearch && (
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
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              style={{
                width: '100%',
                maxWidth: '750px',
                maxHeight: '85vh',
                backgroundColor: 'var(--bg-steel)',
                border: '1px solid var(--border-cyan)',
                borderRadius: '12px',
                padding: '2.5rem',
                overflowY: 'auto',
                position: 'relative',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
              }}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedResearch(null)}
                style={{
                  position: 'absolute',
                  top: '1.5rem',
                  right: '1.5rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  color: 'var(--text-secondary)',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X size={18} />
              </button>

              {/* Modal HUD Header */}
              <div className="hud-tag" style={{ marginBottom: '1rem' }}>
                <FlaskConical size={14} />
                <span>TECHNICAL REPORT DOSSIER</span>
              </div>

              <h2 style={{
                fontSize: '1.6rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: '1.5rem',
                lineHeight: 1.3,
              }}>
                {selectedResearch.title}
              </h2>

              {/* Sections */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {selectedResearch.abstract && (
                  <div>
                    <h4 style={{
                      fontSize: '11px',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--accent-cyan)',
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                      marginBottom: '6px',
                    }}>
                      ABSTRACT
                    </h4>
                    <p style={{ fontSize: '0.95rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
                      {selectedResearch.abstract}
                    </p>
                  </div>
                )}

                {/* Universal Research Media Dossier */}
                <UniversalMediaGallery
                  entityType="research"
                  entityId={selectedResearch.id}
                  title={selectedResearch.title}
                  maxPreviewCount={6}
                />

                {selectedResearch.objective && (
                  <div>
                    <h4 style={{
                      fontSize: '11px',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--accent-cyan)',
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                      marginBottom: '6px',
                    }}>
                      RESEARCH OBJECTIVE
                    </h4>
                    <p style={{ fontSize: '0.95rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
                      {selectedResearch.objective}
                    </p>
                  </div>
                )}

                {selectedResearch.methodology && (
                  <div>
                    <h4 style={{
                      fontSize: '11px',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--accent-cyan)',
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                      marginBottom: '6px',
                    }}>
                      METHODOLOGY & NUMERICAL SCHEMES
                    </h4>
                    <p style={{ fontSize: '0.95rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
                      {selectedResearch.methodology}
                    </p>
                  </div>
                )}

                {selectedResearch.results && (
                  <div>
                    <h4 style={{
                      fontSize: '11px',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--accent-cyan)',
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                      marginBottom: '6px',
                    }}>
                      RESULTS & EMPIRICAL FINDINGS
                    </h4>
                    <p style={{ fontSize: '0.95rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
                      {selectedResearch.results}
                    </p>
                  </div>
                )}

                {selectedResearch.conclusion && (
                  <div>
                    <h4 style={{
                      fontSize: '11px',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--accent-cyan)',
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                      marginBottom: '6px',
                    }}>
                      ENGINEERING CONCLUSION
                    </h4>
                    <p style={{ fontSize: '0.95rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
                      {selectedResearch.conclusion}
                    </p>
                  </div>
                )}

                {selectedResearch.references && selectedResearch.references.length > 0 && (
                  <div style={{
                    marginTop: '1rem',
                    paddingTop: '1.25rem',
                    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  }}>
                    <h4 style={{
                      fontSize: '11px',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--text-muted)',
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                      marginBottom: '10px',
                    }}>
                      PRIMARY CITATIONS & REFERENCES
                    </h4>
                    <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {selectedResearch.references.map((ref, rIdx) => (
                        <li key={rIdx} style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                          {ref}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
