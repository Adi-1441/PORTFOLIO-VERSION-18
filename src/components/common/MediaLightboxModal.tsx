// ==============================================================================
// ADITHYA MECHNEXUS V18.3 — ACCESSIBLE MEDIA LIGHTBOX MODAL
// Full-resolution image inspection and high-definition video playback.
// Keyboard accessible (Esc, Left, Right), responsive, zero layout shift.
// ==============================================================================

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Maximize2, Minimize2 } from 'lucide-react';
import { UniversalMediaItem } from '../../services/media.service';

interface MediaLightboxModalProps {
  media: UniversalMediaItem[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export const MediaLightboxModal: React.FC<MediaLightboxModalProps> = ({
  media,
  initialIndex = 0,
  isOpen,
  onClose,
  title,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const modalContainerRef = useRef<HTMLDivElement>(null);

  // Sync index when initialIndex changes or modal opens
  useEffect(() => {
    setCurrentIndex(initialIndex);
    setIsZoomed(false);
  }, [initialIndex, isOpen]);

  // Navigate next / previous
  const handleNext = useCallback(() => {
    if (media.length <= 1) return;
    setIsZoomed(false);
    setCurrentIndex(prev => (prev + 1) % media.length);
  }, [media.length]);

  const handlePrev = useCallback(() => {
    if (media.length <= 1) return;
    setIsZoomed(false);
    setCurrentIndex(prev => (prev - 1 + media.length) % media.length);
  }, [media.length]);

  // Pause playing video on index change or close
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
  }, [currentIndex, isOpen]);

  // Keyboard navigation listener (Escape, ArrowLeft, ArrowRight)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    // Prevent background body scroll when lightbox is open
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose, handleNext, handlePrev]);

  if (!isOpen || media.length === 0) return null;

  const currentMedia = media[currentIndex] || media[0];
  const isVideo = currentMedia.type === 'video';

  return (
    <div
      ref={modalContainerRef}
      role="dialog"
      aria-modal="true"
      aria-label={title || 'Media Lightbox'}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(3, 7, 15, 0.96)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        zIndex: 2000,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '1rem',
      }}
      onClick={(e) => {
        if (e.target === modalContainerRef.current) onClose();
      }}
    >
      {/* Top Bar: Title, Counter, and Close Button */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.5rem 1rem',
        borderBottom: '1px solid rgba(148, 163, 184, 0.15)',
        zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="vernier-badge" style={{ color: 'var(--accent-cyan, #00e5ff)' }}>
            MEDIA INSPECTOR
          </span>
          {title && (
            <span style={{
              color: 'var(--text-primary, #f1f5f9)',
              fontSize: '0.875rem',
              fontWeight: 600,
              fontFamily: 'var(--font-display, sans-serif)',
            }}>
              {title}
            </span>
          )}
          <span style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '0.75rem',
            color: 'var(--text-muted, #64748b)',
          }}>
            [{currentIndex + 1} / {media.length}]
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {!isVideo && (
            <button
              type="button"
              onClick={() => setIsZoomed(!isZoomed)}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '6px',
                color: 'var(--text-secondary, #94a3b8)',
                padding: '6px 10px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono, monospace)',
                cursor: 'pointer',
              }}
              title="Toggle Zoom / Fit"
            >
              {isZoomed ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              <span>{isZoomed ? 'FIT' : 'ZOOM'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Lightbox"
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              borderRadius: '6px',
              color: '#f87171',
              padding: '6px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono, monospace)',
              cursor: 'pointer',
            }}
          >
            <X size={16} />
            <span>ESC</span>
          </button>
        </div>
      </div>

      {/* Main Stage: Current Media with Prev/Next buttons */}
      <div style={{
        position: 'relative',
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        margin: '1rem 0',
      }}>
        {/* Previous Button */}
        {media.length > 1 && (
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous Media"
            style={{
              position: 'absolute',
              left: '1rem',
              zIndex: 15,
              background: 'rgba(6, 11, 20, 0.75)',
              border: '1px solid var(--border-cyan, rgba(0, 229, 255, 0.35))',
              borderRadius: '50%',
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-cyan, #00e5ff)',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.6)',
              transition: 'all 0.15s ease',
            }}
          >
            <ChevronLeft size={24} />
          </button>
        )}

        {/* Media Container */}
        <div style={{
          maxWidth: isZoomed ? '100%' : '90vw',
          maxHeight: isZoomed ? '100%' : '76vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: isZoomed ? 'auto' : 'hidden',
        }}>
          {isVideo ? (
            <video
              ref={videoRef}
              src={currentMedia.url}
              controls
              playsInline
              preload="metadata"
              style={{
                maxWidth: '90vw',
                maxHeight: '76vh',
                borderRadius: '8px',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
                outline: 'none',
              }}
            />
          ) : (
            <img
              src={currentMedia.url}
              alt={currentMedia.alt_text || currentMedia.caption || 'Engineering Work'}
              style={{
                maxWidth: isZoomed ? 'none' : '90vw',
                maxHeight: isZoomed ? 'none' : '76vh',
                objectFit: 'contain',
                borderRadius: '8px',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
                transition: 'transform 0.2s ease',
                cursor: isZoomed ? 'zoom-out' : 'zoom-in',
              }}
              onClick={() => setIsZoomed(!isZoomed)}
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><rect width="600" height="400" fill="%230b1322"/><text x="50%" y="50%" fill="%2364748b" dominant-baseline="middle" text-anchor="middle" font-family="monospace" font-size="16">ORIGINAL MEDIA UNAVAILABLE</text></svg>';
              }}
            />
          )}
        </div>

        {/* Next Button */}
        {media.length > 1 && (
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next Media"
            style={{
              position: 'absolute',
              right: '1rem',
              zIndex: 15,
              background: 'rgba(6, 11, 20, 0.75)',
              border: '1px solid var(--border-cyan, rgba(0, 229, 255, 0.35))',
              borderRadius: '50%',
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-cyan, #00e5ff)',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.6)',
              transition: 'all 0.15s ease',
            }}
          >
            <ChevronRight size={24} />
          </button>
        )}
      </div>

      {/* Bottom Bar: Caption and Thumbnail Navigation Strip */}
      <div style={{
        padding: '0.75rem 1rem',
        borderTop: '1px solid rgba(148, 163, 184, 0.15)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        zIndex: 10,
      }}>
        {/* Caption */}
        {currentMedia.caption && (
          <div style={{
            color: 'var(--text-primary, #f1f5f9)',
            fontSize: '0.85rem',
            fontFamily: 'var(--font-mono, monospace)',
            textAlign: 'center',
            maxWidth: '700px',
          }}>
            {currentMedia.caption}
          </div>
        )}

        {/* Thumbnail Strip */}
        {media.length > 1 && (
          <div style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            maxWidth: '100%',
            padding: '4px',
          }}>
            {media.map((item, idx) => {
              const active = idx === currentIndex;
              return (
                <button
                  key={item.id || idx}
                  type="button"
                  onClick={() => {
                    setIsZoomed(false);
                    setCurrentIndex(idx);
                  }}
                  style={{
                    width: '56px',
                    height: '40px',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    border: `2px solid ${active ? 'var(--accent-cyan, #00e5ff)' : 'transparent'}`,
                    padding: 0,
                    background: '#000',
                    cursor: 'pointer',
                    opacity: active ? 1 : 0.6,
                    flexShrink: 0,
                    transition: 'opacity 0.15s ease',
                  }}
                >
                  {item.type === 'video' ? (
                    <div style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(56, 189, 248, 0.2)',
                      color: '#38bdf8',
                      fontSize: '9px',
                      fontFamily: 'var(--font-mono, monospace)',
                    }}>
                      VID
                    </div>
                  ) : (
                    <img
                      src={item.url}
                      alt={item.caption || 'Thumbnail'}
                      loading="lazy"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
