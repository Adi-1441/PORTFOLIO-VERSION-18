// ==============================================================================
// ADITHYA MECHNEXUS V18.0 — PROJECTS SECTION
// Engineering case studies with deep parameter inspection and technical metrics.
// ==============================================================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FolderGit2, ArrowUpRight, X, Wrench, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useCursor } from '../../context/CursorContext';
import { Project } from '../../types/database';
import { UniversalMediaGallery } from '../common/UniversalMediaGallery';

interface ProjectsProps {
  projects: Project[];
}

export const Projects: React.FC<ProjectsProps> = ({ projects }) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const { setMode } = useCursor();

  return (
    <section id="projects" className="section-padding" style={{ position: 'relative', zIndex: 10 }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ marginBottom: '3.5rem' }}>
          <div className="hud-tag">
            <FolderGit2 size={14} />
            <span>CASE STUDIES & TECHNICAL WORKS</span>
          </div>
          <h2 className="section-title">ENGINEERING PROJECTS</h2>
          <p className="section-subtitle">
            Authentic, physics-validated mechanical designs, thermal simulations, materials research, and predictive algorithms.
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid-cards">
          {projects.map((project, idx) => (
            <motion.div
              key={project.id || idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: (idx % 4) * 0.08 }}
              onMouseEnter={() => setMode('card')}
              onMouseLeave={() => setMode('default')}
              onClick={() => setSelectedProject(project)}
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
                {/* Top Meta: Category + Status Badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <span className="badge-tech badge-tech-cyan">
                    {project.category}
                  </span>
                  <span className={project.status === 'completed' ? 'badge-status-completed' : 'badge-status-progress'}>
                    {project.status === 'completed' ? 'COMPLETED' : 'IN PROGRESS'}
                  </span>
                </div>

                {/* Project Title */}
                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  lineHeight: 1.35,
                  marginBottom: '1rem',
                }}>
                  {project.title}
                </h3>

                {/* Short Description */}
                <p style={{
                  fontSize: '0.875rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                  marginBottom: '1.5rem',
                }}>
                  {project.short_description}
                </p>

                {/* Tools Badges */}
                {project.tools_software && project.tools_software.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.5rem' }}>
                    {project.tools_software.slice(0, 3).map((tool, tIdx) => (
                      <span key={tIdx} className="badge-tech">
                        {tool}
                      </span>
                    ))}
                    {project.tools_software.length > 3 && (
                      <span className="badge-tech">+{project.tools_software.length - 3}</span>
                    )}
                  </div>
                )}

                {/* Universal Media Gallery Previews */}
                <UniversalMediaGallery
                  entityType="projects"
                  entityId={project.id}
                  title={project.title}
                />
              </div>

              {/* Card Footer: View Inspection Link */}
              <div style={{
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                color: 'var(--accent-cyan)',
              }}>
                <span>INSPECT TECHNICAL DOSSIER</span>
                <ArrowUpRight size={16} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Comprehensive Project Detail Modal */}
      <AnimatePresence>
        {selectedProject && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(3, 7, 15, 0.88)',
              backdropFilter: 'blur(20px)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.5rem',
              overflowY: 'auto',
            }}
            onClick={() => setSelectedProject(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              className="glass-panel-elevated"
              style={{
                maxWidth: '860px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                padding: '2.5rem',
                position: 'relative',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedProject(null)}
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

              {/* Modal Header */}
              <div style={{ marginBottom: '1.75rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <span className="badge-tech badge-tech-cyan">{selectedProject.category}</span>
                  <span className={selectedProject.status === 'completed' ? 'badge-status-completed' : 'badge-status-progress'}>
                    {selectedProject.status.toUpperCase()}
                  </span>
                </div>
                <h2 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(1.4rem, 2.5vw, 1.85rem)',
                  color: 'var(--text-primary)',
                  lineHeight: 1.25,
                }}>
                  {selectedProject.title}
                </h2>
              </div>

              {/* Full Description */}
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                {selectedProject.full_description || selectedProject.short_description}
              </p>

              {/* Universal Media Gallery Dossier */}
              <UniversalMediaGallery
                entityType="projects"
                entityId={selectedProject.id}
                title={selectedProject.title}
                maxPreviewCount={6}
              />

              {/* Structured Technical Specifications */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                {/* Problem Statement */}
                {selectedProject.problem_statement && (
                  <div className="glass-panel" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem', color: '#f59e0b' }}>
                      <ShieldAlert size={16} />
                      <span className="vernier-badge">PROBLEM STATEMENT</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                      {selectedProject.problem_statement}
                    </p>
                  </div>
                )}

                {/* Objective */}
                {selectedProject.objective && (
                  <div className="glass-panel" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem', color: 'var(--accent-cyan)' }}>
                      <CheckCircle2 size={16} />
                      <span className="vernier-badge">ENGINEERING OBJECTIVE</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                      {selectedProject.objective}
                    </p>
                  </div>
                )}
              </div>

              {/* Methodology & Approach */}
              {selectedProject.methodology && (
                <div style={{ marginBottom: '1.75rem' }}>
                  <div className="vernier-badge" style={{ marginBottom: '0.5rem' }}>NUMERICAL & EXPERIMENTAL METHODOLOGY</div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                    {selectedProject.methodology}
                  </p>
                </div>
              )}

              {/* Engineering Parameters JSON display */}
              {selectedProject.parameters && Object.keys(selectedProject.parameters).length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                  <div className="vernier-badge" style={{ marginBottom: '0.5rem' }}>PHYSICAL PARAMETERS // BOUNDARY DATA</div>
                  <pre className="code-block">
                    {JSON.stringify(selectedProject.parameters, null, 2)}
                  </pre>
                </div>
              )}

              {/* Results & Verification */}
              {selectedProject.results && (
                <div style={{
                  background: 'rgba(20, 184, 166, 0.08)',
                  border: '1px solid rgba(20, 184, 166, 0.3)',
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '1.75rem',
                }}>
                  <div style={{ color: '#2dd4bf', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', marginBottom: '0.5rem', fontWeight: 600 }}>
                    QUANTIFIED RESULTS & VALIDATION
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
                    {selectedProject.results}
                  </p>
                </div>
              )}

              {/* Materials & Software Tooling */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', borderTop: '1px solid var(--border-medium)', paddingTop: '1.5rem' }}>
                {selectedProject.tools_software && (
                  <div>
                    <span className="vernier-badge" style={{ display: 'block', marginBottom: '0.4rem' }}>SOFTWARE SOLVERS</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {selectedProject.tools_software.map((t, idx) => (
                        <span key={idx} className="badge-tech badge-tech-blue">{t}</span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedProject.materials && (
                  <div>
                    <span className="vernier-badge" style={{ display: 'block', marginBottom: '0.4rem' }}>MATERIALS TESTED</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {selectedProject.materials.map((m, idx) => (
                        <span key={idx} className="badge-tech">{m}</span>
                      ))}
                    </div>
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
