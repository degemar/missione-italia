import {
  beginMission,
  createDefaultSave,
  resolveMission,
  type FamilyMember,
  type MissionStage,
  type ResolvedMissionState,
  type SaveEnvelopeV1,
  type StableScreenId,
} from '../contracts/save-contract.js';
import {getEffectiveMission} from '../content/content-repository.js';
import type {ContentBundle} from '../content/types.js';
import {nextRoleRotation} from '../game/roles.js';
import {
  TripDataMaintenance,
  type CacheStoragePort,
  type ConfirmedTripMaintenance,
  type TripDeletionResult,
} from '../platform/trip-data-maintenance.js';
import {
  LocalSaveRepository,
  type CommitSaveResult,
  type DurabilityStatus,
  type LoadSaveResult,
  type PersistenceRequestResult,
  type RepositoryOptions,
} from '../storage/index.js';

export interface StableRouteInput {
  screenId: StableScreenId;
  chapterId?: string | null;
  missionId?: string | null;
  stage?: MissionStage;
}

export interface FamilySetupInput {
  members: FamilyMember[];
  sound: boolean;
}

export type ParentSettingInput = Partial<Pick<SaveEnvelopeV1['settings'], 'sound' | 'reducedMotion'>>;

export interface GameController {
  hydrate(): Promise<LoadSaveResult>;
  saveFamily(input: FamilySetupInput): Promise<CommitSaveResult>;
  navigate(route: StableRouteInput): Promise<CommitSaveResult>;
  beginMission(missionId: string): Promise<CommitSaveResult>;
  resolveMission(missionId: string, result: ResolvedMissionState): Promise<CommitSaveResult>;
  selectExcursionPair(pairId: string): Promise<CommitSaveResult>;
  updateSettings(input: ParentSettingInput): Promise<CommitSaveResult>;
  flushLocalState(): Promise<void>;
  getDurabilityStatus(): DurabilityStatus;
  requestPersistentStorage(): Promise<PersistenceRequestResult>;
  resetProgress(intent: ConfirmedTripMaintenance): Promise<CommitSaveResult>;
  deleteTripData(
    intent: ConfirmedTripMaintenance,
    options?: {cacheStorage?: CacheStoragePort | null; clearDiagnostics?: () => void},
  ): Promise<TripDeletionResult>;
  close(): void;
}

const sameRoute = (left: SaveEnvelopeV1['route'], right: SaveEnvelopeV1['route']): boolean =>
  left.screenId === right.screenId &&
  left.chapterId === right.chapterId &&
  left.missionId === right.missionId &&
  left.stage === right.stage &&
  left.selectedWalkId === right.selectedWalkId;

const withRoute = (save: SaveEnvelopeV1, route: SaveEnvelopeV1['route']): SaveEnvelopeV1 => {
  if (sameRoute(save.route, route)) return save;
  return {...save, localRevision: save.localRevision + 1, route};
};

const toRoute = (input: StableRouteInput): SaveEnvelopeV1['route'] => ({
  screenId: input.screenId,
  chapterId: input.chapterId ?? null,
  missionId: input.missionId ?? null,
  stage: input.stage ?? null,
  selectedWalkId: null,
});

export class LocalGameController implements GameController {
  private constructor(
    private readonly bundle: ContentBundle,
    private readonly repository: LocalSaveRepository,
  ) {}

  static async create(
    bundle: ContentBundle,
    repositoryOptions: Omit<RepositoryOptions, 'catalog'> = {},
  ): Promise<LocalGameController> {
    const variantIdsByMission = new Map(
      bundle.missions
        .filter((mission) => mission.variants?.length)
        .map((mission) => [mission.id, new Set(mission.variants?.map((variant) => variant.id) ?? [])]),
    );
    const repository = await LocalSaveRepository.create({
      ...repositoryOptions,
      catalog: {
        tripKey: bundle.manifest.tripKey,
        contentVersion: bundle.manifest.contentVersion,
        chapterIds: new Set(bundle.chapters.map((chapter) => chapter.id)),
        missionIds: new Set(bundle.missions.map((mission) => mission.id)),
        scoredMissionIds: new Set(bundle.missions.filter((mission) => mission.scored).map((mission) => mission.id)),
        variantIdsByMission,
        compatibleFromContentVersions: new Set([bundle.manifest.contentVersion]),
      },
    });
    return new LocalGameController(bundle, repository);
  }

  hydrate(): Promise<LoadSaveResult> {
    return this.repository.load(this.bundle.manifest.tripKey);
  }

  saveFamily(input: FamilySetupInput): Promise<CommitSaveResult> {
    return this.repository.update(
      this.bundle.manifest.tripKey,
      () => createDefaultSave(this.bundle.manifest.tripKey, this.bundle.manifest.contentVersion),
      (save) => {
        const next: SaveEnvelopeV1 = {
          ...save,
          localRevision: save.localRevision + 1,
          family: {...save.family, members: input.members},
          route: {screenId: 'WELCOME', chapterId: null, missionId: null, stage: null, selectedWalkId: null},
          settings: {...save.settings, sound: input.sound},
        };
        return next;
      },
    );
  }

  navigate(routeInput: StableRouteInput): Promise<CommitSaveResult> {
    const route = toRoute(routeInput);
    return this.repository.update(
      this.bundle.manifest.tripKey,
      () => createDefaultSave(this.bundle.manifest.tripKey, this.bundle.manifest.contentVersion),
      (save) => withRoute(save, route),
    );
  }

