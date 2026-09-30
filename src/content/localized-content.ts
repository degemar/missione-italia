import type {
  AssetRegister,
  LocalizedTripManifest,
  NarrationManifest,
  TripManifest,
} from './types.js';

export class LocalizedContentContractError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LocalizedContentContractError';
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

export function assertLocalizedContentContracts(
  localizedValue: unknown,
  narrationValue: unknown,
  base: TripManifest,
  assets?: AssetRegister,
): {localized: LocalizedTripManifest; narration: NarrationManifest} {
  if (!isRecord(localizedValue) || localizedValue.locale !== 'es' || localizedValue.fallbackLocale !== 'en') {
    throw new LocalizedContentContractError('Spanish content must declare English fallback.');
  }
  if (localizedValue.baseContentVersion !== base.contentVersion || !isRecord(localizedValue.missions) || !isRecord(localizedValue.chapters)) {
    throw new LocalizedContentContractError('Localized content does not match the active base manifest.');
  }
  const missionIds = new Set(base.missions.map(({id}) => id));
  const chapterIds = new Set(base.chapters.map(({id}) => id));
  if (!sameIds(Object.keys(localizedValue.missions), missionIds) || !sameIds(Object.keys(localizedValue.chapters), chapterIds)) {
    throw new LocalizedContentContractError('Localized mission or chapter IDs differ from the base manifest.');
  }
  const knownAssetIds = new Set(assets?.assets.map(({id}) => id) ?? []);
  for (const [missionId, value] of Object.entries(localizedValue.missions)) {
    if (!isRecord(value)) throw new LocalizedContentContractError(`${missionId} localization must be an object.`);
    validateAssetIds(value.assetIds, knownAssetIds, `${missionId}.assetIds`, Boolean(assets));
    if (value.variants !== undefined) {
      if (!isRecord(value.variants)) throw new LocalizedContentContractError(`${missionId}.variants must be an object.`);
      const baseMission = base.missions.find(({id}) => id === missionId);
      const variantIds = new Set(baseMission?.variants?.map(({id}) => id) ?? []);
      if (!sameIds(Object.keys(value.variants), variantIds)) throw new LocalizedContentContractError(`${missionId} localized variant IDs differ from the base manifest.`);
    }
  }
  if (!isRecord(narrationValue) || narrationValue.locale !== 'es' || narrationValue.autoplay !== false || narrationValue.captionPolicy !== 'exact-script' || !Array.isArray(narrationValue.segments)) {
    throw new LocalizedContentContractError('Narration metadata is missing or invalid.');
  }
  const segmentIds = new Set<string>();
  for (const [index, value] of narrationValue.segments.entries()) {
    if (!isRecord(value) || typeof value.id !== 'string' || segmentIds.has(value.id)) throw new LocalizedContentContractError(`Invalid narration segment at index ${index}.`);
    segmentIds.add(value.id);
    if (typeof value.scriptRef !== 'string' || typeof value.captionRef !== 'string' || value.scriptRef !== value.captionRef) {
      throw new LocalizedContentContractError(`${value.id} caption must resolve from the exact script reference.`);
    }
    if (value.captionText !== undefined && typeof value.captionText !== 'string') throw new LocalizedContentContractError(`${value.id}.captionText must be text.`);
    validateAssetIds(value.audioAssetId === undefined ? undefined : [value.audioAssetId], knownAssetIds, `${value.id}.audioAssetId`, Boolean(assets));
  }
  return {localized: localizedValue as unknown as LocalizedTripManifest, narration: narrationValue as unknown as NarrationManifest};
}

function sameIds(actual: string[], expected: ReadonlySet<string>): boolean {
  return actual.length === expected.size && actual.every((id) => expected.has(id));
}

function validateAssetIds(value: unknown, known: ReadonlySet<string>, path: string, enforceKnown: boolean): void {
  if (value === undefined) return;
  if (!Array.isArray(value) || !value.every((id) => typeof id === 'string' && id.length > 0)) throw new LocalizedContentContractError(`${path} must contain asset IDs.`);
  if (enforceKnown) for (const id of value) if (!known.has(id)) throw new LocalizedContentContractError(`${path} references unknown asset ${id}.`);
}
