import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';

import {describe, expect, it} from 'vitest';

import {
  NarrationChapterCache,
  type NarrationCachePort,
  type NarrationCacheStoragePort,
} from '../../src/audio/narration-cache.js';
import {
  assertNarrationPackManifest,
  loadNarrationPack,
  narrationPackManifestUrl,
  type NarrationAudioEntry,
  type NarrationPackManifest,
} from '../../src/audio/narration-pack.js';
import type {NarrationManifest} from '../../src/content/types.js';

const readJson = <T>(path: string): T => JSON.parse(readFileSync(join(process.cwd(), path), 'utf8')) as T;
const narration = readJson<NarrationManifest>('public/content/locales/narration.es.json');
const trip = readJson<{contentVersion: string; chapters: Array<{id: string}>}>('public/content/trip-manifest.json');
const productionPack = readJson<NarrationPackManifest>('public/audio/narration/v1/manifest.json');
const emptyPack: NarrationPackManifest = {
  ...structuredClone(productionPack),
  status: 'awaiting-audio-production',
  chapters: productionPack.chapters.map((chapter) => ({...chapter, entries: []})),
};
const chapterIds = trip.chapters.map(({id}) => id);
const bytes = new Uint8Array([0x49, 0x44, 0x33, 0x04, 0x00, 0x00, 0x01, 0x02]);
const hash = (value: Uint8Array) => createHash('sha256').update(value).digest('hex');

const entry = (segmentId: string, fileName: string, value = bytes): NarrationAudioEntry => {
  const segment = narration.segments.find((candidate) => candidate.id === segmentId);
  if (!segment) throw new Error(`Missing test narration segment ${segmentId}`);
  return {
    segmentId,
    scriptRef: segment.scriptRef,
    captionRef: segment.captionRef,
    url: `audio/narration/v1/road/${fileName}.mp3`,
    chapterId: 'road',
    bytes: value.byteLength,
    durationMs: 1000,
    sha256: hash(value),
    lufs: -18,
    truePeakDbtp: -1,
    generator: 'test-generator',
    model: 'test-model',
    modelRevision: 'test-revision',
    voicePreset: 'test-voice',
    generatedAt: '2026-10-01T12:00:00Z',
  };
};

const packWith = (...entries: NarrationAudioEntry[]): NarrationPackManifest => ({
  ...structuredClone(emptyPack),
  chapters: emptyPack.chapters.map((chapter) => chapter.chapterId === 'road' ? {...chapter, entries} : chapter),
});

class MemoryCache implements NarrationCachePort {
  readonly responses = new Map<string, Response>();

  async match(request: RequestInfo | URL): Promise<Response | undefined> {
    return this.responses.get(String(request))?.clone();
  }

  async put(request: RequestInfo | URL, response: Response): Promise<void> {
    this.responses.set(String(request), response.clone());
  }

  async delete(request: RequestInfo | URL): Promise<boolean> {
    return this.responses.delete(String(request));
  }
}

class MemoryCacheStorage implements NarrationCacheStoragePort {
  readonly caches = new Map<string, MemoryCache>();

  async open(name: string): Promise<MemoryCache> {
    const existing = this.caches.get(name);
    if (existing) return existing;
    const cache = new MemoryCache();
    this.caches.set(name, cache);
    return cache;
  }

  async delete(name: string): Promise<boolean> {
    return this.caches.delete(name);
  }
}

