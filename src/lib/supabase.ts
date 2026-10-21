import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** Null until the public Supabase URL and anon key are provided at build time. */
export const supabase: SupabaseClient | null = url && anonKey ? createClient(url, anonKey) : null;
export const backendReady = supabase !== null;

export const db = () => {
  if (!supabase) throw new Error('The backend is not configured yet.');
  return supabase;
};

/** Unwraps a Supabase response, throwing a readable error. */
export async function q<T>(p: PromiseLike<{ data: T | null; error: { message: string } | null }>): Promise<T> {
  const { data, error } = await p;
  if (error) throw new Error(cleanError(error.message));
  return data as T;
}

const cleanError = (m: string) =>
  m.includes('no_double_booking') ? 'That time was just taken. Please pick another slot.' : m;
