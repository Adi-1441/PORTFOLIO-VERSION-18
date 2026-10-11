// ==============================================================================
// ADITHYA MECHNEXUS V18.0 — PLC & INDUSTRIAL AUTOMATION SECTION
// Deterministic ladder diagrams, sensor inputs, actuator outputs, and sequence timing.
// ==============================================================================

import React from 'react';
import { motion } from 'framer-motion';
import { Sliders, Cpu, ArrowRightLeft, CheckCircle2, ShieldCheck } from 'lucide-react';
import { PlcAutomation as PlcType } from '../../types/database';
import { UniversalMediaGallery } from '../common/UniversalMediaGallery';

interface PlcProps {
  entries: PlcType[];
}

export const PlcAutomation: React.FC<PlcProps> = ({ entries }) => {
  return (
    <section id="plc" className="section-padding" style={{ position: 'relative', zIndex: 10 }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ marginBottom: '3.5rem' }}>
          <div className="hud-tag">
            <Sliders size={14} />
            <span>DETERMINISTIC CONTROL & MECHATRONICS</span>
          </div>
          <h2 className="section-title">PLC & INDUSTRIAL AUTOMATION</h2>
          <p className="section-subtitle">
            Programmable logic controller routines, pneumatic solenoid sequencing, state-machine interlocks,
            and high-speed sensor integration.
          </p>
        </div>

        {/* PLC Entries */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
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
              {/* Header: Title + Controller Badge */}
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '1.5rem',
              }}>
                <div>
                  <h3 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.35rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    marginBottom: '0.35rem',
                  }}>
                    {entry.title}
                  </h3>
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8rem',
                    color: 'var(--accent-cyan)',
                    letterSpacing: '0.08em',
                  }}>
                    CONTROLLER: {entry.controller || 'Rockwell Allen-Bradley Micro820'}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <span className="badge-tech badge-tech-cyan">
                    {entry.programming_type.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className="badge-status-completed">VERIFIED LOGIC</span>
                </div>
              </div>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: 1.65, marginBottom: '1.25rem' }}>
                {entry.description}
              </p>

              {/* Universal Automation Media Gallery (Schematics, Ladder Rungs, HMI Videos) */}
              <UniversalMediaGallery
                entityType="plc"
                entityId={entry.id}
                title={entry.title}
              />

              {/* I/O Channel Mapping Table */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem',
              }}>
                {/* Inputs Table */}
                <div style={{
                  background: 'rgba(6, 11, 20, 0.85)',
                  padding: '1.5rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-medium)',
                }}>
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    color: '#38bdf8',
                    letterSpacing: '0.1em',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}>
                    <ArrowRightLeft size={14} />
                    DIGITAL / ANALOG INPUTS (DI/AI)
                  </div>
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                    {entry.inputs?.map((inp, iIdx) => (
                      <li key={iIdx} style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary)',
                        background: 'rgba(148, 163, 184, 0.05)',
                        padding: '0.35rem 0.6rem',
                        borderRadius: 'var(--radius-xs)',
                        borderLeft: '2px solid #38bdf8',
                      }}>
                        {inp}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Outputs Table */}
                <div style={{
                  background: 'rgba(6, 11, 20, 0.85)',
                  padding: '1.5rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-medium)',
                }}>
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    color: '#34d399',
                    letterSpacing: '0.1em',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}>
                    <Cpu size={14} />
                    ACTUATOR / CONTACTOR OUTPUTS (DO/AO)
                  </div>
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                    {entry.outputs?.map((out, oIdx) => (
                      <li key={oIdx} style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary)',
                        background: 'rgba(148, 163, 184, 0.05)',
                        padding: '0.35rem 0.6rem',
                        borderRadius: 'var(--radius-xs)',
                        borderLeft: '2px solid #34d399',
                      }}>
                        {out}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* State Machine Logic & Sequence */}
              <div style={{ marginBottom: '1.75rem' }}>
                <div className="vernier-badge" style={{ color: 'var(--accent-cyan)', marginBottom: '0.5rem' }}>
                  STATE-MACHINE ARCHITECTURE & SAFETY INTERLOCKS
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>
                  {entry.logic_description}
                </p>

                <div className="vernier-badge" style={{ color: 'var(--accent-cyan)', marginBottom: '0.5rem' }}>
                  EXECUTION SEQUENCE
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {entry.sequence_description}
                </p>
              </div>

              {/* Hardware & Software Tags */}
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1rem',
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: '1.25rem',
              }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {entry.hardware?.map((h, idx) => (
                    <span key={idx} className="badge-tech">{h}</span>
                  ))}
                  {entry.software?.map((s, idx) => (
                    <span key={idx} className="badge-tech badge-tech-blue">{s}</span>
                  ))}
                </div>

                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  color: '#2dd4bf',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}>
                  <ShieldCheck size={16} />
                  <span>DETERMINISTIC VERIFICATION PASS</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