  beginMission(missionId: string): Promise<CommitSaveResult> {
    const mission = this.bundle.missionById.get(missionId);
    if (!mission) return Promise.reject(new Error('Unknown mission.'));
    const knownMissionIds = new Set(this.bundle.missions.map((item) => item.id));
    const route = toRoute({screenId: 'STORY', chapterId: mission.chapterId, missionId, stage: 'story'});
    return this.repository.update(
      this.bundle.manifest.tripKey,
      () => createDefaultSave(this.bundle.manifest.tripKey, this.bundle.manifest.contentVersion),
      (save) => {
        const started = beginMission(save, missionId, knownMissionIds);
        return started === save ? withRoute(save, route) : {...started, route};
      },
    );
  }

  resolveMission(missionId: string, result: ResolvedMissionState): Promise<CommitSaveResult> {
    const mission = this.bundle.missionById.get(missionId);
    if (!mission) return Promise.reject(new Error('Unknown mission.'));
    const knownMissionIds = new Set(this.bundle.missions.map((item) => item.id));
    const scoredMissionIds = this.bundle.missions.filter((item) => item.scored).map((item) => item.id);
    return this.repository.update(
      this.bundle.manifest.tripKey,
      () => createDefaultSave(this.bundle.manifest.tripKey, this.bundle.manifest.contentVersion),
      (save) => {
        const current = save.missionProgress[missionId];
        if (current?.state === 'completed' || current?.state === 'manual' || current?.state === 'skipped') return save;
        const effective = getEffectiveMission(mission, save.excursionSelection.selectedPairId);
        const resolved = resolveMission(save, missionId, result, knownMissionIds, effective.resolvedVariantId);
        const storyComplete = scoredMissionIds.every((id) => {
          const progress = resolved.missionProgress[id];
          return progress?.state === 'completed' || progress?.state === 'manual' || progress?.state === 'skipped';
        });
        return {
          ...resolved,
          journeyState: storyComplete ? 'completed' : 'in-progress',
          family: {
            ...resolved.family,
            roleRotationIndex: nextRoleRotation(resolved.family.roleRotationIndex, resolved.family.members.length),
          },
          route: {
            screenId: 'CELEBRATION',
            chapterId: mission.chapterId,
            missionId,
            stage: 'celebration',
            selectedWalkId: null,
          },
        };
      },
    );
  }

  selectExcursionPair(pairId: string): Promise<CommitSaveResult> {
    if (!this.bundle.manifest.excursionSelection.candidatePairs.some((pair) => pair.id === pairId)) {
      return Promise.reject(new Error('Unknown excursion pair.'));
    }
    return this.repository.update(
      this.bundle.manifest.tripKey,
      () => createDefaultSave(this.bundle.manifest.tripKey, this.bundle.manifest.contentVersion),
      (save) => {
        if (save.excursionSelection.selectedPairId === pairId) return save;
        return {
          ...save,
          localRevision: save.localRevision + 1,
          excursionSelection: {selectedPairId: pairId},
        };
      },
    );
  }

  updateSettings(input: ParentSettingInput): Promise<CommitSaveResult> {
    return this.repository.update(
      this.bundle.manifest.tripKey,
      () => createDefaultSave(this.bundle.manifest.tripKey, this.bundle.manifest.contentVersion),
      (save) => {
        const sound = input.sound ?? save.settings.sound;
        const reducedMotion = input.reducedMotion ?? save.settings.reducedMotion;
        if (sound === save.settings.sound && reducedMotion === save.settings.reducedMotion) return save;
        return {
          ...save,
          localRevision: save.localRevision + 1,
          settings: {...save.settings, sound, reducedMotion},
        };
      },
    );
  }

  flushLocalState(): Promise<void> {
    return this.repository.flush();
  }

  getDurabilityStatus(): DurabilityStatus {
    return this.repository.getDurabilityStatus();
  }

  requestPersistentStorage(): Promise<PersistenceRequestResult> {
    return this.repository.requestPersistentStorage();
  }

  resetProgress(intent: ConfirmedTripMaintenance): Promise<CommitSaveResult> {
    return this.maintenance().reset(intent);
  }

  deleteTripData(
    intent: ConfirmedTripMaintenance,
    options: {cacheStorage?: CacheStoragePort | null; clearDiagnostics?: () => void} = {},
  ): Promise<TripDeletionResult> {
    return this.maintenance(options.cacheStorage, options.clearDiagnostics).delete(intent);
  }

  private maintenance(
    cacheStorage?: CacheStoragePort | null,
    clearDiagnostics?: () => void,
  ): TripDataMaintenance {
    const initialize = () => createDefaultSave(this.bundle.manifest.tripKey, this.bundle.manifest.contentVersion);
    if (cacheStorage !== undefined || clearDiagnostics !== undefined) {
      return new TripDataMaintenance(
        this.bundle.manifest.tripKey,
        this.repository,
        initialize,
        cacheStorage ?? null,
        clearDiagnostics ?? (() => undefined),
      );
    }
    return new TripDataMaintenance(this.bundle.manifest.tripKey, this.repository, initialize);
  }

  close(): void {
    this.repository.close();
  }
}
