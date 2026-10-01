import {createHash} from 'node:crypto';
import {existsSync, readFileSync, readdirSync, statSync} from 'node:fs';
import {dirname, extname, join, relative, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const publicRoot = join(root, 'public');
const assetsRoot = join(publicRoot, 'assets');
const register = JSON.parse(readFileSync(join(root, 'public/content/assets.json'), 'utf8'));
const policy = JSON.parse(readFileSync(join(root, 'config/runtime-asset-policy.json'), 'utf8'));
const failures = [];
const fail = (code, detail) => failures.push(`${code}: ${detail}`);
const sha256 = (value) => createHash('sha256').update(value).digest('hex');
const supported = new Map([
  ['image/png', '.png'],
  ['image/webp', '.webp'],
  ['image/avif', '.avif'],
  ['image/svg+xml', '.svg'],
  ['audio/mpeg', '.mp3'],
  ['audio/ogg', '.ogg'],
]);
const assetFilename = /^[a-z0-9]+(?:-[a-z0-9]+)*(?:-\d{2,4}x\d{2,4})?\.(?:png|webp|avif|svg|mp3|ogg)$/;
const mediaFilename = /\.(?:png|webp|avif|svg|mp3|ogg)$/;

function filesUnder(directory) {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? filesUnder(path) : [path];
  });
}

function pngDimensions(buffer) {
  if (buffer.length < 24 || buffer.toString('hex', 0, 8) !== '89504e470d0a1a0a') return null;
  return {width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20)};
}

function webpDimensions(buffer) {
  if (buffer.length < 30 || buffer.toString('ascii', 0, 4) !== 'RIFF' || buffer.toString('ascii', 8, 12) !== 'WEBP') return null;
  const format = buffer.toString('ascii', 12, 16);
  if (format === 'VP8X') return {width: buffer.readUIntLE(24, 3) + 1, height: buffer.readUIntLE(27, 3) + 1};
  if (format === 'VP8 ' && buffer.length >= 30 && buffer[23] === 0x9d && buffer[24] === 0x01 && buffer[25] === 0x2a) {
    return {width: buffer.readUInt16LE(26) & 0x3fff, height: buffer.readUInt16LE(28) & 0x3fff};
  }
  if (format === 'VP8L' && buffer.length >= 25 && buffer[20] === 0x2f) {
    const bits = buffer.readUInt32LE(21);
    return {width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1};
  }
  return null;
}

