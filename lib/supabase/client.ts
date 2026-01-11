import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

/**
 * Supabase client for server-side operations
 * 
 * Uses service role key for full database access in API routes and server components.
 * For client-side operations, create a separate client with the anon key.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
}

if (!supabaseServiceKey) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
}

/**
 * Server-side Supabase client with service role privileges
 * Use this for API routes and server components that need full database access
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * Create a Supabase client with the anon key for client-side operations
 * This has Row Level Security (RLS) applied
 */
export function createAnonClient() {
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
  }
  
  if (!anonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
  }
  
  return createClient<Database>(supabaseUrl, anonKey);
}
