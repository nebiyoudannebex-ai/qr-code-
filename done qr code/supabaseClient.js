import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Prefer service role on the server so backend routes can read/write without RLS friction.
const serverKey = supabaseServiceRoleKey || supabaseAnonKey;

export const supabase = supabaseUrl && serverKey
  ? createClient(supabaseUrl, serverKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

export function hasSupabaseConfig() {
  return Boolean(supabaseUrl && serverKey);
}

export function getSupabaseConfigError() {
  if (!supabaseUrl) {
    return 'SUPABASE_URL is not set.';
  }
  if (!serverKey) {
    return 'SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY must be set.';
  }
  return null;
}
