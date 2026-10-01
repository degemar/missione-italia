import type {NarrationManifest} from '../content/types.js';
import {joinBasePath} from '../platform/base-path.js';

export const NARRATION_PACK_MANIFEST_PATH = 'audio/narration/v1/manifest.json';
export const NARRATION_PACK_SCHEMA_VERSION = '1.0.0';
export const NARRATION_PACK_MAXIMUM_BYTES = 8 * 1024 * 1024;
export const NARRATION_JOURNEY_CHAPTER_ID = 'journey';

export interface NarrationAudioEntry {
  readonly segmentId: string;
  readonly scriptRef: string;
  readonly captionRef: string;
  readonly url: string;
  readonly chapterId: string;
  readonly bytes: number;
  readonly durationMs: number;
  readonly sha256: string;
  readonly lufs: number;
  readonly truePeakDbtp: number;
  readonly generator: string;
  readonly model: string;
  readonly modelRevision: string;
  readonly voicePreset: string;
  readonly generatedAt: string;
}

export interface NarrationChapterPack {
  readonly chapterId: string;
  readonly entries: readonly NarrationAudioEntry[];
}

export interface NarrationPackManifest {
  readonly schemaVersion: typeof NARRATION_PACK_SCHEMA_VERSION;
  readonly packId: string;
  readonly packVersion: string;
  readonly contentVersion: string;
  readonly status: 'awaiting-audio-production' | 'production-ready';
  readonly locale: 'es';
  readonly autoplay: false;
  readonly captionPolicy: 'exact-script';
  readonly maximumPackBytes: typeof NARRATION_PACK_MAXIMUM_BYTES;
  readonly format: {
    readonly mediaType: 'audio/mpeg';
    readonly codec: 'mp3';
    readonly sampleRateHz: 24000;
    readonly channels: 1;
    readonly bitrateKbps: 48;
  };
  readonly chapters: readonly NarrationChapterPack[];
}

export interface NarrationPackLoadOptions {
  readonly contentVersion: string;
  readonly chapterIds: readonly string[];
  readonly narration: NarrationManifest;
  readonly fetcher?: typeof fetch;
  readonly basePath?: string;
}

