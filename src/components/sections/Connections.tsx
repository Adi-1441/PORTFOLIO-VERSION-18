// ==============================================================================
// ADITHYA MECHNEXUS V18.0 — CONNECTIONS SECTION
// Professional network profiles (Terminology: CONNECTIONS, not "Socials").
// ==============================================================================

import React from 'react';
import { motion } from 'framer-motion';
import { Link2, Linkedin, Github, BookOpen, ExternalLink } from 'lucide-react';
import { useCursor } from '../../context/CursorContext';
import { Connection } from '../../types/database';

interface ConnectionsProps {
  connections: Connection[];
}

export const Connections: React.FC<ConnectionsProps> = ({ connections }) => {
  const { setMode } = useCursor();

  const getIcon = (iconName: string | null) => {
    switch (iconName?.toLowerCase()) {
      case 'linkedin': return <Linkedin size={22} />;
      case 'github': return <Github size={22} />;
      case 'bookopen':
      case 'researchgate': return <BookOpen size={22} />;
      default: return <Link2 size={22} />;
    }
  };

  return (
    <section id="connections" className="section-padding" style={{ position: 'relative', zIndex: 10 }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ marginBottom: '3.5rem' }}>
          <div className="hud-tag">
            <Link2 size={14} />
            <span>PROFESSIONAL ENGAGEMENT</span>
          </div>
          <h2 className="section-title">CONNECTIONS</h2>
          <p className="section-subtitle">
            Verified professional and academic profiles for technical collaboration, industrial consultation, and research inquiries.
          </p>
        </div>

        {/* Connections Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.75rem',
        }}>
          {connections.map((conn, idx) => (
            <motion.a
              key={conn.id || idx}
              href={conn.url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: idx * 0.1 }}
              onMouseEnter={() => setMode('button')}
              onMouseLeave={() => setMode('default')}
              className="glass-panel card-interactive"
              style={{
                padding: '2rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1.25rem',
              }}
            >
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(0, 229, 255, 0.1)',
                border: '1px solid var(--border-cyan)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-cyan)',
                flexShrink: 0,
              }}>
                {getIcon(conn.icon)}
              </div>

              <div style={{ flex: 1 }}>
                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  marginBottom: '0.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <span>{conn.name}</span>
                  <ExternalLink size={14} color="var(--accent-cyan)" />
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {conn.description}
                </p>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};
