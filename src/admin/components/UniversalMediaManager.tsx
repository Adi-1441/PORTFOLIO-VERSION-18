// ==============================================================================
// ADITHYA MECHNEXUS V18.3 — UNIVERSAL ADMIN MEDIA MANAGER COMPONENT
// Production-grade media gallery editor for Projects, CAD & CAE, PLC, Research,
// AI Engineering, and Dynamic Custom Section CMS entries.
// Strict Independent Limits: 10 Images, 3 Videos. Live counters. Safe CRUD.
// ==============================================================================

import React, { useState, useEffect, useRef } from 'react';
import {
  Upload, Image as ImageIcon, Video as VideoIcon, Trash2, RefreshCw,
  Star, CheckCircle2, AlertCircle, Loader2, Edit3, X, Eye, FileText
} from 'lucide-react';
import { mediaService, UniversalMediaItem } from '../../services/media.service';
import { MEDIA_CONFIG, formatBytes, validateMediaFile } from '../../config/media.config';

interface UniversalMediaManagerProps {
  entityType: 'projects' | 'cad_cae' | 'plc' | 'research' | 'ai_engineering' | 'section_item';
  entityId: string;
  onMediaChanged?: (items: UniversalMediaItem[]) => void;
}

export interface QueuedMediaFile {
  id: string;
  file: File;
  type: 'image' | 'video';
  previewUrl?: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  errorMessage?: string;
}

