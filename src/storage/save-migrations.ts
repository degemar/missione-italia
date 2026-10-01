import {SAVE_SCHEMA_VERSION, type SaveEnvelopeV1} from '../contracts/save-contract.js';
import {assertValidSaveEnvelope, type SaveValidationContext} from './save-validation.js';

export interface LegacySaveV0 extends Omit<SaveEnvelopeV1, 'schemaVersion' | 'settings' | 'backup'> {
  schemaVersion: 0;
  settings: Omit<SaveEnvelopeV1['settings'], 'preferredLocale' | 'highContrast'> & {language: 'en'};
}

export interface LegacySaveV1 extends Omit<SaveEnvelopeV1, 'schemaVersion' | 'settings'> {
  schemaVersion: 1;
  settings: Omit<SaveEnvelopeV1['settings'], 'preferredLocale'> & {language: 'en'};
}

interface LegacySaveV2 extends Omit<SaveEnvelopeV1, 'schemaVersion' | 'settings'> {
  schemaVersion: 2;
  settings: Omit<SaveEnvelopeV1['settings'], 'preferredLocale'> & {preferredLocale: 'en' | 'es'};
}

export interface MigrationResult {
  save: SaveEnvelopeV1;
  fromVersion: number;
  toVersion: typeof SAVE_SCHEMA_VERSION;
  migrated: boolean;
}

export class UnsupportedSaveVersionError extends Error {
  constructor(readonly version: number) {
    super(`Storage schema ${version} is newer than supported schema ${SAVE_SCHEMA_VERSION}.`);
    this.name = 'UnsupportedSaveVersionError';
  }
}

export class InvalidLegacySaveError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidLegacySaveError';
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const migrateV0ToV1 = (input: unknown): LegacySaveV1 => {
  if (!isRecord(input) || input.schemaVersion !== 0 || !isRecord(input.settings)) throw new InvalidLegacySaveError('Invalid storage schema 0 record.');
  const legacy = input as unknown as LegacySaveV0;
  return {
    ...legacy,
    schemaVersion: 1,
    settings: {...legacy.settings, highContrast: false},
    backup: {enabled: false, dirty: false, lastSuccessfulRevision: null, lastSuccessfulSyncAt: null},
  };
};

const migrateV1ToV2 = (input: unknown): LegacySaveV2 => {
  if (!isRecord(input) || input.schemaVersion !== 1 || !isRecord(input.settings) || input.settings.language !== 'en') {
    throw new InvalidLegacySaveError('Invalid storage schema 1 record.');
  }
  const legacy = input as unknown as LegacySaveV1;
  const {italianPhrases, sound, reducedMotion, highContrast} = legacy.settings;
  return {
    ...legacy,
    schemaVersion: 2,
    settings: {preferredLocale: 'en', italianPhrases, sound, reducedMotion, highContrast},
  };
};

const migrateV2ToV3 = (input: unknown): SaveEnvelopeV1 => {
  if (!isRecord(input) || input.schemaVersion !== 2 || !isRecord(input.settings)) {
    throw new InvalidLegacySaveError('Invalid storage schema 2 record.');
  }
  const legacy = input as unknown as LegacySaveV2;
  return {
    ...legacy,
    schemaVersion: SAVE_SCHEMA_VERSION,
    settings: {...legacy.settings, preferredLocale: 'es'},
  };
};

export const STORAGE_MIGRATIONS = [
  {from: 0, to: 1, migrate: migrateV0ToV1},
  {from: 1, to: 2, migrate: migrateV1ToV2},
  {from: 2, to: 3, migrate: migrateV2ToV3},
] as const;

export const migrateSave = (input: unknown, validationContext: SaveValidationContext = {}): MigrationResult => {
  if (!isRecord(input) || !Number.isInteger(input.schemaVersion) || (input.schemaVersion as number) < 0) throw new InvalidLegacySaveError('Missing or invalid storage schema version.');
  const fromVersion = input.schemaVersion as number;
  if (fromVersion > SAVE_SCHEMA_VERSION) throw new UnsupportedSaveVersionError(fromVersion);
  let current: unknown = input;
  let version = fromVersion;
  while (version < SAVE_SCHEMA_VERSION) {
    const migration = STORAGE_MIGRATIONS.find((candidate) => candidate.from === version);
    if (!migration) throw new InvalidLegacySaveError(`No migration exists from storage schema ${version}.`);
    current = migration.migrate(current);
    version = migration.to;
  }
  return {
    save: assertValidSaveEnvelope(current, validationContext),
    fromVersion,
    toVersion: SAVE_SCHEMA_VERSION,
    migrated: fromVersion !== SAVE_SCHEMA_VERSION,
  };
};
