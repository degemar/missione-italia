import {describe, expect, it} from 'vitest';

import {appReducer, initialAppState, screenFromSave} from '../../src/app/app-state.js';
import {createDefaultSave} from '../../src/contracts/save-contract.js';
import {MemoryStorageEngine} from '../../src/storage/index.js';
import {LocalGameController} from '../../src/app/game-controller.js';
import {loadTestBundle} from './helpers.js';

describe('app state and hydration recovery', () => {
  it('routes first run to welcome and restarts an interrupted clue at its mission card', async () => {
    const bundle = await loadTestBundle();
    expect(screenFromSave(bundle, null)).toEqual({id: 'WELCOME', mode: 'intro', openingStep: 0});

    const save = createDefaultSave(bundle.manifest.tripKey, bundle.manifest.contentVersion);
    save.family.members = [{id: 'child-1', nickname: 'Ari', ageBand: '4-6', avatarId: 'binoculars'}];
    save.route = {screenId: 'CHALLENGE', chapterId: 'road', missionId: 'ROAD-01', stage: 'challenge', selectedWalkId: null};
    save.missionProgress['ROAD-01'] = {state: 'in-progress', resolvedVariantId: null};

    expect(screenFromSave(bundle, save)).toEqual({id: 'MISSION', chapterId: 'road', missionId: 'ROAD-01'});
  });

  it('recovers an invalid stored route to the atlas', async () => {
    const bundle = await loadTestBundle();
    const save = createDefaultSave(bundle.manifest.tripKey, bundle.manifest.contentVersion);
    save.family.members = [{id: 'child-1', nickname: 'Ari', ageBand: '4-6', avatarId: 'binoculars'}];
    save.route = {screenId: 'MISSION', chapterId: 'lost', missionId: 'MISSING', stage: null, selectedWalkId: null};
    expect(screenFromSave(bundle, save)).toEqual({id: 'ATLAS'});
  });

  it('resumes a committed result at celebration without awarding again', async () => {
    const bundle = await loadTestBundle();
    const controller = await LocalGameController.create(bundle, {engine: new MemoryStorageEngine()});
    await controller.saveFamily({
      members: [{id: 'child-1', nickname: 'Ari', ageBand: '4-6', avatarId: 'binoculars'}],
      sound: false,
    });
    await controller.beginMission('ROAD-01');
    const committed = await controller.resolveMission('ROAD-01', 'completed');
    expect(screenFromSave(bundle, committed.save)).toEqual({
      id: 'CELEBRATION',
      chapterId: 'road',
      missionId: 'ROAD-01',
      result: 'completed',
    });
    controller.close();
  });

  it('keeps reducer transitions deterministic and resets clue-local state at a mission boundary', () => {
    let state = appReducer(initialAppState, {
      type: 'NAVIGATE',
      screen: {id: 'CHALLENGE', chapterId: 'road', missionId: 'ROAD-01'},
    });
    state = appReducer(state, {type: 'REVEAL_ALL_ROLES'});
    state = appReducer(state, {type: 'TOGGLE_ROLE_CHECK', role: 'spotter'});
    state = appReducer(state, {type: 'SELECT_CHOICE', choiceId: 'answer'});
    expect(state.challenge.revealedRoles.spotter).toBe(true);

    state = appReducer(state, {type: 'NAVIGATE', screen: {id: 'MISSION', chapterId: 'venice', missionId: 'VEN-01'}});
    expect(state.challenge).toEqual({
      revealedRoles: {spotter: false, detective: false, navigator: false},
      roleChecks: {spotter: false, detective: false, navigator: false},
      roleShift: 0,
      selectedChoiceId: null,
      answerStatus: 'idle',
      answerHint: null,
    });
  });
});
