export const MAX_PRECACHE_BYTES = 5 * 1024 * 1024;

export const PRECACHE_GLOB_PATTERNS = [
  '**/*.{html,js,css,json,png,svg,webp,avif,woff2,txt}',
];

export const PRECACHE_GLOB_IGNORES = [
  '**/*.map',
  '**/bussola-app-icon-source.png',
  '**/cache-inventory.json',
];

const FORBIDDEN_PRECACHE_PATTERNS = [
  /tile\.openstreetmap\.org/i,
  /google\.(?:com|[a-z]{2,3})\/maps/i,
  /supabase/i,
  /diagnostic/i,
  /family[-_/ ]?(?:data|photo)/i,
];

export function isAllowedPrecacheUrl(url: string): boolean {
  return !FORBIDDEN_PRECACHE_PATTERNS.some((pattern) => pattern.test(url));
}
