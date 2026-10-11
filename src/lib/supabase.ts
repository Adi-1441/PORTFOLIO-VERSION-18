// ==============================================================================
// ADITHYA MECHNEXUS V18.0 — SUPABASE CLIENT SINGLETON
// Real production Supabase client with diagnostics.
// ==============================================================================

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ENV } from '../env';

let client: SupabaseClient | null = null;

if (ENV.isConfigured) {
  try {
    client = createClient(ENV.supabaseUrl, ENV.supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'mechnexus-v18-auth-session',
      },
    });
  } catch (err) {
    console.error('[MECHNEXUS SUPABASE INIT ERROR]', err);
    client = null;
  }
} else {
  // Mock dummy client for unconfigured state to prevent crash before .env setup
  client = createClient('https://placeholder.supabase.co', 'placeholder-key', {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export const supabase = client as SupabaseClient;

export function isSupabaseReady(): boolean {
  return ENV.isConfigured && Boolean(client);
}
