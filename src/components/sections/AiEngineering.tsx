// ==============================================================================
// ADITHYA MECHNEXUS V18.0 — AI × ENGINEERING SECTION
// Machine intelligence strictly applied to physical simulation and manufacturing.
// ==============================================================================

import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Zap, Clock, ShieldCheck } from 'lucide-react';
import { AiEngineering as AiEngType } from '../../types/database';

interface AiProps {
  entries: AiEngType[];
}

export const AiEngineering: React.FC<AiProps> = ({ entries }) => {
  return (
    <section id="ai-engineering" className="section-padding" style={{ position: 'relative', zIndex: 10 }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ marginBottom: '3.5rem' }}>
          <div className="hud-tag">
            <Brain size={14} />
            <span>MACHINE INTELLIGENCE FOR PHYSICAL SYSTEMS</span>
          </div>
          <h2 className="section-title">AI × ENGINEERING</h2>
          <p className="section-subtitle">
            Surrogate neural solvers, physics-informed optimization networks, and predictive sensor telemetry
            accelerating mechanical engineering iterations.
          </p>
        </div>

        {/* AI Engineering Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {entries.map((entry, idx) => (
            <motion.div
              key={entry.id || idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="glass-panel"
              style={{ padding: '2.5rem' }}
            >
              {/* Header: Title + Application Type */}
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '1.5rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '8px',
                    background: 'rgba(124, 58, 237, 0.15)',
                    border: '1px solid rgba(124, 58, 237, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#c084fc',
                  }}>
                    <Brain size={22} />
                  </div>
                  <div>
                    <h3 style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.35rem',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                    }}>
                      {entry.title}
                    </h3>
                    <div className="vernier-badge" style={{ color: '#c084fc' }}>
                      ENGINEERING DOMAIN: {entry.application_type.replace('_', ' ').toUpperCase()}
                    </div>
                  </div>
                </div>

                <span className="badge-tech badge-tech-blue">
                  PHYSICS-INFORMED ML
                </span>
              </div>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: 1.65, marginBottom: '1.75rem' }}>
                {entry.description}
              </p>

              {/* Methodology Specification */}
              {entry.methodology && (
                <div style={{
                  background: 'rgba(6, 11, 20, 0.8)',
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-medium)',
                  marginBottom: '1.75rem',
                }}>
                  <div className="vernier-badge" style={{ color: 'var(--accent-cyan)', marginBottom: '0.4rem' }}>
                    NEURAL ARCHITECTURE & PHYSICS CONSTRAINTS
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {entry.methodology}
                  </p>
                </div>
              )}

              {/* Benchmark Latency Comparison Banner */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1rem',
                marginBottom: '1.75rem',
              }}>
                <div style={{
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-xs)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}>
                  <Clock size={20} color="#f87171" />
                  <div>
                    <div className="vernier-badge" style={{ color: '#f87171' }}>CONVENTIONAL CFD SOLVER</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold', fontSize: '1.1rem', color: '#f87171' }}>
                      45 MINUTES
                    </div>
                  </div>
                </div>

                <div style={{
                  background: 'rgba(52, 211, 153, 0.08)',
                  border: '1px solid rgba(52, 211, 153, 0.25)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-xs)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}>
                  <Zap size={20} color="#34d399" />
                  <div>
                    <div className="vernier-badge" style={{ color: '#34d399' }}>AI SURROGATE INFERENCE</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold', fontSize: '1.1rem', color: '#34d399' }}>
                      12 MILLISECONDS
                    </div>
                  </div>
                </div>
              </div>

              {/* Quantified Accuracy */}
              {entry.results && (
                <div style={{
                  background: 'rgba(0, 229, 255, 0.06)',
                  borderLeft: '3px solid var(--accent-cyan)',
                  padding: '1rem 1.25rem',
                  borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
                  marginBottom: '1.5rem',
                }}>
                  <div className="vernier-badge" style={{ color: 'var(--accent-cyan)', marginBottom: '0.3rem' }}>
                    SURROGATE ACCURACY & VALIDATION
                  </div>
                  <p style={{ color: 'var(--text-primary)', fontSize: '0.875rem', lineHeight: 1.55 }}>
                    {entry.results}
                  </p>
                </div>
              )}

              {/* Tools Tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {entry.tools_software?.map((tool, tIdx) => (
                  <span key={tIdx} className="badge-tech">{tool}</span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
