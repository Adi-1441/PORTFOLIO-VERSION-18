// ==============================================================================
// ADITHYA MECHNEXUS V18.3 — UNIVERSAL PUBLIC MEDIA GALLERY COMPONENT
// Optimized public gallery preview: Curated thumbnails, lazy loading,
// "VIEW ALL IMAGES" badge action, responsive video playback, accessible lightbox.
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Video as VideoIcon, Eye, Play } from 'lucide-react';
import { UniversalMediaItem, mediaService } from '../../services/media.service';
import { MEDIA_CONFIG } from '../../config/media.config';
import { MediaLightboxModal } from './MediaLightboxModal';

interface UniversalMediaGalleryProps {
  media?: UniversalMediaItem[];
  entityType?: 'projects' | 'cad_cae' | 'plc' | 'research' | 'ai_engineering' | 'section_item';
  entityId?: string;
  title?: string;
  maxPreviewCount?: number;
  className?: string;
}

export const UniversalMediaGallery: React.FC<UniversalMediaGalleryProps> = ({
  media: initialMedia,
  entityType,
  entityId,
  title,
  maxPreviewCount = MEDIA_CONFIG.previewImagesCount,
  className = '',
}) => {
  const [mediaList, setMediaList] = useState<UniversalMediaItem[]>(initialMedia || []);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // If initialMedia is not passed but entityType and entityId are provided, load dynamically
  useEffect(() => {
    if (initialMedia) {
      setMediaList(initialMedia);
      return;
    }
    if (entityType && entityId) {
      let isMounted = true;
      mediaService.getWorkMedia(entityType, entityId).then(items => {
        if (isMounted) setMediaList(items);
      });
      return () => { isMounted = false; };
    }
  }, [initialMedia, entityType, entityId]);

  if (mediaList.length === 0) {
    return null;
  }

  // Separate images and videos
  const images = mediaList.filter(m => m.type === 'image');
  const videos = mediaList.filter(m => m.type === 'video');

  const previewImages = images.slice(0, maxPreviewCount);
  const remainingCount = Math.max(0, images.length - maxPreviewCount);

  const openLightboxAt = (indexInOverallList: number) => {
    setLightboxIndex(indexInOverallList);
    setLightboxOpen(true);
  };

  return (
    <div
      className={`universal-media-gallery ${className}`}
      onClick={(e) => e.stopPropagation()}
      style={{ marginTop: '1.25rem', marginBottom: '1.25rem' }}
    >
      {/* 1. Curated Image Thumbnails Grid */}
      {previewImages.length === 1 && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          width: '100%',
          marginBottom: videos.length > 0 ? '12px' : '0',
        }}>
          <div
            className="universal-media-single-frame"
            style={{
              maxWidth: '540px',
              width: '100%',
              position: 'relative',
              borderRadius: '8px',
              overflow: 'hidden',
              backgroundColor: 'rgba(3, 7, 15, 0.9)',
              border: '1px solid var(--border-subtle, rgba(148, 163, 184, 0.2))',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.45)',
              cursor: 'pointer',
              transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
            }}
            onClick={(e) => {
              e.stopPropagation();
              const overallIdx = mediaList.findIndex(m => m.id === previewImages[0].id);
              openLightboxAt(overallIdx >= 0 ? overallIdx : 0);
            }}
            title={previewImages[0].caption || 'Click to inspect high-resolution photograph'}
          >
            <div style={{
              width: '100%',
              height: 'clamp(200px, 55vw, 300px)',
              maxHeight: '340px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'radial-gradient(circle at center, rgba(148, 163, 184, 0.08) 0%, rgba(3, 7, 15, 0.95) 100%)',
              padding: '8px',
              position: 'relative',
            }}>
              <img
                src={previewImages[0].url}
                alt={previewImages[0].alt_text || previewImages[0].caption || 'Work Preview'}
                loading="lazy"
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  width: 'auto',
                  height: 'auto',
                  objectFit: 'contain',
                  display: 'block',
                  borderRadius: '4px',
                  transition: 'transform 0.3s ease',
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="60"><rect width="100" height="60" fill="%230b1322"/><text x="50%" y="50%" fill="%2364748b" dominant-baseline="middle" text-anchor="middle" font-family="monospace" font-size="8">IMAGE</text></svg>';
                }}
              />

              {/* High-tech Inspection Badge */}
              <div style={{
                position: 'absolute',
                bottom: '8px',
                right: '8px',
                backgroundColor: 'rgba(3, 7, 15, 0.85)',
                border: '1px solid rgba(0, 229, 255, 0.35)',
                borderRadius: '4px',
                padding: '3px 8px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                color: 'var(--accent-cyan, #00e5ff)',
                fontSize: '10px',
                fontFamily: 'var(--font-mono, monospace)',
                letterSpacing: '0.04em',
              }}>
                <ImageIcon size={11} />
                <span>INSPECT</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Two Images Balanced Layout */}
      {previewImages.length === 2 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
          gap: '10px',
          maxWidth: '780px',
          margin: '0 auto',
          marginBottom: videos.length > 0 ? '12px' : '0',
        }}>
          {previewImages.map((img, idx) => {
            const overallIndex = mediaList.findIndex(m => m.id === img.id);

            return (
              <div
                key={img.id || idx}
                style={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '16/10',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  backgroundColor: 'rgba(3, 7, 15, 0.85)',
                  border: '1px solid var(--border-subtle, rgba(148, 163, 184, 0.15))',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease, border-color 0.2s ease',
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  openLightboxAt(overallIndex >= 0 ? overallIndex : idx);
                }}
                title={img.caption || 'Click to enlarge photograph'}
              >
                <img
                  src={img.url}
                  alt={img.alt_text || img.caption || 'Work Preview'}
                  loading="lazy"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                    transition: 'transform 0.3s ease',
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="60"><rect width="100" height="60" fill="%230b1322"/><text x="50%" y="50%" fill="%2364748b" dominant-baseline="middle" text-anchor="middle" font-family="monospace" font-size="8">IMAGE</text></svg>';
                  }}
                />

                <div style={{
                  position: 'absolute',
                  bottom: '6px',
                  right: '6px',
                  backgroundColor: 'rgba(3, 7, 15, 0.75)',
                  borderRadius: '4px',
                  padding: '2px 5px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                  color: 'var(--text-secondary, #94a3b8)',
                  fontSize: '9px',
                  fontFamily: 'var(--font-mono, monospace)',
                }}>
                  <ImageIcon size={10} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Three or More Images Responsive Grid (Consistent Spacing & Balanced Sizing) */}
      {previewImages.length >= 3 && (
        <div
          className="universal-media-grid-multi"
          style={{
            display: 'grid',
            gridTemplateColumns: previewImages.length === 3 ? 'repeat(3, minmax(0, 1fr))' : 'repeat(auto-fill, minmax(min(100%, 160px), 1fr))',
            gap: '8px',
            maxWidth: previewImages.length === 3 ? '840px' : '100%',
            margin: previewImages.length === 3 ? '0 auto' : '0',
            marginBottom: videos.length > 0 ? '10px' : '0',
          }}
        >
          {previewImages.map((img, idx) => {
            const isLast = idx === previewImages.length - 1;
            const showOverlayButton = isLast && remainingCount > 0;
            const overallIndex = mediaList.findIndex(m => m.id === img.id);

            return (
              <div
                key={img.id || idx}
                style={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '16/10',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  backgroundColor: 'rgba(3, 7, 15, 0.8)',
                  border: '1px solid var(--border-subtle, rgba(148, 163, 184, 0.15))',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease, border-color 0.2s ease',
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  openLightboxAt(overallIndex >= 0 ? overallIndex : idx);
                }}
                title={img.caption || 'Click to enlarge photograph'}
              >
                <img
                  src={img.url}
                  alt={img.alt_text || img.caption || 'Work Preview'}
                  loading="lazy"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                    transition: 'transform 0.3s ease',
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="60"><rect width="100" height="60" fill="%230b1322"/><text x="50%" y="50%" fill="%2364748b" dominant-baseline="middle" text-anchor="middle" font-family="monospace" font-size="8">IMAGE</text></svg>';
                  }}
                />

                {/* Overlay Badge for remaining images on the last preview slot */}
                {showOverlayButton ? (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: 'rgba(3, 7, 15, 0.78)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-cyan, #00e5ff)',
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                  }}>
                    <Eye size={18} style={{ marginBottom: '4px' }} />
                    <span>VIEW ALL ({images.length})</span>
                  </div>
                ) : (
                  /* Subtle Zoom Icon on Hover */
                  <div style={{
                    position: 'absolute',
                    bottom: '6px',
                    right: '6px',
                    backgroundColor: 'rgba(3, 7, 15, 0.75)',
                    borderRadius: '4px',
                    padding: '2px 5px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px',
                    color: 'var(--text-secondary, #94a3b8)',
                    fontSize: '9px',
                    fontFamily: 'var(--font-mono, monospace)',
                  }}>
                    <ImageIcon size={10} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 2. Dedicated Video Recordings Area */}
      {videos.length > 0 && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          marginTop: previewImages.length > 0 ? '10px' : '0',
          maxWidth: previewImages.length === 1 ? '540px' : previewImages.length === 2 ? '780px' : '840px',
          margin: (previewImages.length === 1 || previewImages.length === 2 || previewImages.length === 3) ? '10px auto 0' : '10px 0 0',
        }}>
          {videos.map((vid, vIdx) => {
            const overallIndex = mediaList.findIndex(m => m.id === vid.id);

            return (
              <div
                key={vid.id || vIdx}
                style={{
                  position: 'relative',
                  backgroundColor: 'rgba(6, 11, 20, 0.9)',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  borderRadius: '6px',
                  overflow: 'hidden',
                }}
              >
                {/* Header label */}
                <div style={{
                  padding: '4px 8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: 'rgba(11, 19, 34, 0.85)',
                  borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
                  fontSize: '0.7rem',
                  fontFamily: 'var(--font-mono, monospace)',
                  color: '#38bdf8',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <VideoIcon size={12} />
                    <span>RECORDING: {vid.caption || `Video ${vIdx + 1}`}</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openLightboxAt(overallIndex >= 0 ? overallIndex : 0);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--accent-cyan, #00e5ff)',
                      fontSize: '0.65rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px',
                    }}
                  >
                    <span>FULLSCREEN</span>
                  </button>
                </div>

                {/* Video Player */}
                <div style={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '16/9',
                  maxHeight: '320px',
                  backgroundColor: '#000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <video
                    src={vid.url}
                    controls
                    playsInline
                    preload="metadata"
                    muted
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      width: '100%',
                      height: '100%',
                      maxHeight: '320px',
                      display: 'block',
                      objectFit: 'contain',
                      backgroundColor: '#000',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. Accessible Fullscreen Lightbox Modal */}
      <MediaLightboxModal
        media={mediaList}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        title={title}
      />
    </div>
  );
};