function validateSvg(buffer, asset, declared) {
  const source = buffer.toString('utf8');
  if (!/^\s*<svg\b/i.test(source)) fail('ASSET_SVG_ROOT', asset.id);
  if (/<(?:script|foreignObject|image)\b/i.test(source)) fail('ASSET_SVG_UNSAFE_ELEMENT', asset.id);
  if (/(?:data:|@font-face|<style\b|\bhref\s*=\s*["']https?:)/i.test(source)) fail('ASSET_SVG_EMBEDDED_OR_REMOTE', asset.id);
  const paths = (source.match(/<(?:path|circle|ellipse|line|polygon|polyline|rect)\b/gi) ?? []).length;
  if (!Number.isInteger(declared.maximumPaths) || declared.maximumPaths < 1) fail('ASSET_SVG_MISSING_PATH_BUDGET', asset.id);
  else if (paths > declared.maximumPaths) fail('ASSET_SVG_PATH_BUDGET', `${asset.id}:${paths}/${declared.maximumPaths}`);
}

function validateAudio(buffer, asset, declared) {
  const valid = asset.mediaType === 'audio/mpeg'
    ? buffer.toString('ascii', 0, 3) === 'ID3' || (buffer[0] === 0xff && (buffer[1] & 0xe0) === 0xe0)
    : buffer.toString('ascii', 0, 4) === 'OggS';
  if (!valid) fail('ASSET_AUDIO_SIGNATURE', asset.id);
  if (!Number.isFinite(declared.maximumDurationSeconds) || declared.maximumDurationSeconds <= 0 || declared.maximumDurationSeconds > 60) {
    fail('ASSET_AUDIO_DURATION_BUDGET', asset.id);
  }
  if (!declared.captionRef?.trim()) fail('ASSET_AUDIO_CAPTION_REF', asset.id);
}

const registeredPaths = new Set();
const policyById = new Map((policy.assets ?? []).map((asset) => [asset.id, asset]));
for (const asset of register.assets ?? []) {
  const declared = policyById.get(asset.id);
  const extension = extname(asset.path).toLowerCase();
  const relativePath = `assets/${asset.path.replace(/^assets\//, '')}`;
  const absolutePath = join(publicRoot, asset.path);
  registeredPaths.add(relativePath);
  if (!assetFilename.test(asset.path.split('/').at(-1) ?? '')) fail('ASSET_FILENAME', asset.path);
  if (supported.get(asset.mediaType) !== extension) fail('ASSET_MEDIA_EXTENSION', `${asset.id}:${asset.mediaType}:${extension}`);
  if (!['informative', 'decorative', 'label-equivalent', 'not-rendered'].includes(asset.altIntent)) fail('ASSET_ALT_INTENT', asset.id);
  if (asset.altIntent === 'informative' && !declared?.altText?.trim()) fail('ASSET_MISSING_ALT', asset.id);
  if (!asset.provenance?.trim() || !existsSync(join(root, asset.provenance))) fail('ASSET_PROVENANCE', asset.id);
  if (!declared) {
    fail('ASSET_MISSING_POLICY', asset.id);
    continue;
  }
  if (declared.mediaType !== asset.mediaType) fail('ASSET_POLICY_MEDIA_TYPE', asset.id);
  if (declared.altIntent !== asset.altIntent) fail('ASSET_POLICY_ALT_INTENT', asset.id);
  if (!existsSync(absolutePath)) {
    fail('ASSET_MISSING_FILE', asset.path);
    continue;
  }
  const buffer = readFileSync(absolutePath);
  if (sha256(buffer) !== asset.sha256) fail('ASSET_HASH', asset.id);
  if (buffer.byteLength > declared.maximumBytes) fail('ASSET_SIZE', `${asset.id}:${buffer.byteLength}/${declared.maximumBytes}`);
  if (asset.mediaType === 'image/png' || asset.mediaType === 'image/webp') {
    const dimensions = asset.mediaType === 'image/png' ? pngDimensions(buffer) : webpDimensions(buffer);
    if (!dimensions || dimensions.width !== declared.width || dimensions.height !== declared.height) fail('ASSET_DIMENSIONS', asset.id);
  }
  if (asset.mediaType === 'image/svg+xml') validateSvg(buffer, asset, declared);
  if (asset.mediaType.startsWith('audio/')) validateAudio(buffer, asset, declared);
}

for (const [id] of policyById) if (!(register.assets ?? []).some((asset) => asset.id === id)) fail('ASSET_ORPHAN_POLICY', id);
for (const path of filesUnder(assetsRoot)) {
  const relativePath = relative(publicRoot, path).replaceAll('\\', '/');
  if (mediaFilename.test(relativePath) && !registeredPaths.has(relativePath)) fail('ASSET_ORPHAN_FILE', relativePath);
}

for (const sourcePath of [join(root, 'index.html'), join(root, 'vite.config.ts'), ...filesUnder(join(root, 'src')).filter((path) => /\.(?:ts|tsx)$/.test(path))]) {
  const source = readFileSync(sourcePath, 'utf8');
  for (const match of source.matchAll(/assets\/[a-zA-Z0-9._/-]+\.(?:png|webp|avif|svg|mp3|ogg)/g)) {
    if (!registeredPaths.has(match[0])) fail('ASSET_UNREGISTERED_REFERENCE', `${relative(root, sourcePath)}:${match[0]}`);
  }
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Asset integrity: ${(register.assets ?? []).length} registered assets, filename/hash/size/alt/orphan checks passed`);
}
