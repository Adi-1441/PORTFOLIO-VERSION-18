// ==============================================================================
// ADITHYA MECHNEXUS V18.1 — LABORATORY FOOTER
// Disciplinary telemetry, navigation shortcuts, and dedicated Admin Portal access.
// ==============================================================================

import React from 'react';
import { Link } from 'react-router-dom';
import { Cpu, ArrowUp, Shield, Lock, FileText, Send, Share2, QrCode } from 'lucide-react';
import { useCursor } from '../../context/CursorContext';

export const Footer: React.FC = () => {
  const { setMode } = useCursor();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer style={{
      borderTop: '1px solid var(--border-medium)',
      backgroundColor: 'rgba(3, 7, 15, 0.96)',
      padding: '4.5rem 0 2.5rem',
      position: 'relative',
      zIndex: 10,
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '2.5rem',
          marginBottom: '3rem',
        }}>
          {/* Column 1: Brand & Identity */}
          <div style={{ maxWidth: '380px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.2) 0%, rgba(61, 126, 255, 0.2) 100%)',
                border: '1px solid var(--border-cyan)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 15px rgba(0, 229, 255, 0.3)',
              }}>
                <Cpu size={19} color="var(--accent-cyan)" />
              </div>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: '1.25rem',
                letterSpacing: '0.1em',
              }}>
                ADITHYA MECHNEXUS
              </span>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              Digital mechanical engineering laboratory focusing on high-accuracy FEA/CFD multi-physics,
              parametric CAD design, PLC automation sequencing, and AI-accelerated simulation frameworks.
            </p>

            <div className="vernier-badge">
              OWNER: ADITHYA G // MECHANICAL ENGINEERING STUDENT
            </div>
          </div>

          {/* Column 2: Quick Domain Matrix */}
          <div>
            <div className="form-label" style={{ marginBottom: '1rem', color: 'var(--accent-cyan)' }}>
              CORE DISCIPLINES
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '0.6rem 1.25rem',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
            }}>
              <span>• MECHANICAL DESIGN</span>
              <span>• FEA / CAE SIMULATION</span>
              <span>• CFD FLUID MECHANICS</span>
              <span>• THERMAL SYSTEMS</span>
              <span>• PLC AUTOMATION</span>
              <span>• AI × ENGINEERING</span>
            </div>

            {/* Direct Section Anchors */}
            <div style={{
              marginTop: '1.5rem',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.75rem',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
            }}>
              <a href="#connections" style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Share2 size={12} color="var(--accent-cyan)" />
                <span>CONNECTIONS</span>
              </a>
              <span style={{ color: 'var(--text-muted)' }}>•</span>
              <a href="#contact" style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Send size={12} color="var(--accent-cyan)" />
                <span>CONTACT</span>
              </a>
              <span style={{ color: 'var(--text-muted)' }}>•</span>
              <a href="#resume" style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <FileText size={12} color="var(--accent-cyan)" />
                <span>RESUME</span>
              </a>
              <span style={{ color: 'var(--text-muted)' }}>•</span>
              <a href="#qr-code" style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <QrCode size={12} color="var(--accent-cyan)" />
                <span>QR CODE</span>
              </a>
            </div>
          </div>

          {/* Column 3: DEDICATED ADMIN PORTAL ACCESS (PRIMARY OBJECTIVE 3) */}
          <div>
            <div className="form-label" style={{ marginBottom: '0.75rem', color: 'var(--accent-cyan)' }}>
              SYSTEM ACCESS
            </div>

            <div style={{
              padding: '1.25rem',
              backgroundColor: 'rgba(6, 12, 22, 0.75)',
              border: '1px solid rgba(0, 229, 255, 0.25)',
              borderRadius: 'var(--radius-sm)',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                <Lock size={14} color="var(--accent-cyan)" />
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  letterSpacing: '0.08em',
                }}>
                  CONTROL TELEMETRY CLEARANCE
                </span>
              </div>

              <p style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                color: 'var(--text-muted)',
                lineHeight: 1.5,
                marginBottom: '1rem',
              }}>
                Authorized administration terminal for updating profile credentials, logo sanctuary asset, dossier media, and project data.
              </p>

              {/* PRIMARY ADMIN PORTAL ENTRY BUTTON */}
              <Link
                to="/admin/login"
                onMouseEnter={() => setMode('button')}
                onMouseLeave={() => setMode('default')}
                className="btn-secondary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.75rem',
                  letterSpacing: '0.12em',
                  padding: '0.6rem 1.2rem',
                  color: 'var(--accent-cyan)',
                  borderColor: 'rgba(0, 229, 255, 0.45)',
                  backgroundColor: 'rgba(0, 229, 255, 0.08)',
                  boxShadow: '0 0 15px rgba(0, 229, 255, 0.15)',
                }}
              >
                <Shield size={14} color="var(--accent-cyan)" />
                <span>ADMIN PORTAL</span>
              </Link>
            </div>

            {/* Back to top Button */}
            <div style={{ marginTop: '1.25rem' }}>
              <button
                onClick={scrollToTop}
                onMouseEnter={() => setMode('button')}
                onMouseLeave={() => setMode('default')}
                className="btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.45rem 0.9rem' }}
              >
                <ArrowUp size={13} />
                <span>RETURN TO TOP</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '2rem',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.6875rem',
          color: 'var(--text-muted)',
        }}>
          <div>
            © {new Date().getFullYear()} ADITHYA MECHNEXUS V18.1. ALL RIGHTS RESERVED.
          </div>
          <div>
            NUMERICAL CONVERGENCE • VERIFIED MESH INDEPENDENCE • ZERO FAKE DATA
          </div>
        </div>
      </div>
    </footer>
  );
};
