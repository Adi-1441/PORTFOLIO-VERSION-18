// ==============================================================================
// ADITHYA MECHNEXUS V18.3 — PRECISION ENGINEERING HUD CURSOR
// Vernier reticle, segmented rotating dial, crosshair graduation arrows,
// Full / Minimal / Off modes, touch ripples, and zero layout interference.
// ==============================================================================

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useCursor, CursorPreferenceMode, normalizeCursorState } from '../../context/CursorContext';

interface Ripple {
  id: number;
  x: number;
  y: number;
}

export const EngineeringCursor: React.FC = () => {
  const {
    mode,
    setMode,
    cursorPreference,
    setCursorPreference,
    cycleCursorPreference,
    isTouchDevice,
    reducedMotion,
  } = useCursor();

  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [isClicking, setIsClicking] = useState(false);
  const [isHoveringEditable, setIsHoveringEditable] = useState(false);
  const [isWindowHovered, setIsWindowHovered] = useState(false);

  // Direct DOM Refs for 60FPS smooth hardware-accelerated movement without React re-renders
  const cursorContainerRef = useRef<HTMLDivElement>(null);
  const reticleRef = useRef<HTMLDivElement>(null);
  const coordsTextRef = useRef<HTMLSpanElement>(null);

  // Position references for smooth interpolation
  const targetPos = useRef({ x: -100, y: -100 });
  const currentPos = useRef({ x: -100, y: -100 });
  const rafId = useRef<number | null>(null);

  // Normalize state label
  const normalizedState = useMemo(() => normalizeCursorState(mode), [mode]);

  // Color mapping based on telemetry state
  const stateColors: Record<string, { stroke: string; glow: string; label: string }> = {
    scan: { stroke: 'var(--accent-cyan)', glow: 'rgba(0, 229, 255, 0.4)', label: 'SCAN' },
    lock: { stroke: '#38bdf8', glow: 'rgba(56, 189, 248, 0.5)', label: 'LOCK' },
    engage: { stroke: '#00e5ff', glow: 'rgba(0, 229, 255, 0.8)', label: 'ENGAGE' },
    inspect: { stroke: '#a78bfa', glow: 'rgba(167, 139, 250, 0.6)', label: 'INSPECT' },
    zoom: { stroke: '#f59e0b', glow: 'rgba(245, 158, 11, 0.6)', label: 'ZOOM' },
    orbit: { stroke: '#60a5fa', glow: 'rgba(96, 165, 250, 0.6)', label: 'ORBIT' },
    drag: { stroke: '#10b981', glow: 'rgba(16, 185, 129, 0.6)', label: 'DRAG' },
    load: { stroke: '#94a3b8', glow: 'rgba(148, 163, 184, 0.4)', label: 'LOAD' },
    text: { stroke: 'transparent', glow: 'transparent', label: 'TEXT' },
  };

  const currentColor = stateColors[normalizedState] || stateColors.scan;

  // 1. POINTER EVENT HANDLING & 60FPS RAF LOOP
  useEffect(() => {
    if (isTouchDevice || cursorPreference === 'off') {
      return;
    }

    const handlePointerMove = (e: PointerEvent) => {
      targetPos.current = { x: e.clientX, y: e.clientY };
      setIsWindowHovered(true);

      // Check if target is an editable input or textarea
      const target = e.target as HTMLElement | null;
      if (target) {
        const isEditable = (
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable ||
          target.closest('input, textarea, select, [contenteditable="true"], .no-custom-cursor') !== null
        );
        setIsHoveringEditable(Boolean(isEditable));

        // Auto-detect orbit state on WebGL 3D canvas
        if (target.tagName === 'CANVAS' || target.closest('canvas, [data-scene]')) {
          if (mode === 'scan' || mode === 'default') {
            setMode('orbit');
          }
        }
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      setIsClicking(true);
      const newRipple: Ripple = { id: Date.now(), x: e.clientX, y: e.clientY };
      setRipples(prev => [...prev.slice(-3), newRipple]);
    };

    const handlePointerUp = () => {
      setIsClicking(false);
    };

    const handleMouseLeave = () => {
      setIsWindowHovered(false);
      setIsClicking(false);
    };

    const handleWindowBlur = () => {
      setIsWindowHovered(false);
      setIsClicking(false);
    };

    // Animation Loop for fluid, hardware-accelerated tracking
    const updatePosition = () => {
      const { x: tx, y: ty } = targetPos.current;

      // Instant hardware tracking for precision aim center
      if (cursorContainerRef.current) {
        cursorContainerRef.current.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
      }

      // Slightly interpolated smoothing for outer gimbal reticle (mechanical HUD feel)
      if (reticleRef.current && !reducedMotion) {
        currentPos.current.x += (tx - currentPos.current.x) * 0.28;
        currentPos.current.y += (ty - currentPos.current.y) * 0.28;
        const rx = currentPos.current.x - tx;
        const ry = currentPos.current.y - ty;
        reticleRef.current.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      }

      // Real-time coordinates telemetry readout
      if (coordsTextRef.current && tx >= 0 && ty >= 0) {
        coordsTextRef.current.textContent = `X:${tx} Y:${ty}`;
      }

      rafId.current = requestAnimationFrame(updatePosition);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('pointerup', handlePointerUp, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('blur', handleWindowBlur);

    rafId.current = requestAnimationFrame(updatePosition);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('blur', handleWindowBlur);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [isTouchDevice, cursorPreference, reducedMotion, mode, setMode]);

  // Touch device ripple handler
  useEffect(() => {
    const handleCustomTouchRipple = (e: any) => {
      if (e.detail) {
        const newRipple: Ripple = { id: Date.now(), x: e.detail.x, y: e.detail.y };
        setRipples(prev => [...prev.slice(-3), newRipple]);
      }
    };

    window.addEventListener('mechnexus-touch-ripple', handleCustomTouchRipple);
    return () => window.removeEventListener('mechnexus-touch-ripple', handleCustomTouchRipple);
  }, []);

  // Prune ripples after 500ms animation
  useEffect(() => {
    if (ripples.length === 0) return;
    const timer = setTimeout(() => {
      setRipples(prev => prev.filter(r => Date.now() - r.id < 500));
    }, 500);
    return () => clearTimeout(timer);
  }, [ripples]);

  // Touch Feedback Layer
  const renderRipples = () => (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 999998,
      }}
    >
      {ripples.map(r => (
        <div
          key={r.id}
          style={{
            position: 'absolute',
            left: r.x,
            top: r.y,
            transform: 'translate(-50%, -50%)',
            width: '54px',
            height: '54px',
            borderRadius: '50%',
            border: `2px solid ${currentColor.stroke}`,
            animation: 'pulse-dot 0.45s ease-out forwards',
            boxShadow: `0 0 15px ${currentColor.glow}`,
            pointerEvents: 'none',
          }}
        />
      ))}
    </div>
  );

  // If Touch Device: native gestures preserved, lightweight tactical ripples only
  if (isTouchDevice) {
    return renderRipples();
  }

  const isVisible = isWindowHovered && !isHoveringEditable && cursorPreference !== 'off';

  return (
    <>
      {/* Click / Touch shockwave feedback */}
      {cursorPreference !== 'off' && renderRipples()}

      {/* Primary Precision Custom HUD Cursor Layer */}
      {cursorPreference !== 'off' && (
        <div
          ref={cursorContainerRef}
          aria-hidden="true"
          className="custom-cursor"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            pointerEvents: 'none',
            zIndex: 999999,
            opacity: isVisible ? 1 : 0,
            transition: 'opacity 0.15s ease',
            willChange: 'transform',
          }}
        >
        {/* Reticle Component Root */}
        <div
          ref={reticleRef}
          style={{
            position: 'relative',
            width: cursorPreference === 'minimal' ? '30px' : '64px',
            height: cursorPreference === 'minimal' ? '30px' : '64px',
            marginTop: cursorPreference === 'minimal' ? '-15px' : '-32px',
            marginLeft: cursorPreference === 'minimal' ? '-15px' : '-32px',
            transform: isClicking ? 'scale(0.88)' : 'scale(1)',
            transition: 'transform 0.12s ease',
            pointerEvents: 'none',
          }}
        >
          {cursorPreference === 'minimal' ? (
            /* ===================================================================
               MINIMAL MODE RETICLE: Simple Precision Aim Dot & Concentric Ring
               =================================================================== */
            <svg width="30" height="30" viewBox="0 0 30 30" style={{ display: 'block' }}>
              {/* Outer Subtle Reticle Ring */}
              <circle
                cx="15"
                cy="15"
                r="10"
                fill="none"
                stroke={currentColor.stroke}
                strokeWidth="1.2"
                strokeOpacity="0.6"
              />
              {/* Hairline Crosshair Ticks */}
              <line x1="15" y1="2" x2="15" y2="7" stroke={currentColor.stroke} strokeWidth="1" strokeOpacity="0.8" />
              <line x1="15" y1="23" x2="15" y2="28" stroke={currentColor.stroke} strokeWidth="1" strokeOpacity="0.8" />
              <line x1="2" y1="15" x2="7" y2="15" stroke={currentColor.stroke} strokeWidth="1" strokeOpacity="0.8" />
              <line x1="23" y1="15" x2="28" y2="15" stroke={currentColor.stroke} strokeWidth="1" strokeOpacity="0.8" />
              {/* Center Target Dot */}
              <circle cx="15" cy="15" r="2" fill={currentColor.stroke} />
            </svg>
          ) : (
            /* ===================================================================
               FULL MODE RETICLE: Complete Mechanical Engineering Vernier HUD
               Directly inspired by engineering blueprint & reticle target specs.
               =================================================================== */
            <>
              <svg width="64" height="64" viewBox="0 0 64 64" style={{ display: 'block' }}>
                <defs>
                  {/* Glowing filter */}
                  <filter id="hud-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor={currentColor.stroke} floodOpacity="0.6" />
                  </filter>
                </defs>

                {/* GIMBAL 1: Rotating Segmented Dial (Top image reference) */}
                <g
                  style={{
                    transformOrigin: '32px 32px',
                    animation: reducedMotion ? 'none' : 'rotate-slow 16s linear infinite',
                  }}
                >
                  {/* Thick Segmented Arc Chunk */}
                  <circle
                    cx="32"
                    cy="32"
                    r="22"
                    fill="none"
                    stroke={currentColor.stroke}
                    strokeWidth="2.5"
                    strokeDasharray="28 110"
                    strokeLinecap="round"
                    filter="url(#hud-glow)"
                  />
                  {/* Secondary Thin Arc Segments */}
                  <circle
                    cx="32"
                    cy="32"
                    r="22"
                    fill="none"
                    stroke={currentColor.stroke}
                    strokeWidth="1.2"
                    strokeDasharray="14 30 8 86"
                    strokeOpacity="0.75"
                  />
                  {/* Calibrated Tick Ring */}
                  <circle
                    cx="32"
                    cy="32"
                    r="18"
                    fill="none"
                    stroke={currentColor.stroke}
                    strokeWidth="1"
                    strokeDasharray="3 6"
                    strokeOpacity="0.4"
                  />
                </g>

                {/* GIMBAL 2: Outer Target Ring with 4 Quadrant Circular Nodes (Bottom image reference) */}
                <circle
                  cx="32"
                  cy="32"
                  r="27"
                  fill="none"
                  stroke={currentColor.stroke}
                  strokeWidth="1"
                  strokeOpacity={isClicking ? '0.9' : '0.45'}
                />
                {/* 4 Quadrant Nodes at 45°, 135°, 225°, 315° */}
                <circle cx="13" cy="13" r="1.75" fill={currentColor.stroke} />
                <circle cx="51" cy="13" r="1.75" fill={currentColor.stroke} />
                <circle cx="13" cy="51" r="1.75" fill={currentColor.stroke} />
                <circle cx="51" cy="51" r="1.75" fill={currentColor.stroke} />

                {/* GIMBAL 3: Crosshairs with Directional Chevron Range Arrows & Terminal Nodes */}
                {/* Horizontal Crosshair Line */}
                <line x1="4" y1="32" x2="60" y2="32" stroke={currentColor.stroke} strokeWidth="1" strokeOpacity="0.6" />
                {/* Left/Right Terminal Circular Aim Nodes */}
                <circle cx="4" cy="32" r="2.2" fill="none" stroke={currentColor.stroke} strokeWidth="1.2" />
                <circle cx="60" cy="32" r="2.2" fill="none" stroke={currentColor.stroke} strokeWidth="1.2" />

                {/* Vertical Crosshair Line */}
                <line x1="32" y1="4" x2="32" y2="60" stroke={currentColor.stroke} strokeWidth="1" strokeOpacity="0.6" />
                {/* Top/Bottom Terminal Circular Aim Nodes */}
                <circle cx="32" cy="4" r="2.2" fill="none" stroke={currentColor.stroke} strokeWidth="1.2" />
                <circle cx="32" cy="60" r="2.2" fill="none" stroke={currentColor.stroke} strokeWidth="1.2" />

                {/* Range Chevrons on Crosshairs (reference: bottom image) */}
                {/* Right Chevrons */}
                <polyline points="40,30 42,32 40,34" fill="none" stroke={currentColor.stroke} strokeWidth="1" />
                <polyline points="45,30 47,32 45,34" fill="none" stroke={currentColor.stroke} strokeWidth="1" />
                {/* Left Chevrons */}
                <polyline points="24,30 22,32 24,34" fill="none" stroke={currentColor.stroke} strokeWidth="1" />
                <polyline points="19,30 17,32 19,34" fill="none" stroke={currentColor.stroke} strokeWidth="1" />
                {/* Bottom Chevrons */}
                <polyline points="30,40 32,42 34,40" fill="none" stroke={currentColor.stroke} strokeWidth="1" />
                <polyline points="30,45 32,47 34,45" fill="none" stroke={currentColor.stroke} strokeWidth="1" />
                {/* Top Chevrons */}
                <polyline points="30,24 32,22 34,24" fill="none" stroke={currentColor.stroke} strokeWidth="1" />
                <polyline points="30,19 32,17 34,19" fill="none" stroke={currentColor.stroke} strokeWidth="1" />

                {/* Center Target Aim Dot */}
                <circle cx="32" cy="32" r="2.5" fill={currentColor.stroke} filter="url(#hud-glow)" />
              </svg>

              {/* Real-Time Coordinates & Telemetry Status Badge */}
              <div
                style={{
                  position: 'absolute',
                  top: '68px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  whiteSpace: 'nowrap',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.625rem',
                  letterSpacing: '0.08em',
                  color: currentColor.stroke,
                  background: 'rgba(3, 7, 15, 0.92)',
                  backdropFilter: 'blur(8px)',
                  padding: '2px 7px',
                  borderRadius: '3px',
                  border: `1px solid ${currentColor.glow}`,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.6)',
                  pointerEvents: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <span ref={coordsTextRef}>X:0 Y:0</span>
                <span style={{ color: '#f8fafc', fontWeight: 700 }}>[{currentColor.label}]</span>
              </div>
            </>
          )}
        </div>
      </div>
      )}

      {/* =========================================================================
          ACCESSIBLE CURSOR MODE CONTROL (HUD DOCK)
          Accessible button group in bottom-right corner with Alt+C shortcut support.
          Does not obstruct site layout, uses pointer-events: auto on buttons.
         ========================================================================= */}
      <div
        role="region"
        aria-label="Cursor Reticle Mode Selector"
        style={{
          position: 'fixed',
          bottom: '16px',
          right: '16px',
          zIndex: 920,
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '4px 6px',
          backgroundColor: 'rgba(4, 9, 18, 0.88)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(0, 229, 255, 0.25)',
          borderRadius: '6px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.65rem',
          letterSpacing: '0.08em',
          pointerEvents: 'auto',
          userSelect: 'none',
        }}
      >
        <span
          style={{
            color: 'var(--text-muted)',
            padding: '0 4px',
            fontSize: '0.6rem',
            borderRight: '1px solid rgba(255, 255, 255, 0.1)',
            marginRight: '2px',
          }}
          title="Toggle with Alt+C"
        >
          RETICLE
        </span>

        {(['full', 'minimal', 'off'] as CursorPreferenceMode[]).map(pref => {
          const isActive = cursorPreference === pref;
          return (
            <button
              key={pref}
              type="button"
              onClick={() => setCursorPreference(pref)}
              aria-pressed={isActive}
              style={{
                background: isActive ? 'rgba(0, 229, 255, 0.16)' : 'transparent',
                border: `1px solid ${isActive ? 'var(--border-cyan)' : 'transparent'}`,
                color: isActive ? 'var(--accent-cyan)' : 'var(--text-muted)',
                borderRadius: '3px',
                padding: '3px 7px',
                fontSize: '0.625rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                textTransform: 'uppercase',
              }}
            >
              {pref}
            </button>
          );
        })}
      </div>
    </>
  );
};
