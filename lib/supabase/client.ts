import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

/**
 * Supabase client for server-side operations
 * 
 * Reads credentials from environment variables.
 * Fails gracefully with clear error messages if env vars are missing.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let _supabase: SupabaseClient<Database> | null = null;
let _initError: string | null = null;

// Check for missing env vars at module load
if (!supabaseUrl) {
  _initError = 'Missing NEXT_PUBLIC_SUPABASE_URL environment variable';
} else if (!supabaseAnonKey) {
  _initError = 'Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable';
} else {
  _supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Get the Supabase client instance
 * Throws a descriptive error if env vars are missing
 */
export function getSupabase(): SupabaseClient<Database> {
  if (_initError) {
    throw new Error(_initError);
  }
  if (!_supabase) {
    throw new Error('Supabase client not initialized');
  }
  return _supabase;
}

/**
 * Check if Supabase is properly configured
 */
export function isSupabaseConfigured(): { ok: boolean; error?: string } {
  if (_initError) {
    return { ok: false, error: _initError };
  }
  return { ok: true };
}
