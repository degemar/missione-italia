import {createHash} from 'node:crypto';
import {existsSync, readFileSync, readdirSync, statSync} from 'node:fs';
import {dirname, join, relative, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const publicRoot = join(root, 'public');
const packPath = join(publicRoot, 'audio/narration/v1/manifest.json');
const pack = JSON.parse(readFileSync(packPath, 'utf8'));
const trip = JSON.parse(readFileSync(join(publicRoot, 'content/trip-manifest.json'), 'utf8'));
const narration = JSON.parse(readFileSync(join(publicRoot, 'content/locales/narration.es.json'), 'utf8'));
const failures = [];
const fail = (code, detail) => failures.push(`${code}: ${detail}`);
const sha256 = (value) => createHash('sha256').update(value).digest('hex');
const slug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const segmentId = /^[A-Z0-9]+(?:-[A-Z0-9]+)*$/;
const audioPath = /^audio\/narration\/v1\/([a-z0-9]+(?:-[a-z0-9]+)*)\/[a-z0-9]+(?:-[a-z0-9]+)*\.mp3$/;
const hash = /^[a-f0-9]{64}$/;
const expectedChapters = new Set(['journey', ...trip.chapters.map(({id}) => id)]);
const narrationById = new Map(narration.segments.map((entry) => [entry.id, entry]));
const declaredPaths = new Set();
const declaredSegments = new Set();
const declaredChapters = new Set();
let totalBytes = 0;

function filesUnder(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? filesUnder(path) : [path];
  });
}

function existsWithExactCase(relativePath) {
  let current = root;
  for (const segment of relativePath.replaceAll('\\', '/').split('/')) {
    const names = readdirSync(current);
    if (!names.includes(segment)) return false;
    current = join(current, segment);
  }
  return existsSync(current);
}

const needText = (value, context) => {
  if (typeof value !== 'string' || !value.trim()) fail('NARRATION_TEXT', context);
};

if (pack.schemaVersion !== '1.0.0') fail('NARRATION_SCHEMA', pack.schemaVersion);
if (!slug.test(pack.packId ?? '')) fail('NARRATION_PACK_ID', pack.packId);
if (!/^1\.\d+\.\d+$/.test(pack.packVersion ?? '')) fail('NARRATION_PACK_VERSION', pack.packVersion);
if (pack.contentVersion !== trip.contentVersion) fail('NARRATION_CONTENT_VERSION', `${pack.contentVersion}/${trip.contentVersion}`);
if (!['awaiting-audio-production', 'production-ready'].includes(pack.status)) fail('NARRATION_STATUS', pack.status);
if (pack.locale !== 'es' || pack.autoplay !== false || pack.captionPolicy !== 'exact-script') fail('NARRATION_POLICY', 'Spanish exact-caption/no-autoplay required');
if (pack.maximumPackBytes !== 8 * 1024 * 1024) fail('NARRATION_PACK_BUDGET', pack.maximumPackBytes);
if (
  pack.format?.mediaType !== 'audio/mpeg' || pack.format?.codec !== 'mp3' ||
  pack.format?.sampleRateHz !== 24000 || pack.format?.channels !== 1 || pack.format?.bitrateKbps !== 48
) fail('NARRATION_FORMAT', JSON.stringify(pack.format));
if (!Array.isArray(pack.chapters)) fail('NARRATION_CHAPTERS', 'array required');

for (const chapter of pack.chapters ?? []) {
  if (!slug.test(chapter.chapterId ?? '') || !expectedChapters.has(chapter.chapterId) || declaredChapters.has(chapter.chapterId)) {
    fail('NARRATION_CHAPTER', chapter.chapterId);
    continue;
  }
  declaredChapters.add(chapter.chapterId);
  if (!Array.isArray(chapter.entries)) {
    fail('NARRATION_ENTRIES', chapter.chapterId);
    continue;
  }
  for (const entry of chapter.entries) {
    const context = `${chapter.chapterId}:${entry.segmentId ?? 'unknown'}`;
    if (!segmentId.test(entry.segmentId ?? '') || declaredSegments.has(entry.segmentId)) fail('NARRATION_SEGMENT_ID', context);
    declaredSegments.add(entry.segmentId);
    const narrationSegment = narrationById.get(entry.segmentId);
    if (!narrationSegment || narrationSegment.scriptRef !== entry.scriptRef || narrationSegment.captionRef !== entry.captionRef || entry.scriptRef !== entry.captionRef) {
      fail('NARRATION_EXACT_CAPTION', context);
    }
    const pathMatch = audioPath.exec(entry.url ?? '');
    if (!pathMatch || pathMatch[1] !== chapter.chapterId || entry.chapterId !== chapter.chapterId || declaredPaths.has(entry.url)) {
      fail('NARRATION_AUDIO_PATH', context);
    }
    declaredPaths.add(entry.url);
    if (!Number.isInteger(entry.bytes) || entry.bytes < 1 || entry.bytes > 1024 * 1024) fail('NARRATION_BYTES', context);
    else totalBytes += entry.bytes;
    if (!Number.isInteger(entry.durationMs) || entry.durationMs < 1 || entry.durationMs > 60_000) fail('NARRATION_DURATION', context);
    if (!hash.test(entry.sha256 ?? '')) fail('NARRATION_HASH', context);
    if (!Number.isFinite(entry.lufs) || entry.lufs < -19 || entry.lufs > -17) fail('NARRATION_LOUDNESS', context);
    if (!Number.isFinite(entry.truePeakDbtp) || entry.truePeakDbtp > -1) fail('NARRATION_TRUE_PEAK', context);
    for (const key of ['generator', 'model', 'modelRevision', 'voicePreset', 'generatedAt']) needText(entry[key], `${context}.${key}`);
    if (Number.isNaN(Date.parse(entry.generatedAt))) fail('NARRATION_GENERATED_AT', context);

    const relativePath = `public/${entry.url}`;
    if (!existsWithExactCase(relativePath)) {
      fail('NARRATION_MISSING_FILE', entry.url);
      continue;
    }
    const buffer = readFileSync(join(root, relativePath));
    const validMp3 = buffer.toString('ascii', 0, 3) === 'ID3' || (buffer[0] === 0xff && (buffer[1] & 0xe0) === 0xe0);
    if (!validMp3) fail('NARRATION_MP3_SIGNATURE', context);
    if (buffer.byteLength !== entry.bytes) fail('NARRATION_FILE_BYTES', context);
    if (sha256(buffer) !== entry.sha256) fail('NARRATION_FILE_HASH', context);
  }
}

if (declaredChapters.size !== expectedChapters.size || [...expectedChapters].some((id) => !declaredChapters.has(id))) {
  fail('NARRATION_CHAPTER_COVERAGE', [...expectedChapters].filter((id) => !declaredChapters.has(id)).join(','));
}
if (totalBytes > pack.maximumPackBytes) fail('NARRATION_TOTAL_BYTES', `${totalBytes}/${pack.maximumPackBytes}`);
if (pack.status === 'production-ready' && declaredSegments.size === 0) fail('NARRATION_EMPTY_PRODUCTION_PACK', pack.packId);

for (const path of filesUnder(join(publicRoot, 'audio/narration')).filter((candidate) => candidate.toLowerCase().endsWith('.mp3'))) {
  const publicPath = relative(publicRoot, path).replaceAll('\\', '/');
  if (!declaredPaths.has(publicPath)) fail('NARRATION_ORPHAN_FILE', publicPath);
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Narration pack: ${pack.chapters.length} chapter groups, ${declaredSegments.size} registered clips, ${totalBytes}/${pack.maximumPackBytes} bytes`);
}
