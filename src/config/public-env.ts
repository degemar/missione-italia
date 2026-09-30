import { normalizeBasePath } from '../platform/base-path.js';

const ALLOWED_PUBLIC_KEYS = new Set([
  'VITE_BASE_PATH',
  'VITE_V1_CLOUD_BACKUP',
  'VITE_PUBLIC_TILE_URL',
  'VITE_PUBLIC_SUPABASE_URL',
  'VITE_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
]);

const DEFAULT_TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

export interface PublicEnvironment {
  readonly basePath: string;
  readonly cloudBackup: false | true;
  readonly tileUrl: string;
  readonly supabaseUrl?: string;
  readonly supabasePublishableKey?: string;
}

function optionalValue(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function legacyJwtRole(value: string): string | undefined {
  const payload = value.split('.')[1];
  if (!payload) return undefined;

  try {
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padding = '='.repeat((4 - (normalized.length % 4)) % 4);
    const decoded = JSON.parse(atob(`${normalized}${padding}`)) as { role?: unknown };
    return typeof decoded.role === 'string' ? decoded.role : undefined;
  } catch {
    return undefined;
  }
}

function assertSafePublishableKey(key: string): void {
  const normalized = key.toLowerCase();
  if (
    normalized.startsWith('sb_secret_') ||
    normalized.includes('service_role') ||
    legacyJwtRole(key) === 'service_role'
  ) {
    throw new Error('A Supabase secret or service-role key cannot be exposed through VITE_* variables.');
  }
}

export function parsePublicEnvironment(raw: Readonly<Record<string, string | undefined>>): PublicEnvironment {
  for (const key of Object.keys(raw)) {
    if (!key.startsWith('VITE_')) continue;
    if (/secret|service.?role|password|private.?key/i.test(key)) {
      throw new Error(`Public environment variable ${key} has a prohibited secret-shaped name.`);
    }
    if (!ALLOWED_PUBLIC_KEYS.has(key)) {
      throw new Error(`Unknown public environment variable ${key}. Add it to the reviewed allowlist first.`);
    }
  }

  const cloudSetting = optionalValue(raw.VITE_V1_CLOUD_BACKUP) ?? 'off';
  if (cloudSetting !== 'off' && cloudSetting !== 'on') {
    throw new Error('VITE_V1_CLOUD_BACKUP must be "off" or "on".');
  }

  const tileUrl = optionalValue(raw.VITE_PUBLIC_TILE_URL) ?? DEFAULT_TILE_URL;
  if (!tileUrl.startsWith('https://') || !['{z}', '{x}', '{y}'].every((part) => tileUrl.includes(part))) {
    throw new Error('VITE_PUBLIC_TILE_URL must be an HTTPS raster template containing {z}, {x}, and {y}.');
  }

  const supabaseUrl = optionalValue(raw.VITE_PUBLIC_SUPABASE_URL);
  const supabasePublishableKey = optionalValue(raw.VITE_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
  if (supabasePublishableKey) assertSafePublishableKey(supabasePublishableKey);

  if (cloudSetting === 'on') {
    if (!supabaseUrl || !supabasePublishableKey) {
      throw new Error('Cloud backup can be enabled only with a public Supabase URL and publishable key.');
    }
    const parsedUrl = new URL(supabaseUrl);
    if (parsedUrl.protocol !== 'https:') throw new Error('The public Supabase URL must use HTTPS.');
  }

  return {
    basePath: normalizeBasePath(optionalValue(raw.VITE_BASE_PATH)),
    cloudBackup: cloudSetting === 'on',
    tileUrl,
    ...(supabaseUrl ? { supabaseUrl } : {}),
    ...(supabasePublishableKey ? { supabasePublishableKey } : {}),
  };
}