describe('versioned narration pack', () => {
  it('loads the production pack from the Pages base path without autoplay', async () => {
    const requested: string[] = [];
    const loaded = await loadNarrationPack({
      contentVersion: trip.contentVersion,
      chapterIds,
      narration,
      basePath: '/family-trip/',
      fetcher: (async (input: RequestInfo | URL) => {
        requested.push(String(input));
        return new Response(JSON.stringify(productionPack), {status: 200});
      }) as typeof fetch,
    });
    expect(requested).toEqual(['/family-trip/audio/narration/v1/manifest.json']);
    expect(narrationPackManifestUrl('/')).toBe('/audio/narration/v1/manifest.json');
    expect(loaded.autoplay).toBe(false);
    expect(loaded.status).toBe('production-ready');
    expect(loaded.chapters.flatMap((chapter) => chapter.entries)).toHaveLength(32);
  });

  it('rejects content drift, unsafe paths, and captions that differ from the script', () => {
    expect(() => assertNarrationPackManifest({...emptyPack, contentVersion: 'wrong'}, {contentVersion: trip.contentVersion, chapterIds, narration}))
      .toThrow(/content version/);

    const unsafe = entry('ROAD-01-STORY', 'road-01-story');
    expect(() => assertNarrationPackManifest(packWith({...unsafe, url: '../road-01.mp3'}), {contentVersion: trip.contentVersion, chapterIds, narration}))
      .toThrow(/chapter path/);

    expect(() => assertNarrationPackManifest(packWith({...unsafe, captionRef: 'missions.ROAD-02.storyBeat'}), {contentVersion: trip.contentVersion, chapterIds, narration}))
      .toThrow(/exact-caption/);
  });

  it('downloads, verifies, reports, reads, and removes one exact chapter cache', async () => {
    const storage = new MemoryCacheStorage();
    const pack = packWith(entry('ROAD-01-STORY', 'road-01-story'));
    const progress: number[] = [];
    const cache = new NarrationChapterCache(pack, {
      basePath: '/missione-italia/',
      cacheStorage: storage,
      fetcher: (async () => new Response(bytes, {status: 200, headers: {'content-type': 'audio/mpeg'}})) as typeof fetch,
    });

    await expect(cache.getChapterStatus('road')).resolves.toMatchObject({state: 'not-downloaded', cachedFiles: 0});
    await expect(cache.downloadChapter('road', ({completedFiles}) => progress.push(completedFiles)))
      .resolves.toMatchObject({state: 'downloaded', cachedFiles: 1, cachedBytes: bytes.byteLength});
    expect(progress).toEqual([1]);
    await expect(cache.getCachedAudio('ROAD-01-STORY')).resolves.toMatchObject({size: bytes.byteLength, type: 'audio/mpeg'});
    await expect(cache.removeChapter('road')).resolves.toBe(true);
    await expect(cache.getChapterStatus('road')).resolves.toMatchObject({state: 'not-downloaded', cachedFiles: 0});
  });

  it('rolls back newly cached files when a later clip fails hash verification', async () => {
    const storage = new MemoryCacheStorage();
    const first = entry('ROAD-01-STORY', 'road-01-story');
    const secondBytes = new Uint8Array([...bytes, 0x03]);
    const second = entry('ROAD-02-STORY', 'road-02-story', secondBytes);
    let request = 0;
    const cache = new NarrationChapterCache(packWith(first, second), {
      basePath: '/missione-italia/',
      cacheStorage: storage,
      fetcher: (async () => new Response(request++ === 0 ? bytes : new Uint8Array([0x00]), {status: 200})) as typeof fetch,
    });

    await expect(cache.downloadChapter('road')).rejects.toMatchObject({code: 'integrity'});
    await expect(cache.getChapterStatus('road')).resolves.toMatchObject({state: 'not-downloaded', cachedFiles: 0});
  });

  it('keeps unavailable audio optional and reports Cache Storage absence without touching saves', async () => {
    const empty = new NarrationChapterCache(emptyPack, {cacheStorage: null, fetcher: globalThis.fetch});
    await expect(empty.getChapterStatus('road')).resolves.toMatchObject({state: 'unavailable', files: 0});

    const available = new NarrationChapterCache(packWith(entry('ROAD-01-STORY', 'road-01-story')), {
      cacheStorage: null,
      fetcher: globalThis.fetch,
    });
    await expect(available.getChapterStatus('road')).resolves.toMatchObject({state: 'unsupported'});
    await expect(available.downloadChapter('road')).rejects.toMatchObject({code: 'unsupported'});
  });
});
