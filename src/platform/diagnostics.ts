import {BUILD_METADATA, type BuildMetadata} from './build-metadata.js';
import type {PlatformState} from './platform-state.js';
import {
  RECOVERY_CATALOGUE,
  type DiagnosticCode,
} from './recovery-catalogue.js';
import type {StorageHealth} from './storage-health.js';

export const MAX_DIAGNOSTIC_ENTRIES = 20;
export const DIAGNOSTIC_STORAGE_KEY = 'missione-italia:diagnostics:v1';

export interface DiagnosticEntry {
  readonly code: DiagnosticCode;
  readonly at: string;
}

export interface DiagnosticSnapshot {
  readonly schemaVersion: 1;
  readonly versions: BuildMetadata & {readonly contentVersion: string};
  readonly serviceWorker: 'checking' | 'offline-ready' | 'registration-failed' | 'unsupported';
  readonly platform: Pick<PlatformState, 'connectivity' | 'offlineReadiness' | 'tiles' | 'location' | 'cloud'>;
  readonly storage: StorageHealth;
  readonly featureFlags: {readonly cloudBackup: boolean};
  readonly recentCodes: readonly DiagnosticEntry[];
}

const knownCodes = new Set<DiagnosticCode>(
  Object.values(RECOVERY_CATALOGUE).map(({code}) => code),
);

const isEntry = (value: unknown): value is DiagnosticEntry => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const candidate = value as Record<string, unknown>;
  return typeof candidate.code === 'string' && knownCodes.has(candidate.code as DiagnosticCode) &&
    typeof candidate.at === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(candidate.at);
};

export class LocalDiagnosticBuffer {
  constructor(
    private readonly storage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> | null = typeof localStorage === 'undefined' ? null : localStorage,
    private readonly now: () => Date = () => new Date(),
  ) {}

  entries(): readonly DiagnosticEntry[] {
    const raw = this.storage?.getItem(DIAGNOSTIC_STORAGE_KEY);
    if (!raw) return [];
    try {
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(isEntry).slice(-MAX_DIAGNOSTIC_ENTRIES);
    } catch {
      return [];
    }
  }

  record(code: DiagnosticCode): void {
    if (!knownCodes.has(code) || !this.storage) return;
    const entry: DiagnosticEntry = {code, at: this.now().toISOString()};
    const entries = [...this.entries(), entry].slice(-MAX_DIAGNOSTIC_ENTRIES);
    try {
      this.storage.setItem(DIAGNOSTIC_STORAGE_KEY, JSON.stringify(entries));
    } catch {
      // Diagnostics are best-effort and never affect gameplay.
    }
  }

  clear(): void {
    try {
      this.storage?.removeItem(DIAGNOSTIC_STORAGE_KEY);
    } catch {
      // Diagnostics are best-effort and never affect gameplay.
    }
  }
}

export function createDiagnosticSnapshot(input: {
  readonly contentVersion: string;
  readonly serviceWorker: DiagnosticSnapshot['serviceWorker'];
  readonly platform: PlatformState;
  readonly storage: StorageHealth;
  readonly cloudBackup: boolean;
  readonly recentCodes: readonly DiagnosticEntry[];
  readonly build?: BuildMetadata;
}): DiagnosticSnapshot {
  const build = input.build ?? BUILD_METADATA;
  return {
    schemaVersion: 1,
    versions: {...build, contentVersion: input.contentVersion},
    serviceWorker: input.serviceWorker,
    platform: {
      connectivity: input.platform.connectivity,
      offlineReadiness: input.platform.offlineReadiness,
      tiles: input.platform.tiles,
      location: input.platform.location,
      cloud: input.platform.cloud,
    },
    storage: input.storage,
    featureFlags: {cloudBackup: input.cloudBackup},
    recentCodes: input.recentCodes.filter(isEntry).slice(-MAX_DIAGNOSTIC_ENTRIES),
  };
}

export const createDiagnosticPreview = (snapshot: DiagnosticSnapshot): string =>
  JSON.stringify(snapshot, null, 2);
