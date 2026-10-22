// ==============================================================================
// ADITHYA MECHNEXUS V18.3 — DEDICATED QR CODE PORTFOLIO SECTION
// Interactive high-contrast QR portal with PNG & SVG vector downloads.
// ==============================================================================

import React from 'react';
import { motion } from 'framer-motion';
import { QrCode, Smartphone, Printer, ExternalLink, ShieldCheck, Share2, Compass } from 'lucide-react';
import { QrCodeCard, LIVE_PORTFOLIO_URL } from '../qr/QrCodeCard';
import { useCursor } from '../../context/CursorContext';
import { Link } from 'react-router-dom';

export const QrCodeSection: React.FC = () => {
  const { setMode } = useCursor();

  return (
    <section
      id="qr-code"
      className="section-padding"
      style={{
        position: 'relative',
        zIndex: 10,
        borderTop: '1px solid var(--border-subtle)',
      }}
    >
      <div className="container">
        {/* Section Header */}
        <div style={{ marginBottom: '3.5rem' }}>
          <div className="hud-tag">
            <QrCode size={14} color="var(--accent-cyan)" />
            <span>OPTICAL DIRECTORY PROTOCOL</span>
          </div>
          <h2 className="section-title">PORTFOLIO QR CODE</h2>
          <p className="section-subtitle">
            Scan via smartphone camera to immediately inspect the live engineering laboratory,
            or export verified vector graphics for physical project dossiers, academic posters, and conference presentations.
          </p>
        </div>

        {/* Section Content Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2.5rem',
            alignItems: 'center',
          }}
        >
          {/* Main Interactive QR Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <QrCodeCard />
          </motion.div>

          {/* Side Telemetry & Usage Dossier */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
            }}
          >
            {/* Telemetry Card 1: Scanning Protocol */}
            <div
              className="glass-panel"
              style={{
                padding: '1.75rem',
                border: '1px solid rgba(0, 229, 255, 0.25)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '1rem',
                  fontFamily: 'var(--font-display)',
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: 'var(--accent-cyan)',
                }}
              >
                <Smartphone size={18} />
                <span>MOBILE OPTICAL SCAN PROTOCOL</span>
              </div>
              <p
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                  marginBottom: '1.25rem',
                }}
              >
                Point your standard iOS Camera or Android Google Lens / Camera app at the high-contrast
                matrix. The live portfolio destination will automatically pop up with zero auxiliary apps required.
              </p>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  color: '#2dd4bf',
                  backgroundColor: 'rgba(20, 184, 166, 0.1)',
                  padding: '0.5rem 0.85rem',
                  borderRadius: 'var(--radius-xs)',
                  border: '1px solid rgba(20, 184, 166, 0.3)',
                }}
              >
                <ShieldCheck size={14} />
                <span>100% OPTICALLY VERIFIED FOR PHONE SENSORS</span>
              </div>
            </div>

            {/* Telemetry Card 2: Print & Dossier Readiness */}
            <div
              className="glass-panel"
              style={{
                padding: '1.75rem',
                border: '1px solid rgba(61, 126, 255, 0.25)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '1rem',
                  fontFamily: 'var(--font-display)',
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: '#60a5fa',
                }}
              >
                <Printer size={18} />
                <span>PHYSICAL DOSSIER SPECIFICATIONS</span>
              </div>
              <p
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                  marginBottom: '1.25rem',
                }}
              >
                The provided PNG download outputs at <strong>1024×1024 px</strong> with built-in quiet zones.
                The SVG export generates infinite-resolution mathematical curves suitable for industrial signage,
                business cards, and LaTeX academic publications.
              </p>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '0.6rem',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  color: 'var(--text-muted)',
                }}
              >
                <div>• REDUNDANCY: 30% REPAIR</div>
                <div>• FORMATS: PNG + SVG</div>
                <div>• CONTRAST RATIO: &gt; 21:1</div>
                <div>• QUIET ZONE: 4 MODULES</div>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '1rem',
                alignItems: 'center',
              }}
            >
              <Link
                to="/qr"
                onMouseEnter={() => setMode('button')}
                onMouseLeave={() => setMode('default')}
                className="btn-secondary"
                style={{
                  fontSize: '0.75rem',
                  padding: '0.7rem 1.4rem',
                  textDecoration: 'none',
                }}
              >
                <Compass size={14} color="var(--accent-cyan)" />
                <span>STANDALONE FULLSCREEN /QR VIEW</span>
              </Link>

              <a
                href={LIVE_PORTFOLIO_URL}
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={() => setMode('button')}
                onMouseLeave={() => setMode('default')}
                className="btn-secondary"
                style={{
                  fontSize: '0.75rem',
                  padding: '0.7rem 1.4rem',
                  textDecoration: 'none',
                }}
              >
                <ExternalLink size={14} />
                <span>LAUNCH VERCEL PRODUCTION</span>
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
