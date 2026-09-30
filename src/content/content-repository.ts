import {contentUrl} from './content-urls.js';
import {BUILD_METADATA} from '../platform/build-metadata.js';
import type {
  AssetRegister,
  Chapter,
  ContentBundle,
  ContentPackage,
  EffectiveMission,
  Mission,
  RewardsRegister,
  SourceRegister,
  TripManifest,
} from './types.js';

export class ContentLoadError extends Error {
  constructor(message: string, readonly causeDetail?: unknown) {
    super(message);
    this.name = 'ContentLoadError';
  }
}

export interface ContentLoadOptions {
  fetcher?: typeof fetch;
  basePath?: string;
  appVersion?: string;
  storageVersion?: number;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const requireString = (record: Record<string, unknown>, key: string, context: string): string => {
  const value = record[key];
  if (typeof value !== 'string' || !value.trim()) throw new ContentLoadError(`${context}.${key} is missing or invalid.`);
  return value;
};

const requireArray = (record: Record<string, unknown>, key: string, context: string): unknown[] => {
  const value = record[key];
  if (!Array.isArray(value)) throw new ContentLoadError(`${context}.${key} must be an array.`);
  return value;
};

const requireRecord = (value: unknown, context: string): Record<string, unknown> => {
  if (!isRecord(value)) throw new ContentLoadError(`${context} must be an object.`);
  return value;
};

const requireStringArray = (record: Record<string, unknown>, key: string, context: string): string[] => {
  const values = requireArray(record, key, context);
  if (!values.every((value) => typeof value === 'string' && value.trim())) {
    throw new ContentLoadError(`${context}.${key} must contain only non-empty strings.`);
  }
  return values as string[];
};

function assertPlayableFields(record: Record<string, unknown>, context: string): void {
  requireString(record, 'storyBeat', context);
  requireString(record, 'objective', context);
  const roles = requireArray(record, 'roles', context);
  if (roles.length !== 3) throw new ContentLoadError(`${context} must contain three role actions.`);
  const roleIds = new Set(roles.map((role, index) => {
    const roleRecord = requireRecord(role, `${context}.roles[${index}]`);
    requireString(roleRecord, 'action', `${context}.roles[${index}]`);
    return requireString(roleRecord, 'role', `${context}.roles[${index}]`);
  }));
  if (!['spotter', 'detective', 'navigator'].every((role) => roleIds.has(role))) {
    throw new ContentLoadError(`${context} must contain Spotter, Detective, and Navigator.`);
  }
  for (const [index, candidate] of requireArray(record, 'choices', context).entries()) {
    const choice = requireRecord(candidate, `${context}.choices[${index}]`);
    requireString(choice, 'id', `${context}.choices[${index}]`);
    requireString(choice, 'label', `${context}.choices[${index}]`);
    requireString(choice, 'hint', `${context}.choices[${index}]`);
    if (typeof choice.correct !== 'boolean') throw new ContentLoadError(`${context}.choices[${index}].correct must be a boolean.`);
  }
  requireArray(record, 'facts', context);
  requireStringArray(record, 'safety', context);
  requireStringArray(record, 'sourceIds', context);
  const completion = requireRecord(record.completion, `${context}.completion`);
  requireString(completion, 'retryLine', `${context}.completion`);
  requireString(completion, 'explanation', `${context}.completion`);
  requireString(completion, 'successLine', `${context}.completion`);
  const allowedStates = requireArray(completion, 'allowedStates', `${context}.completion`);
  if (!['completed', 'manual', 'skipped'].every((state) => allowedStates.includes(state))) {
    throw new ContentLoadError(`${context} has an incomplete resolution contract.`);
  }
  const fallbacks = requireRecord(record.fallbacks, `${context}.fallbacks`);
  for (const key of ['noGps', 'closedVenue', 'badWeather', 'tiredLegs']) requireString(fallbacks, key, `${context}.fallbacks`);
}

async function loadJson(fileName: string, fetcher: typeof fetch, basePath: string): Promise<unknown> {
  let response: Response;
  try {
    response = await fetcher(contentUrl(fileName, basePath));
  } catch (error) {
    throw new ContentLoadError(`Could not load ${fileName}.`, error);
  }
  if (!response.ok) throw new ContentLoadError(`Could not load ${fileName} (${response.status}).`);
  try {
    return await response.json() as unknown;
  } catch (error) {
    throw new ContentLoadError(`${fileName} is not valid JSON.`, error);
  }
}

function assertManifest(value: unknown): TripManifest {
  const manifest = requireRecord(value, 'trip-manifest');
  requireString(manifest, 'schemaVersion', 'trip-manifest');
  requireString(manifest, 'contentVersion', 'trip-manifest');
  requireString(manifest, 'tripKey', 'trip-manifest');
  const epilogueMissionId = requireString(manifest, 'epilogueMissionId', 'trip-manifest');
  const chapters = requireArray(manifest, 'chapters', 'trip-manifest');
  const missions = requireArray(manifest, 'missions', 'trip-manifest');
  if (chapters.length < 3 || chapters.length > 4) throw new ContentLoadError('The active manifest must contain three or four chapters.');
  if (!missions.length) throw new ContentLoadError('The active manifest contains no missions.');

  const chapterIds = new Set<string>();
  const missionIds = new Set<string>();
  for (const [index, candidate] of chapters.entries()) {
    const chapter = requireRecord(candidate, `chapters[${index}]`);
    const id = requireString(chapter, 'id', `chapters[${index}]`);
    if (chapterIds.has(id)) throw new ContentLoadError(`Duplicate chapter ID: ${id}.`);
    chapterIds.add(id);
    requireString(chapter, 'title', `chapters[${index}]`);
    requireString(chapter, 'power', `chapters[${index}]`);
    requireStringArray(chapter, 'missionIds', `chapters[${index}]`);
  }
  for (const [index, candidate] of missions.entries()) {
    const mission = requireRecord(candidate, `missions[${index}]`);
    const id = requireString(mission, 'id', `missions[${index}]`);
    if (missionIds.has(id)) throw new ContentLoadError(`Duplicate mission ID: ${id}.`);
    missionIds.add(id);
    requireString(mission, 'title', `missions[${index}]`);
    assertPlayableFields(mission, id);
    if (mission.variants !== undefined) {
      if (!Array.isArray(mission.variants)) throw new ContentLoadError(`${id}.variants must be an array.`);
      for (const [variantIndex, candidateVariant] of mission.variants.entries()) {
        const variant = requireRecord(candidateVariant, `${id}.variants[${variantIndex}]`);
        requireString(variant, 'id', `${id}.variants[${variantIndex}]`);
        requireString(variant, 'pairId', `${id}.variants[${variantIndex}]`);
        requireString(variant, 'title', `${id}.variants[${variantIndex}]`);
        requireString(variant, 'locationLabel', `${id}.variants[${variantIndex}]`);
        assertPlayableFields(variant, `${id}.variants[${variantIndex}]`);
      }
    }
  }
  for (const [index, candidate] of chapters.entries()) {
    const chapter = candidate as Chapter;
    for (const missionId of chapter.missionIds) {
      if (!missionIds.has(missionId)) throw new ContentLoadError(`chapters[${index}] references unknown mission ${missionId}.`);
    }
  }
  if (!missionIds.has(epilogueMissionId)) throw new ContentLoadError('The epilogue mission does not resolve.');
  const narrative = requireRecord(manifest.narrative, 'trip-manifest.narrative');
  const opening = requireRecord(narrative.opening, 'trip-manifest.narrative.opening');
  if (requireArray(opening, 'tutorialSteps', 'trip-manifest.narrative.opening').length !== 3) {
    throw new ContentLoadError('The opening must contain exactly three tutorial steps.');
  }
  requireRecord(narrative.states, 'trip-manifest.narrative.states');
  requireRecord(manifest.excursionSelection, 'trip-manifest.excursionSelection');
  return value as TripManifest;
}

function assertRewards(value: unknown): RewardsRegister {
  const rewards = requireRecord(value, 'rewards');
  requireArray(rewards, 'powers', 'rewards');
  requireArray(rewards, 'stamps', 'rewards');
  return value as RewardsRegister;
}

function assertSources(value: unknown): SourceRegister {
  const sources = requireRecord(value, 'sources');
  requireArray(sources, 'claims', 'sources');
  return value as SourceRegister;
}

function assertAssets(value: unknown): AssetRegister {
  const assets = requireRecord(value, 'assets');
  requireArray(assets, 'assets', 'assets');
  return value as AssetRegister;
}

function assertPackage(value: unknown): ContentPackage {
  const contentPackage = requireRecord(value, 'content-package');
  requireString(contentPackage, 'contentVersion', 'content-package');
  requireString(contentPackage, 'entrypoint', 'content-package');
  requireArray(contentPackage, 'files', 'content-package');
  const compatibility = requireRecord(contentPackage.compatibility, 'content-package.compatibility');
  requireString(compatibility, 'contentSchemaVersion', 'content-package.compatibility');
  requireString(compatibility, 'minimumAppVersion', 'content-package.compatibility');
  if (!Number.isInteger(compatibility.minimumStorageVersion) || !Number.isInteger(compatibility.maximumStorageVersion)) {
    throw new ContentLoadError('content-package compatibility storage versions are invalid.');
  }
  return value as ContentPackage;
}

const numericVersion = (value: string): readonly number[] | null => {
  if (!/^\d+(?:\.\d+){0,2}$/.test(value)) return null;
  return value.split('.').map(Number);
};

const compareVersions = (left: string, right: string): number => {
  const leftParts = numericVersion(left);
  const rightParts = numericVersion(right);
  if (!leftParts || !rightParts) throw new ContentLoadError('Application/content compatibility version is invalid.');
  for (let index = 0; index < 3; index += 1) {
    const difference = (leftParts[index] ?? 0) - (rightParts[index] ?? 0);
    if (difference) return difference;
  }
  return 0;
};

export async function loadContentBundle(options: ContentLoadOptions = {}): Promise<ContentBundle> {
  const fetcher = options.fetcher ?? globalThis.fetch;
  const basePath = options.basePath ?? import.meta.env.BASE_URL;
  if (!fetcher) throw new ContentLoadError('This browser cannot load the bundled adventure content.');
  const [manifestValue, rewardsValue, sourcesValue, assetsValue, packageValue] = await Promise.all([
    loadJson('trip-manifest.json', fetcher, basePath),
    loadJson('rewards.json', fetcher, basePath),
    loadJson('sources.json', fetcher, basePath),
    loadJson('assets.json', fetcher, basePath),
    loadJson('content-package.json', fetcher, basePath),
  ]);
  const manifest = assertManifest(manifestValue);
  const rewards = assertRewards(rewardsValue);
  const sources = assertSources(sourcesValue);
  const assets = assertAssets(assetsValue);
  const contentPackage = assertPackage(packageValue);
  if (contentPackage.contentVersion !== manifest.contentVersion || contentPackage.entrypoint !== 'trip-manifest.json') {
    throw new ContentLoadError('The adventure content package and manifest do not match.');
  }
  const appVersion = options.appVersion ?? BUILD_METADATA.appVersion;
  const storageVersion = options.storageVersion ?? BUILD_METADATA.databaseVersion;
  if (compareVersions(appVersion, contentPackage.compatibility.minimumAppVersion) < 0) {
    throw new ContentLoadError('This adventure content requires a newer application version.');
  }
  if (
    storageVersion < contentPackage.compatibility.minimumStorageVersion ||
    storageVersion > contentPackage.compatibility.maximumStorageVersion
  ) {
    throw new ContentLoadError('This adventure content is not compatible with the local storage version.');
  }

  const chapters = [...manifest.chapters].sort((left, right) => left.order - right.order);
  const missions = [...manifest.missions].sort((left, right) => left.order - right.order);
  const chapterById = new Map(chapters.map((chapter) => [chapter.id, chapter]));
  const missionById = new Map(missions.map((mission) => [mission.id, mission]));
  const stampLabelById = new Map(rewards.stamps.map((stamp) => [stamp.id, stamp.label]));
  const powerLabelById = new Map(rewards.powers.map((power) => [power.id, power.label]));
  const sourceById = new Map(sources.claims.map((source) => [source.id, source]));

  for (const mission of missions) {
    if (mission.chapterId && !chapterById.has(mission.chapterId)) throw new ContentLoadError(`${mission.id} references an unknown chapter.`);
    if (mission.reward.stamp && !stampLabelById.has(mission.reward.stamp)) throw new ContentLoadError(`${mission.id} references an unknown stamp.`);
    if (mission.reward.power && !powerLabelById.has(mission.reward.power)) throw new ContentLoadError(`${mission.id} references an unknown power.`);
    for (const sourceId of mission.sourceIds) {
      if (!sourceById.has(sourceId)) throw new ContentLoadError(`${mission.id} references an unknown source.`);
    }
  }

  return {
    manifest,
    rewards,
    sources,
    assets,
    contentPackage,
    chapters,
    missions,
    walks: [],
    chapterById,
    missionById,
    stampLabelById,
    powerLabelById,
    sourceById,
  };
}

export function getEffectiveMission(
  mission: Mission,
  selectedPairId: string | null,
  resolvedVariantId: string | null = null,
): EffectiveMission {
  const variant = mission.variants?.find((candidate) =>
    resolvedVariantId ? candidate.id === resolvedVariantId : candidate.pairId === selectedPairId,
  );
  if (!variant) return {...mission, resolvedVariantId: null};
  return {
    ...mission,
    title: variant.title,
    storyBeat: variant.storyBeat,
    objective: variant.objective,
    location: {...mission.location, label: variant.locationLabel},
    roles: variant.roles,
    choices: variant.choices,
    facts: variant.facts,
    completion: variant.completion,
    fallbacks: variant.fallbacks,
    safety: variant.safety,
    sourceIds: variant.sourceIds,
    fact_checked_on: variant.fact_checked_on,
    review_after: variant.review_after,
    resolvedVariantId: variant.id,
  };
}
