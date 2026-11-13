import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = (import.meta.env.VITE_SUPABASE_URL ?? '').trim();
const anon = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim();

// Read the address BEFORE the client starts: the client removes the login-link tokens from the address bar.
const startHash = typeof window !== 'undefined' ? window.location.hash : '';
/** true when the visitor arrived from a "reset password" email link */
export const startedInRecovery = /[#&]type=recovery(&|$)/.test(startHash);
/** true when the email link was expired or already used */
export const authLinkError = /[#&]error(_code)?=/.test(startHash);

/** null when the two environment variables are missing. Only the public anon key is ever used here. */
export const supabase: SupabaseClient | null = url && anon ? createClient(url, anon) : null;
export const isConfigured = supabase !== null;
export const supabaseUrl = url;
export const supabaseAnonKey = anon;
