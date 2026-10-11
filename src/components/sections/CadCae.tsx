// ==============================================================================
// ADITHYA MECHNEXUS V18.0 — CAD & CAE SIMULATIONS SECTION
// Finite element stress analysis, CFD fluid dynamics, and conjugate heat transfer.
// ==============================================================================

import React from 'react';
import { motion } from 'framer-motion';
import { Boxes, Activity, Wind, Flame, Grid, Cpu } from 'lucide-react';
import { useCursor } from '../../context/CursorContext';
import { CadCae as CadCaeType } from '../../types/database';
import { UniversalMediaGallery } from '../common/UniversalMediaGallery';

interface CadCaeProps {
  entries: CadCaeType[];
}

export const CadCae: React.FC<CadCaeProps> = ({ entries }) => {
  const { setMode } = useCursor();

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'fea': return <Activity size={20} color="#38bdf8" />;
      case 'cfd': return <Wind size={20} color="#2dd4bf" />;
      case 'thermal': return <Flame size={20} color="#f59e0b" />;
      case 'meshing': return <Grid size={20} color="#818cf8" />;
      default: return <Boxes size={20} color="var(--accent-cyan)" />;
    }
  };

  return (
    <section id="cad-cae" className="section-padding" style={{ position: 'relative', zIndex: 10 }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ marginBottom: '3.5rem' }}>
          <div className="hud-tag">
            <Boxes size={14} />
            <span>FINITE ELEMENT & COMPUTATIONAL FLUID DYNAMICS</span>
          </div>
          <h2 className="section-title">CAD & CAE SIMULATIONS</h2>
          <p className="section-subtitle">
            High-density multi-physics models, structural stress solutions, Navier-Stokes fluid fields,
            and mesh-independent numerical convergence.
          </p>
        </div>

        {/* CAD/CAE Detailed Cards Grid */}
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
              {/* Header: Title + Type Badge */}
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
                    background: 'rgba(0, 229, 255, 0.1)',
                    border: '1px solid var(--border-cyan)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {getTypeIcon(entry.type)}
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
                    <div className="vernier-badge">SOLVER: {entry.solver || 'ANSYS Mechanical / Fluent'}</div>
                  </div>
                </div>

                <span className="badge-tech badge-tech-cyan" style={{ fontSize: '0.75rem', padding: '0.3rem 0.75rem' }}>
                  {entry.type.toUpperCase()} ANALYSIS
                </span>
              </div>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: 1.65, marginBottom: '1.25rem' }}>
                {entry.description}
              </p>

              {/* Universal Simulation Media Gallery (FEA/CFD Images & Solver Videos) */}
              <UniversalMediaGallery
                entityType="cad_cae"
                entityId={entry.id}
                title={entry.title}
              />

              {/* Technical Simulation Telemetry Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.25rem',
                marginBottom: '1.75rem',
              }}>
                {/* Boundary Conditions */}
                {entry.boundary_conditions && (
                  <div style={{
                    background: 'rgba(6, 11, 20, 0.75)',
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                  }}>
                    <div className="vernier-badge" style={{ color: 'var(--accent-cyan)', marginBottom: '0.4rem' }}>
                      BOUNDARY CONDITIONS & CONSTRAINTS
                    </div>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {entry.boundary_conditions}
                    </p>
                  </div>
                )}

                {/* Materials & Constitutive Properties */}
                {entry.materials && (
                  <div style={{
                    background: 'rgba(6, 11, 20, 0.75)',
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                  }}>
                    <div className="vernier-badge" style={{ color: '#38bdf8', marginBottom: '0.4rem' }}>
                      MATERIAL CONSTITUTIVE MODEL
                    </div>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {entry.materials}
                    </p>
                  </div>
                )}
              </div>

              {/* Mesh & Solver Details Code Block */}
              {entry.mesh_details && Object.keys(entry.mesh_details).length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <div className="vernier-badge" style={{ marginBottom: '0.4rem' }}>
                    MESH METRICS & DISCRETIZATION SPECS
                  </div>
                  <pre className="code-block" style={{ fontSize: '0.75rem' }}>
                    {JSON.stringify(entry.mesh_details, null, 2)}
                  </pre>
                </div>
              )}

              {/* Simulation Result Callout */}
              {entry.results && (
                <div style={{
                  background: 'rgba(0, 229, 255, 0.06)',
                  borderLeft: '3px solid var(--accent-cyan)',
                  padding: '1rem 1.25rem',
                  borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
                }}>
                  <div className="vernier-badge" style={{ color: 'var(--accent-cyan)', marginBottom: '0.3rem' }}>
                    VERIFIED NUMERICAL CONVERGENCE & OUTCOME
                  </div>
                  <p style={{ color: 'var(--text-primary)', fontSize: '0.875rem', lineHeight: 1.55 }}>
                    {entry.results}
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
