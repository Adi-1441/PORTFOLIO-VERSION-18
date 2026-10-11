// ==============================================================================
// ADITHYA MECHNEXUS V18.2 — CONTACT MESSAGES SERVICE
// Upgraded: Routes submissions through Supabase Edge Function for
// server-side DB insert + email notification. Falls back to direct
// DB insert if Edge Function is not deployed yet.
// Public users can only INSERT. Admin possesses read/update/delete clearance.
// ==============================================================================

import { supabase, isSupabaseReady } from '../lib/supabase';
import { ContactMessage } from '../types/database';

export interface SubmitContactPayload {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

export const contactService = {
  /**
   * Submit a contact message.
   * Primary path: Supabase Edge Function (insert + email notification).
   * Fallback path: Direct Supabase table insert (no email, but message saved).
   */
  async submitMessage(payload: SubmitContactPayload): Promise<{ success: boolean; error?: string; emailSent?: boolean }> {
    if (!payload.name || !payload.email || !payload.message) {
      return { success: false, error: 'Name, email, and message are required fields.' };
    }

    if (!isSupabaseReady()) {
      // In offline/preview mode, log to console and simulate successful queue
      console.log('[LOCAL CONTACT QUEUE (OFFLINE PREVIEW)]:', payload);
      return { success: true, emailSent: false };
    }

    // ── Primary Path: Edge Function (Insert + Email) ─────────────────────
    try {
      const { data, error } = await supabase.functions.invoke('send-contact-email', {
        body: {
          name: payload.name.trim(),
          email: payload.email.trim(),
          subject: payload.subject?.trim() || '',
          message: payload.message.trim(),
        },
      });

      if (error) {
        console.warn('[EDGE FUNCTION INVOKE ERROR]', error);
        // Check if the Edge Function responded with a structured error (e.g. 400 validation, 429 rate limit)
        if ('context' in error && (error as any).context) {
          try {
            const errContext = (error as any).context;
            if (typeof errContext?.json === 'function') {
              const errJson = await errContext.json();
              if (errJson?.error) {
                return { success: false, error: errJson.error, emailSent: false };
              }
            }
          } catch {
            // Non-JSON response context; fall through to fallback
          }
        }
        // Fall through to fallback path if function is unrouted / offline
      } else if (data?.success) {
        return {
          success: true,
          emailSent: data.email_sent ?? false,
        };
      } else if (data && !data.success) {
        // Edge function responded with a validation or server error
        return { success: false, error: data.error || 'Transmission failed via secure channel.', emailSent: false };
      }
    } catch (edgeFnError: any) {
      console.warn('[EDGE FUNCTION UNAVAILABLE]', edgeFnError?.message || edgeFnError);
      // Fall through to direct insert fallback
    }

    // ── Fallback Path: Direct DB Insert (No Email Notification) ──────────
    console.log('[CONTACT FALLBACK] Edge Function unavailable — using direct insert.');
    try {
      const { error } = await supabase.from('contact_messages').insert([{
        name: payload.name.trim(),
        email: payload.email.trim(),
        subject: payload.subject?.trim() || 'Engineering Consultation Inquiry',
        message: payload.message.trim(),
      }]);

      if (error) {
        console.error('[CONTACT SUBMISSION ERROR]', error);
        return { success: false, error: error.message };
      }

      return { success: true, emailSent: false };
    } catch (err: any) {
      return { success: false, error: err.message || 'Transmission failed.' };
    }
  },

  async getMessages(): Promise<{ data: ContactMessage[]; error?: string }> {
    if (!isSupabaseReady()) {
      return { data: [] };
    }

    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return { data: [], error: error.message };
      }

      return { data: (data as ContactMessage[]) || [] };
    } catch (err: any) {
      return { data: [], error: err.message };
    }
  },

  async markAsRead(id: string, read: boolean = true): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseReady()) return { success: true };

    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ read })
        .eq('id', id);

      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async deleteMessage(id: string): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseReady()) return { success: true };

    try {
      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', id);

      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },
};
