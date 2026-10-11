// ==============================================================================
// ADITHYA MECHNEXUS V18.3 — PRECISION CURSOR & TELEMETRY CONTEXT
// High-performance pointer tracking with Full, Minimal, and Off preference modes.
// Zero layout shifts, zero leaked listeners, respects prefers-reduced-motion.
// ==============================================================================

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

export type CursorPreferenceMode = 'full' | 'minimal' | 'off';

export type CursorTelemetryState =
  | 'scan'
  | 'lock'
  | 'engage'
  | 'inspect'
  | 'zoom'
  | 'orbit'
  | 'drag'
  | 'load'
  | 'text'
  // Legacy aliases for complete backwards compatibility
  | 'default'
  | 'button'
  | 'card'
  | 'disabled';

export type CursorMode = CursorTelemetryState;

interface CursorContextType {
  mode: CursorTelemetryState;
  setMode: (mode: CursorTelemetryState) => void;
  cursorPreference: CursorPreferenceMode;
  setCursorPreference: (mode: CursorPreferenceMode) => void;
  cycleCursorPreference: () => void;
  coordinates: { x: number; y: number };
  isTouchDevice: boolean;
  reducedMotion: boolean;
  isPointerActive: boolean;
  triggerRipple: (x: number, y: number) => void;
  pointerRef: React.MutableRefObject<{ x: number; y: number; active: boolean }>;
}

const STORAGE_KEY = 'mechnexus_cursor_mode';

const CursorContext = createContext<CursorContextType | undefined>(undefined);

// Normalizes state names to unified mechanical telemetry vocabulary
export const normalizeCursorState = (state: CursorTelemetryState): string => {
  switch (state) {
    case 'button': return 'engage';
    case 'card': return 'lock';
    case 'default': return 'scan';
    case 'disabled': return 'load';
    default: return state;
  }
};

export const CursorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<CursorTelemetryState>('scan');
  const [coordinates, setCoordinates] = useState({ x: -100, y: -100 });
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isPointerActive, setIsPointerActive] = useState(false);

  // Initialize preference from localStorage with safe fallback
  const [cursorPreference, setCursorPreferenceState] = useState<CursorPreferenceMode>(() => {
    if (typeof window === 'undefined') return 'full';
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as CursorPreferenceMode | null;
      if (saved === 'full' || saved === 'minimal' || saved === 'off') {
        return saved;
      }
    } catch {
      // Ignore localStorage errors (private browsing, etc.)
    }
    return 'full';
  });

  const latestPos = useRef({ x: -100, y: -100 });
  const pointerRef = useRef<{ x: number; y: number; active: boolean }>({ x: -100, y: -100, active: false });
  const rafId = useRef<number | null>(null);

  // Update body classes for native cursor hiding based on active mode
  const syncBodyClasses = useCallback((pref: CursorPreferenceMode, isTouch: boolean) => {
    if (typeof document === 'undefined') return;
    const body = document.body;
    body.classList.remove('cursor-mode-full', 'cursor-mode-minimal', 'cursor-mode-off', 'cursor-enabled');

    if (isTouch) {
      body.classList.add('is-touch-device');
      return;
    }

    body.classList.add(`cursor-mode-${pref}`);
    if (pref !== 'off') {
      body.classList.add('cursor-enabled');
    }
  }, []);

  const setCursorPreference = useCallback((newPref: CursorPreferenceMode) => {
    setCursorPreferenceState(newPref);
    try {
      localStorage.setItem(STORAGE_KEY, newPref);
    } catch {
      // storage unavailable
    }
    syncBodyClasses(newPref, isTouchDevice);
  }, [isTouchDevice, syncBodyClasses]);

  const cycleCursorPreference = useCallback(() => {
    setCursorPreference(
      cursorPreference === 'full' ? 'minimal' :
      cursorPreference === 'minimal' ? 'off' : 'full'
    );
  }, [cursorPreference, setCursorPreference]);

  const setMode = useCallback((newMode: CursorTelemetryState) => {
    setModeState(newMode);
  }, []);

  // Detect touch device and prefers-reduced-motion media query
  useEffect(() => {
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsTouchDevice(hasTouch);

    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mql.matches);

    const handleReducedMotionChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };

    if (mql.addEventListener) {
      mql.addEventListener('change', handleReducedMotionChange);
    } else {
      // Legacy Safari
      mql.addListener(handleReducedMotionChange);
    }

    syncBodyClasses(cursorPreference, hasTouch);

    return () => {
      if (mql.removeEventListener) {
        mql.removeEventListener('change', handleReducedMotionChange);
      } else {
        mql.removeListener(handleReducedMotionChange);
      }
    };
  }, [cursorPreference, syncBodyClasses]);

  // Pointer movement tracking with window blur / mouseleave / cancel handling
  useEffect(() => {
    if (isTouchDevice) return;

    const handlePointerMove = (e: PointerEvent) => {
      setIsPointerActive(true);
      const clientX = Math.round(e.clientX);
      const clientY = Math.round(e.clientY);
      latestPos.current = { x: clientX, y: clientY };
      pointerRef.current = { x: clientX, y: clientY, active: true };

      if (!rafId.current) {
        rafId.current = requestAnimationFrame(() => {
          setCoordinates(latestPos.current);
          rafId.current = null;
        });
      }
    };

    const handleMouseLeave = () => {
      setIsPointerActive(false);
      pointerRef.current.active = false;
      setCoordinates({ x: -100, y: -100 });
    };

    const handleWindowBlur = () => {
      setIsPointerActive(false);
      pointerRef.current.active = false;
      setCoordinates({ x: -100, y: -100 });
    };

    const handlePointerCancel = () => {
      setIsPointerActive(false);
      pointerRef.current.active = false;
      setCoordinates({ x: -100, y: -100 });
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsPointerActive(false);
        pointerRef.current.active = false;
        setCoordinates({ x: -100, y: -100 });
      }
    };

    // Keyboard shortcut to cycle cursor mode: Alt+C
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === 'c' || e.key === 'C')) {
        e.preventDefault();
        cycleCursorPreference();
      }
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('pointercancel', handlePointerCancel);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('pointercancel', handlePointerCancel);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('keydown', handleKeyDown);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [isTouchDevice, cycleCursorPreference]);

  const triggerRipple = useCallback((x: number, y: number) => {
    const event = new CustomEvent('mechnexus-touch-ripple', { detail: { x, y } });
    window.dispatchEvent(event);
  }, []);

  return (
    <CursorContext.Provider value={{
      mode,
      setMode,
      cursorPreference,
      setCursorPreference,
      cycleCursorPreference,
      coordinates,
      isTouchDevice,
      reducedMotion,
      isPointerActive,
      triggerRipple,
      pointerRef,
    }}>
      {children}
    </CursorContext.Provider>
  );
};

export const useCursor = (): CursorContextType => {
  const context = useContext(CursorContext);
  if (!context) {
    throw new Error('useCursor must be used within a CursorProvider');
  }
  return context;
};
