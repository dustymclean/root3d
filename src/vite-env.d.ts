/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_JITSI_DOMAIN?: string;
  readonly VITE_CONTACT_EMAIL?: string;
  readonly VITE_JITSI_ROOM_PREFIX?: string;
}
