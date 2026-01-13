import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

/**
 * Server-only Supabase admin client using service role key.
 * 
 * This client bypasses Row Level Security and should ONLY be used
 * in server-side code (API routes, server actions) for privileged operations
 * like webhook processing.
 * 
 * NEVER import this in client components or expose the service role key.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Check if the admin client can be initialized
 */
export function isAdminClientConfigured(): { ok: true } | { ok: false; error: string } {
  if (!supabaseUrl) {
    return { ok: false, error: 'Missing NEXT_PUBLIC_SUPABASE_URL environment variable' };
  }
  if (!supabaseServiceRoleKey) {
    return { ok: false, error: 'Missing SUPABASE_SERVICE_ROLE_KEY environment variable' };
  }
  return { ok: true };
}

/**
 * Get the Supabase admin client instance.
 * Creates a new client on each call to avoid caching issues in serverless.
 * 
 * @throws Error if env vars are missing
 */
export function getSupabaseAdmin(): SupabaseClient<Database> {
  const configCheck = isAdminClientConfigured();
  if (!configCheck.ok) {
    throw new Error(configCheck.error);
  }

  return createClient<Database>(supabaseUrl!, supabaseServiceRoleKey!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
