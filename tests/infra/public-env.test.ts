import { Buffer } from 'node:buffer';
import { describe, expect, it } from 'vitest';

import { parsePublicEnvironment } from '../../src/config/public-env.js';

function jwtWithRole(role: string): string {
  const payload = Buffer.from(JSON.stringify({ role })).toString('base64url');
  return `header.${payload}.signature`;
}

describe('public environment', () => {
  it('defaults to local-first and requires no Supabase values', () => {
    expect(parsePublicEnvironment({})).toMatchObject({
      basePath: '/missione-italia/',
      cloudBackup: false,
      tileUrl: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    });
  });

  it('rejects unknown and secret-shaped browser variables', () => {
    expect(() => parsePublicEnvironment({ VITE_NEW_SETTING: 'x' })).toThrow(/Unknown public/);
    expect(() => parsePublicEnvironment({ VITE_SUPABASE_SERVICE_ROLE_KEY: 'x' })).toThrow(/prohibited/);
  });

  it('rejects secret and legacy service-role key values', () => {
    expect(() => parsePublicEnvironment({
      VITE_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'sb_secret_example',
    })).toThrow(/secret or service-role/);
    expect(() => parsePublicEnvironment({
      VITE_PUBLIC_SUPABASE_PUBLISHABLE_KEY: jwtWithRole('service_role'),
    })).toThrow(/secret or service-role/);
  });

  it('requires complete public configuration only when cloud is on', () => {
    expect(() => parsePublicEnvironment({ VITE_V1_CLOUD_BACKUP: 'on' })).toThrow(/only with/);
    expect(parsePublicEnvironment({
      VITE_V1_CLOUD_BACKUP: 'on',
      VITE_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
      VITE_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_example',
    }).cloudBackup).toBe(true);
  });
});

