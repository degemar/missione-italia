export const SAVE_SCHEMA_VERSION = 2 as const;
export const SAVE_TARGET_BYTES = 65_536 as const;
export const SAVE_HARD_LIMIT_BYTES = 262_144 as const;

export const JOURNEY_STATES = ["fresh", "in-progress", "completed", "reset"] as const;
export const MISSION_STATES = ["in-progress", "completed", "manual", "skipped"] as const;
export const RESOLVED_MISSION_STATES = ["completed", "manual", "skipped"] as const;

export type JourneyState = (typeof JOURNEY_STATES)[number];
export type MissionState = (typeof MISSION_STATES)[number];
export type ResolvedMissionState = (typeof RESOLVED_MISSION_STATES)[number];
export type AgeBand = "4-6" | "7-8" | "9-11";
export const SUPPORTED_LOCALES = ["es", "en"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
export type StableScreenId =
  | "WELCOME"
  | "SETUP"
  | "ATLAS"
  | "CHAPTER"
  | "MISSION"
  | "STORY"
  | "LOOK-UP"
  | "CHALLENGE"
  | "CELEBRATION"
  | "PASSPORT"
  | "EPILOGUE"
  | "PARENT";
export type MissionStage = "story" | "look-up" | "challenge" | "celebration" | null;

export interface FamilyMember {
  id: `child-${1 | 2 | 3}`;
  nickname: string;
  ageBand: AgeBand;
  avatarId: string | null;
}

export interface MissionProgress {
  state: MissionState;
  resolvedVariantId: string | null;
}

export interface SaveEnvelopeV1 {
  schemaVersion: typeof SAVE_SCHEMA_VERSION;
  tripKey: string;
  contentVersion: string;
  journeyState: JourneyState;
  localRevision: number;
  family: {members: FamilyMember[]; roleRotationIndex: 0 | 1 | 2};
  route: {
    screenId: StableScreenId;
    chapterId: string | null;
    missionId: string | null;
    stage: MissionStage;
    selectedWalkId: string | null;
  };
  missionProgress: Record<string, MissionProgress>;
  excursionSelection: {selectedPairId: string | null};
  settings: {
    preferredLocale: SupportedLocale;
    italianPhrases: boolean;
    sound: boolean;
    reducedMotion: boolean;
    highContrast: boolean;
  };
  backup: {
    enabled: boolean;
    dirty: boolean;
    lastSuccessfulRevision: number | null;
    lastSuccessfulSyncAt: string | null;
  };
}

export const createDefaultSave = (tripKey: string, contentVersion: string): SaveEnvelopeV1 => ({
  schemaVersion: SAVE_SCHEMA_VERSION,
  tripKey,
  contentVersion,
  journeyState: "fresh",
  localRevision: 0,
  family: {members: [], roleRotationIndex: 0},
  route: {screenId: "WELCOME", chapterId: null, missionId: null, stage: null, selectedWalkId: null},
  missionProgress: {},
  excursionSelection: {selectedPairId: null},
  settings: {preferredLocale: "es", italianPhrases: true, sound: false, reducedMotion: false, highContrast: false},
  backup: {enabled: false, dirty: false, lastSuccessfulRevision: null, lastSuccessfulSyncAt: null}
});

const withRevision = (save: SaveEnvelopeV1): SaveEnvelopeV1 => ({
  ...save,
  localRevision: save.localRevision + 1,
  backup: {...save.backup, dirty: save.backup.enabled || save.backup.dirty}
});

export const beginMission = (
  save: SaveEnvelopeV1,
  missionId: string,
  knownMissionIds: ReadonlySet<string>
): SaveEnvelopeV1 => {
  if (!knownMissionIds.has(missionId) || save.missionProgress[missionId]) return save;
  return withRevision({
    ...save,
    journeyState: "in-progress",
    missionProgress: {...save.missionProgress, [missionId]: {state: "in-progress", resolvedVariantId: null}}
  });
};

export const resolveMission = (
  save: SaveEnvelopeV1,
  missionId: string,
  state: ResolvedMissionState,
  knownMissionIds: ReadonlySet<string>,
  resolvedVariantId: string | null = null
): SaveEnvelopeV1 => {
  if (!knownMissionIds.has(missionId)) return save;
  const current = save.missionProgress[missionId];
  if (current && RESOLVED_MISSION_STATES.includes(current.state as ResolvedMissionState)) return save;
  return withRevision({
    ...save,
    journeyState: "in-progress",
    missionProgress: {...save.missionProgress, [missionId]: {state, resolvedVariantId}}
  });
};

export const resetProgress = (save: SaveEnvelopeV1): SaveEnvelopeV1 => {
  const alreadyReset = save.journeyState === "reset" && Object.keys(save.missionProgress).length === 0;
  if (alreadyReset) return save;
  return withRevision({
    ...save,
    journeyState: "reset",
    route: {screenId: "ATLAS", chapterId: null, missionId: null, stage: null, selectedWalkId: null},
    missionProgress: {}
  });
};

export const partitionMissionProgress = (
  save: SaveEnvelopeV1,
  knownMissionIds: ReadonlySet<string>
): {active: Record<string, MissionProgress>; unknown: Record<string, MissionProgress>} => {
  const active: Record<string, MissionProgress> = {};
  const unknown: Record<string, MissionProgress> = {};
  for (const [id, progress] of Object.entries(save.missionProgress)) {
    (knownMissionIds.has(id) ? active : unknown)[id] = progress;
  }
  return {active, unknown};
};
