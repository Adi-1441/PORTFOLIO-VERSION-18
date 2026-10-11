// ==============================================================================
// ADITHYA MECHNEXUS V18.3 — PRECISION INSTRUMENT CURSOR
// Professional CAD/CAE instrument aesthetic: Graphite/Titanium base,
// Electric Cyan primary, Restrained Amber accents.
// 4 Modes: MINIMAL (default), FULL, RETICLE, OFF.
// Zero React state updates on pointer move. Hardware-accelerated 60FPS RAF.
// ==============================================================================

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useCursor, CursorPreferenceMode } from '../../context/CursorContext';

interface ClickBurst {
  id: number;
  x: number;
  y: number;
}

export const CustomCursor: React.FC = () => {
  const {
    mode,
    cursorPreference,
    setCursorPreference,
    cycleCursorPreference,
    isTouchDevice,
    reducedMotion,
  } = useCursor();

  // DOM Refs for direct hardware-accelerated transforms without React state re-renders
  const containerRef = useRef<HTMLDivElement>(null);
  const coreDotRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const readoutRef = useRef<HTMLDivElement>(null);
  const readoutTextRef = useRef<HTMLSpanElement>(null);
  const badgeLabelRef = useRef<HTMLSpanElement>(null);
  const chargeCircleRef = useRef<SVGCircleElement>(null);
  const reticleCrosshairRef = useRef<HTMLDivElement>(null);

  // Motion physics and interpolation
  const targetPos = useRef({ x: -100, y: -100 });
  const framePos = useRef({ x: -100, y: -100 });
  const idleAngle = useRef(0);
  const lastMoveTime = useRef(Date.now());
  const rafId = useRef<number | null>(null);

  // Telemetry and contextual states
  const isHoveringInteractive = useRef(false);
  const isHoveringEditable = useRef(false);
  const isHoveringCanvas = useRef(false);
  const isHoveringDisabled = useRef(false);
  const contextualAction = useRef<string>('');

  // Press-and-hold charge state
  const pressTimerRef = useRef<number | null>(null);
  const pressProgressRef = useRef<number>(0);
  const isPressingRef = useRef(false);
  const [isPressing, setIsPressing] = useState(false);

  // Click bursts
  const [bursts, setBursts] = useState<ClickBurst[]>([]);

  // FULL mode trail points (6-8 lightweight coordinates)
  const trailPointsRef = useRef<Array<{ x: number; y: number; time: number }>>([]);
  const trailContainerRef = useRef<HTMLDivElement>(null);

  // Visibility state
  const [isVisible, setIsVisible] = useState(false);

  // Cancel press-and-hold charge cleanly
  const cancelPressCharge = useCallback(() => {
    if (pressTimerRef.current) {
      cancelAnimationFrame(pressTimerRef.current);
      pressTimerRef.current = null;
    }
    pressProgressRef.current = 0;
    isPressingRef.current = false;
    setIsPressing(false);
    if (chargeCircleRef.current) {
      chargeCircleRef.current.style.strokeDashoffset = '56.5';
    }
  }, []);

  // 1. POINTER TRACKING & HARDWARE-ACCELERATED ANIMATION LOOP
  useEffect(() => {
    if (isTouchDevice || cursorPreference === 'off') {
      return;
    }

    const handlePointerMove = (e: PointerEvent) => {
      targetPos.current = { x: e.clientX, y: e.clientY };
      lastMoveTime.current = Date.now();
      setIsVisible(true);

      const target = e.target as HTMLElement | null;
      if (target) {
        // Form field & text-editing detection
        const isEditable = Boolean(
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable ||
          target.closest('input, textarea, select, [contenteditable="true"], .no-custom-cursor')
        );
        isHoveringEditable.current = isEditable;

        // Interactive element detection (links, buttons, action tabs)
        const clickable = target.closest('a, button, [role="button"], input[type="submit"], input[type="button"]');
        const isInteractive = Boolean(clickable && !isEditable);
        isHoveringInteractive.current = isInteractive;

        // Contextual action label
        if (isInteractive && clickable) {
          const text = (clickable.getAttribute('data-cursor-action') ||
            (clickable.tagName === 'A' ? 'OPEN' : 'ENGAGE')).toUpperCase();
          contextualAction.current = text;
        } else {
          contextualAction.current = '';
        }

        // Disabled element detection
        const isDisabled = Boolean(
          target.hasAttribute('disabled') ||
          target.getAttribute('aria-disabled') === 'true' ||
          target.closest('[disabled], [aria-disabled="true"], .btn-disabled')
        );
        isHoveringDisabled.current = isDisabled;

        // WebGL 3D Canvas / draggable detection
        const is3D = Boolean(target.tagName === 'CANVAS' || target.closest('canvas, [data-scene], [data-draggable]'));
        isHoveringCanvas.current = is3D;
      }

      // Record trail point for FULL mode
      if (cursorPreference === 'full' && !reducedMotion) {
        trailPointsRef.current.push({ x: e.clientX, y: e.clientY, time: Date.now() });
        if (trailPointsRef.current.length > 8) {
          trailPointsRef.current.shift();
        }
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      // Trigger thin dimension-line bursts
      if (!isHoveringEditable.current) {
        const newBurst: ClickBurst = { id: Date.now(), x: e.clientX, y: e.clientY };
        setBursts(prev => [...prev.slice(-2), newBurst]);
      }

      // Start press-and-hold charge sequence
      if (!isHoveringEditable.current) {
        isPressingRef.current = true;
        setIsPressing(true);
        const startTime = Date.now();
        const duration = 650; // ms to full charge

        const stepCharge = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(1, elapsed / duration);
          pressProgressRef.current = progress;

          if (chargeCircleRef.current) {
            // Circumference of 9px radius circle = 2 * PI * 9 ≈ 56.55
            const circumference = 56.55;
            const offset = circumference * (1 - progress);
            chargeCircleRef.current.style.strokeDashoffset = String(offset);
          }

          if (progress < 1) {
            pressTimerRef.current = requestAnimationFrame(stepCharge);
          }
        };

        cancelPressCharge();
        isPressingRef.current = true;
        setIsPressing(true);
        pressTimerRef.current = requestAnimationFrame(stepCharge);
      }
    };

    const handlePointerUp = () => {
      cancelPressCharge();
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
      cancelPressCharge();
    };

    const handleWindowBlur = () => {
      setIsVisible(false);
      cancelPressCharge();
    };

    // HIGH-PERFORMANCE ANIMATION LOOP
    const updateCursor = () => {
      const tx = targetPos.current.x;
      const ty = targetPos.current.y;

      if (tx >= 0 && ty >= 0 && containerRef.current) {
        // Core center dot: Instant 1:1 hardware tracking with translate3d
        containerRef.current.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;

        // Measurement frame: Spring interpolation (factor ~0.15)
        if (!reducedMotion) {
          framePos.current.x += (tx - framePos.current.x) * 0.16;
          framePos.current.y += (ty - framePos.current.y) * 0.16;
        } else {
          framePos.current.x = tx;
          framePos.current.y = ty;
        }

        const fx = framePos.current.x - tx;
        const fy = framePos.current.y - ty;

        // Slow idle rotation (~45 degrees) when mouse rests
        const idleDuration = Date.now() - lastMoveTime.current;
        if (!reducedMotion && idleDuration > 200 && !isHoveringInteractive.current) {
          idleAngle.current = (idleAngle.current + 0.35) % 360;
        } else if (isHoveringInteractive.current) {
          idleAngle.current = 0; // Lock upright on interactive elements
        }

        // Apply transform to measurement frame
        if (frameRef.current) {
          let scale = 1;
          if (isPressingRef.current) scale = 0.85;
          else if (isHoveringInteractive.current) scale = 0.9;
          else if (isHoveringCanvas.current) scale = 1.15;

          frameRef.current.style.transform = `translate3d(${fx}px, ${fy}px, 0) rotate(${idleAngle.current}deg) scale(${scale})`;
        }

        // Micro-readout coordinates & label telemetry
        if (readoutRef.current && (cursorPreference === 'full' || cursorPreference === 'reticle')) {
          if (isHoveringEditable.current || isHoveringInteractive.current) {
            readoutRef.current.style.opacity = '0';
          } else {
            readoutRef.current.style.opacity = '0.65';
          }

          if (readoutTextRef.current) {
            readoutTextRef.current.textContent = `X:${tx} Y:${ty}`;
          }
        }

        // Contextual action badge
        if (badgeLabelRef.current) {
          if (isHoveringInteractive.current && contextualAction.current) {
            badgeLabelRef.current.textContent = `[${contextualAction.current}]`;
            badgeLabelRef.current.style.opacity = '1';
          } else {
            badgeLabelRef.current.style.opacity = '0';
          }
        }

        // Trail render in FULL mode
        if (cursorPreference === 'full' && trailContainerRef.current && !reducedMotion) {
          const now = Date.now();
          // Filter out points older than 400ms
          trailPointsRef.current = trailPointsRef.current.filter(p => now - p.time < 400);
          const points = trailPointsRef.current;
          const children = trailContainerRef.current.children;

          for (let i = 0; i < 8; i++) {
            const dot = children[i] as HTMLElement | undefined;
            if (dot) {
              if (i < points.length) {
                const pt = points[i];
                const age = now - pt.time;
                const alpha = Math.max(0, 1 - age / 400) * 0.45;
                dot.style.display = 'block';
                dot.style.transform = `translate3d(${pt.x}px, ${pt.y}px, 0)`;
                dot.style.opacity = String(alpha);
              } else {
                dot.style.display = 'none';
              }
            }
          }
        }
      }

      rafId.current = requestAnimationFrame(updateCursor);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('pointerup', handlePointerUp, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('blur', handleWindowBlur);

    rafId.current = requestAnimationFrame(updateCursor);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('blur', handleWindowBlur);
      if (rafId.current) cancelAnimationFrame(rafId.current);
      cancelPressCharge();
    };
  }, [cursorPreference, isTouchDevice, reducedMotion, cancelPressCharge]);

  // Clean up click bursts after 300ms
  useEffect(() => {
    if (bursts.length === 0) return;
    const timer = setTimeout(() => {
      setBursts(prev => prev.filter(b => Date.now() - b.id < 300));
    }, 300);
    return () => clearTimeout(timer);
  }, [bursts]);

  // Suppress custom cursor completely on touch devices or when in OFF mode
  if (isTouchDevice || cursorPreference === 'off') {
    return (
      <CursorModeSwitcher
        current={cursorPreference}
        onChange={setCursorPreference}
        onCycle={cycleCursorPreference}
      />
    );
  }

  return (
    <>
      {/* 1. Click Bursts: 4 thin dimension ticks expanding ~12px outward and fading over 300ms */}
      {bursts.map(burst => (
        <div
          key={burst.id}
          aria-hidden="true"
          style={{
            position: 'fixed',
            left: burst.x,
            top: burst.y,
            pointerEvents: 'none',
            zIndex: 999998,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <svg width="36" height="36" viewBox="0 0 36 36" style={{ overflow: 'visible' }}>
            <line
              x1="18" y1="6" x2="18" y2="0"
              stroke="#00e5ff" strokeWidth="1" strokeLinecap="round"
              className="cursor-burst-tick"
            />
            <line
              x1="18" y1="30" x2="18" y2="36"
              stroke="#00e5ff" strokeWidth="1" strokeLinecap="round"
              className="cursor-burst-tick"
            />
            <line
              x1="6" y1="18" x2="0" y2="18"
              stroke="#00e5ff" strokeWidth="1" strokeLinecap="round"
              className="cursor-burst-tick"
            />
            <line
              x1="30" y1="18" x2="36" y2="18"
              stroke="#00e5ff" strokeWidth="1" strokeLinecap="round"
              className="cursor-burst-tick"
            />
          </svg>
        </div>
      ))}

      {/* 2. FULL Mode Subtle Trail: 8 tiny fading cyan points */}
      {cursorPreference === 'full' && (
        <div
          ref={trailContainerRef}
          aria-hidden="true"
          style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 999997 }}
        >
          {Array.from({ length: 8 }).map((_, idx) => (
            <div
              key={idx}
              style={{
                position: 'fixed',
                top: '-2px',
                left: '-2px',
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                backgroundColor: '#00e5ff',
                pointerEvents: 'none',
                display: 'none',
                willChange: 'transform, opacity',
              }}
            />
          ))}
        </div>
      )}

      {/* 3. Primary Precision Instrument Cursor Layer */}
      <div
        ref={containerRef}
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
        {/* Core Dot (4-5px solid electric cyan, brief amber flash on click) */}
        <div
          ref={coreDotRef}
          style={{
            position: 'absolute',
            width: '5px',
            height: '5px',
            marginTop: '-2.5px',
            marginLeft: '-2.5px',
            borderRadius: '50%',
            backgroundColor: isPressing ? '#f59e0b' : '#00e5ff',
            boxShadow: isPressing ? '0 0 6px rgba(245, 158, 11, 0.6)' : '0 0 4px rgba(0, 229, 255, 0.4)',
            transition: 'background-color 0.1s ease',
          }}
        />

        {/* Press-and-hold subtle cyan progress indicator around the dot */}
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          style={{
            position: 'absolute',
            marginTop: '-12px',
            marginLeft: '-12px',
            transform: 'rotate(-90deg)',
            pointerEvents: 'none',
            display: isPressing ? 'block' : 'none',
          }}
        >
          <circle
            ref={chargeCircleRef}
            cx="12"
            cy="12"
            r="9"
            fill="none"
            stroke="#00e5ff"
            strokeWidth="1.5"
            strokeDasharray="56.55"
            strokeDashoffset="56.55"
            strokeLinecap="round"
          />
        </svg>

        {/* RETICLE MODE: Precision crosshair lines */}
        {cursorPreference === 'reticle' && (
          <div
            ref={reticleCrosshairRef}
            style={{
              position: 'absolute',
              width: '32px',
              height: '32px',
              marginTop: '-16px',
              marginLeft: '-16px',
              pointerEvents: 'none',
            }}
          >
            <svg width="32" height="32" viewBox="0 0 32 32">
              <line x1="16" y1="2" x2="16" y2="10" stroke="#00e5ff" strokeWidth="1" strokeOpacity="0.75" />
              <line x1="16" y1="22" x2="16" y2="30" stroke="#00e5ff" strokeWidth="1" strokeOpacity="0.75" />
              <line x1="2" y1="16" x2="10" y2="16" stroke="#00e5ff" strokeWidth="1" strokeOpacity="0.75" />
              <line x1="22" y1="16" x2="30" y2="16" stroke="#00e5ff" strokeWidth="1" strokeOpacity="0.75" />
            </svg>
          </div>
        )}

        {/* MINIMAL & FULL MODES: Four refined corner measurement brackets (26px bounding box) */}
        {(cursorPreference === 'minimal' || cursorPreference === 'full') && (
          <div
            ref={frameRef}
            style={{
              position: 'absolute',
              width: '26px',
              height: '26px',
              marginTop: '-13px',
              marginLeft: '-13px',
              pointerEvents: 'none',
              transition: isPressing ? 'transform 0.1s ease' : 'none',
            }}
          >
            <svg width="26" height="26" viewBox="0 0 26 26" style={{ display: 'block' }}>
              {/* Top-Left Bracket */}
              <path d="M2 7 V2 H7" fill="none" stroke="#00e5ff" strokeWidth="1.2" strokeLinecap="square" strokeOpacity="0.85" />
              {/* Top-Right Bracket */}
              <path d="M19 2 H24 V7" fill="none" stroke="#00e5ff" strokeWidth="1.2" strokeLinecap="square" strokeOpacity="0.85" />
              {/* Bottom-Left Bracket */}
              <path d="M2 19 V24 H7" fill="none" stroke="#00e5ff" strokeWidth="1.2" strokeLinecap="square" strokeOpacity="0.85" />
              {/* Bottom-Right Bracket */}
              <path d="M19 24 H24 V19" fill="none" stroke="#00e5ff" strokeWidth="1.2" strokeLinecap="square" strokeOpacity="0.85" />
            </svg>
          </div>
        )}

        {/* Micro-Readout: Monospaced X/Y coordinates (~18px offset from cursor) */}
        {(cursorPreference === 'full' || cursorPreference === 'reticle') && (
          <div
            ref={readoutRef}
            style={{
              position: 'absolute',
              top: '16px',
              left: '16px',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '9px',
              letterSpacing: '0.06em',
              color: '#00e5ff',
              background: 'rgba(6, 11, 20, 0.88)',
              padding: '2px 5px',
              borderRadius: '2px',
              border: '1px solid rgba(0, 229, 255, 0.25)',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              opacity: 0.65,
              transition: 'opacity 0.15s ease',
            }}
          >
            <span ref={readoutTextRef}>X:0 Y:0</span>
          </div>
        )}

        {/* Contextual Action Badge ([OPEN], [ENGAGE]) */}
        <div
          style={{
            position: 'absolute',
            top: '-20px',
            left: '50%',
            transform: 'translateX(-50%)',
            pointerEvents: 'none',
          }}
        >
          <span
            ref={badgeLabelRef}
            style={{
              display: 'inline-block',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '9px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              color: '#f1f5f9',
              background: 'rgba(6, 11, 20, 0.92)',
              border: '1px solid #00e5ff',
              padding: '1px 5px',
              borderRadius: '2px',
              whiteSpace: 'nowrap',
              opacity: 0,
              transition: 'opacity 0.12s ease',
            }}
          />
        </div>
      </div>

      {/* Accessible HUD Mode Switcher Dock */}
      <CursorModeSwitcher
        current={cursorPreference}
        onChange={setCursorPreference}
        onCycle={cycleCursorPreference}
      />
    </>
  );
};

// ==============================================================================
// Accessible Bottom-Right Mode Switcher Dock
// ==============================================================================
interface ModeSwitcherProps {
  current: CursorPreferenceMode;
  onChange: (mode: CursorPreferenceMode) => void;
  onCycle: () => void;
}

const CursorModeSwitcher: React.FC<ModeSwitcherProps> = ({ current, onChange }) => {
  const modes: CursorPreferenceMode[] = ['minimal', 'full', 'reticle', 'off'];

  return (
    <div
      role="region"
      aria-label="Precision Instrument Cursor Mode Selector"
      className="cursor-mode-dock"
      style={{
        position: 'fixed',
        bottom: '16px',
        right: '16px',
        zIndex: 920,
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        padding: '4px 6px',
        backgroundColor: 'rgba(4, 9, 18, 0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(0, 229, 255, 0.25)',
        borderRadius: '6px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
        fontFamily: 'var(--font-mono, monospace)',
        fontSize: '0.65rem',
        letterSpacing: '0.08em',
        pointerEvents: 'auto',
        userSelect: 'none',
      }}
    >
      <span
        style={{
          color: 'var(--text-muted, #64748b)',
          padding: '0 4px',
          fontSize: '0.6rem',
          borderRight: '1px solid rgba(255, 255, 255, 0.1)',
          marginRight: '2px',
        }}
        title="Toggle with Alt+C"
      >
        RETICLE
      </span>

      {modes.map(mode => {
        const isActive = current === mode;
        return (
          <button
            key={mode}
            type="button"
            onClick={() => onChange(mode)}
            aria-pressed={isActive}
            style={{
              background: isActive ? 'rgba(0, 229, 255, 0.18)' : 'transparent',
              border: `1px solid ${isActive ? 'var(--border-cyan, rgba(0, 229, 255, 0.4))' : 'transparent'}`,
              color: isActive ? 'var(--accent-cyan, #00e5ff)' : 'var(--text-muted, #64748b)',
              borderRadius: '3px',
              padding: '3px 7px',
              fontSize: '0.625rem',
              fontFamily: 'var(--font-mono, monospace)',
              fontWeight: isActive ? 700 : 500,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              textTransform: 'uppercase',
            }}
          >
            {mode}
          </button>
        );
      })}
    </div>
  );
};
