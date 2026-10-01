import {
  narrationAudioUrl,
  type NarrationAudioEntry,
  type NarrationPackManifest,
} from './narration-pack.js';

export type NarrationChapterState =
  | 'unavailable'
  | 'unsupported'
  | 'not-downloaded'
  | 'incomplete'
  | 'downloaded';

export interface NarrationChapterStatus {
  readonly chapterId: string;
  readonly state: NarrationChapterState;
  readonly files: number;
  readonly cachedFiles: number;
  readonly invalidFiles: number;
  readonly bytes: number;
  readonly cachedBytes: number;
}

export interface NarrationDownloadProgress {
  readonly chapterId: string;
  readonly completedFiles: number;
  readonly totalFiles: number;
  readonly completedBytes: number;
  readonly totalBytes: number;
}

export interface NarrationCachePort {
  match(request: RequestInfo | URL): Promise<Response | undefined>;
  put(request: RequestInfo | URL, response: Response): Promise<void>;
  delete(request: RequestInfo | URL): Promise<boolean>;
}

export interface NarrationCacheStoragePort {
  open(cacheName: string): Promise<NarrationCachePort>;
  delete(cacheName: string): Promise<boolean>;
}

export interface NarrationCacheOptions {
  readonly basePath?: string;
  readonly fetcher?: typeof fetch;
  readonly cacheStorage?: NarrationCacheStoragePort | null;
}

export class NarrationCacheError extends Error {
  constructor(readonly code: 'unsupported' | 'unknown-chapter' | 'unknown-segment' | 'download' | 'integrity', message: string) {
    super(message);
    this.name = 'NarrationCacheError';
  }
}

const sha256Hex = async (bytes: ArrayBuffer): Promise<string> => {
  if (!globalThis.crypto?.subtle) throw new NarrationCacheError('unsupported', 'SHA-256 is unavailable.');
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
};

const isVerified = async (response: Response, entry: NarrationAudioEntry): Promise<boolean> => {
  try {
    const bytes = await response.clone().arrayBuffer();
    return bytes.byteLength === entry.bytes && await sha256Hex(bytes) === entry.sha256;
  } catch {
    return false;
  }
};

export function narrationChapterCacheName(manifest: NarrationPackManifest, chapterId: string): string {
  return `missione-italia-narration-${manifest.packVersion}-${chapterId}`;
}

export class NarrationChapterCache {
  private readonly basePath: string;
  private readonly fetcher: typeof fetch;
  private readonly cacheStorage: NarrationCacheStoragePort | null;
  private readonly entryBySegment: ReadonlyMap<string, NarrationAudioEntry>;

  constructor(readonly manifest: NarrationPackManifest, options: NarrationCacheOptions = {}) {
    const fetcher = options.fetcher ?? globalThis.fetch;
    if (typeof fetcher !== 'function') throw new NarrationCacheError('unsupported', 'Fetch is unavailable.');
    this.fetcher = fetcher;
    this.basePath = options.basePath ?? import.meta.env.BASE_URL;
    this.cacheStorage = options.cacheStorage === undefined
      ? (typeof caches === 'undefined' ? null : caches)
      : options.cacheStorage;
    this.entryBySegment = new Map(manifest.chapters.flatMap((chapter) => chapter.entries).map((entry) => [entry.segmentId, entry]));
  }

  getAudioUrl(segmentId: string): string | null {
    const entry = this.entryBySegment.get(segmentId);
    return entry ? narrationAudioUrl(entry, this.basePath) : null;
  }

  async getCachedAudio(segmentId: string): Promise<Blob | null> {
    const entry = this.entryBySegment.get(segmentId);
    if (!entry) return null;
    if (!this.cacheStorage) return null;
    const cache = await this.cacheStorage.open(narrationChapterCacheName(this.manifest, entry.chapterId));
    const response = await cache.match(narrationAudioUrl(entry, this.basePath));
    if (!response || !await isVerified(response, entry)) return null;
    return response.blob();
  }

