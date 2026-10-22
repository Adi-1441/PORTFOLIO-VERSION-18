// ==============================================================================
// ADITHYA MECHNEXUS V18.3 — FUTURISTIC MECHANICAL ENGINEERING QR CODE CARD
// High-contrast optical barcode calibrated for 100% mobile scanner accuracy.
// Encodes exact live URL: https://portfolio-version-18.vercel.app/
// ==============================================================================

import React, { useState, useRef, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import QRCode from 'qrcode';
import {
  Download,
  Copy,
  Check,
  ExternalLink,
  Camera,
  Smartphone,
  ShieldCheck,
  Maximize2,
  Cpu,
  Layers,
  Sparkles
} from 'lucide-react';
import { useCursor } from '../../context/CursorContext';

export const LIVE_PORTFOLIO_URL = 'https://portfolio-version-18.vercel.app/';

// Central AG Monogram SVG Data URI with white protective quiet boundary
const AG_MONOGRAM_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <rect x="2" y="2" width="96" height="96" rx="16" fill="#ffffff" stroke="#ffffff" stroke-width="4" />
  <rect x="8" y="8" width="84" height="84" rx="12" fill="#040812" stroke="#00e5ff" stroke-width="3.5" />
  <path d="M 14 24 L 14 14 L 24 14" stroke="#00e5ff" stroke-width="2" fill="none" />
  <path d="M 86 24 L 86 14 L 76 14" stroke="#00e5ff" stroke-width="2" fill="none" />
  <path d="M 14 76 L 14 86 L 24 86" stroke="#00e5ff" stroke-width="2" fill="none" />
  <path d="M 86 76 L 86 86 L 76 86" stroke="#00e5ff" stroke-width="2" fill="none" />
  <text x="50" y="63" font-family="'Orbitron', sans-serif" font-size="38" font-weight="900" fill="#00e5ff" text-anchor="middle" letter-spacing="1.5">AG</text>
</svg>
`)}`;

export interface QrCodeCardProps {
  showHeading?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const QrCodeCard: React.FC<QrCodeCardProps> = ({
  showHeading = true,
  className = '',
  style = {},
}) => {
  const { setMode } = useCursor();
  const [copied, setCopied] = useState(false);
  const [withMonogram, setWithMonogram] = useState(true);
  const [downloading, setDownloading] = useState<'png' | 'svg' | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Copy portfolio link to clipboard with feedback
  const handleCopyLink = useCallback(async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(LIVE_PORTFOLIO_URL);
      } else {
        // Fallback for non-https or older webviews
        const textArea = document.createElement('textarea');
        textArea.value = LIVE_PORTFOLIO_URL;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy portfolio link:', err);
    }
  }, []);

  // Download high-resolution PNG (1024x1024 for pristine printing & scanning)
  const handleDownloadPng = useCallback(async () => {
    try {
      setDownloading('png');

      // 1. Create a high-res offscreen canvas
      const canvasSize = 1024;
      const offscreenCanvas = document.createElement('canvas');
      offscreenCanvas.width = canvasSize;
      offscreenCanvas.height = canvasSize;

      // 2. Render standard high-resolution QR with 4-module margin and Level H
      await QRCode.toCanvas(offscreenCanvas, LIVE_PORTFOLIO_URL, {
        errorCorrectionLevel: 'H',
        margin: 4,
        width: canvasSize,
        color: {
          dark: '#030712',
          light: '#ffffff',
        },
      });

      // 3. If monogram is enabled, render the high-res AG monogram in the center
      if (withMonogram) {
        const ctx = offscreenCanvas.getContext('2d');
        if (ctx) {
          await new Promise<void>((resolve) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
              const badgeSize = Math.floor(canvasSize * 0.18); // ~184px on 1024px canvas
              const startX = (canvasSize - badgeSize) / 2;
              const startY = (canvasSize - badgeSize) / 2;
              ctx.drawImage(img, startX, startY, badgeSize, badgeSize);
              resolve();
            };
            img.onerror = () => resolve();
            img.src = AG_MONOGRAM_SVG;
          });
        }
      }

      // 4. Export blob and trigger download
      offscreenCanvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ADITHYA_MECHNEXUS_PORTFOLIO_QR_${withMonogram ? 'AG' : 'CLEAN'}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setDownloading(null);
      }, 'image/png');
    } catch (err) {
      console.error('Failed to generate PNG download:', err);
      setDownloading(null);
    }
  }, [withMonogram]);

  // Download crisp vector SVG
  const handleDownloadSvg = useCallback(() => {
    try {
      setDownloading('svg');
      if (!svgRef.current) return;

      const serializer = new XMLSerializer();
      let source = serializer.serializeToString(svgRef.current);

      // Add name-spaces if missing
      if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
        source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
      }
      if (!source.match(/^<svg[^>]+"http\:\/\/www\.w3\.org\/1999\/xlink"/)) {
        source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
      }

      // Add xml declaration
      source = '<?xml version="1.0" standalone="no"?>\r\n' + source;

      const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ADITHYA_MECHNEXUS_PORTFOLIO_QR_${withMonogram ? 'AG' : 'CLEAN'}.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDownloading(null);
    } catch (err) {
      console.error('Failed to generate SVG download:', err);
      setDownloading(null);
    }
  }, [withMonogram]);

  return (
    <div
      className={`glass-panel hud-corner-brackets ${className}`}
      style={{
        position: 'relative',
        maxWidth: '560px',
        margin: '0 auto',
        padding: '2.5rem 2rem 2.25rem',
        backgroundColor: 'rgba(6, 12, 22, 0.92)',
        border: '1px solid rgba(0, 229, 255, 0.35)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.75), 0 0 35px rgba(0, 229, 255, 0.18)',
        borderRadius: 'var(--radius-lg)',
        color: 'var(--text-primary)',
        ...style,
      }}
    >
      {/* Top Engineering Reticle Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(0, 229, 255, 0.2)',
          paddingBottom: '0.85rem',
          marginBottom: '1.75rem',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.6875rem',
          color: 'var(--text-muted)',
          letterSpacing: '0.12em',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: 'var(--accent-cyan)',
              boxShadow: '0 0 8px var(--accent-cyan)',
              display: 'inline-block',
            }}
          />
          <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>
            OPTICAL TELEMETRY HANDSHAKE
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ShieldCheck size={13} color="var(--accent-cyan)" />
          <span>ECC: LEVEL H (30%)</span>
        </div>
      </div>

      {/* Header Information */}
      {showHeading && (
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          {/* Main Heading */}
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.75rem',
              fontWeight: 800,
              letterSpacing: '0.14em',
              margin: '0 0 0.5rem 0',
              background: 'linear-gradient(135deg, #ffffff 0%, #e2e8f0 40%, #00e5ff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 30px rgba(0, 229, 255, 0.25)',
            }}
          >
            ADITHYA MECHNEXUS
          </h2>

          {/* Subtitle */}
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              letterSpacing: '0.18em',
              color: 'var(--accent-cyan)',
              marginBottom: '0.65rem',
              textTransform: 'uppercase',
            }}
          >
            SCAN TO EXPLORE MY PORTFOLIO
          </div>

          {/* Engineering Disciplines Label */}
          <div
            style={{
              display: 'inline-block',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6875rem',
              fontWeight: 500,
              letterSpacing: '0.08em',
              color: 'var(--text-secondary)',
              padding: '0.35rem 0.85rem',
              borderRadius: 'var(--radius-xs)',
              background: 'rgba(0, 229, 255, 0.05)',
              border: '1px solid rgba(0, 229, 255, 0.2)',
            }}
          >
            MECHANICAL ENGINEERING | CAD | CAE | CFD | AUTOMATION
          </div>
        </div>
      )}

      {/* Futuristic Metallic / Neon QR Frame Container */}
      <div
        style={{
          position: 'relative',
          margin: '0 auto 1.5rem',
          maxWidth: '310px',
          padding: '12px',
          background: 'linear-gradient(145deg, rgba(14, 25, 45, 0.9) 0%, rgba(6, 12, 22, 0.95) 100%)',
          borderRadius: '16px',
          border: '1px solid rgba(0, 229, 255, 0.45)',
          boxShadow: '0 0 25px rgba(0, 229, 255, 0.2), inset 0 0 15px rgba(0, 229, 255, 0.08)',
        }}
      >
        {/* Corner Reticle Accents */}
        <div
          style={{
            position: 'absolute',
            top: '4px',
            left: '4px',
            width: '14px',
            height: '14px',
            borderTop: '2px solid var(--accent-cyan)',
            borderLeft: '2px solid var(--accent-cyan)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            width: '14px',
            height: '14px',
            borderTop: '2px solid var(--accent-cyan)',
            borderRight: '2px solid var(--accent-cyan)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '4px',
            left: '4px',
            width: '14px',
            height: '14px',
            borderBottom: '2px solid var(--accent-cyan)',
            borderLeft: '2px solid var(--accent-cyan)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '4px',
            right: '4px',
            width: '14px',
            height: '14px',
            borderBottom: '2px solid var(--accent-cyan)',
            borderRight: '2px solid var(--accent-cyan)',
            pointerEvents: 'none',
          }}
        />

        {/* High-Contrast Pure White QR Code Canvas Plaque */}
        <div
          style={{
            backgroundColor: '#ffffff',
            padding: '14px',
            borderRadius: '10px',
            boxShadow: '0 4px 18px rgba(0, 0, 0, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          {/* Subtle sweep line on top of frame (non-obstructive) */}
          <div className="scanline-sweep" style={{ opacity: 0.35, borderRadius: '10px' }} />

          {/* Render Vector SVG QR Code with exact URL */}
          <QRCodeSVG
            ref={svgRef}
            value={LIVE_PORTFOLIO_URL}
            size={256}
            level="H"
            bgColor="#ffffff"
            fgColor="#030712"
            includeMargin={false}
            imageSettings={
              withMonogram
                ? {
                    src: AG_MONOGRAM_SVG,
                    x: undefined,
                    y: undefined,
                    height: 52,
                    width: 52,
                    excavate: true,
                  }
                : undefined
            }
            style={{
              width: '100%',
              maxWidth: '256px',
              height: 'auto',
              aspectRatio: '1 / 1',
              display: 'block',
            }}
          />
        </div>

        {/* Monogram Toggle Switch under QR code */}
        <div
          style={{
            marginTop: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 4px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6875rem',
            color: 'var(--text-secondary)',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Sparkles size={11} color="var(--accent-cyan)" />
            <span>AG MONOGRAM</span>
          </span>
          <button
            type="button"
            onClick={() => setWithMonogram((prev) => !prev)}
            onMouseEnter={() => setMode('button')}
            onMouseLeave={() => setMode('default')}
            style={{
              background: withMonogram ? 'rgba(0, 229, 255, 0.15)' : 'rgba(148, 163, 184, 0.1)',
              border: `1px solid ${withMonogram ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
              color: withMonogram ? 'var(--accent-cyan)' : 'var(--text-muted)',
              fontSize: '0.625rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              padding: '2px 8px',
              borderRadius: 'var(--radius-xs)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {withMonogram ? 'ACTIVE [ON]' : 'OFF [CLEAN]'}
          </button>
        </div>
      </div>

      {/* Mandatory Instruction Prompt */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          textAlign: 'center',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.8125rem',
          color: 'var(--text-primary)',
          backgroundColor: 'rgba(0, 229, 255, 0.06)',
          border: '1px solid rgba(0, 229, 255, 0.2)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.75rem 1rem',
          marginBottom: '1.5rem',
        }}
      >
        <Smartphone size={16} color="var(--accent-cyan)" />
        <span>Open your phone camera and scan to visit my portfolio.</span>
      </div>

      {/* Primary Action Buttons Matrix */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '0.75rem',
          marginBottom: '1.25rem',
        }}
      >
        {/* DOWNLOAD PNG BUTTON */}
        <button
          type="button"
          onClick={handleDownloadPng}
          disabled={downloading === 'png'}
          onMouseEnter={() => setMode('button')}
          onMouseLeave={() => setMode('default')}
          className="btn-primary"
          style={{
            width: '100%',
            padding: '0.8rem 1rem',
            fontSize: '0.75rem',
            cursor: 'pointer',
          }}
        >
          <Download size={15} />
          <span>{downloading === 'png' ? 'RENDERING...' : 'DOWNLOAD QR CODE (PNG)'}</span>
        </button>

        {/* DOWNLOAD SVG BUTTON */}
        <button
          type="button"
          onClick={handleDownloadSvg}
          disabled={downloading === 'svg'}
          onMouseEnter={() => setMode('button')}
          onMouseLeave={() => setMode('default')}
          className="btn-secondary"
          style={{
            width: '100%',
            padding: '0.8rem 1rem',
            fontSize: '0.75rem',
            cursor: 'pointer',
          }}
        >
          <Layers size={15} color="var(--accent-cyan)" />
          <span>{downloading === 'svg' ? 'EXPORTING...' : 'DOWNLOAD QR CODE (SVG)'}</span>
        </button>
      </div>

      {/* Secondary Controls: Copy Link + Live Visit */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '0.75rem',
          marginBottom: '1.5rem',
        }}
      >
        {/* COPY PORTFOLIO LINK */}
        <button
          type="button"
          onClick={handleCopyLink}
          onMouseEnter={() => setMode('button')}
          onMouseLeave={() => setMode('default')}
          className="btn-secondary"
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            fontSize: '0.75rem',
            borderColor: copied ? 'var(--accent-cyan)' : undefined,
            color: copied ? 'var(--accent-cyan)' : undefined,
            cursor: 'pointer',
          }}
        >
          {copied ? <Check size={14} color="var(--accent-cyan)" /> : <Copy size={14} />}
          <span>{copied ? 'LINK COPIED!' : 'COPY PORTFOLIO LINK'}</span>
        </button>

        {/* DIRECT VISIT LINK */}
        <a
          href={LIVE_PORTFOLIO_URL}
          target="_blank"
          rel="noopener noreferrer"
          onMouseEnter={() => setMode('button')}
          onMouseLeave={() => setMode('default')}
          className="btn-secondary"
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            fontSize: '0.75rem',
            textDecoration: 'none',
            color: 'var(--text-secondary)',
          }}
        >
          <ExternalLink size={14} />
          <span>OPEN IN BROWSER</span>
        </a>
      </div>

      {/* Technical Telemetry Footer Information */}
      <div
        style={{
          borderTop: '1px solid rgba(148, 163, 184, 0.12)',
          paddingTop: '0.85rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.625rem',
          color: 'var(--text-muted)',
          lineHeight: 1.5,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <span style={{ color: 'var(--text-secondary)' }}>LIVE DESTINATION:</span>
          <span style={{ color: 'var(--accent-cyan)', wordBreak: 'break-all' }}>
            {LIVE_PORTFOLIO_URL}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <span>ALGORITHM: ISO/IEC 18004</span>
          <span>MAX SCAN RECOVERY: 30% REPAIR BAND</span>
        </div>
      </div>
    </div>
  );
};
