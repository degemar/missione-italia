import {readFile} from 'node:fs/promises';

import {loadContentBundle} from '../../src/content/content-repository.js';
import type {ContentBundle} from '../../src/content/types.js';

const contentRoot = new URL('../../public/content/', import.meta.url);

export async function readContentJson(fileName: string): Promise<unknown> {
  return JSON.parse(await readFile(new URL(fileName, contentRoot), 'utf8')) as unknown;
}

export function createContentFetcher(overrides: Readonly<Record<string, unknown>> = {}): typeof fetch {
  return (async (input: RequestInfo | URL) => {
    const url = new URL(String(input), 'https://missione.test');
    const fileName = url.pathname.split('/').at(-1) ?? '';
    const contentPath = url.pathname.split('/content/').at(-1) ?? fileName;
    const value = Object.hasOwn(overrides, fileName) ? overrides[fileName] : await readContentJson(contentPath);
    return new Response(JSON.stringify(value), {status: 200, headers: {'content-type': 'application/json'}});
  }) as typeof fetch;
}

export function loadTestBundle(overrides: Readonly<Record<string, unknown>> = {}): Promise<ContentBundle> {
  return loadContentBundle({fetcher: createContentFetcher(overrides), basePath: '/family-trip/'});
}
