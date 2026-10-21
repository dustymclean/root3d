import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Profile } from '../lib/types';

type AuthState = {
  profile: Profile | null;
  ready: boolean;
  init: () => void;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};

async function loadProfile(): Promise<Profile | null> {
  if (!supabase) return null;
  const { data: session } = await supabase.auth.getSession();
  const uid = session.session?.user.id;
  if (!uid) return null;
  const { data } = await supabase.from('profiles').select('*').eq('id', uid).maybeSingle();
  return (data as Profile) ?? null;
}

export const useAuth = create<AuthState>((set, get) => ({
  profile: null,
  ready: false,
  init: () => {
    if (!supabase) {
      set({ ready: true });
      return;
    }
    void get().refresh();
    supabase.auth.onAuthStateChange((event) => {
      // Defer: calling Supabase inside this callback can deadlock the auth client.
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') setTimeout(() => void get().refresh(), 0);
    });
  },
  refresh: async () => set({ profile: await loadProfile(), ready: true }),
  signOut: async () => {
    await supabase?.auth.signOut();
    set({ profile: null });
  },
}));

export const useIsAdmin = () => useAuth((s) => s.profile?.role === 'admin');
