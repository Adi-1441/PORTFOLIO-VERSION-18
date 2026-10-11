// ==============================================================================
// ADITHYA MECHNEXUS V18.0 — CERTIFICATIONS SECTION
// Verified credentials in Finite Element Analysis, Machine Learning, and CAD.
// ==============================================================================

import React from 'react';
import { motion } from 'framer-motion';
import { Award, ExternalLink, Calendar, ShieldCheck } from 'lucide-react';
import { useCursor } from '../../context/CursorContext';
import { Certification } from '../../types/database';

interface CertsProps {
  certifications: Certification[];
}

export const Certifications: React.FC<CertsProps> = ({ certifications }) => {
  const { setMode } = useCursor();

  return (
    <section id="certifications" className="section-padding" style={{ position: 'relative', zIndex: 10 }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ marginBottom: '3.5rem' }}>
          <div className="hud-tag">
            <Award size={14} />
            <span>ACCREDITED CREDENTIALS & SPECIALIZATIONS</span>
          </div>
          <h2 className="section-title">CERTIFICATIONS</h2>
          <p className="section-subtitle">
            Formal technical certifications validating computational mechanics, machine learning for telemetry,
            and parametric drafting.
          </p>
        </div>

        {/* Certifications Cards Grid */}
        <div className="grid-cards">
          {certifications.map((cert, idx) => (
            <motion.div
              key={cert.id || idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: idx * 0.08 }}
              className="glass-panel"
              style={{
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                {/* Header: Issuer + Verified Badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <span className="badge-tech badge-tech-cyan">
                    {cert.issuer}
                  </span>
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.6875rem',
                    color: '#34d399',
                  }}>
                    <ShieldCheck size={14} />
                    VERIFIED
                  </span>
                </div>

                {/* Title */}
                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.15rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  lineHeight: 1.35,
                  marginBottom: '1rem',
                }}>
                  {cert.title}
                </h3>

                {/* Description */}
                <p style={{
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                  marginBottom: '1.5rem',
                }}>
                  {cert.description}
                </p>
              </div>

              {/* Bottom Meta */}
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  marginBottom: '0.75rem',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={13} />
                    <span>{cert.date || '2024'}</span>
                  </div>
                  <span>ID: {cert.credential_id || 'VERIFIED'}</span>
                </div>

                {cert.verification_url && (
                  <a
                    href={cert.verification_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onMouseEnter={() => setMode('button')}
                    onMouseLeave={() => setMode('default')}
                    className="btn-secondary"
                    style={{
                      width: '100%',
                      fontSize: '0.72rem',
                      padding: '0.55rem 1rem',
                    }}
                  >
                    <span>VERIFY CREDENTIAL</span>
                    <ExternalLink size={13} />
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
