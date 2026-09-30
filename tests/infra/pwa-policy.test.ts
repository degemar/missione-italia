import { describe, expect, it } from 'vitest';

import {
  MAX_PRECACHE_BYTES,
  PRECACHE_GLOB_IGNORES,
  PRECACHE_GLOB_PATTERNS,
  isAllowedPrecacheUrl,
} from '../../src/platform/pwa-policy.js';

describe('offline boundary', () => {
  it('includes app/content/media types but excludes source masters and source maps', () => {
    expect(PRECACHE_GLOB_PATTERNS.join(' ')).toContain('json');
    expect(PRECACHE_GLOB_PATTERNS.join(' ')).toContain('png');
    expect(PRECACHE_GLOB_IGNORES).toContain('**/bussola-app-icon-source.png');
    expect(PRECACHE_GLOB_IGNORES).toContain('**/*.map');
    expect(MAX_PRECACHE_BYTES).toBe(5 * 1024 * 1024);
  });

  it.each([
    'https://tile.openstreetmap.org/1/2/3.png',
    'https://www.google.com/maps/dir/',
    'https://project.supabase.co/rest/v1/save',
    '/diagnostics/session.json',
    '/family-data/photo.png',
  ])('rejects nonessential or private cache target %s', (url) => {
    expect(isAllowedPrecacheUrl(url)).toBe(false);
  });

  it('allows the versioned public content package', () => {
    expect(isAllowedPrecacheUrl('/missione-italia/content/trip-manifest.json')).toBe(true);
  });
});
