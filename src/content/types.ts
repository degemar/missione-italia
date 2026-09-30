export type RoleId = 'spotter' | 'detective' | 'navigator';
export type CompletionState = 'completed' | 'manual' | 'skipped';

export interface RoleAction {
  role: RoleId;
  action: string;
}

export interface MissionChoice {
  id: string;
  label: string;
  correct: boolean;
  hint: string;
}

export interface MissionFact {
  label: 'FACT' | 'TRADITION' | 'LEGEND' | 'OUR STORY';
  text: string;
  sourceId: string | null;
}

export interface MissionCompletion {
  mode: string;
  allowedStates: CompletionState[];
  retryLine: string;
  explanation: string;
  successLine: string;
}

export interface MissionFallbacks {
  noGps: string;
  closedVenue: string;
  badWeather: string;
  tiredLegs: string;
}

export interface MissionPhrase {
  it: string;
  en: string;
  pronunciation: string;
  gesture: string;
}

export interface MissionVariant {
  id: string;
  pairId: string;
  title: string;
  locationLabel: string;
  storyBeat: string;
  objective: string;
  roles: RoleAction[];
  choices: MissionChoice[];
  facts: MissionFact[];
  completion: MissionCompletion;
  fallbacks: MissionFallbacks;
  safety: string[];
  sourceIds: string[];
  fact_checked_on: string;
  review_after: string;
}

export interface Mission {
  id: string;
  order: number;
  chapterId: string | null;
  date: string;
  scored: boolean;
  title: string;
  status: string;
  durationMinutes: number;
  energy: string;
  storyBeat: string;
  objective: string;
  location: {
    mode: 'parent-selected';
    label: string;
    coordinates: [number, number] | null;
  };
  roles: RoleAction[];
  choices: MissionChoice[];
  phrases?: MissionPhrase[];
  facts: MissionFact[];
  variants?: MissionVariant[];
  completion: MissionCompletion;
  fallbacks: MissionFallbacks;
  safety: string[];
  reward: {stamp: string | null; power: string | null};
  sourceIds: string[];
  assetIds?: string[];
  fact_checked_on: string;
  review_after: string;
  offlineCritical: boolean;
  dependencies: {gps: boolean; audio: boolean; ticket: boolean; liveData: boolean};
}

export interface Chapter {
  id: string;
  order: number;
  dateRange: [string, string];
  title: string;
  power: string;
  status: string;
  missionIds: string[];
  openingBeat: string;
  closingBeat: string;
}

export interface ExcursionPair {
  id: string;
  label: string;
  status: string;
  morningVariantId: string;
  afternoonVariantId: string;
  reason: string;
}

export interface TripManifest {
  schemaVersion: string;
  contentVersion: string;
  tripKey: string;
  status: string;
  generatedAt: string;
  minimumAppVersion: string;
  minimumStorageVersion: number;
  locales: {default: 'en'; available: string[]; italianLayer: boolean};
  excludedContent: string[];
  epilogueMissionId: string;
  narrative: {
    opening: {
      storyBeat: string;
      youngestAction: string;
      familyOath: string;
      tutorialSteps: [string, string, string];
    };
    states: {
      interrupted: string;
      resume: string;
      skip: string;
      manual: string;
      retry: string;
      offline: string;
      closedVenue: string;
      tiredLegs: string;
      badWeather: string;
      endingWithSkips: string;
      endingAllObserved: string;
      mondaySilent: string;
    };
  };
  chapters: Chapter[];
  excursionSelection: {
    status: string;
    selectedPairId: string | null;
    recommendedPairId: string;
    candidatePairs: ExcursionPair[];
  };
  missions: Mission[];
}

export interface RewardsRegister {
  schemaVersion: string;
  powers: Array<{id: string; label: string; chapterId: string}>;
  stamps: Array<{id: string; label: string}>;
}

export interface SourceClaim {
  id: string;
  publisher: string;
  pageTitle: string;
  url: string;
  claimType: string;
  claimText: string;
  requiredRecheckOn: string;
}

export interface SourceRegister {
  schemaVersion: string;
  claims: SourceClaim[];
}

export interface AssetRegister {
  schemaVersion: string;
  assets: Array<{id: string; path: string; mediaType: string; license: string; offlineCritical: boolean; sha256: string}>;
}

export interface ContentPackage {
  schemaVersion: string;
  contentVersion: string;
  status: string;
  entrypoint: string;
  compatibility: {
    contentSchemaVersion: string;
    minimumAppVersion: string;
    minimumStorageVersion: number;
    maximumStorageVersion: number;
  };
  files: Array<{path: string; sha256: string; bytes: number; offlineCritical: boolean}>;
}

export interface WalkContent {
  id: string;
  chapterId: string;
  title: string;
}

export interface ContentBundle {
  manifest: TripManifest;
  rewards: RewardsRegister;
  sources: SourceRegister;
  assets: AssetRegister;
  contentPackage: ContentPackage;
  chapters: readonly Chapter[];
  missions: readonly Mission[];
  walks: readonly WalkContent[];
  chapterById: ReadonlyMap<string, Chapter>;
  missionById: ReadonlyMap<string, Mission>;
  stampLabelById: ReadonlyMap<string, string>;
  powerLabelById: ReadonlyMap<string, string>;
  sourceById: ReadonlyMap<string, SourceClaim>;
}

export interface EffectiveMission extends Omit<Mission, 'variants'> {
  resolvedVariantId: string | null;
}
