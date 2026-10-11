// ==============================================================================
// ADITHYA MECHNEXUS V18.0 — STORAGE & MEDIA MANAGEMENT SERVICE
// Atomic upload flow with rollback on failure. Zero orphan files.
// ==============================================================================

import { supabase, isSupabaseReady } from '../lib/supabase';
import { ProjectMedia, MediaType } from '../types/database';

export interface UploadMediaParams {
  file: File;
  bucket: string;
  projectId?: string;
  type?: MediaType;
  caption?: string;
  altText?: string;
  isPrimary?: boolean;
}

export const mediaService = {
  async uploadProjectMedia(params: UploadMediaParams): Promise<{ success: boolean; data?: ProjectMedia; error?: string }> {
    const { file, bucket, projectId, type = 'image', caption, altText, isPrimary = false } = params;

    if (!file) {
      return { success: false, error: 'No file provided for upload.' };
    }

    // 1. File Validation
    const maxSize = 25 * 1024 * 1024; // 25MB limit
    if (file.size > maxSize) {
      return { success: false, error: 'File size exceeds the 25MB engineering upload limit.' };
    }

    if (!isSupabaseReady()) {
      return { success: false, error: 'Supabase storage connection is not configured in .env.' };
    }

    // 2. Storage Upload
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'dat';
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `${projectId || 'general'}/${Date.now()}_${cleanFileName}`;

    try {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError || !uploadData) {
        console.error('[STORAGE UPLOAD FAILED]', uploadError);
        return { success: false, error: `Storage upload failed: ${uploadError?.message}` };
      }

      // 3. Get Public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(uploadData.path);

      const publicUrl = urlData.publicUrl;

      // 4. Create Database Record (if projectId is specified)
      if (projectId) {
        const { data: dbData, error: dbError } = await supabase
          .from('project_media')
          .insert([{
            project_id: projectId,
            type,
            url: publicUrl,
            storage_path: uploadData.path,
            caption: caption || file.name,
            alt_text: altText || file.name,
            is_primary: isPrimary,
            display_order: 0,
            enabled: true,
          }])
          .select()
          .single();

        if (dbError) {
          console.error('[DB MEDIA RECORD FAILED — INITIATING STORAGE ROLLBACK]', dbError);
          // Rollback storage upload to prevent orphan file
          await supabase.storage.from(bucket).remove([uploadData.path]);
          return { success: false, error: `Database link creation failed: ${dbError.message}` };
        }

        return { success: true, data: dbData as ProjectMedia };
      }

      return {
        success: true,
        data: {
          id: 'temp',
          project_id: projectId || '',
          type,
          url: publicUrl,
          storage_path: uploadData.path,
          caption: caption || file.name,
          alt_text: altText || file.name,
          is_primary: isPrimary,
          display_order: 0,
          enabled: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      };
    } catch (err: any) {
      return { success: false, error: err.message || 'Media upload pipeline failed.' };
    }
  },

  async deleteProjectMedia(media: ProjectMedia, bucket: string = 'project-media'): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseReady()) return { success: true };

    try {
      // 1. Remove from database
      const { error: dbError } = await supabase
        .from('project_media')
        .delete()
        .eq('id', media.id);

      if (dbError) {
        return { success: false, error: dbError.message };
      }

      // 2. Remove from Storage if storage_path is present
      if (media.storage_path) {
        await supabase.storage.from(bucket).remove([media.storage_path]);
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async uploadAsset(params: {
    file: File;
    bucket: string;
    folder?: string;
  }): Promise<{ success: boolean; publicUrl?: string; storagePath?: string; error?: string }> {
    const { file, bucket, folder = 'general' } = params;

    if (!file) {
      return { success: false, error: 'No file provided for upload.' };
    }

    const maxSize = 25 * 1024 * 1024; // 25MB
    if (file.size > maxSize) {
      return { success: false, error: 'File size exceeds 25MB limit.' };
    }

    if (!isSupabaseReady()) {
      // Local fallback for offline/preview environments
      const objectUrl = URL.createObjectURL(file);
      return { success: true, publicUrl: objectUrl, storagePath: `${folder}/${file.name}` };
    }

    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `${folder}/${Date.now()}_${cleanFileName}`;

    try {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError || !uploadData) {
        return { success: false, error: `Upload failed: ${uploadError?.message}` };
      }

      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(uploadData.path);

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

