import {type MissionProgress, type SaveEnvelopeV1} from '../contracts/save-contract.js';
import {assertValidSaveEnvelope, type SaveValidationContext} from './save-validation.js';

export interface ContentCatalog {
  tripKey: string;
  contentVersion: string;
  chapterIds: ReadonlySet<string>;
  missionIds: ReadonlySet<string>;
  scoredMissionIds: ReadonlySet<string>;
  variantIdsByMission: ReadonlyMap<string, ReadonlySet<string>>;
  compatibleFromContentVersions?: ReadonlySet<string>;
  missionIdMigrations?: ReadonlyMap<string, string | null>;
}

export interface ReconciliationResult {
  save: SaveEnvelopeV1;
  activeMissionProgress: Record<string, MissionProgress>;
  unknownMissionProgress: Record<string, MissionProgress>;
  inactiveVariantMissionIds: string[];
  contentVersionChanged: boolean;
  routeRecovered: boolean;
  missionIdsChanged: boolean;
}

export class IncompatibleContentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'IncompatibleContentError';
  }
}

export const validationContextFromCatalog = (catalog: ContentCatalog): SaveValidationContext => ({
  scoredMissionIds: catalog.scoredMissionIds,
});

export const reconcileSaveWithContent = (input: SaveEnvelopeV1, catalog: ContentCatalog): ReconciliationResult => {
  if (input.tripKey !== catalog.tripKey) throw new IncompatibleContentError(`Save trip ${input.tripKey} does not match ${catalog.tripKey}.`);
  const contentVersionChanged = input.contentVersion !== catalog.contentVersion;
  if (contentVersionChanged && catalog.compatibleFromContentVersions && !catalog.compatibleFromContentVersions.has(input.contentVersion)) {
    throw new IncompatibleContentError(`Content ${input.contentVersion} is not compatible with ${catalog.contentVersion}.`);
  }
  const activeMissionProgress: Record<string, MissionProgress> = {};
  const unknownMissionProgress: Record<string, MissionProgress> = {};
  const missionProgress: Record<string, MissionProgress> = {};
  const inactiveVariantMissionIds: string[] = [];
  let missionIdsChanged = false;
  for (const [missionId, progress] of Object.entries(input.missionProgress)) {
    const hasMigration = catalog.missionIdMigrations?.has(missionId) ?? false;
    const migratedId = hasMigration ? catalog.missionIdMigrations?.get(missionId) ?? null : missionId;
    if (migratedId && catalog.missionIds.has(migratedId) && !missionProgress[migratedId]) {
      missionProgress[migratedId] = progress;
      activeMissionProgress[migratedId] = progress;
      missionIdsChanged ||= migratedId !== missionId;
      if (progress.resolvedVariantId && !catalog.variantIdsByMission.get(migratedId)?.has(progress.resolvedVariantId)) inactiveVariantMissionIds.push(migratedId);
    } else {
      missionProgress[missionId] = progress;
      unknownMissionProgress[missionId] = progress;
    }
  }
  const routeMissionId = input.route.missionId && catalog.missionIdMigrations?.has(input.route.missionId)
    ? catalog.missionIdMigrations.get(input.route.missionId) ?? null
    : input.route.missionId;
  const routeMissionKnown = routeMissionId === null || catalog.missionIds.has(routeMissionId);
  const routeChapterKnown = input.route.chapterId === null || catalog.chapterIds.has(input.route.chapterId);
  const routeRecovered = !routeMissionKnown || !routeChapterKnown;
  const save: SaveEnvelopeV1 = {
    ...input,
    contentVersion: catalog.contentVersion,
    missionProgress,
    route: routeRecovered
      ? {screenId: 'ATLAS', chapterId: null, missionId: null, stage: null, selectedWalkId: null}
      : routeMissionId !== input.route.missionId
        ? {...input.route, missionId: routeMissionId}
        : input.route,
  };
  assertValidSaveEnvelope(save, validationContextFromCatalog(catalog));
  return {save, activeMissionProgress, unknownMissionProgress, inactiveVariantMissionIds, contentVersionChanged, routeRecovered, missionIdsChanged};
};
