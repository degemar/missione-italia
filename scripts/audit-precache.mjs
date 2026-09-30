import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { extname, join, relative, resolve, sep } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const dist = join(root, 'dist');
const reportPath = join(root, 'reports', 'cache-inventory.json');
const maximumBytes = 5 * 1024 * 1024;
const eligibleExtensions = new Set([
  '.html', '.js', '.css', '.json', '.png', '.svg', '.webp', '.avif', '.woff2', '.txt', '.webmanifest',
]);

function normalizeBasePath(value) {
  const candidate = value?.trim() || '/missione-italia/';
  if (!candidate.startsWith('/') || candidate.startsWith('//') || candidate.includes('..')) {
    throw new Error('VITE_BASE_PATH must be a root-relative path.');
  }
  return candidate.endsWith('/') ? candidate : `${candidate}/`;
}

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path));
    else files.push(path);
  }
  return files;
}

function toPosix(path) {
  return path.split(sep).join('/');
}

function isPrecacheCandidate(path) {
  const relativePath = toPosix(relative(dist, path));
  if (!eligibleExtensions.has(extname(path))) return false;
  if (relativePath.endsWith('.map')) return false;
  if (relativePath.endsWith('bussola-app-icon-source.png')) return false;
  if (relativePath === 'sw.js' || /^workbox-[^/]+\.js$/.test(relativePath)) return false;
  return relativePath !== 'cache-inventory.json';
}

const forbidden = [
  /tile\.openstreetmap\.org/i,
  /google\.(?:com|[a-z]{2,3})\/maps/i,
  /supabase/i,
  /diagnostic/i,
  /family[-_/ ]?(?:data|photo)/i,
];

const basePath = normalizeBasePath(process.env.VITE_BASE_PATH);
const allFiles = await walk(dist);
const candidates = allFiles.filter(isPrecacheCandidate).sort();
const sw = await readFile(join(dist, 'sw.js'), 'utf8');
const entries = [];

for (const path of candidates) {
  const relativePath = toPosix(relative(dist, path));
  const data = await readFile(path);
  if (data.byteLength > maximumBytes) {
    throw new Error(`Offline asset exceeds ${maximumBytes} bytes: ${relativePath}`);
  }
  if (forbidden.some((pattern) => pattern.test(relativePath))) {
    throw new Error(`Forbidden offline dependency found in precache candidate: ${relativePath}`);
  }
  if (!sw.includes(JSON.stringify(relativePath))) {
    throw new Error(`Expected precache entry is absent from generated service worker: ${relativePath}`);
  }
  entries.push({
    url: `${basePath}${relativePath}`,
    revision: createHash('sha256').update(data).digest('hex'),
    bytes: data.byteLength,
    gzipBytes: gzipSync(data).byteLength,
  });
}

if (forbidden.some((pattern) => pattern.test(sw))) {
  throw new Error('Generated service worker contains a forbidden runtime or precache target.');
}

const assetRegister = JSON.parse(await readFile(join(dist, 'content', 'assets.json'), 'utf8'));
const assetPolicy = JSON.parse(await readFile(join(root, 'config', 'runtime-asset-policy.json'), 'utf8'));
const pngDimensions = (buffer) => {
  if (buffer.length < 24 || buffer.toString('hex', 0, 8) !== '89504e470d0a1a0a') return null;
  return {width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20)};
};
for (const asset of assetRegister.assets) {
  const path = join(dist, asset.path);
  const data = await readFile(path);
  const declared = assetPolicy.assets.find(({id}) => id === asset.id);
  if (!declared) throw new Error(`Registered asset has no size/dimension policy: ${asset.id}`);
  if (!asset.license?.trim()) throw new Error(`Registered asset has no licence evidence: ${asset.id}`);
  if (createHash('sha256').update(data).digest('hex') !== asset.sha256) throw new Error(`Registered asset hash mismatch: ${asset.id}`);
  if (data.byteLength > declared.maximumBytes) throw new Error(`Registered asset exceeds its byte budget: ${asset.id}`);
  if (asset.mediaType === 'image/png') {
    const dimensions = pngDimensions(data);
    if (!dimensions || dimensions.width !== declared.width || dimensions.height !== declared.height) {
      throw new Error(`Registered asset dimensions do not match policy: ${asset.id}`);
    }
  }
}
for (const asset of assetRegister.assets.filter((item) => item.offlineCritical)) {
  const expectedUrl = `${basePath}${asset.path}`;
  if (!entries.some((entry) => entry.url === expectedUrl)) {
    throw new Error(`Offline-critical registered asset is absent from the precache: ${asset.path}`);
  }
}

const contentPackage = JSON.parse(await readFile(join(dist, 'content', 'content-package.json'), 'utf8'));
for (const file of contentPackage.files.filter((item) => item.offlineCritical)) {
  const expectedUrl = `${basePath}content/${file.path}`;
  if (!entries.some((entry) => entry.url === expectedUrl)) {
    throw new Error(`Offline-critical content is absent from the precache: ${file.path}`);
  }
}

const report = {
  schemaVersion: '1.0.0',
  basePath,
  revisionAlgorithm: 'sha256',
  maximumEntryBytes: maximumBytes,
  entries,
  totals: {
    files: entries.length,
    bytes: entries.reduce((sum, entry) => sum + entry.bytes, 0),
    gzipBytes: entries.reduce((sum, entry) => sum + entry.gzipBytes, 0),
  },
  budgets: {
    targetPrecacheBytes: assetPolicy.targetPrecacheBytes,
    maximumPrecacheBytes: assetPolicy.maximumPrecacheBytes,
    withinTarget: entries.reduce((sum, entry) => sum + entry.bytes, 0) <= assetPolicy.targetPrecacheBytes,
  },
  excludedByPolicy: [
    'OpenStreetMap tiles',
    'Google Maps URLs',
    'Supabase responses',
    'diagnostics',
    'family data and photos',
    'source masters and source maps',
  ],
};

if (report.totals.bytes > assetPolicy.maximumPrecacheBytes) {
  throw new Error(`Offline precache exceeds ${assetPolicy.maximumPrecacheBytes} bytes without a release decision.`);
}

await mkdir(join(root, 'reports'), { recursive: true });
await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(`Precache audit: ${report.totals.files} files, ${report.totals.bytes} bytes (${report.totals.gzipBytes} gzip)`);
