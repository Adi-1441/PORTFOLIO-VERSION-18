// ==============================================================================
// ADITHYA MECHNEXUS V18.3 — UNIVERSAL STORAGE & MEDIA MANAGEMENT SERVICE
// Atomic upload flow with rollback on failure. Zero orphan files.
// Handles Projects, CAD & CAE, PLC & Automation, Research, AI Engineering,
// and Dynamic Section CMS items with independent image/video limits.
// ==============================================================================

import { supabase, isSupabaseReady } from '../lib/supabase';
import { ProjectMedia, MediaType } from '../types/database';
import { MEDIA_CONFIG, validateMediaFile } from '../config/media.config';

export interface UniversalMediaItem {
  id: string;
  parentId: string;
  type: 'image' | 'video' | 'document' | 'report';
  url: string;
  storage_path: string | null;
  caption?: string | null;
  alt_text?: string | null;
  is_primary: boolean;
  display_order: number;
  enabled: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UploadWorkMediaParams {
  file: File;
  entityType: 'projects' | 'cad_cae' | 'plc' | 'research' | 'ai_engineering' | 'section_item';
  entityId: string;
  type: 'image' | 'video';
  caption?: string;
  altText?: string;
  isPrimary?: boolean;
  currentCount?: number;
}

export const mediaService = {
  /**
   * Fetch all media items associated with a given work item
   */
  async getWorkMedia(
    entityType: 'projects' | 'cad_cae' | 'plc' | 'research' | 'ai_engineering' | 'section_item',
    entityId: string
  ): Promise<UniversalMediaItem[]> {
    if (!isSupabaseReady() || !entityId) return [];

    const mapping = MEDIA_CONFIG.mappings[entityType];
    if (!mapping) return [];

    // Special handler for dynamic CMS section items (stored in metadata.gallery JSONB)
    if (entityType === 'section_item') {
      try {
        const { data, error } = await supabase
          .from('portfolio_content_items')
          .select('id, metadata, media_url, media_type')
          .eq('id', entityId)
          .maybeSingle();

        if (error || !data) return [];
        const gallery = data.metadata?.gallery;
        if (Array.isArray(gallery)) {
          return gallery as UniversalMediaItem[];
        }
        // Fallback: If only media_url was set historically, convert it to a media item
        if (data.media_url) {
          return [{
            id: `${entityId}-legacy`,
            parentId: entityId,
            type: (data.media_type as any) || 'image',
            url: data.media_url,
            storage_path: null,
            caption: 'Primary Media',
            alt_text: 'Primary Media',
            is_primary: true,
            display_order: 0,
            enabled: true,
          }];
        }
        return [];
      } catch {
        return [];
      }
    }

    // Standard relational media tables (project_media, cad_cae_media, etc.)
    try {
      const { data, error } = await supabase
        .from(mapping.table!)
        .select('*')
        .eq(mapping.foreignKey!, entityId)
        .eq('enabled', true)
        .order('display_order', { ascending: true });

      if (error || !data) return [];

      return data.map((row: any) => ({
        id: row.id,
        parentId: row[mapping.foreignKey!],
        type: row.type,
        url: row.url,
        storage_path: row.storage_path,
        caption: row.caption,
        alt_text: row.alt_text,
        is_primary: row.is_primary ?? false,
        display_order: row.display_order ?? 0,
        enabled: row.enabled ?? true,
        created_at: row.created_at,
        updated_at: row.updated_at,
      }));
    } catch (err) {
      console.error(`[MEDIA FETCH ERROR] ${entityType}:`, err);
      return [];
    }
  },

  /**
   * Upload and attach a media file (image or video) to a work item
   */
  async uploadWorkMedia(
    params: UploadWorkMediaParams
  ): Promise<{ success: boolean; data?: UniversalMediaItem; error?: string }> {
    const { file, entityType, entityId, type, caption, altText, isPrimary = false } = params;

    // 1. Validation: File Existence
    if (!file) {
      return { success: false, error: 'No file provided for upload.' };
    }

    // 2. Validation: Type & Size Caps
    const validation = validateMediaFile(file, type);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const mapping = MEDIA_CONFIG.mappings[entityType];
    if (!mapping) {
      return { success: false, error: `Unrecognized section type: ${entityType}` };
    }

    // Offline / Preview fallback
    if (!isSupabaseReady()) {
      const mockUrl = URL.createObjectURL(file);
      const mockItem: UniversalMediaItem = {
        id: `mock-${Date.now()}`,
        parentId: entityId,
        type,
        url: mockUrl,
        storage_path: `${entityId}/${Date.now()}_${file.name}`,
        caption: caption || file.name,
        alt_text: altText || file.name,
        is_primary: isPrimary,
        display_order: params.currentCount || 0,
        enabled: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return { success: true, data: mockItem };
    }

    // 3. Storage Upload
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `${entityId || 'general'}/${Date.now()}_${cleanFileName}`;

    try {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(mapping.bucket)
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError || !uploadData) {
        console.error('[STORAGE UPLOAD FAILED]', uploadError);
        return { success: false, error: `Storage upload failed: ${uploadError?.message}` };
      }

      // 4. Retrieve Public URL
      const { data: urlData } = supabase.storage
        .from(mapping.bucket)
        .getPublicUrl(uploadData.path);

      const publicUrl = urlData.publicUrl;

      // 5. Database Save (Atomic: with rollback if DB insert fails)
      if (entityType === 'section_item') {
        // Save to portfolio_content_items metadata.gallery
        try {
          const { data: itemData, error: fetchErr } = await supabase
            .from('portfolio_content_items')
            .select('id, metadata, media_url')
            .eq('id', entityId)
            .single();

          if (fetchErr || !itemData) {
            // Rollback Storage upload
            await supabase.storage.from(mapping.bucket).remove([uploadData.path]);
            return { success: false, error: `Content item not found: ${fetchErr?.message}` };
          }

          const existingGallery: UniversalMediaItem[] = Array.isArray(itemData.metadata?.gallery)
            ? itemData.metadata.gallery
            : [];

          const newItem: UniversalMediaItem = {
            id: `media-${Date.now()}`,
            parentId: entityId,
            type,
            url: publicUrl,
            storage_path: uploadData.path,
            caption: caption || file.name,
            alt_text: altText || file.name,
            is_primary: isPrimary || existingGallery.length === 0,
            display_order: existingGallery.length,
            enabled: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          const updatedGallery = [...existingGallery, newItem];
          const newMetadata = { ...itemData.metadata, gallery: updatedGallery };

          const updates: any = { metadata: newMetadata };
          if (newItem.is_primary) {
            updates.media_url = publicUrl;
            updates.media_type = type;
          }

          const { error: updateErr } = await supabase
            .from('portfolio_content_items')
            .update(updates)
            .eq('id', entityId);

          if (updateErr) {
            // Rollback Storage upload
            await supabase.storage.from(mapping.bucket).remove([uploadData.path]);
            return { success: false, error: `Database save failed: ${updateErr.message}` };
          }

          return { success: true, data: newItem };
        } catch (dbErr: any) {
          await supabase.storage.from(mapping.bucket).remove([uploadData.path]);
          return { success: false, error: dbErr.message || 'Failed saving metadata to content item' };
        }
      }

      // Standard relational tables (project_media, cad_cae_media, plc_media, etc.)
      const insertPayload: any = {
        [mapping.foreignKey!]: entityId,
        type,
        url: publicUrl,
        storage_path: uploadData.path,
        caption: caption || file.name,
        alt_text: altText || file.name,
        is_primary: isPrimary,
        display_order: params.currentCount || 0,
        enabled: true,
      };

      const { data: dbData, error: dbError } = await supabase
        .from(mapping.table!)
        .insert([insertPayload])
        .select()
        .single();

      if (dbError) {
        console.error('[DB MEDIA RECORD FAILED — INITIATING STORAGE ROLLBACK]', dbError);
        // Rollback storage upload to prevent orphan file
        await supabase.storage.from(mapping.bucket).remove([uploadData.path]);
        return { success: false, error: `Database record creation failed: ${dbError.message}` };
      }

      const createdItem: UniversalMediaItem = {
        id: dbData.id,
        parentId: entityId,
        type: dbData.type,
        url: dbData.url,
        storage_path: dbData.storage_path,
        caption: dbData.caption,
        alt_text: dbData.alt_text,
        is_primary: dbData.is_primary,
        display_order: dbData.display_order,
        enabled: dbData.enabled,
        created_at: dbData.created_at,
        updated_at: dbData.updated_at,
      };

      return { success: true, data: createdItem };
    } catch (err: any) {
      return { success: false, error: err.message || 'Media upload pipeline failed.' };
    }
  },

  /**
   * Delete a single media item and its Storage object safely
   */
  async deleteWorkMedia(
    item: UniversalMediaItem,
    entityType: 'projects' | 'cad_cae' | 'plc' | 'research' | 'ai_engineering' | 'section_item'
  ): Promise<{ success: boolean; error?: string }> {
    if (!item) return { success: true };
    const mapping = MEDIA_CONFIG.mappings[entityType];
    if (!mapping) return { success: false, error: 'Unknown entity mapping' };

    if (!isSupabaseReady()) {
      return { success: true };
    }

    try {
      // 1. Delete database record
      if (entityType === 'section_item') {
        const { data: itemData, error: fetchErr } = await supabase
          .from('portfolio_content_items')
          .select('id, metadata, media_url')
          .eq('id', item.parentId)
          .single();

        if (!fetchErr && itemData) {
          const gallery: UniversalMediaItem[] = itemData.metadata?.gallery || [];
          const updated = gallery.filter(g => g.id !== item.id);
          const updates: any = { metadata: { ...itemData.metadata, gallery: updated } };
          if (itemData.media_url === item.url) {
            updates.media_url = updated[0]?.url || null;
          }
          await supabase.from('portfolio_content_items').update(updates).eq('id', item.parentId);
        }
      } else {
        const { error: dbError } = await supabase
          .from(mapping.table!)
          .delete()
          .eq('id', item.id);

        if (dbError) {
          return { success: false, error: `Failed to remove database record: ${dbError.message}` };
        }
      }

      // 2. Remove Storage object
      if (item.storage_path) {
        await supabase.storage.from(mapping.bucket).remove([item.storage_path]);
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Media deletion failed' };
    }
  },

  /**
   * Replace a media item with a new file safely (validate before removing old)
   */
  async replaceWorkMedia(
    oldItem: UniversalMediaItem,
    newFile: File,
    entityType: 'projects' | 'cad_cae' | 'plc' | 'research' | 'ai_engineering' | 'section_item'
  ): Promise<{ success: boolean; data?: UniversalMediaItem; error?: string }> {
    // 1. Upload new file first
    const uploadRes = await this.uploadWorkMedia({
      file: newFile,
      entityType,
      entityId: oldItem.parentId,
      type: oldItem.type === 'video' ? 'video' : 'image',
      caption: oldItem.caption || newFile.name,
      altText: oldItem.alt_text || newFile.name,
      isPrimary: oldItem.is_primary,
      currentCount: oldItem.display_order,
    });

    if (!uploadRes.success || !uploadRes.data) {
      return { success: false, error: `Replacement failed: ${uploadRes.error}` };
    }

    // 2. Safely remove old item only after new item succeeded
    await this.deleteWorkMedia(oldItem, entityType);

    return { success: true, data: uploadRes.data };
  },

  /**
   * Update caption, alt text, or primary status for an existing media item
   */
  async updateWorkMediaMetadata(
    item: UniversalMediaItem,
    entityType: 'projects' | 'cad_cae' | 'plc' | 'research' | 'ai_engineering' | 'section_item',
    updates: Partial<UniversalMediaItem>
  ): Promise<{ success: boolean; error?: string }> {
    const mapping = MEDIA_CONFIG.mappings[entityType];
    if (!mapping || !isSupabaseReady()) return { success: true };

    try {
      if (entityType === 'section_item') {
        const { data: itemData, error: fetchErr } = await supabase
          .from('portfolio_content_items')
          .select('id, metadata')
          .eq('id', item.parentId)
          .single();

        if (fetchErr || !itemData) return { success: false, error: fetchErr?.message };
        const gallery: UniversalMediaItem[] = itemData.metadata?.gallery || [];
        const updated = gallery.map(g => (g.id === item.id ? { ...g, ...updates } : g));
        await supabase
          .from('portfolio_content_items')
          .update({ metadata: { ...itemData.metadata, gallery: updated } })
          .eq('id', item.parentId);
        return { success: true };
      }

      const { error } = await supabase
        .from(mapping.table!)
        .update({
          caption: updates.caption,
          alt_text: updates.alt_text,
          is_primary: updates.is_primary,
          display_order: updates.display_order,
        })
        .eq('id', item.id);

      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  /**
   * Set an image as primary thumbnail and update parent work item if applicable
   */
  async setPrimaryMedia(
    item: UniversalMediaItem,
    allItems: UniversalMediaItem[],
    entityType: 'projects' | 'cad_cae' | 'plc' | 'research' | 'ai_engineering' | 'section_item'
  ): Promise<{ success: boolean; error?: string }> {
    const mapping = MEDIA_CONFIG.mappings[entityType];
    if (!mapping || !isSupabaseReady()) return { success: true };

    try {
      // 1. Reset is_primary on other items and set on selected item
      for (const media of allItems) {
        const isCurrent = media.id === item.id;
        await this.updateWorkMediaMetadata(media, entityType, { is_primary: isCurrent });
      }

      // 2. Also update parent work table's thumbnail_url if the table supports it
      const parentTableMap: Record<string, string> = {
        projects: 'projects',
        cad_cae: 'cad_cae',
        plc: 'plc_automation',
        research: 'research',
        ai_engineering: 'ai_engineering',
      };

      const parentTable = parentTableMap[entityType];
      if (parentTable) {
        await supabase
          .from(parentTable)
          .update({ thumbnail_url: item.url })
          .eq('id', item.parentId);
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // ============================================================================
  // Backward-compatible delegates for ProfileEditor and existing modules
  // ============================================================================
  async uploadProjectMedia(params: any): Promise<{ success: boolean; data?: ProjectMedia; error?: string }> {
    const res = await this.uploadWorkMedia({
      file: params.file,
      entityType: 'projects',
      entityId: params.projectId || '',
      type: params.type || 'image',
      caption: params.caption,
      altText: params.altText,
      isPrimary: params.isPrimary,
    });
    return { success: res.success, data: res.data as any, error: res.error };
  },

  async deleteProjectMedia(media: ProjectMedia, bucket: string = 'project-media'): Promise<{ success: boolean; error?: string }> {
    return this.deleteWorkMedia(
      {
        id: media.id,
        parentId: media.project_id,
        type: media.type,
        url: media.url,
        storage_path: media.storage_path,
        caption: media.caption,
        alt_text: media.alt_text,
        is_primary: media.is_primary,
        display_order: media.display_order,
        enabled: media.enabled,
      },
      'projects'
    );
  },

  async uploadAsset(params: {
    file: File;
    bucket: string;
    folder?: string;
  }): Promise<{ success: boolean; publicUrl?: string; storagePath?: string; error?: string }> {
    const { file, bucket, folder = 'general' } = params;

    if (!file) return { success: false, error: 'No file provided for upload.' };

    const maxSize = 25 * 1024 * 1024;
    if (file.size > maxSize) {
      return { success: false, error: 'File size exceeds 25MB limit.' };
    }

    if (!isSupabaseReady()) {
      const objectUrl = URL.createObjectURL(file);
      return { success: true, publicUrl: objectUrl, storagePath: `${folder}/${file.name}` };
    }

    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `${folder}/${Date.now()}_${cleanFileName}`;

    try {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(storagePath, file, { cacheControl: '3600', upsert: true });

      if (uploadError || !uploadData) {
        return { success: false, error: `Upload failed: ${uploadError?.message}` };
      }

      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(uploadData.path);

      return {
        success: true,
        publicUrl: urlData.publicUrl,
        storagePath: uploadData.path,
      };
    } catch (err: any) {
      return { success: false, error: err.message || 'Storage upload failed.' };
    }
  },

  async deleteAsset(bucket: string, storagePath: string): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseReady() || !storagePath) return { success: true };
    try {
      const { error } = await supabase.storage.from(bucket).remove([storagePath]);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },
};
