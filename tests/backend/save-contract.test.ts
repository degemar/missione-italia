import {describe, expect, it} from 'vitest';

import {type SaveEnvelopeV1} from '../../src/contracts/save-contract.js';
import {reconcileSaveWithContent} from '../../src/storage/content-reconciliation.js';
import {migrateSave, UnsupportedSaveVersionError} from '../../src/storage/save-migrations.js';
import {validateSaveEnvelope} from '../../src/storage/save-validation.js';
import {catalog, readFixture} from './helpers.js';

describe('save validation, migration, and reconciliation', () => {
  it.each(['fresh', 'in-progress', 'manual', 'skipped', 'completed', 'reset', 'unknown-id-recovery'])('validates %s fixture', (name) => {
    const fixture = readFixture<unknown>(`tests/fixtures/save/valid/${name}.json`);
    expect(validateSaveEnvelope(fixture, {scoredMissionIds: catalog.scoredMissionIds}).ok).toBe(true);
  });

  it.each(['prohibited-data', 'invalid-state', 'binary-media'])('rejects %s fixture', (name) => {
    const fixture = readFixture<unknown>(`tests/fixtures/save/invalid/${name}.json`);
    expect(validateSaveEnvelope(fixture).ok).toBe(false);
  });

  it('migrates schema 0 deterministically and idempotently', () => {
    const legacy = readFixture<unknown>('tests/fixtures/save/migration/v0.json');
    const first = migrateSave(legacy, {scoredMissionIds: catalog.scoredMissionIds});
    const second = migrateSave(first.save, {scoredMissionIds: catalog.scoredMissionIds});
    expect(first.migrated).toBe(true);
    expect(first.save.schemaVersion).toBe(1);
    expect(first.save.settings.highContrast).toBe(false);
    expect(first.save.backup.enabled).toBe(false);
    expect(second).toMatchObject({migrated: false, save: first.save});
  });

  it('refuses a newer schema without modifying it', () => {
    const future = readFixture<unknown>('tests/fixtures/save/migration/v2-unsupported.json');
    expect(() => migrateSave(future)).toThrow(UnsupportedSaveVersionError);
    expect((future as {schemaVersion: number}).schemaVersion).toBe(2);
  });

  it('preserves unknown mission IDs but keeps them inactive', () => {
    const save = readFixture<SaveEnvelopeV1>('tests/fixtures/save/valid/unknown-id-recovery.json');
    const result = reconcileSaveWithContent(save, catalog);
    expect(result.activeMissionProgress).toHaveProperty('ROAD-01');
    expect(result.unknownMissionProgress).toHaveProperty('ARCHIVE-99');
    expect(result.activeMissionProgress).not.toHaveProperty('ARCHIVE-99');
    expect(result.save.missionProgress).toHaveProperty('ARCHIVE-99');
  });

  it('updates compatible content and recovers an unknown resume route', () => {
    const save = readFixture<SaveEnvelopeV1>('tests/fixtures/save/valid/in-progress.json');
    save.contentVersion = 'trip-2026.09-v1';
    save.route = {screenId: 'MISSION', chapterId: 'archive', missionId: 'ARCHIVE-99', stage: null, selectedWalkId: null};
    const result = reconcileSaveWithContent(save, catalog);
    expect(result.contentVersionChanged).toBe(true);
    expect(result.routeRecovered).toBe(true);
    expect(result.save.route.screenId).toBe('ATLAS');
  });

  it('applies explicit mission-ID mappings and preserves removed progress as inactive', () => {
    const save = readFixture<SaveEnvelopeV1>('tests/fixtures/save/valid/in-progress.json');
    save.missionProgress = {
      'OLD-01': {state: 'completed', resolvedVariantId: null},
      'REMOVED-01': {state: 'manual', resolvedVariantId: null},
    };
    save.route = {...save.route, screenId: 'MISSION', missionId: 'OLD-01'};
    const result = reconcileSaveWithContent(save, {
      ...catalog,
      missionIdMigrations: new Map([['OLD-01', 'ROAD-01'], ['REMOVED-01', null]]),
    });
    expect(result.missionIdsChanged).toBe(true);
    expect(result.save.missionProgress['ROAD-01']?.state).toBe('completed');
    expect(result.save.missionProgress['REMOVED-01']?.state).toBe('manual');
    expect(result.activeMissionProgress).toHaveProperty('ROAD-01');
    expect(result.unknownMissionProgress).toHaveProperty('REMOVED-01');
    expect(result.save.route.missionId).toBe('ROAD-01');
  });
});
