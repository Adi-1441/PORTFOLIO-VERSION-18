// ==============================================================================
// ADITHYA MECHNEXUS V18.1 — CINEMATIC INTRODUCTION PAGE
// Dedicated Portfolio Logo Sanctuary, telemetry HUD, and "ENTER MECHNEXUS" transition.
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCursor } from '../context/CursorContext';
import { portfolioService } from '../services/portfolio.service';
import { Profile } from '../types/database';

export const IntroPage: React.FC = () => {
  const navigate = useNavigate();
  const { setMode } = useCursor();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    let mounted = true;
    portfolioService.getProfile().then((data) => {
      if (mounted) setProfile(data);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const handleEnter = () => {
    setIsTransitioning(true);
    // Smooth cinematic transition timing (~750ms)
    setTimeout(() => {
      navigate('/portfolio');
    }, 750);
  };

  const logoSrc = profile?.logo_url || '/assets/branding/mechnexus-emblem.svg';

  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      width: '100vw',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
    }}>

      {/* Intro Background Engineering Grid */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          linear-gradient(to right, rgba(0, 229, 255, 0.04) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(0, 229, 255, 0.04) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
        maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 80%)',
        WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 80%)',
        pointerEvents: 'none',
      }} />

      {/* Top Left Engineering Telemetry HUD */}
      <div style={{
        position: 'absolute',
        top: '24px',
        left: '28px',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.6875rem',
        color: 'var(--text-muted)',
        letterSpacing: '0.12em',
        lineHeight: 1.6,
        pointerEvents: 'none',
        zIndex: 10,
      }}>
        <div style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>SYSTEM: ADITHYA MECHNEXUS V18.1</div>
        <div>KERNEL: SOLID_MECHANICS // MULTIPHYSICS_CORE</div>
        <div>DISCIPLINE: MECHANICAL ENGINEERING</div>
      </div>

      {/* Top Right Coordinate / Status HUD */}
      <div style={{
        position: 'absolute',
        top: '24px',
        right: '28px',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.6875rem',
        color: 'var(--text-muted)',
        letterSpacing: '0.12em',
        textAlign: 'right',
        pointerEvents: 'none',
        zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end', color: '#2dd4bf' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#2dd4bf', boxShadow: '0 0 8px #2dd4bf' }} />
          LABORATORY ONLINE
        </div>
        <div>STATUS: ALL SUBSYSTEMS NOMINAL</div>
        <div>VERIFICATION: MESH CONVERGENCE GCI</div>
      </div>

      {/* Main Center Content Container */}
      <AnimatePresence>
        {!isTransitioning ? (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 1.08, filter: 'blur(12px)' }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            style={{
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              padding: '1.5rem',
              maxWidth: '860px',
              width: '100%',
              position: 'relative',
            }}
          >
            {/* =========================================================================
                DEDICATED PORTFOLIO LOGO SANCTUARY
            ========================================================================= */}
            <div
              className="hud-corner-brackets"
              style={{
                position: 'relative',
                padding: 'clamp(1.5rem, 3.5vw, 2.5rem)',
                marginBottom: '2rem',
                background: 'radial-gradient(ellipse at center, rgba(0, 229, 255, 0.12) 0%, rgba(61, 126, 255, 0.05) 50%, rgba(4, 8, 16, 0.75) 100%)',
                border: '1px solid rgba(0, 229, 255, 0.28)',
                borderRadius: 'var(--radius-lg)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                maxWidth: '680px',
                width: '100%',
                boxShadow: '0 0 40px rgba(0, 229, 255, 0.18), inset 0 0 35px rgba(0, 229, 255, 0.06)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
              }}
            >
              {/* Telemetry Tag above Logo */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                color: 'var(--accent-cyan)',
                letterSpacing: '0.22em',
                marginBottom: '1.25rem',
                textTransform: 'uppercase',
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--accent-cyan)', boxShadow: '0 0 8px var(--accent-cyan)' }} />
                <span>PORTFOLIO LOGO // ADITHYA MECHNEXUS</span>
              </div>

              {/* Dedicated Logo Asset Frame */}
              <div style={{
                position: 'relative',
                width: 'clamp(110px, 16vw, 150px)',
                height: 'clamp(110px, 16vw, 150px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.5rem',
              }}>
                {/* Rotating Hexagonal Calibration Ring */}
                <div style={{
                  position: 'absolute',
                  inset: -10,
                  borderRadius: '24px',
                  border: '1.5px dashed rgba(0, 229, 255, 0.45)',
                  animation: 'rotate-slow 22s linear infinite',
                  pointerEvents: 'none',
                }} />

                {/* Counter-Rotating Precision Caliper Ring */}
                <div style={{
                  position: 'absolute',
                  inset: -2,
                  borderRadius: '50%',
                  border: '1.5px solid transparent',
                  borderTopColor: 'var(--accent-cyan)',
                  borderRightColor: 'var(--accent-violet)',
                  animation: 'rotate-reverse 12s linear infinite',
                  pointerEvents: 'none',
                }} />

                {/* Actual Logo Image loaded from replaceable asset */}
                <div style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  zIndex: 2,
                  padding: '8px',
                }}>
                  <img
                    src={logoSrc}
                    alt="ADITHYA MECHNEXUS Portfolio Logo"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/assets/branding/mechnexus-emblem.svg';
                    }}
                    style={{
                      maxWidth: '90%',
                      maxHeight: '90%',
                      objectFit: 'contain',
                      filter: 'drop-shadow(0 0 20px rgba(0, 229, 255, 0.6)) drop-shadow(0 0 40px rgba(124, 58, 237, 0.35))',
                      transition: 'transform var(--transition-medium)',
                    }}
                  />
                </div>
              </div>

              {/* Primary Identity Wordmark */}
              <h1 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2rem, 4.8vw, 3.4rem)',
                fontWeight: 900,
                letterSpacing: '0.14em',
                lineHeight: 1.15,
                background: 'linear-gradient(180deg, #ffffff 0%, #cbd5e1 45%, #00e5ff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textTransform: 'uppercase',
                filter: 'drop-shadow(0 0 32px rgba(0, 229, 255, 0.4))',
                marginBottom: '0.5rem',
              }}>
                ADITHYA MECHNEXUS
              </h1>

              {/* Primary Academic Identity */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontFamily: 'var(--font-mono)',
                fontSize: 'clamp(0.72rem, 1.8vw, 0.8125rem)',
                letterSpacing: '0.2em',
                color: 'var(--accent-cyan)',
                textTransform: 'uppercase',
                flexWrap: 'wrap',
                justifyContent: 'center',
              }}>
                <span>ADITHYA G</span>
                <span style={{ color: 'var(--text-muted)' }}>//</span>
                <span>MECHANICAL ENGINEERING STUDENT</span>
              </div>
            </div>

            {/* Engineering Disciplines Matrix */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '0.6rem',
              marginBottom: '2.5rem',
              maxWidth: '680px',
            }}>
              {[
                'MECHANICAL DESIGN', 'CAD', 'CAE', 'FEA', 'CFD',
                'THERMAL', 'RESEARCH', 'AUTOMATION', 'PLC', 'ROBOTICS', 'AI × ENGINEERING'
              ].map((domain) => (
                <span key={domain} className="badge-tech badge-tech-cyan" style={{ fontSize: '0.7rem', padding: '0.25rem 0.65rem' }}>
                  {domain}
                </span>
              ))}
            </div>

            {/* MANDATORY PRIMARY ENTRY BUTTON: "ENTER MECHNEXUS" */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={handleEnter}
                onMouseEnter={() => setMode('button')}
                onMouseLeave={() => setMode('default')}
                className="btn-primary"
                style={{
                  fontSize: '1rem',
                  padding: '1.15rem 2.8rem',
                  letterSpacing: '0.16em',
                  borderRadius: 'var(--radius-sm)',
                  boxShadow: '0 0 35px rgba(0, 229, 255, 0.5), inset 0 0 15px rgba(255, 255, 255, 0.3)',
                }}
              >
                ENTER MECHNEXUS
              </button>

              {/* Under-Button Telemetry Tick */}
              <div style={{
                marginTop: '1rem',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                color: 'var(--text-muted)',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
              }}>
                [ PRESS OR TAP TO INITIALIZE MULTI-PHYSICS WORKSPACE ]
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              zIndex: 20,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem',
            }}
          >
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              border: '2px dashed var(--accent-cyan)',
              animation: 'rotate-slow 1s linear infinite',
            }} />
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8125rem',
              letterSpacing: '0.2em',
              color: 'var(--accent-cyan)',
            }}>
              INITIALIZING MECHNEXUS PORTFOLIO CORE...
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Footer Telemetry */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        padding: '0 32px',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.6875rem',
        color: 'var(--text-muted)',
        pointerEvents: 'none',
        zIndex: 10,
        boxSizing: 'border-box',
      }}>
        <div>CALIBRATION: ISO 5167 • ASME SEC VIII DIV 1 • TEMA CLASS C</div>
        <div>PRECISION TELEMETRY // 2026</div>
      </div>
    </div>
  );
};
