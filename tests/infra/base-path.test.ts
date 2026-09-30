import { describe, expect, it } from 'vitest';

import { DEFAULT_BASE_PATH, joinBasePath, normalizeBasePath } from '../../src/platform/base-path.js';

describe('Pages base path', () => {
  it('uses the project-site default and normalizes one override', () => {
    expect(normalizeBasePath()).toBe(DEFAULT_BASE_PATH);
    expect(normalizeBasePath('/family-trip')).toBe('/family-trip/');
    expect(normalizeBasePath('/')).toBe('/');
  });

  it('rejects remote, traversal, and ambiguous values', () => {
    for (const invalid of ['https://example.com/app/', '//host/app/', '../app/', '/app?x=1', '/app#x', '/app\\x']) {
      expect(() => normalizeBasePath(invalid)).toThrow();
    }
  });

  it('joins content and assets without losing the subpath', () => {
    expect(joinBasePath('/missione-italia/', '/content/trip-manifest.json'))
      .toBe('/missione-italia/content/trip-manifest.json');
    expect(() => joinBasePath('/', '../secret')).toThrow();
  });
});

