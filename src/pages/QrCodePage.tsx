// ==============================================================================
// ADITHYA MECHNEXUS V18.3 — STANDALONE QR CODE TELEMETRY PAGE (/qr)
// Dedicated fullscreen optical handshake view for presentations, mobile scanning,
// and physical dossier export.
// ==============================================================================

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Cpu, Shield, Sparkles, ExternalLink } from 'lucide-react';
import { QrCodeCard, LIVE_PORTFOLIO_URL } from '../components/qr/QrCodeCard';
import { SEOHead } from '../components/common/SEOHead';
import { useCursor } from '../context/CursorContext';

export const QrCodePage: React.FC = () => {
  const { setMode } = useCursor();

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        width: '100vw',
        overflowX: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.5rem',
        backgroundColor: 'transparent',
      }}
    >
      <SEOHead
        title="ADITHYA MECHNEXUS | Portfolio QR Code"
        description="Scan the official optical QR code to instantly explore Adithya G's mechanical engineering and multi-physics laboratory."
      />

      {/* Engineering Background Grid Overlay */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundImage: `
            linear-gradient(to right, rgba(0, 229, 255, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 229, 255, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 85%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 85%)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* Top Navigation & Status Bar */}
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          padding: '1.25rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          backgroundColor: 'rgba(3, 7, 15, 0.75)',
          borderBottom: '1px solid rgba(0, 229, 255, 0.15)',
          zIndex: 50,
        }}
      >
        {/* Back Link */}
        <Link
          to="/portfolio"
          onMouseEnter={() => setMode('button')}
          onMouseLeave={() => setMode('default')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--text-secondary)',
            textDecoration: 'none',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            letterSpacing: '0.08em',
            padding: '0.45rem 0.9rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            backgroundColor: 'rgba(6, 12, 22, 0.8)',
            transition: 'all 0.2s ease',
          }}
        >
          <ArrowLeft size={14} color="var(--accent-cyan)" />
          <span>RETURN TO PORTFOLIO</span>
        </Link>

        {/* System Identifier */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6875rem',
            color: 'var(--text-muted)',
            letterSpacing: '0.12em',
          }}
        >
          <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>
            NODE: QR_TELEMETRY_TERMINAL
          </span>
          <span style={{ color: 'var(--border-cyan)' }}>//</span>
          <span>LIVE VERCEL TARGET</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: '640px',
          marginTop: '5rem',
          marginBottom: '2rem',
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <QrCodeCard />
        </motion.div>
      </main>

      {/* Telemetry Footer */}
      <footer
        style={{
          position: 'relative',
          zIndex: 10,
          textAlign: 'center',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.6875rem',
          color: 'var(--text-muted)',
          letterSpacing: '0.06em',
          maxWidth: '600px',
          lineHeight: 1.6,
        }}
      >
        <div>
          ADITHYA MECHNEXUS • ISO/IEC 18004 COMPLIANT OPTICAL ENCODING
        </div>
        <div style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
          TARGET: {LIVE_PORTFOLIO_URL}
        </div>
      </footer>
    </div>
  );
};