export const UniversalMediaManager: React.FC<UniversalMediaManagerProps> = ({
  entityType,
  entityId,
  onMediaChanged,
}) => {
  const [mediaList, setMediaList] = useState<UniversalMediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingType, setUploadingType] = useState<'image' | 'video' | null>(null);
  const [uploadProgressText, setUploadProgressText] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Staging upload queue for multi-file batch upload
  const [uploadQueue, setUploadQueue] = useState<QueuedMediaFile[]>([]);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);

  // Replacement state
  const [replacingItem, setReplacingItem] = useState<UniversalMediaItem | null>(null);

  // Metadata editing state
  const [editingItem, setEditingItem] = useState<UniversalMediaItem | null>(null);
  const [captionInput, setCaptionInput] = useState('');
  const [altTextInput, setAltTextInput] = useState('');

  // File input refs
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  // Derived counts (taking already-uploaded files + currently queued active files into account)
  const imageCount = mediaList.filter(m => m.type === 'image').length;
  const videoCount = mediaList.filter(m => m.type === 'video').length;

  const queuedImagesCount = uploadQueue.filter(q => q.type === 'image' && q.status !== 'error').length;
  const queuedVideosCount = uploadQueue.filter(q => q.type === 'video' && q.status !== 'error').length;

  const totalImageCount = imageCount + queuedImagesCount;
  const totalVideoCount = videoCount + queuedVideosCount;

  const isImageLimitReached = totalImageCount >= MEDIA_CONFIG.maxImagesPerWork;
  const isVideoLimitReached = totalVideoCount >= MEDIA_CONFIG.maxVideosPerWork;

  // Load existing media on mount or when entityId changes
  const loadMedia = async () => {
    if (!entityId) return;
    setLoading(true);
    setErrorMessage(null);
    try {
      const items = await mediaService.getWorkMedia(entityType, entityId);
      setMediaList(items);
      onMediaChanged?.(items);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed loading work media.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, [entityId, entityType]);

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  // Cleanup object URLs when queue unmounts
  useEffect(() => {
    return () => {
      uploadQueue.forEach(item => {
        if (item.previewUrl) {
          try { URL.revokeObjectURL(item.previewUrl); } catch {}
        }
      });
    };
  }, []);

  // 1. MULTI-FILE SELECTION HANDLER (Supports selecting up to 10 images / 3 videos simultaneously)
  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const rawFiles = e.target.files ? Array.from(e.target.files) : [];
    // Reset file input value immediately so selecting the exact same files triggers onChange
    e.target.value = '';

    if (rawFiles.length === 0) return;

    // Remaining capacity check: Max allowed - already uploaded - already queued
    const currentUploaded = mediaList.filter(m => m.type === type).length;
    const currentActiveQueued = uploadQueue.filter(q => q.type === type && q.status !== 'error').length;
    const maxAllowed = type === 'image' ? MEDIA_CONFIG.maxImagesPerWork : MEDIA_CONFIG.maxVideosPerWork;
    const remainingCapacity = Math.max(0, maxAllowed - currentUploaded - currentActiveQueued);

    if (remainingCapacity <= 0) {
      setErrorMessage(
        `${type === 'image' ? 'Image' : 'Video'} capacity reached (${maxAllowed}/${maxAllowed}). ` +
        `Already stored: ${currentUploaded}${currentActiveQueued > 0 ? `, queued: ${currentActiveQueued}` : ''}. ` +
        `Remove an existing file before selecting more.`
      );
      return;
    }

    let filesToProcess = rawFiles;
    let rejectedOverCapacityCount = 0;

    if (rawFiles.length > remainingCapacity) {
      filesToProcess = rawFiles.slice(0, remainingCapacity);
      rejectedOverCapacityCount = rawFiles.length - remainingCapacity;
    }

    const newQueueItems: QueuedMediaFile[] = [];
    const validationErrors: string[] = [];

    for (const file of filesToProcess) {
      const validation = validateMediaFile(file, type);
      if (!validation.valid) {
        validationErrors.push(`${file.name}: ${validation.error || 'Invalid file format or size'}`);
        continue;
      }

      const previewUrl = type === 'image' ? URL.createObjectURL(file) : undefined;
      newQueueItems.push({
        id: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        file,
        type,
        previewUrl,
        status: 'pending',
      });
    }

    if (newQueueItems.length > 0) {
      setUploadQueue(prev => [...prev, ...newQueueItems]);
    }

    // Inform user of results: accepted vs rejected
    if (rejectedOverCapacityCount > 0 || validationErrors.length > 0) {
      const notices: string[] = [];
      if (rejectedOverCapacityCount > 0) {
        notices.push(`${rejectedOverCapacityCount} file(s) omitted (exceeded remaining limit of ${remainingCapacity}).`);
      }
      if (validationErrors.length > 0) {
        notices.push(`${validationErrors.length} file(s) rejected: ${validationErrors.join(' | ')}`);
      }
      setErrorMessage(`Selection notice: ${notices.join(' ')}`);
      if (newQueueItems.length > 0) {
        showSuccess(`Added ${newQueueItems.length} valid ${type}(s) to upload queue.`);
      }
    } else {
      showSuccess(`Added ${newQueueItems.length} ${type}(s) to upload queue. Click "CONFIRM & UPLOAD ALL" to process.`);
      setErrorMessage(null);
    }
  };

  const handleRemoveFromQueue = (id: string) => {
    if (isBatchProcessing) return;
    setUploadQueue(prev => {
      const target = prev.find(item => item.id === id);
      if (target?.previewUrl) {
        try { URL.revokeObjectURL(target.previewUrl); } catch {}
      }
      return prev.filter(item => item.id !== id);
    });
  };

  const handleClearQueue = () => {
    if (isBatchProcessing) return;
    uploadQueue.forEach(item => {
      if (item.previewUrl) {
        try { URL.revokeObjectURL(item.previewUrl); } catch {}
      }
    });
    setUploadQueue([]);
  };

  const handleExecuteBatchUpload = async () => {
    const itemsToUpload = uploadQueue.filter(q => q.status === 'pending' || q.status === 'error');
    if (itemsToUpload.length === 0 || isBatchProcessing) return;

    setIsBatchProcessing(true);
    setErrorMessage(null);

    let currentMedia = [...mediaList];
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < itemsToUpload.length; i++) {
      const item = itemsToUpload[i];

      // Mark current item as uploading
      setUploadQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'uploading' } : q));
      setUploadingType(item.type);
      setUploadProgressText(
        `Uploading ${i + 1}/${itemsToUpload.length}: ${item.file.name} (${formatBytes(item.file.size)})...`
      );

      const isFirstItem = currentMedia.length === 0 && item.type === 'image';

      try {
        const res = await mediaService.uploadWorkMedia({
          file: item.file,
          entityType,
          entityId,
          type: item.type,
          caption: item.file.name.replace(/\.[^/.]+$/, ''),
          altText: item.file.name.replace(/\.[^/.]+$/, ''),
          isPrimary: isFirstItem,
          currentCount: currentMedia.length,
        });

        if (res.success && res.data) {
          currentMedia = [...currentMedia, res.data];
          setMediaList(currentMedia);
          onMediaChanged?.(currentMedia);
          successCount++;
          // Revoke preview URL if any
          if (item.previewUrl) {
            try { URL.revokeObjectURL(item.previewUrl); } catch {}
          }
          setUploadQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'success' } : q));
        } else {
          failCount++;
          setUploadQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'error', errorMessage: res.error || 'Upload failed' } : q));
        }
      } catch (err: any) {
        failCount++;
        setUploadQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'error', errorMessage: err.message || 'Pipeline error' } : q));
      }
    }

    setUploadingType(null);
    setUploadProgressText(null);
    setIsBatchProcessing(false);

    if (failCount === 0) {
      showSuccess(`Successfully uploaded all ${successCount} file(s)!`);
      // Clear completed items from queue
      setUploadQueue([]);
    } else if (successCount > 0) {
      // Partial success: keep failed items in queue so user can retry, remove succeeded items
      setUploadQueue(prev => prev.filter(q => q.status === 'error'));
      setErrorMessage(`${successCount} file(s) uploaded successfully. ${failCount} file(s) failed. Review errors and click "RETRY FAILED FILES".`);
    } else {
      setErrorMessage(`All ${failCount} file(s) failed to upload. Check connection or storage permissions and retry.`);
    }
  };

  // 2. REPLACEMENT HANDLER
  const handleReplaceSelect = (item: UniversalMediaItem) => {
    setReplacingItem(item);
    if (replaceInputRef.current) {
      replaceInputRef.current.accept = item.type === 'video' ? 'video/mp4,video/webm' : 'image/*';
      replaceInputRef.current.click();
    }
  };

  const handleExecuteReplace = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';

    if (!file || !replacingItem) {
      setReplacingItem(null);
      return;
    }

    const type = replacingItem.type === 'video' ? 'video' : 'image';
    const validation = validateMediaFile(file, type);
    if (!validation.valid) {
      setErrorMessage(validation.error || 'Invalid replacement file.');
      setReplacingItem(null);
      return;
    }

    setUploadingType(type);
    setUploadProgressText(`Replacing ${type}...`);
    setErrorMessage(null);

    try {
      const res = await mediaService.replaceWorkMedia(replacingItem, file, entityType);
      if (res.success && res.data) {
        const updated = mediaList.map(m => (m.id === replacingItem.id ? res.data! : m));
        setMediaList(updated);
        onMediaChanged?.(updated);
        showSuccess(`Successfully replaced with ${file.name}`);
      } else {
        setErrorMessage(res.error || 'Replacement failed.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Replacement failed.');
    } finally {
      setReplacingItem(null);
      setUploadingType(null);
      setUploadProgressText(null);
    }
  };

  // 3. DELETION HANDLER
  const handleDeleteMedia = async (item: UniversalMediaItem) => {
    const label = item.caption || item.type.toUpperCase();
    if (!window.confirm(`Permanently remove this ${item.type} ("${label}")?`)) {
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await mediaService.deleteWorkMedia(item, entityType);
      if (res.success) {
        const updated = mediaList.filter(m => m.id !== item.id);
        setMediaList(updated);
        onMediaChanged?.(updated);
        showSuccess('Media item removed safely.');
      } else {
        setErrorMessage(res.error || 'Failed to delete media item.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Deletion error.');
    } finally {
      setLoading(false);
    }
  };

  // 4. PRIMARY COVER SELECTION
  const handleSetPrimary = async (item: UniversalMediaItem) => {
    if (item.type !== 'image') return;
    setLoading(true);
    try {
      const res = await mediaService.setPrimaryMedia(item, mediaList, entityType);
      if (res.success) {
        const updated = mediaList.map(m => ({ ...m, is_primary: m.id === item.id }));
        setMediaList(updated);
        onMediaChanged?.(updated);
        showSuccess('Set as primary cover photograph.');
      } else {
        setErrorMessage(res.error || 'Failed setting primary media.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Primary update failed.');
    } finally {
      setLoading(false);
    }
  };

  // 5. METADATA SAVE (Caption & Alt Text)
  const handleSaveMetadata = async () => {
    if (!editingItem) return;
    setLoading(true);
    try {
      const res = await mediaService.updateWorkMediaMetadata(editingItem, entityType, {
        caption: captionInput,
        alt_text: altTextInput,
      });

      if (res.success) {
        const updated = mediaList.map(m =>
          m.id === editingItem.id ? { ...m, caption: captionInput, alt_text: altTextInput } : m
        );
        setMediaList(updated);
        onMediaChanged?.(updated);
        setEditingItem(null);
        showSuccess('Metadata updated successfully.');
      } else {
        setErrorMessage(res.error || 'Failed updating metadata.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Metadata save failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: 'rgba(6, 11, 20, 0.75)',
      border: '1px solid var(--border-medium, rgba(148, 163, 184, 0.22))',
      borderRadius: 'var(--radius-md, 12px)',
      padding: '1.5rem',
      marginTop: '1.5rem',
      marginBottom: '1.5rem',
    }}>
      {/* Header with Title and Independent Counters */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '1.25rem',
        borderBottom: '1px solid var(--border-subtle, rgba(148, 163, 184, 0.12))',
        paddingBottom: '1rem',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="vernier-badge" style={{ color: 'var(--accent-cyan, #00e5ff)' }}>
              WORK MEDIA DOSSIER
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)' }}>
              // PHOTOS & SIMULATION RECORDINGS
            </span>
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary, #94a3b8)', marginTop: '4px' }}>
            Upload, replace, and order technical media. Max 10 images (≤15MB) and 3 videos (≤100MB).
          </p>
        </div>

        {/* Live Counters */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {/* Images Counter */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: isImageLimitReached ? 'rgba(239, 68, 68, 0.12)' : 'rgba(0, 229, 255, 0.08)',
            border: `1px solid ${isImageLimitReached ? '#ef4444' : 'var(--border-cyan, rgba(0, 229, 255, 0.35))'}`,
            borderRadius: '6px',
            padding: '4px 10px',
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '0.75rem',
            color: isImageLimitReached ? '#f87171' : 'var(--accent-cyan, #00e5ff)',
          }}>
            <ImageIcon size={14} />
            <span>
              Images: {imageCount} / {MEDIA_CONFIG.maxImagesPerWork}
              {queuedImagesCount > 0 && (
                <span style={{ opacity: 0.85, marginLeft: '4px', fontSize: '0.7rem' }}>
                  (+{queuedImagesCount} staged)
                </span>
              )}
            </span>
          </div>

          {/* Videos Counter */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: isVideoLimitReached ? 'rgba(239, 68, 68, 0.12)' : 'rgba(56, 189, 248, 0.08)',
            border: `1px solid ${isVideoLimitReached ? '#ef4444' : 'rgba(56, 189, 248, 0.35)'}`,
            borderRadius: '6px',
            padding: '4px 10px',
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '0.75rem',
            color: isVideoLimitReached ? '#f87171' : '#38bdf8',
          }}>
            <VideoIcon size={14} />
            <span>
              Videos: {videoCount} / {MEDIA_CONFIG.maxVideosPerWork}
              {queuedVideosCount > 0 && (
                <span style={{ opacity: 0.85, marginLeft: '4px', fontSize: '0.7rem' }}>
                  (+{queuedVideosCount} staged)
                </span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {errorMessage && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          borderRadius: '6px',
          padding: '0.75rem 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#f87171',
          fontSize: '0.8125rem',
          marginBottom: '1rem',
        }}>
          <AlertCircle size={16} />
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} style={{ marginLeft: 'auto', color: '#f87171' }}>
            <X size={14} />
          </button>
        </div>
      )}

      {successMessage && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          borderRadius: '6px',
          padding: '0.75rem 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#34d399',
          fontSize: '0.8125rem',
          marginBottom: '1rem',
        }}>
          <CheckCircle2 size={16} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Upload Action Buttons */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '1.25rem' }}>
        {/* Hidden File Inputs with HTML multiple attribute for batch Windows File Explorer selection */}
        <input
          ref={imageInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/gif"
          style={{ display: 'none' }}
          onChange={(e) => handleFilesSelected(e, 'image')}
        />
        <input
          ref={videoInputRef}
          type="file"
          multiple
          accept="video/mp4,video/webm"
          style={{ display: 'none' }}
          onChange={(e) => handleFilesSelected(e, 'video')}
        />
        <input
          ref={replaceInputRef}
          type="file"
          style={{ display: 'none' }}
          onChange={handleExecuteReplace}
        />

        {/* Upload Image Button */}
        <button
          type="button"
          disabled={isImageLimitReached || isBatchProcessing || uploadingType !== null}
          onClick={() => imageInputRef.current?.click()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 14px',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono, monospace)',
            fontWeight: 600,
            cursor: isImageLimitReached || isBatchProcessing || uploadingType !== null ? 'not-allowed' : 'pointer',
            backgroundColor: isImageLimitReached ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 229, 255, 0.12)',
            border: `1px solid ${isImageLimitReached ? 'rgba(255, 255, 255, 0.1)' : 'var(--border-cyan, rgba(0, 229, 255, 0.4))'}`,
            color: isImageLimitReached ? 'var(--text-muted, #64748b)' : 'var(--accent-cyan, #00e5ff)',
            transition: 'all 0.18s ease',
          }}
          title={isImageLimitReached ? 'Maximum 10 images limit reached. Remove an image to upload another.' : 'Select one or more images (Ctrl+click / Shift+click up to 10 images, max 15MB each)'}
        >
          {uploadingType === 'image' ? <Loader2 size={14} className="anim-rotate-slow" /> : <Upload size={14} />}
          <span>{isImageLimitReached ? 'IMAGE LIMIT REACHED (10/10)' : '+ SELECT PHOTOS (MULTI-FILE)'}</span>
        </button>

        {/* Upload Video Button */}
        <button
          type="button"
          disabled={isVideoLimitReached || isBatchProcessing || uploadingType !== null}
          onClick={() => videoInputRef.current?.click()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 14px',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono, monospace)',
            fontWeight: 600,
            cursor: isVideoLimitReached || isBatchProcessing || uploadingType !== null ? 'not-allowed' : 'pointer',
            backgroundColor: isVideoLimitReached ? 'rgba(255, 255, 255, 0.03)' : 'rgba(56, 189, 248, 0.12)',
            border: `1px solid ${isVideoLimitReached ? 'rgba(255, 255, 255, 0.1)' : 'rgba(56, 189, 248, 0.4)'}`,
            color: isVideoLimitReached ? 'var(--text-muted, #64748b)' : '#38bdf8',
            transition: 'all 0.18s ease',
          }}
          title={isVideoLimitReached ? 'Maximum 3 videos limit reached. Remove a video to upload another.' : 'Select one or more videos (up to 3 videos, max 100MB each)'}
        >
          {uploadingType === 'video' ? <Loader2 size={14} className="anim-rotate-slow" /> : <VideoIcon size={14} />}
          <span>{isVideoLimitReached ? 'VIDEO LIMIT REACHED (3/3)' : '+ SELECT VIDEOS (MULTI-FILE)'}</span>
        </button>

        {uploadProgressText && (
          <span style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '0.75rem',
            color: 'var(--accent-cyan, #00e5ff)',
            marginLeft: 'auto',
          }}>
            <Loader2 size={13} className="anim-rotate-slow" />
            <span>{uploadProgressText}</span>
          </span>
        )}
      </div>

      {/* Staging Queue HUD Panel (Multi-file batch preview, removal & batch upload) */}
      {uploadQueue.length > 0 && (
        <div style={{
          backgroundColor: 'rgba(3, 7, 15, 0.95)',
          border: '1px solid var(--border-cyan, rgba(0, 229, 255, 0.4))',
          borderRadius: '8px',
          padding: '1.25rem',
          marginBottom: '1.5rem',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.6)',
        }}>
          {/* Queue Header & Actions */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '1rem',
            borderBottom: '1px solid rgba(148, 163, 184, 0.15)',
            paddingBottom: '0.75rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="vernier-badge" style={{ color: 'var(--accent-cyan, #00e5ff)' }}>
                STAGING UPLOAD QUEUE
              </span>
              <span style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '0.75rem',
                color: 'var(--text-secondary, #94a3b8)',
              }}>
                [{uploadQueue.length} file(s) staged]
              </span>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                type="button"
                disabled={isBatchProcessing}
                onClick={handleClearQueue}
                style={{
                  background: 'none',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '4px',
                  color: '#f87171',
                  padding: '5px 10px',
                  fontSize: '0.7rem',
                  fontFamily: 'var(--font-mono, monospace)',
                  cursor: isBatchProcessing ? 'not-allowed' : 'pointer',
                  opacity: isBatchProcessing ? 0.5 : 1,
                }}
              >
                CLEAR QUEUE
              </button>

              <button
                type="button"
                disabled={isBatchProcessing}
                onClick={handleExecuteBatchUpload}
                style={{
                  backgroundColor: 'var(--accent-cyan, #00e5ff)',
                  border: 'none',
                  borderRadius: '4px',
                  color: '#03070f',
                  padding: '6px 14px',
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono, monospace)',
                  fontWeight: 700,
                  cursor: isBatchProcessing ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  opacity: isBatchProcessing ? 0.65 : 1,
                  boxShadow: '0 0 12px rgba(0, 229, 255, 0.35)',
                }}
              >
                {isBatchProcessing ? (
                  <>
                    <Loader2 size={13} className="anim-rotate-slow" />
                    <span>UPLOADING BATCH...</span>
                  </>
                ) : (
                  <>
                    <Upload size={13} />
                    <span>START BATCH UPLOAD ({uploadQueue.length})</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Staged Items Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '10px',
          }}>
            {uploadQueue.map((item) => {
              const isErr = item.status === 'error';
              const isDone = item.status === 'success';
              const isUp = item.status === 'uploading';

              return (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    backgroundColor: 'rgba(11, 19, 34, 0.8)',
                    border: `1px solid ${isErr ? '#ef4444' : isDone ? '#10b981' : isUp ? 'var(--accent-cyan, #00e5ff)' : 'rgba(148, 163, 184, 0.15)'}`,
                    borderRadius: '6px',
                    padding: '8px',
                    position: 'relative',
                  }}
                >
                  {/* Thumbnail / Icon */}
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    backgroundColor: '#000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {item.type === 'image' && item.previewUrl ? (
                      <img
                        src={item.previewUrl}
                        alt={item.file.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <VideoIcon size={18} color="#38bdf8" />
                    )}
                  </div>

                  {/* File Metadata */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'var(--text-primary, #f1f5f9)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {item.file.name}
                    </div>
                    <div style={{
                      fontSize: '0.65rem',
                      color: 'var(--text-muted, #64748b)',
                      fontFamily: 'var(--font-mono, monospace)',
                      marginTop: '2px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}>
                      <span>{formatBytes(item.file.size)}</span>
                      <span>•</span>
                      <span style={{
                        color: isErr ? '#f87171' : isDone ? '#34d399' : isUp ? 'var(--accent-cyan, #00e5ff)' : 'var(--text-secondary, #94a3b8)',
                        fontWeight: 600,
                      }}>
                        {isUp ? 'UPLOADING...' : isDone ? 'COMPLETED' : isErr ? 'FAILED' : 'QUEUED'}
                      </span>
                    </div>
                    {item.errorMessage && (
                      <div style={{
                        fontSize: '0.65rem',
                        color: '#f87171',
                        marginTop: '2px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }} title={item.errorMessage}>
                        {item.errorMessage}
                      </div>
                    )}
                  </div>

                  {/* Remove Button */}
                  {!isBatchProcessing && (
                    <button
                      type="button"
                      onClick={() => handleRemoveFromQueue(item.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted, #64748b)',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'color 0.15s ease',
                      }}
                      title="Remove from queue"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Media Thumbnails Grid */}
      {loading && mediaList.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted, #64748b)', fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8rem' }}>
          LOADING MEDIA ARCHIVES...
        </div>
      ) : mediaList.length === 0 ? (
        <div style={{
          border: '1px dashed var(--border-medium, rgba(148, 163, 184, 0.22))',
          borderRadius: '8px',
          padding: '2.5rem 1rem',
          textAlign: 'center',
          color: 'var(--text-muted, #64748b)',
        }}>
          <Upload size={24} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
          <div style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary, #94a3b8)' }}>
            No media attached to this work entry yet
          </div>
          <div style={{ fontSize: '0.75rem', marginTop: '4px' }}>
            Click "+ UPLOAD PHOTO" or "+ UPLOAD VIDEO" above to add project media.
          </div>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '1rem',
        }}>
          {mediaList.map((item, idx) => {
            const isVideo = item.type === 'video';
            const isPrimary = item.is_primary;

            return (
              <div
                key={item.id || idx}
                style={{
                  position: 'relative',
                  backgroundColor: 'rgba(3, 7, 15, 0.9)',
                  border: `1px solid ${isPrimary ? 'var(--accent-cyan, #00e5ff)' : 'var(--border-subtle, rgba(148, 163, 184, 0.15))'}`,
                  borderRadius: '8px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: isPrimary ? '0 0 12px rgba(0, 229, 255, 0.15)' : 'none',
                }}
              >
                {/* Media Preview Box */}
                <div style={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '16/10',
                  backgroundColor: '#000',
                  overflow: 'hidden',
                }}>
                  {isVideo ? (
                    <video
                      src={item.url}
                      preload="metadata"
                      controls
                      playsInline
                      muted
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <img
                      src={item.url}
                      alt={item.alt_text || item.caption || 'Work Preview'}
                      loading="lazy"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      onError={(e) => {
                        // Graceful fallback for broken image links
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="%230b1322"/><text x="50%" y="50%" fill="%2364748b" dominant-baseline="middle" text-anchor="middle" font-family="monospace" font-size="10">IMAGE UNAVAILABLE</text></svg>';
                      }}
                    />
                  )}

                  {/* Primary Cover Badge */}
                  {isPrimary && (
                    <span style={{
                      position: 'absolute',
                      top: '6px',
                      left: '6px',
                      backgroundColor: 'rgba(0, 229, 255, 0.95)',
                      color: '#03070f',
                      fontFamily: 'var(--font-mono, monospace)',
                      fontSize: '9px',
                      fontWeight: 800,
                      padding: '2px 6px',
                      borderRadius: '3px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px',
                      zIndex: 2,
                    }}>
                      <Star size={10} fill="#03070f" />
                      <span>PRIMARY COVER</span>
                    </span>
                  )}

                  {/* Format Badge (PHOTO / VIDEO) */}
                  <span style={{
                    position: 'absolute',
                    top: '6px',
                    right: '6px',
                    backgroundColor: 'rgba(3, 7, 15, 0.85)',
                    color: isVideo ? '#38bdf8' : 'var(--accent-cyan, #00e5ff)',
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '9px',
                    padding: '2px 5px',
                    borderRadius: '3px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    zIndex: 2,
                  }}>
                    {isVideo ? 'VIDEO' : 'PHOTO'}
                  </span>
                </div>

                {/* Media Details */}
                <div style={{ padding: '0.75rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: 'var(--text-primary, #f1f5f9)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      marginBottom: '2px',
                    }}>
                      {item.caption || (isVideo ? 'Video Recording' : 'Photograph')}
                    </div>
                    {item.alt_text && (
                      <div style={{
                        fontSize: '0.7rem',
                        color: 'var(--text-muted, #64748b)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        Alt: {item.alt_text}
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: '0.75rem',
                    paddingTop: '0.5rem',
                    borderTop: '1px solid var(--border-subtle, rgba(148, 163, 184, 0.1))',
                  }}>
                    {/* Primary Star Action (Images only) */}
                    {!isVideo && !isPrimary && (
                      <button
                        type="button"
                        onClick={() => handleSetPrimary(item)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-muted, #64748b)',
                          cursor: 'pointer',
                          padding: '3px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '2px',
                          fontSize: '10px',
                        }}
                        title="Set as primary cover"
                      >
                        <Star size={13} />
                        <span>Cover</span>
                      </button>
                    )}

                    {/* Edit Metadata */}
                    <button
                      type="button"
                      onClick={() => {
                        setEditingItem(item);
                        setCaptionInput(item.caption || '');
                        setAltTextInput(item.alt_text || '');
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-secondary, #94a3b8)',
                        cursor: 'pointer',
                        padding: '3px',
                      }}
                      title="Edit Caption / Alt text"
                    >
                      <Edit3 size={13} />
                    </button>

                    {/* Replace File */}
                    <button
                      type="button"
                      onClick={() => handleReplaceSelect(item)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--accent-cyan, #00e5ff)',
                        cursor: 'pointer',
                        padding: '3px',
                      }}
                      title="Replace file safely"
                    >
                      <RefreshCw size={13} />
                    </button>

                    {/* Delete Item */}
                    <button
                      type="button"
                      onClick={() => handleDeleteMedia(item)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#f87171',
                        cursor: 'pointer',
                        padding: '3px',
                      }}
                      title="Permanently remove"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Metadata Editor Modal */}
      {editingItem && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(3, 7, 15, 0.85)',
          backdropFilter: 'blur(10px)',
          zIndex: 1050,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
        }}>
          <div style={{
            backgroundColor: 'var(--bg-secondary, #0b1322)',
            border: '1px solid var(--border-cyan, rgba(0, 229, 255, 0.4))',
            borderRadius: '10px',
            maxWidth: '460px',
            width: '100%',
            padding: '1.75rem',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.7)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontFamily: 'var(--font-display, sans-serif)', fontSize: '1.1rem', color: 'var(--text-primary, #f1f5f9)' }}>
                Edit Media Telemetry
              </h3>
              <button onClick={() => setEditingItem(null)} style={{ color: 'var(--text-muted, #64748b)' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #94a3b8)' }}>
                CAPTION / TITLE
              </label>
              <input
                type="text"
                value={captionInput}
                onChange={(e) => setCaptionInput(e.target.value)}
                placeholder="FEA Von-Mises Stress Contour Plot"
                className="form-input"
                style={{ width: '100%', marginTop: '4px' }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #94a3b8)' }}>
                ACCESSIBILITY ALT TEXT
              </label>
              <input
                type="text"
                value={altTextInput}
                onChange={(e) => setAltTextInput(e.target.value)}
                placeholder="Finite element stress contours across critical fillet"
                className="form-input"
                style={{ width: '100%', marginTop: '4px' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button type="button" onClick={() => setEditingItem(null)} className="btn-secondary" style={{ fontSize: '0.75rem' }}>
                CANCEL
              </button>
              <button type="button" onClick={handleSaveMetadata} className="btn-primary" style={{ fontSize: '0.75rem' }}>
                SAVE METADATA
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
