import { joinBasePath } from '../platform/base-path.js';

export function contentUrl(fileName: string, basePath = import.meta.env.BASE_URL): string {
  if (!/^[a-z0-9][a-z0-9.-]*\.json$/i.test(fileName)) {
    throw new Error('Content files must be plain JSON filenames.');
  }
  return joinBasePath(basePath, `content/${fileName}`);
}

export function localizedContentUrl(locale: 'es', fileName: 'trip-manifest.es.json' | 'narration.es.json', basePath = import.meta.env.BASE_URL): string {
  return joinBasePath(basePath, `content/locales/${locale === 'es' ? fileName : ''}`);
}

export function assetUrl(relativePath: string, basePath = import.meta.env.BASE_URL): string {
  return joinBasePath(basePath, relativePath);
}
