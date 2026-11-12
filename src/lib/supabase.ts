import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = (import.meta.env.VITE_SUPABASE_URL ?? '').trim();
const anon = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim();

/** null when the two environment variables are missing. Only the public anon key is ever used here. */
export const supabase: SupabaseClient | null = url && anon ? createClient(url, anon) : null;
export const isConfigured = supabase !== null;
export const supabaseUrl = url;
export const supabaseAnonKey = anon;