  async getChapterStatus(chapterId: string): Promise<NarrationChapterStatus> {
    const chapter = this.chapter(chapterId);
    const bytes = chapter.entries.reduce((total, entry) => total + entry.bytes, 0);
    if (!chapter.entries.length) return {chapterId, state: 'unavailable', files: 0, cachedFiles: 0, invalidFiles: 0, bytes: 0, cachedBytes: 0};
    if (!this.cacheStorage) return {chapterId, state: 'unsupported', files: chapter.entries.length, cachedFiles: 0, invalidFiles: 0, bytes, cachedBytes: 0};
    const cache = await this.cacheStorage.open(narrationChapterCacheName(this.manifest, chapterId));
    let cachedFiles = 0;
    let invalidFiles = 0;
    let cachedBytes = 0;
    for (const entry of chapter.entries) {
      const response = await cache.match(narrationAudioUrl(entry, this.basePath));
      if (!response) continue;
      if (!await isVerified(response, entry)) {
        invalidFiles += 1;
        continue;
      }
      cachedFiles += 1;
      cachedBytes += entry.bytes;
    }
    const state: NarrationChapterState = cachedFiles === chapter.entries.length && invalidFiles === 0
      ? 'downloaded'
      : cachedFiles === 0 && invalidFiles === 0
        ? 'not-downloaded'
        : 'incomplete';
    return {chapterId, state, files: chapter.entries.length, cachedFiles, invalidFiles, bytes, cachedBytes};
  }

  async downloadChapter(
    chapterId: string,
    onProgress?: (progress: NarrationDownloadProgress) => void,
  ): Promise<NarrationChapterStatus> {
    const chapter = this.chapter(chapterId);
    if (!chapter.entries.length) throw new NarrationCacheError('unknown-chapter', `Narration is not yet available for ${chapterId}.`);
    if (!this.cacheStorage) throw new NarrationCacheError('unsupported', 'Offline audio storage is unavailable.');
    const cache = await this.cacheStorage.open(narrationChapterCacheName(this.manifest, chapterId));
    const totalBytes = chapter.entries.reduce((total, entry) => total + entry.bytes, 0);
    let completedFiles = 0;
    let completedBytes = 0;
    const newlyCached: string[] = [];
    try {
      for (const entry of chapter.entries) {
        const url = narrationAudioUrl(entry, this.basePath);
        const existing = await cache.match(url);
        if (!existing || !await isVerified(existing, entry)) {
          const response = await this.fetcher(url, {cache: 'no-store'});
          if (!response.ok) throw new NarrationCacheError('download', `Could not download ${entry.segmentId} (${response.status}).`);
          const audioBytes = await response.arrayBuffer();
          if (audioBytes.byteLength !== entry.bytes || await sha256Hex(audioBytes) !== entry.sha256) {
            throw new NarrationCacheError('integrity', `${entry.segmentId} failed byte/hash verification.`);
          }
          await cache.put(url, new Response(audioBytes, {
            status: 200,
            headers: {'content-type': 'audio/mpeg', 'content-length': String(audioBytes.byteLength)},
          }));
          newlyCached.push(url);
        }
        completedFiles += 1;
        completedBytes += entry.bytes;
        onProgress?.({chapterId, completedFiles, totalFiles: chapter.entries.length, completedBytes, totalBytes});
      }
    } catch (error) {
      await Promise.all(newlyCached.map((url) => cache.delete(url)));
      if (error instanceof NarrationCacheError) throw error;
      throw new NarrationCacheError('download', 'Narration download failed.');
    }
    return this.getChapterStatus(chapterId);
  }

  removeChapter(chapterId: string): Promise<boolean> {
    this.chapter(chapterId);
    if (!this.cacheStorage) return Promise.resolve(false);
    return this.cacheStorage.delete(narrationChapterCacheName(this.manifest, chapterId));
  }

  private chapter(chapterId: string) {
    const chapter = this.manifest.chapters.find((candidate) => candidate.chapterId === chapterId);
    if (!chapter) throw new NarrationCacheError('unknown-chapter', `Unknown narration chapter: ${chapterId}.`);
    return chapter;
  }
}
