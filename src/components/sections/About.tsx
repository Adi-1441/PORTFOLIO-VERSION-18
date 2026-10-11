// ==============================================================================
// ADITHYA MECHNEXUS V18.0 — ABOUT SECTION
// Professional background, design philosophy, technical direction, and engineering approach.
// ==============================================================================

import React from 'react';
import { motion } from 'framer-motion';
import { Compass, Target, Layers, BookOpen, Cpu, Sparkles } from 'lucide-react';
import { About as AboutType } from '../../types/database';

interface AboutProps {
  about: AboutType;
}

export const About: React.FC<AboutProps> = ({ about }) => {
  return (
    <section id="about" className="section-padding" style={{ position: 'relative', zIndex: 10 }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ marginBottom: '3.5rem' }}>
          <div className="hud-tag">
            <Compass size={14} />
            <span>ENGINEERING PHILOSOPHY & PROFILE</span>
          </div>
          <h2 className="section-title">ABOUT ADITHYA G</h2>
          <p className="section-subtitle">
            Bridging fundamental thermodynamics and solid mechanics with modern computational engineering,
            industrial automation, and machine intelligence.
          </p>
        </div>

        {/* Two Column Layout: Narrative + Pillars */}
        <div className="grid-two-col">
          {/* Main Narrative Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass-panel"
            style={{ padding: '2.5rem', height: '100%' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: 'rgba(0, 229, 255, 0.1)',
                border: '1px solid var(--border-cyan)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-cyan)',
              }}>
                <Cpu size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)' }}>
                  Core Engineering Objective
                </h3>
                <span className="vernier-badge">DISCIPLINE: MECHANICAL ENGINEERING</span>
              </div>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
              {about.content}
            </p>

            {/* Design Philosophy Callout */}
            <div style={{
              background: 'rgba(6, 11, 20, 0.8)',
              borderLeft: '3px solid var(--accent-cyan)',
              padding: '1.25rem',
              borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
              marginBottom: '1.5rem',
            }}>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                color: 'var(--accent-cyan)',
                letterSpacing: '0.1em',
                marginBottom: '0.35rem',
              }}>
                DESIGN PHILOSOPHY
              </div>
              <p style={{ color: 'var(--text-primary)', fontStyle: 'italic', fontSize: '0.875rem' }}>
                "{about.design_philosophy || 'Form adheres strictly to thermodynamic, mechanical, and manufacturability constraints. Precision over decoration; verification over assumption.'}"
              </p>
            </div>

            {/* Engineering Approach */}
            <div>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                color: 'var(--text-secondary)',
                letterSpacing: '0.1em',
                marginBottom: '0.5rem',
              }}>
                METHODOLOGICAL APPROACH
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                {about.engineering_approach}
              </p>
            </div>
          </motion.div>

          {/* Right Column: Key Focus Areas & Trajectory */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
          >
            {/* Engineering Interests Matrix */}
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem' }}>
                <Target size={18} color="var(--accent-cyan)" />
                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>
                  Primary Engineering Interests
                </h4>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {about.engineering_interests?.map((interest, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.8125rem',
                      color: 'var(--text-primary)',
                      padding: '0.5rem 0.75rem',
                      background: 'rgba(148, 163, 184, 0.05)',
                      borderRadius: 'var(--radius-xs)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <span style={{ color: 'var(--accent-cyan)', fontWeight: 'bold' }}>0{idx + 1}.</span>
                    <span>{interest}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Technical Direction & Future Scope */}
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                <Sparkles size={18} color="#818cf8" />
                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>
                  Technical Direction
                </h4>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                {about.technical_direction}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.75rem' }}>
                <BookOpen size={16} color="var(--accent-teal)" />
                <span className="vernier-badge" style={{ color: 'var(--text-secondary)' }}>LEARNING TRAJECTORY</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                {about.learning_direction}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
