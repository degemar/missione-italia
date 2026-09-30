export const DEFAULT_BASE_PATH = '/missione-italia/';

export function normalizeBasePath(input?: string): string {
  const candidate = input?.trim() || DEFAULT_BASE_PATH;
  if (
    !candidate.startsWith('/') ||
    candidate.startsWith('//') ||
    candidate.includes('\\') ||
    candidate.includes('..') ||
    candidate.includes('?') ||
    candidate.includes('#')
  ) {
    throw new Error('VITE_BASE_PATH must be a root-relative path such as /missione-italia/ or /.');
  }

  const normalized = candidate.replace(/\/{2,}/g, '/');
  return normalized.endsWith('/') ? normalized : `${normalized}/`;
}

export function joinBasePath(basePath: string, relativePath: string): string {
  const base = normalizeBasePath(basePath);
  const relative = relativePath.replace(/^\/+/, '');
  if (!relative || relative.includes('..') || relative.includes('\\')) {
    throw new Error('Asset paths must be non-empty, relative, and cannot traverse directories.');
  }
  return `${base}${relative}`;
}

