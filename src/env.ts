// ==============================================================================
// ADITHYA MECHNEXUS V18.0 — ENVIRONMENT VALIDATION & DIAGNOSTICS
// Strict startup checking. Zero silent failures.
// ==============================================================================

export interface EnvConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  siteUrl: string;
  isConfigured: boolean;
  missingVariables: string[];
}

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
const siteUrl = (import.meta.env.VITE_SITE_URL || 'http://localhost:5173').trim();

const missing: string[] = [];
if (!supabaseUrl) missing.push('VITE_SUPABASE_URL');
if (!supabaseAnonKey) missing.push('VITE_SUPABASE_ANON_KEY');

export const ENV: EnvConfig = {
  supabaseUrl,
  supabaseAnonKey,
  siteUrl,
  isConfigured: missing.length === 0,
  missingVariables: missing,
};

export function validateEnv(): boolean {
  if (!ENV.isConfigured) {
    console.warn(
      `[MECHNEXUS ENV ALERT] Missing required Supabase configuration: ${ENV.missingVariables.join(', ')}. ` +
      `System will load with fallback local seed state until production credentials are provided in .env.`
    );
    return false;
  }
  return true;
}
