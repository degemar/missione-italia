import {describe, expect, it} from 'vitest';

import {LocalGameController} from '../../src/app/game-controller.js';
import {screenFromSave} from '../../src/app/app-state.js';
import {MemoryStorageEngine} from '../../src/storage/index.js';
import {confirmTripMaintenance, prepareTripMaintenance} from '../../src/platform/trip-data-maintenance.js';
import {loadTestBundle} from './helpers.js';

const family = [
  {id: 'child-1' as const, nickname: 'Ari', ageBand: '4-6' as const, avatarId: 'binoculars'},
  {id: 'child-2' as const, nickname: 'Bea', ageBand: '7-8' as const, avatarId: 'magnifier'},
  {id: 'child-3' as const, nickname: 'Ciro', ageBand: '9-11' as const, avatarId: 'compass'},
];

describe('local game controller', () => {
  it('runs setup, mission start, persisted completion, role rotation, and idempotent replay', async () => {
    const bundle = await loadTestBundle();
    const controller = await LocalGameController.create(bundle, {engine: new MemoryStorageEngine()});
    expect((await controller.hydrate()).save).toBeNull();

    const setup = await controller.saveFamily({members: family, sound: false});
    expect(setup.save.family.members.map((member) => member.nickname)).toEqual(['Ari', 'Bea', 'Ciro']);

    const started = await controller.beginMission('ROAD-01');
    expect(started.save.missionProgress['ROAD-01']?.state).toBe('in-progress');
    expect(started.save.route.screenId).toBe('STORY');
    expect(screenFromSave(bundle, (await controller.hydrate()).save)).toEqual({id: 'MISSION', chapterId: 'road', missionId: 'ROAD-01'});

    const completed = await controller.resolveMission('ROAD-01', 'completed');
    expect(completed.persisted).toBe(false);
    expect(completed.save.route.screenId).toBe('CELEBRATION');
    expect(completed.save.family.roleRotationIndex).toBe(1);
    const revision = completed.save.localRevision;

    const duplicate = await controller.resolveMission('ROAD-01', 'skipped');
    expect(duplicate.changed).toBe(false);
    expect(duplicate.save.localRevision).toBe(revision);
    expect(duplicate.save.missionProgress['ROAD-01']?.state).toBe('completed');
    expect(duplicate.save.family.roleRotationIndex).toBe(1);
    controller.close();
  });

  it('stores the exact TBC variant selected when a slot resolves', async () => {
    const bundle = await loadTestBundle();
    const controller = await LocalGameController.create(bundle, {engine: new MemoryStorageEngine()});
    await controller.saveFamily({members: family, sound: false});
    await controller.selectExcursionPair('sigurta-borghetto');
    await controller.beginMission('VER-04');
    const result = await controller.resolveMission('VER-04', 'manual');
    expect(result.save.missionProgress['VER-04']).toEqual({state: 'manual', resolvedVariantId: 'sigurta-team-maze'});
    controller.close();
  });

  it('completes the manifest-driven scored journey without cloud or fixed chapter counts', async () => {
    const bundle = await loadTestBundle();
    const controller = await LocalGameController.create(bundle, {engine: new MemoryStorageEngine()});
    await controller.saveFamily({members: family, sound: false});
    for (const mission of bundle.missions.filter((candidate) => candidate.scored)) {
      await controller.resolveMission(mission.id, mission.id === 'VER-05' ? 'skipped' : 'completed');
    }
    const hydrated = await controller.hydrate();
    expect(hydrated.save?.journeyState).toBe('completed');
    expect(Object.keys(hydrated.save?.missionProgress ?? {})).toHaveLength(16);
    expect(hydrated.save?.backup.enabled).toBe(false);
    controller.close();
  });

  it('persists parent settings, resets only progress, and deletes only this trip', async () => {
    const bundle = await loadTestBundle();
    const controller = await LocalGameController.create(bundle, {engine: new MemoryStorageEngine()});
    await controller.saveFamily({members: family, sound: false});
    await controller.resolveMission('ROAD-01', 'completed');
    const settings = await controller.updateSettings({sound: true, reducedMotion: true});
    expect(settings.save.settings).toMatchObject({sound: true, reducedMotion: true, preferredLocale: 'es'});

    const resetPrepared = prepareTripMaintenance('reset-progress', bundle.manifest.tripKey);
    const resetIntent = confirmTripMaintenance(resetPrepared, resetPrepared.confirmationLabel);
    if (!resetIntent) throw new Error('Expected reset confirmation');
    const reset = await controller.resetProgress(resetIntent);
    expect(reset.save.family.members).toEqual(family);
    expect(reset.save.settings).toMatchObject({sound: true, reducedMotion: true, preferredLocale: 'es'});
    expect(reset.save.missionProgress).toEqual({});
    expect(reset.save.route.screenId).toBe('ATLAS');

    let diagnosticsCleared = false;
    const deletePrepared = prepareTripMaintenance('delete-trip-data', bundle.manifest.tripKey);
    const deleteIntent = confirmTripMaintenance(deletePrepared, deletePrepared.confirmationLabel);
    if (!deleteIntent) throw new Error('Expected delete confirmation');
    const deleted = await controller.deleteTripData(deleteIntent, {
      cacheStorage: null,
      clearDiagnostics: () => { diagnosticsCleared = true; },
    });
    expect(deleted.local).toEqual({deleted: true, canonicalPresent: false, recoveryCount: 0, outboxPresent: false});
    expect(diagnosticsCleared).toBe(true);
    expect((await controller.hydrate()).save).toBeNull();
    controller.close();
  });
});
