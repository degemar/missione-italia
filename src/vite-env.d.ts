/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_BASE_PATH?: string;
  readonly VITE_V1_CLOUD_BACKUP?: 'off' | 'on';
  readonly VITE_PUBLIC_TILE_URL?: string;
  readonly VITE_PUBLIC_SUPABASE_URL?: string;
  readonly VITE_PUBLIC_SUPABASE_PUBLISHABLE_KEY?: string;
}

declare const __APP_VERSION__: string;
declare const __COMMIT_SHA__: string;
