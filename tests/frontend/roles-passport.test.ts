import {describe, expect, it} from 'vitest';

import {createDefaultSave, resolveMission} from '../../src/contracts/save-contract.js';
import {derivePassport, getChapterProgress, isChapterAvailable} from '../../src/game/progress.js';
import {getRoleAssignments, nextRoleRotation} from '../../src/game/roles.js';
import {loadTestBundle} from './helpers.js';

const family = [
  {id: 'child-1' as const, nickname: 'Ari', ageBand: '4-6' as const, avatarId: 'binoculars'},
  {id: 'child-2' as const, nickname: 'Bea', ageBand: '7-8' as const, avatarId: 'magnifier'},
  {id: 'child-3' as const, nickname: 'Ciro', ageBand: '9-11' as const, avatarId: 'compass'},
];

describe('cooperative roles and Passport', () => {
  it('rotates assignments predictably and permits session-only reassignment', () => {
    expect(getRoleAssignments(family, 0).map((assignment) => assignment.member?.nickname)).toEqual(['Ari', 'Bea', 'Ciro']);
    expect(getRoleAssignments(family, 0, 1).map((assignment) => assignment.member?.nickname)).toEqual(['Bea', 'Ciro', 'Ari']);
    expect(nextRoleRotation(0, 3)).toBe(1);
    expect(nextRoleRotation(2, 3)).toBe(0);
  });

  it('treats completed, manual, and skipped as progression-resolving states', async () => {
    const bundle = await loadTestBundle();
    const road = bundle.chapterById.get('road')!;
    const save = createDefaultSave(bundle.manifest.tripKey, bundle.manifest.contentVersion);
    save.family.members = family;
    for (const missionId of road.missionIds) save.missionProgress[missionId] = {state: 'skipped', resolvedVariantId: null};
    const progress = getChapterProgress(road, save);
    expect(progress).toEqual({resolved: 3, total: 3, complete: true, observed: false});
    expect(isChapterAvailable(bundle, save, bundle.chapterById.get('venice')!, new Set())).toBe(true);
  });

  it('derives shared stamps, discoveries, powers, and neutral saved-for-later markers', async () => {
    const bundle = await loadTestBundle();
    const known = new Set(bundle.missions.map((mission) => mission.id));
    let save = createDefaultSave(bundle.manifest.tripKey, bundle.manifest.contentVersion);
    save.family.members = family;
    save = resolveMission(save, 'ROAD-01', 'manual', known);
    save = resolveMission(save, 'ROAD-02', 'skipped', known);
    save = resolveMission(save, 'ROAD-03', 'completed', known);
    const passport = derivePassport(bundle, save);
    expect(passport.powers.find(({chapter}) => chapter.id === 'road')?.awake).toBe(true);
    expect(passport.stamps.map((stamp) => stamp.state)).toEqual(['manual', 'completed']);
    expect(passport.savedForLater).toEqual([{missionId: 'ROAD-02', missionTitle: 'Alpine Tunnel Hunt'}]);
    expect(passport.discoveries.some((discovery) => discovery.missionId === 'ROAD-02')).toBe(false);
    expect(passport.discoveries.length).toBeGreaterThan(0);
  });
});
