// ==============================================================================
// ADITHYA MECHNEXUS V18.1 — HERO SECTION
// Primary identity: Adithya G | Mechanical Engineering Student
// Dual-column layout: Left identity & CTAs | Right dedicated Profile Identity Module
// ==============================================================================

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Compass, ShieldCheck, ChevronDown, User, Scan } from 'lucide-react';
import { useCursor } from '../../context/CursorContext';
import { Profile } from '../../types/database';

interface HeroProps {
  profile: Profile;
}

export const Hero: React.FC<HeroProps> = ({ profile }) => {
  const { setMode } = useCursor();

  const handleScrollTo = (targetId: string) => {
    const el = document.getElementById(targetId);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="hero" style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      paddingTop: 'calc(var(--header-height) + 1.5rem)',
      paddingBottom: '3rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background Readability Layer to prevent 3D background collision */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(circle at 40% 45%, rgba(6, 11, 20, 0.72) 0%, rgba(3, 7, 15, 0.88) 100%)',
        pointerEvents: 'none',
        zIndex: 1,
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 10 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '3rem',
          alignItems: 'center',
        }}>
          {/* =========================================================================
              LEFT COLUMN: PRIMARY IDENTITY, INTRO & ACTIONS
          ========================================================================= */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Engineering HUD Pre-Title */}
            <div className="hud-tag" style={{ marginBottom: '1.25rem' }}>
              <Compass size={14} />
              <span>FUTURISTIC MECHANICAL ENGINEERING LABORATORY</span>
            </div>

            {/* Primary Name */}
            <h1 className="title-hero" style={{ marginBottom: '0.75rem' }}>
              {profile.full_name || 'ADITHYA G'}
            </h1>

            {/* Core Professional Identity & Status Badge */}
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.2rem, 2.4vw, 1.85rem)',
              fontWeight: 700,
              letterSpacing: '0.08em',
              color: 'var(--accent-cyan)',
              textTransform: 'uppercase',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              flexWrap: 'wrap',
            }}>
              <span>{profile.title || 'Mechanical Engineering Student'}</span>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                color: '#34d399',
                background: 'rgba(52, 211, 153, 0.1)',
                padding: '0.2rem 0.6rem',
                borderRadius: 'var(--radius-xs)',
                border: '1px solid rgba(52, 211, 153, 0.3)',
              }}>
                <ShieldCheck size={12} />
                VERIFIED WORKSPACE
              </span>
            </h2>

            {/* Short Engineering Statement */}
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'clamp(0.95rem, 1.25vw, 1.15rem)',
              color: 'var(--text-secondary)',
              lineHeight: 1.65,
              marginBottom: '2rem',
              maxWidth: '620px',
            }}>
              Engineering multi-physics fidelity across <strong style={{ color: '#f8fafc' }}>SolidWorks CAD modeling</strong>,{' '}
              <strong style={{ color: '#f8fafc' }}>ANSYS FEA & CFD convergence</strong>, deterministic{' '}
              <strong style={{ color: '#f8fafc' }}>PLC automation sequencing</strong>, and physics-informed{' '}
              <strong style={{ color: '#f8fafc' }}>AI surrogate acceleration</strong>.
            </p>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem', alignItems: 'center', marginBottom: '2.5rem' }}>
              <button
                onClick={() => {
                  const target = profile.hero_cta_primary_url || '#projects';
                  if (target.startsWith('#')) {
                    handleScrollTo(target.substring(1));
                  } else {
                    window.open(target, '_blank', 'noopener,noreferrer');
                  }
                }}
                onMouseEnter={() => setMode('button')}
                onMouseLeave={() => setMode('default')}
                className="btn-primary"
              >
                <span>{profile.hero_cta_primary_label || 'EXPLORE ENGINEERING'}</span>
                <ArrowRight size={16} />
              </button>

              <button
                onClick={() => {
                  const target = profile.hero_cta_secondary_url || '#cad-cae';
                  if (target.startsWith('#')) {
                    handleScrollTo(target.substring(1));
                  } else {
                    window.open(target, '_blank', 'noopener,noreferrer');
                  }
                }}
                onMouseEnter={() => setMode('button')}
                onMouseLeave={() => setMode('default')}
                className="btn-secondary"
              >
                <span>{profile.hero_cta_secondary_label || 'VIEW CAD & CAE'}</span>
              </button>

              <button
                onClick={() => handleScrollTo('plc')}
                onMouseEnter={() => setMode('button')}
                onMouseLeave={() => setMode('default')}
                className="btn-secondary"
              >
                <span>PLC & AUTOMATION</span>
              </button>
            </div>

            {/* Supporting Engineering Disciplines Pills */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.45rem',
              alignItems: 'center',
            }}>
              <span className="vernier-badge" style={{ marginRight: '0.5rem' }}>DISCIPLINES:</span>
              {[
                'CAD DESIGN', 'STRUCTURAL FEA', 'CFD AERODYNAMICS',
                'CONJUGATE THERMAL', 'PLC LADDER LOGIC', 'ROBOTICS', 'AI SURROGATES'
              ].map(pill => (
                <span key={pill} className="badge-tech badge-tech-blue">
                  {pill}
                </span>
              ))}
            </div>
          </motion.div>

          {/* =========================================================================
              RIGHT COLUMN: DEDICATED PROFILE IDENTITY MODULE
          ========================================================================= */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            style={{
              display: 'flex',
              justifyContent: 'center',
              width: '100%',
            }}
          >
            <div
              className="hud-corner-brackets"
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: '380px',
                padding: '1.5rem',
                backgroundColor: 'rgba(6, 12, 22, 0.82)',
                border: '1px solid rgba(0, 229, 255, 0.32)',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 0 35px rgba(0, 229, 255, 0.2), inset 0 0 25px rgba(0, 229, 255, 0.05)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
              }}
            >
              {/* Header Telemetry Bar */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                color: 'var(--accent-cyan)',
                letterSpacing: '0.14em',
                marginBottom: '1rem',
                borderBottom: '1px solid rgba(0, 229, 255, 0.18)',
                paddingBottom: '0.5rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Scan size={13} color="var(--accent-cyan)" />
                  <span>PROFILE IDENTITY MODULE</span>
                </div>
                <span style={{ color: 'var(--text-muted)' }}>REF: MECH-V18.3</span>
              </div>

              {/* Photo Area Container */}
              <div style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '4 / 4.8',
                borderRadius: 'var(--radius-sm)',
                overflow: 'hidden',
                border: '1px solid rgba(0, 229, 255, 0.25)',
                backgroundColor: 'rgba(3, 7, 15, 0.95)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundImage: `
                  linear-gradient(to right, rgba(0, 229, 255, 0.04) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(0, 229, 255, 0.04) 1px, transparent 1px)
                `,
                backgroundSize: '20px 20px',
              }}>
                {profile.avatar_url ? (
                  <>
                    {/* Active Uploaded Profile Photograph */}
                    <img
                      src={profile.avatar_url}
                      alt={profile.avatar_alt_text || profile.full_name || 'Adithya G Profile Photograph'}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                      onError={(e) => {
                        // If custom image fails to load, gracefully hide img and show pending placeholder
                        (e.currentTarget as HTMLElement).style.display = 'none';
                      }}
                    />
                    {/* Dynamic scanning line overlay */}
                    <div className="scanline-sweep" />
                  </>
                ) : (
                  /* Deliberate "PROFILE IMAGE PENDING" Engineering HUD Placeholder */
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2rem',
                    textAlign: 'center',
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                  }}>
                    {/* Outer Reticle Ring */}
                    <div style={{
                      position: 'relative',
                      width: '90px',
                      height: '90px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '1.25rem',
                    }}>
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: '50%',
                        border: '1.5px dashed rgba(0, 229, 255, 0.5)',
                        animation: 'rotate-slow 18s linear infinite',
                      }} />
                      <div style={{
                        position: 'absolute',
                        inset: 8,
                        borderRadius: '50%',
                        border: '1px solid transparent',
                        borderTopColor: 'var(--accent-cyan)',
                        borderBottomColor: 'var(--accent-blue)',
                        animation: 'rotate-reverse 9s linear infinite',
                      }} />
                      <div style={{
                        width: '54px',
                        height: '54px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.15) 0%, rgba(61, 126, 255, 0.1) 100%)',
                        border: '1px solid var(--border-cyan)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 0 20px rgba(0, 229, 255, 0.3)',
                      }}>
                        <User size={28} color="var(--accent-cyan)" />
                      </div>
                    </div>

                    {/* Pending Notice */}
                    <div style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      letterSpacing: '0.14em',
                      color: 'var(--text-primary)',
                      marginBottom: '0.4rem',
                      textTransform: 'uppercase',
                    }}>
                      PROFILE IMAGE PENDING
                    </div>

                    <div style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.65rem',
                      color: 'var(--text-muted)',
                      letterSpacing: '0.12em',
                      lineHeight: 1.5,
                      maxWidth: '220px',
                    }}>
                      AWAITING DOSSIER UPLOAD VIA ADMIN PORTAL
                    </div>

                    {/* Radar scanning line */}
                    <div className="scanline-sweep" />
                  </div>
                )}
              </div>

              {/* Footer Telemetry Bar */}
              <div style={{
                marginTop: '1rem',
                paddingTop: '0.5rem',
                borderTop: '1px solid rgba(0, 229, 255, 0.18)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.625rem',
                color: 'var(--text-muted)',
              }}>
                <span>SUBJECT: {profile.full_name || 'ADITHYA G'}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#34d399' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#34d399', boxShadow: '0 0 6px #34d399' }} />
                  TELEMETRY ACTIVE
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Scroll Indicator */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        color: 'var(--text-muted)',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.625rem',
        letterSpacing: '0.2em',
        pointerEvents: 'none',
        zIndex: 10,
      }}>
        <span>SCROLL DOWN</span>
        <ChevronDown size={14} className="anim-float" color="var(--accent-cyan)" />
      </div>
    </section>
  );
};
