// ==============================================================================
// ADITHYA MECHNEXUS V18.3 — CENTRALIZED UNIVERSAL MEDIA CONFIGURATION
// Configurable limits, file sizes, MIME types, and section-to-bucket mappings.
// Initial Defaults: 10 images, 3 videos per work item.
// ==============================================================================

export interface MediaSectionMapping {
  entityType: 'projects' | 'cad_cae' | 'plc' | 'research' | 'ai_engineering' | 'section_item';
  bucket: string;
  table?: string;
  foreignKey?: string;
  label: string;
}

export const MEDIA_CONFIG = {
  // Configurable media count limits per individual work item
  maxImagesPerWork: 10,
  maxVideosPerWork: 3,

  // Configurable file size limits (bytes)
  maxImageSizeBytes: 15 * 1024 * 1024, // 15MB
  maxVideoSizeBytes: 100 * 1024 * 1024, // 100MB

  // Supported MIME types and extensions
  allowedImageMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
  ] as string[],

  allowedVideoMimeTypes: [
    'video/mp4',
    'video/webm',
  ] as string[],

  // Number of preview thumbnails displayed in the public card before "VIEW ALL IMAGES"
  previewImagesCount: 3,

  // Section entity mappings to Supabase Storage buckets & database tables
  mappings: {
    projects: {
      entityType: 'projects',
      bucket: 'project-media',
      table: 'project_media',
      foreignKey: 'project_id',
      label: 'Engineering Project',
    },
    cad_cae: {
      entityType: 'cad_cae',
      bucket: 'cad-cae-media',
      table: 'cad_cae_media',
      foreignKey: 'cad_cae_id',
      label: 'CAD & CAE Simulation',
    },
    plc: {
      entityType: 'plc',
      bucket: 'plc-media',
      table: 'plc_media',
      foreignKey: 'plc_id',
      label: 'PLC & Automation Logic',
    },
    research: {
      entityType: 'research',
      bucket: 'research-media',
      table: 'research_media',
      foreignKey: 'research_id',
      label: 'Applied Research Paper',
    },
    ai_engineering: {
      entityType: 'ai_engineering',
      bucket: 'ai-eng-media',
      table: 'ai_engineering_media',
      foreignKey: 'ai_engineering_id',
      label: 'AI × Engineering Model',
    },
    section_item: {
      entityType: 'section_item',
      bucket: 'section-media',
      table: 'portfolio_content_items',
      foreignKey: 'id',
      label: 'Dynamic CMS Section Item',
    },
  } as Record<string, MediaSectionMapping>,
};

/**
 * Format bytes to readable string (e.g. 15 MB)
 */
export const formatBytes = (bytes: number, decimals: number = 1): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

/**
 * Validate an uploaded media file against size and MIME restrictions
 */
export const validateMediaFile = (
  file: File,
  type: 'image' | 'video'
): { valid: boolean; error?: string } => {
  if (!file) {
    return { valid: false, error: 'No file provided for upload.' };
  }

  if (type === 'image') {
    // Check MIME type
    const isImageMime = MEDIA_CONFIG.allowedImageMimeTypes.includes(file.type);
    const hasImageExt = /\.(jpe?g|png|webp|gif)$/i.test(file.name);
    if (!isImageMime && !hasImageExt) {
      return {
        valid: false,
        error: `Unsupported image format (${file.type || 'unknown'}). Supported formats: JPEG, PNG, WebP, GIF.`,
      };
    }

    // Check size limit (15MB)
    if (file.size > MEDIA_CONFIG.maxImageSizeBytes) {
      return {
        valid: false,
        error: `Image exceeds maximum allowed size of ${formatBytes(MEDIA_CONFIG.maxImageSizeBytes)} (selected: ${formatBytes(file.size)}).`,
      };
    }
  } else if (type === 'video') {
    // Check MIME type
    const isVideoMime = MEDIA_CONFIG.allowedVideoMimeTypes.includes(file.type);
    const hasVideoExt = /\.(mp4|webm)$/i.test(file.name);
    if (!isVideoMime && !hasVideoExt) {
      return {
        valid: false,
        error: `Unsupported video format (${file.type || 'unknown'}). Supported formats: MP4, WebM.`,
      };
    }

    // Check size limit (100MB)
    if (file.size > MEDIA_CONFIG.maxVideoSizeBytes) {
      return {
        valid: false,
        error: `Video exceeds maximum allowed size of ${formatBytes(MEDIA_CONFIG.maxVideoSizeBytes)} (selected: ${formatBytes(file.size)}).`,
      };
    }
  }

  return { valid: true };
};
