// ==============================================================================
// ADITHYA MECHNEXUS V18.0 — RESUME & ENGINEERING DOSSIER SECTION
// Professional CV overview, version tracking, and direct download links.
// ==============================================================================

import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, CheckCircle2, Shield, Calendar } from 'lucide-react';
import { useCursor } from '../../context/CursorContext';
import { Profile } from '../../types/database';

interface ResumeProps {
  profile: Profile;
}

export const Resume: React.FC<ResumeProps> = ({ profile }) => {
  const { setMode } = useCursor();

  return (
    <section id="resume" className="section-padding" style={{ position: 'relative', zIndex: 10 }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ marginBottom: '3.5rem' }}>
          <div className="hud-tag">
            <FileText size={14} />
            <span>CURRICULUM VITAE & TECHNICAL DOSSIER</span>
          </div>
          <h2 className="section-title">ENGINEERING RESUME</h2>
          <p className="section-subtitle">
            Comprehensive chronological summary of academic research, technical internships, and mechanical design competencies.
          </p>
        </div>

        {/* Dossier Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="glass-panel-elevated"
          style={{ padding: '3rem 2.5rem', maxWidth: '880px', margin: '0 auto' }}
        >
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1.5rem',
            borderBottom: '1px solid var(--border-medium)',
            paddingBottom: '2rem',
            marginBottom: '2rem',
          }}>
            <div>
              <span className="badge-tech badge-tech-cyan" style={{ marginBottom: '0.5rem' }}>
                ACTIVE ENGINEERING DOSSIER
              </span>
              <h3 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.65rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: '0.35rem',
              }}>
                {profile.full_name || 'Adithya G'} — Curriculum Vitae
              </h3>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                color: 'var(--text-secondary)',
                display: 'flex',
                gap: '1rem',
              }}>
                <span>VERSION: {profile.resume_version || 'V18.0'}</span>
                <span>STATUS: VERIFIED CANDIDATE</span>
              </div>
            </div>

            {/* Download CTA Button */}
            <a
              href={profile.resume_url || '#'}
              download={Boolean(profile.resume_url)}
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={() => setMode('button')}
              onMouseLeave={() => setMode('default')}
              className="btn-primary"
            >
              <Download size={16} />
              <span>DOWNLOAD RESUME PDF</span>
            </a>
          </div>

          {/* Dossier Core Highlights */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.5rem',
          }}>
            <div style={{
              background: 'rgba(6, 11, 20, 0.75)',
              padding: '1.25rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
            }}>
              <div className="vernier-badge" style={{ color: 'var(--accent-cyan)', marginBottom: '0.4rem' }}>
                EDUCATION
              </div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.2rem' }}>
                {profile.education_degree || 'B.E. Mechanical Engineering'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {profile.education_institution || 'BMS Institute of Technology & Management'}
                {profile.education_year ? ` • ${profile.education_year}` : ' • 2022 – 2026'}
              </div>
            </div>

            <div style={{
              background: 'rgba(6, 11, 20, 0.75)',
              padding: '1.25rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
            }}>
              <div className="vernier-badge" style={{ color: '#38bdf8', marginBottom: '0.4rem' }}>
                SPECIALIZATION
              </div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.2rem' }}>
                CAD/CAE & Multi-Physics
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                FEA Stress • CFD Aerodynamics • Thermal
              </div>
            </div>

            <div style={{
              background: 'rgba(6, 11, 20, 0.75)',
              padding: '1.25rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
            }}>
              <div className="vernier-badge" style={{ color: '#34d399', marginBottom: '0.4rem' }}>
                AUTOMATION & AI
              </div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.2rem' }}>
                PLC & Machine Learning
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Rockwell Micro820 • PyTorch Surrogates
              </div>
            </div>
          </div>

          {/* Career Objectives & Trajectory Highlight if set */}
          {profile.career_goals && (
            <div style={{
              marginTop: '1.5rem',
              padding: '1.25rem',
              background: 'rgba(0, 229, 255, 0.04)',
              border: '1px solid rgba(0, 229, 255, 0.2)',
              borderRadius: 'var(--radius-sm)',
            }}>
              <div className="vernier-badge" style={{ color: 'var(--accent-cyan)', marginBottom: '0.4rem' }}>
                RESEARCH & CAREER OBJECTIVE
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                {profile.career_goals}
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
};