export class NarrationPackContractError extends Error {
  constructor(message: string, readonly causeDetail?: unknown) {
    super(message);
    this.name = 'NarrationPackContractError';
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const record = (value: unknown, context: string): Record<string, unknown> => {
  if (!isRecord(value)) throw new NarrationPackContractError(`${context} must be an object.`);
  return value;
};

const text = (value: unknown, context: string): string => {
  if (typeof value !== 'string' || !value.trim()) throw new NarrationPackContractError(`${context} must be text.`);
  return value;
};

const integer = (value: unknown, context: string, minimum: number, maximum: number): number => {
  if (!Number.isInteger(value) || (value as number) < minimum || (value as number) > maximum) {
    throw new NarrationPackContractError(`${context} is outside its allowed range.`);
  }
  return value as number;
};

const finite = (value: unknown, context: string): number => {
  if (typeof value !== 'number' || !Number.isFinite(value)) throw new NarrationPackContractError(`${context} must be finite.`);
  return value;
};

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const segmentPattern = /^[A-Z0-9]+(?:-[A-Z0-9]+)*$/;
const versionPattern = /^\d+\.\d+\.\d+$/;
const hashPattern = /^[a-f0-9]{64}$/;
const audioPathPattern = /^audio\/narration\/v1\/([a-z0-9]+(?:-[a-z0-9]+)*)\/[a-z0-9]+(?:-[a-z0-9]+)*\.mp3$/;

export function narrationPackManifestUrl(basePath = import.meta.env.BASE_URL): string {
  return joinBasePath(basePath, NARRATION_PACK_MANIFEST_PATH);
}

export function narrationAudioUrl(entry: NarrationAudioEntry, basePath = import.meta.env.BASE_URL): string {
  return joinBasePath(basePath, entry.url);
}

export function assertNarrationPackManifest(
  value: unknown,
  expected: Pick<NarrationPackLoadOptions, 'contentVersion' | 'chapterIds' | 'narration'>,
): NarrationPackManifest {
  const manifest = record(value, 'narration pack');
  if (manifest.schemaVersion !== NARRATION_PACK_SCHEMA_VERSION) throw new NarrationPackContractError('Unsupported narration pack schema.');
  if (!slugPattern.test(text(manifest.packId, 'narration pack.packId'))) throw new NarrationPackContractError('Narration pack ID is invalid.');
  if (!versionPattern.test(text(manifest.packVersion, 'narration pack.packVersion'))) throw new NarrationPackContractError('Narration pack version is invalid.');
  if (manifest.contentVersion !== expected.contentVersion) throw new NarrationPackContractError('Narration pack content version does not match the adventure.');
  if (!['awaiting-audio-production', 'production-ready'].includes(String(manifest.status))) throw new NarrationPackContractError('Narration pack status is invalid.');
  if (manifest.locale !== 'es' || manifest.autoplay !== false || manifest.captionPolicy !== 'exact-script') {
    throw new NarrationPackContractError('Narration pack must be Spanish, exact-caption, and no-autoplay.');
  }
  if (manifest.maximumPackBytes !== NARRATION_PACK_MAXIMUM_BYTES) throw new NarrationPackContractError('Narration pack byte budget is invalid.');
  const format = record(manifest.format, 'narration pack.format');
  if (
    format.mediaType !== 'audio/mpeg' || format.codec !== 'mp3' || format.sampleRateHz !== 24000 ||
    format.channels !== 1 || format.bitrateKbps !== 48
  ) {
    throw new NarrationPackContractError('Narration pack audio format is invalid.');
  }
  if (!Array.isArray(manifest.chapters)) throw new NarrationPackContractError('Narration pack chapters must be an array.');

  const expectedChapterIds = new Set([NARRATION_JOURNEY_CHAPTER_ID, ...expected.chapterIds]);
  const chapterIds = new Set<string>();
  const segmentIds = new Set<string>();
  const narrationById = new Map(expected.narration.segments.map((segment) => [segment.id, segment]));
  let packBytes = 0;

  for (const [chapterIndex, chapterValue] of manifest.chapters.entries()) {
    const chapter = record(chapterValue, `narration pack.chapters[${chapterIndex}]`);
    const chapterId = text(chapter.chapterId, `narration pack.chapters[${chapterIndex}].chapterId`);
    if (!slugPattern.test(chapterId) || !expectedChapterIds.has(chapterId) || chapterIds.has(chapterId)) {
      throw new NarrationPackContractError(`Narration chapter ${chapterId} is unknown or duplicated.`);
    }
    chapterIds.add(chapterId);
    if (!Array.isArray(chapter.entries)) throw new NarrationPackContractError(`Narration chapter ${chapterId} entries must be an array.`);
    for (const [entryIndex, entryValue] of chapter.entries.entries()) {
      const context = `narration pack.${chapterId}.entries[${entryIndex}]`;
      const entry = record(entryValue, context);
      const segmentId = text(entry.segmentId, `${context}.segmentId`);
      const scriptRef = text(entry.scriptRef, `${context}.scriptRef`);
      const captionRef = text(entry.captionRef, `${context}.captionRef`);
      const url = text(entry.url, `${context}.url`);
      const entryChapterId = text(entry.chapterId, `${context}.chapterId`);
      const match = audioPathPattern.exec(url);
      if (!segmentPattern.test(segmentId) || segmentIds.has(segmentId)) throw new NarrationPackContractError(`${context}.segmentId is invalid or duplicated.`);
      if (!match || match[1] !== chapterId || entryChapterId !== chapterId) throw new NarrationPackContractError(`${context} is assigned to an invalid chapter path.`);
      const narrationSegment = narrationById.get(segmentId);
      if (!narrationSegment || narrationSegment.scriptRef !== scriptRef || narrationSegment.captionRef !== captionRef || scriptRef !== captionRef) {
        throw new NarrationPackContractError(`${segmentId} does not match its exact-caption script.`);
      }
      const bytes = integer(entry.bytes, `${context}.bytes`, 1, 1024 * 1024);
      integer(entry.durationMs, `${context}.durationMs`, 1, 60_000);
      if (!hashPattern.test(text(entry.sha256, `${context}.sha256`))) throw new NarrationPackContractError(`${context}.sha256 is invalid.`);
      const lufs = finite(entry.lufs, `${context}.lufs`);
      if (lufs < -19 || lufs > -17) throw new NarrationPackContractError(`${context}.lufs is outside -18 LUFS ±1.`);
      if (finite(entry.truePeakDbtp, `${context}.truePeakDbtp`) > -1) throw new NarrationPackContractError(`${context}.truePeakDbtp exceeds -1 dBTP.`);
      for (const key of ['generator', 'model', 'modelRevision', 'voicePreset', 'generatedAt'] as const) text(entry[key], `${context}.${key}`);
      if (Number.isNaN(Date.parse(entry.generatedAt as string))) throw new NarrationPackContractError(`${context}.generatedAt is invalid.`);
      segmentIds.add(segmentId);
      packBytes += bytes;
    }
  }
  if (chapterIds.size !== expectedChapterIds.size || [...expectedChapterIds].some((id) => !chapterIds.has(id))) {
    throw new NarrationPackContractError('Narration pack chapter coverage does not match the adventure.');
  }
  if (packBytes > NARRATION_PACK_MAXIMUM_BYTES) throw new NarrationPackContractError('Narration pack exceeds 8 MiB.');
  if (manifest.status === 'production-ready' && segmentIds.size === 0) throw new NarrationPackContractError('A production-ready narration pack cannot be empty.');
  return value as NarrationPackManifest;
}

export async function loadNarrationPack(options: NarrationPackLoadOptions): Promise<NarrationPackManifest> {
  const fetcher = options.fetcher ?? globalThis.fetch;
  if (typeof fetcher !== 'function') throw new NarrationPackContractError('This browser cannot load narration metadata.');
  let response: Response;
  try {
    response = await fetcher(narrationPackManifestUrl(options.basePath));
  } catch (error) {
    throw new NarrationPackContractError('Could not load narration metadata.', error);
  }
  if (!response.ok) throw new NarrationPackContractError(`Could not load narration metadata (${response.status}).`);
  let value: unknown;
  try {
    value = await response.json() as unknown;
  } catch (error) {
    throw new NarrationPackContractError('Narration metadata is not valid JSON.', error);
  }
  return assertNarrationPackManifest(value, options);
}
