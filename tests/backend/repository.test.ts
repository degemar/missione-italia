import {describe, expect, it} from 'vitest';

import {beginMission, resolveMission, type SaveEnvelopeV1} from '../../src/contracts/save-contract.js';
import {integrityHash} from '../../src/storage/canonical-json.js';
import {LocalSaveRepository, RepositoryBlockedError} from '../../src/storage/local-save-repository.js';
import {FailingStorageEngine, IndexedDbStorageEngine, MemoryStorageEngine, type StoredSaveRecord} from '../../src/storage/storage-engine.js';
import {catalog, createHarness, freshSave, manifest, readFixture} from './helpers.js';

const tripKey = catalog.tripKey;

describe('local save repository', () => {
  it('persists before resolving and survives a database reopen without network', async () => {
    let harness = await createHarness();
    const result = await harness.repository.update(tripKey, freshSave, (save) => beginMission(save, 'ROAD-01', catalog.missionIds));
    expect(result.persisted).toBe(true);
    const stored = await harness.engine.transaction('readonly', (transaction) => transaction.getSave(tripKey));
    expect((stored?.payload as SaveEnvelopeV1).missionProgress['ROAD-01']?.state).toBe('in-progress');
    harness = await harness.reopen();
    const loaded = await harness.repository.load(tripKey);
    expect(loaded.save?.missionProgress['ROAD-01']?.state).toBe('in-progress');
    expect(loaded.durability.mode).toBe('persistent');
    harness.repository.close();
  });

  it('serializes rapid duplicate completion and awards one keyed state', async () => {
    const harness = await createHarness();
    await harness.repository.update(tripKey, freshSave, (save) => beginMission(save, 'ROAD-01', catalog.missionIds));
    const results = await Promise.all(Array.from({length: 20}, () => harness.repository.update(
      tripKey,
      freshSave,
      (save) => resolveMission(save, 'ROAD-01', 'completed', catalog.missionIds),
    )));
    const loaded = await harness.repository.load(tripKey);
    expect(results.filter(({changed}) => changed)).toHaveLength(1);
    expect(loaded.save?.localRevision).toBe(2);
    expect(loaded.save?.missionProgress).toEqual({'ROAD-01': {state: 'completed', resolvedVariantId: null}});
    harness.repository.close();
  });

  it('persists setup and settings, then resets progress without deleting family data', async () => {
    let harness = await createHarness();
    await harness.repository.update(tripKey, freshSave, (save) => ({
      ...save,
      localRevision: save.localRevision + 1,
      family: {members: [{id: 'child-1', nickname: 'Nova', ageBand: '7-8', avatarId: null}], roleRotationIndex: 0},
      settings: {...save.settings, highContrast: true},
    }));
    await harness.repository.update(tripKey, freshSave, (save) => beginMission(save, 'ROAD-01', catalog.missionIds));
    await harness.repository.resetProgress(tripKey, freshSave);
    harness = await harness.reopen();
    const loaded = await harness.repository.load(tripKey);
    expect(loaded.save).toMatchObject({journeyState: 'reset', settings: {highContrast: true}});
    expect(loaded.save?.family.members[0]?.nickname).toBe('Nova');
    expect(loaded.save?.missionProgress).toEqual({});
    harness.repository.close();
  });

  it('keeps three bounded snapshots and one coalesced outbox marker atomically', async () => {
    const harness = await createHarness();
    await harness.repository.update(tripKey, freshSave, (save) => ({
      ...save,
      localRevision: save.localRevision + 1,
      journeyState: 'in-progress',
      missionProgress: {'ROAD-01': {state: 'in-progress', resolvedVariantId: null}},
      backup: {...save.backup, enabled: true, dirty: true},
    }));
    for (const missionId of ['ROAD-01', 'ROAD-02', 'ROAD-03', 'VEN-01', 'VEN-02']) {
      await harness.repository.update(tripKey, freshSave, (save) => {
        if (save.missionProgress[missionId]) return save;
        return {...save, localRevision: save.localRevision + 1, missionProgress: {...save.missionProgress, [missionId]: {state: 'completed', resolvedVariantId: null}}};
      });
    }
    const state = await harness.engine.transaction('readonly', async (transaction) => ({
      recovery: await transaction.getRecoveries(tripKey),
      outbox: await transaction.getOutbox(tripKey),
      canonical: await transaction.getSave(tripKey),
    }));
    expect(state.recovery).toHaveLength(3);
    expect(state.outbox?.localRevision).toBe((state.canonical?.payload as SaveEnvelopeV1).localRevision);
    expect(state.outbox).not.toHaveProperty('payload');
    harness.repository.close();
  });

  it('continues in explicit memory-only mode when IndexedDB is unavailable', async () => {
    const repository = await LocalSaveRepository.create({catalog, indexedDBFactory: null, storagePersistence: null});
    const result = await repository.update(tripKey, freshSave, (save) => beginMission(save, 'ROAD-01', catalog.missionIds));
    expect(result.persisted).toBe(false);
    expect(result.durability).toMatchObject({mode: 'memory-only', reason: 'unavailable'});
    expect(result.durability.parentMessage).toContain('not saved');
    expect((await repository.load(tripKey)).save?.missionProgress).toHaveProperty('ROAD-01');
  });

  it('falls back to memory after a quota error without claiming persistence', async () => {
    const repository = await LocalSaveRepository.create({
      catalog,
      engine: new FailingStorageEngine(() => new DOMException('Quota reached', 'QuotaExceededError')),
      storagePersistence: null,
    });
    const result = await repository.update(tripKey, freshSave, (save) => beginMission(save, 'ROAD-01', catalog.missionIds));
    expect(result.persisted).toBe(false);
    expect(result.durability).toMatchObject({mode: 'memory-only', reason: 'quota'});
    expect((await repository.load(tripKey)).save?.missionProgress['ROAD-01']?.state).toBe('in-progress');
  });

  it('migrates old storage with a pre-migration recovery and does not repeat migration', async () => {
    const harness = await createHarness();
    const legacy = readFixture<unknown>('tests/fixtures/save/migration/v0.json');
    const record: StoredSaveRecord = {tripKey, payload: legacy, integrity: integrityHash(legacy), storedAt: '2026-09-29T00:00:00.000Z'};
    await harness.engine.transaction('readwrite', (transaction) => transaction.putSave(record));
    expect((await harness.repository.load(tripKey)).save?.schemaVersion).toBe(2);
    const afterFirst = await harness.engine.transaction('readonly', async (transaction) => ({
      canonical: await transaction.getSave(tripKey),
      recovery: await transaction.getRecoveries(tripKey),
    }));
    expect((afterFirst.canonical?.payload as SaveEnvelopeV1).settings.highContrast).toBe(false);
    expect((afterFirst.canonical?.payload as SaveEnvelopeV1).settings.preferredLocale).toBe('en');
    expect(afterFirst.recovery).toHaveLength(1);
    expect(afterFirst.recovery[0]?.reason).toBe('before-migration');
    await harness.repository.load(tripKey);
    expect(await harness.engine.transaction('readonly', (transaction) => transaction.getRecoveries(tripKey))).toHaveLength(1);
    harness.repository.close();
  });

  it('restores and exports the newest valid snapshot when migration validation fails', async () => {
    const harness = await createHarness();
    await harness.repository.update(tripKey, freshSave, (save) => beginMission(save, 'ROAD-01', catalog.missionIds));
    await harness.repository.update(tripKey, freshSave, (save) => resolveMission(save, 'ROAD-01', 'completed', catalog.missionIds));
    const invalidLegacy = readFixture<Record<string, unknown>>('tests/fixtures/save/migration/v0.json');
    (invalidLegacy.settings as Record<string, unknown>).language = 'unsupported';
    await harness.engine.transaction('readwrite', (transaction) => transaction.putSave({
      tripKey,
      payload: invalidLegacy,
      integrity: integrityHash(invalidLegacy),
      storedAt: '2026-09-29T00:00:00.000Z',
    }));
    const loaded = await harness.repository.load(tripKey);
    expect(loaded).toMatchObject({source: 'recovery', recovered: true, warning: 'corrupt-canonical'});
    expect(loaded.save?.missionProgress['ROAD-01']?.state).toBe('in-progress');
    await expect(harness.repository.exportTrip(tripKey)).resolves.toContain('Missione Italia family save');
    harness.repository.close();
  });

  it('never downgrades or overwrites a newer unsupported schema', async () => {
    const harness = await createHarness();
    const future = readFixture<unknown>('tests/fixtures/save/migration/v2-unsupported.json');
    const record: StoredSaveRecord = {tripKey, payload: future, integrity: integrityHash(future), storedAt: '2026-09-29T00:00:00.000Z'};
    await harness.engine.transaction('readwrite', (transaction) => transaction.putSave(record));
    const loaded = await harness.repository.load(tripKey);
    expect(loaded).toMatchObject({save: null, writable: false, warning: 'newer-schema'});
    await expect(harness.repository.update(tripKey, freshSave, (save) => beginMission(save, 'ROAD-01', catalog.missionIds))).rejects.toBeInstanceOf(RepositoryBlockedError);
    const unchanged = await harness.engine.transaction('readonly', (transaction) => transaction.getSave(tripKey));
    expect(unchanged?.payload).toEqual(future);
    harness.repository.close();
  });

  it('recovers the newest valid snapshot when the canonical record is corrupt', async () => {
    const harness = await createHarness();
    await harness.repository.update(tripKey, freshSave, (save) => beginMission(save, 'ROAD-01', catalog.missionIds));
    await harness.repository.update(tripKey, freshSave, (save) => resolveMission(save, 'ROAD-01', 'completed', catalog.missionIds));
    await harness.engine.transaction('readwrite', async (transaction) => {
      const record = await transaction.getSave(tripKey);
      if (!record) throw new Error('Missing test record');
      (record.payload as SaveEnvelopeV1).missionProgress['ROAD-01'] = {state: 'skipped', resolvedVariantId: null};
      await transaction.putSave(record);
    });
    const loaded = await harness.repository.load(tripKey);
    expect(loaded).toMatchObject({source: 'recovery', recovered: true, warning: 'corrupt-canonical'});
    expect(loaded.save?.missionProgress['ROAD-01']?.state).toBe('in-progress');
    harness.repository.close();
  });

  it('completes all scored missions locally with no cloud or network client', async () => {
    const harness = await createHarness();
    for (const [index, mission] of manifest.missions.filter(({scored}) => scored).entries()) {
      await harness.repository.update(tripKey, freshSave, (save) => {
        const resolved = resolveMission(save, mission.id, index % 3 === 1 ? 'manual' : index % 3 === 2 ? 'skipped' : 'completed', catalog.missionIds);
        return index === catalog.scoredMissionIds.size - 1 ? {...resolved, journeyState: 'completed'} : resolved;
      });
    }
    const loaded = await harness.repository.load(tripKey);
    expect(loaded.save?.journeyState).toBe('completed');
    expect(Object.keys(loaded.save?.missionProgress ?? {})).toHaveLength(16);
    expect(loaded.save?.backup.enabled).toBe(false);
    harness.repository.close();
  });

  it('requests durable storage only after the explicit parent action', async () => {
    let persistedCalls = 0;
    let persistCalls = 0;
    const repository = await LocalSaveRepository.create({
      catalog,
      engine: new MemoryStorageEngine(),
      storagePersistence: {
        persisted: async () => { persistedCalls += 1; return false; },
        persist: async () => { persistCalls += 1; return true; },
      },
    });
    expect(persistedCalls).toBe(0);
    expect(persistCalls).toBe(0);
    expect(await repository.requestPersistentStorage()).toEqual({status: 'memory-only'});
    expect(persistedCalls).toBe(0);
    expect(persistCalls).toBe(0);
  });

  it('calls the browser persistence API only from the explicit request method', async () => {
    const harness = await createHarness();
    harness.repository.close();
    const engine = await IndexedDbStorageEngine.open(harness.factory, harness.databaseName);
    let persistedCalls = 0;
    let persistCalls = 0;
    const repository = await LocalSaveRepository.create({
      catalog,
      engine,
      storagePersistence: {
        persisted: async () => { persistedCalls += 1; return false; },
        persist: async () => { persistCalls += 1; return true; },
      },
    });
    await repository.load(tripKey);
    expect([persistedCalls, persistCalls]).toEqual([0, 0]);
    expect(await repository.requestPersistentStorage()).toEqual({status: 'granted'});
    expect([persistedCalls, persistCalls]).toEqual([1, 1]);
    repository.close();
  });

  it('deletes canonical, recovery, and outbox without touching static content', async () => {
    const harness = await createHarness();
    await harness.repository.update(tripKey, freshSave, (save) => ({
      ...beginMission(save, 'ROAD-01', catalog.missionIds),
      backup: {...save.backup, enabled: true, dirty: true},
    }));
    await harness.repository.update(tripKey, freshSave, (save) => resolveMission(save, 'ROAD-01', 'manual', catalog.missionIds));
    expect(await harness.repository.deleteLocalTripData(tripKey)).toEqual({deleted: true, canonicalPresent: false, recoveryCount: 0, outboxPresent: false});
    expect((await harness.repository.load(tripKey)).save).toBeNull();
    harness.repository.close();
  });
});
