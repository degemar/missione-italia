import {describe, expect, it} from 'vitest';

import {appReducer, initialAppState} from '../../src/app/app-state.js';
import {
  PARENT_HOLD_DURATION_MS,
  initialParentEntryState,
  offlinePresentation,
  reduceParentEntry,
  reduceParentMaintenance,
  shouldRenderCloudControls,
  updatePresentation,
} from '../../src/parent/parent-controls.js';
import {createInitialPlatformState, reducePlatformState} from '../../src/platform/platform-state.js';

describe('Parent Corner interaction policy', () => {
  it('opens confirmation only after the full hold and cancels safely on release', () => {
    const holding = reduceParentEntry(initialParentEntryState, {type: 'HOLD_STARTED', now: 1_000});
    expect(reduceParentEntry(holding, {type: 'HOLD_TICK', now: 1_000 + PARENT_HOLD_DURATION_MS - 1}).phase).toBe('holding');
    expect(reduceParentEntry(holding, {type: 'HOLD_CANCELLED'})).toEqual(initialParentEntryState);
    expect(reduceParentEntry(holding, {type: 'HOLD_TICK', now: 1_000 + PARENT_HOLD_DURATION_MS})).toEqual({
      phase: 'confirming', startedAt: null, progress: 100,
    });
    expect(reduceParentEntry(initialParentEntryState, {type: 'DIRECT_ACTIVATED'}).phase).toBe('confirming');
  });

  it('requires prepare then explicit confirmation and treats cancel as no-op', () => {
    const prepared = reduceParentMaintenance({stage: 'idle'}, {type: 'PREPARE', action: 'delete-trip-data'});
    expect(prepared).toEqual({stage: 'confirm', action: 'delete-trip-data'});
    expect(reduceParentMaintenance(prepared, {type: 'CANCEL'})).toEqual({stage: 'idle'});
    expect(reduceParentMaintenance(prepared, {type: 'COMMITTED'})).toEqual({stage: 'idle'});
  });

  it('returns from Parent Corner to the exact prior session screen', () => {
    const challenge = {id: 'CHALLENGE', chapterId: 'venice', missionId: 'VEN-02'} as const;
    const onChallenge = appReducer(initialAppState, {type: 'NAVIGATE', screen: challenge});
    const withAnswer = appReducer(
      appReducer(onChallenge, {type: 'REVEAL_ROLE', role: 'spotter'}),
      {type: 'SELECT_CHOICE', choiceId: 'choice-a'},
    );
    const parent = appReducer(withAnswer, {type: 'OPEN_PARENT'});
    expect(parent.screen).toEqual({id: 'PARENT'});
    expect(parent.parentReturnTo).toEqual(challenge);
    const returned = appReducer(parent, {type: 'NAVIGATE', screen: parent.parentReturnTo ?? {id: 'ATLAS'}});
    expect(returned.screen).toEqual(challenge);
    expect(returned.challenge.revealedRoles.spotter).toBe(true);
    expect(returned.challenge.selectedChoiceId).toBe('choice-a');
  });

  it('keeps offline play calm, gates updates, and omits cloud controls when cloud is off', () => {
    let platform = createInitialPlatformState(false, false);
    expect(offlinePresentation(platform)).toBe('offline-not-ready');
    platform = reducePlatformState(platform, {type: 'OFFLINE_READINESS_CHANGED', readiness: 'ready'});
    expect(offlinePresentation(platform)).toBe('offline-ready');
    expect(platform.coreGameplayAvailable).toBe(true);
    expect(shouldRenderCloudControls(platform)).toBe(false);
    expect(updatePresentation(true, false)).toBe('waiting');
    expect(updatePresentation(true, true)).toBe('ready');
    expect(updatePresentation(false, true)).toBe('hidden');
  });
});
