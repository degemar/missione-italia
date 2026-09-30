import {describe, expect, it} from 'vitest';

import {
  createInitialPlatformState,
  deriveDegradedModes,
  reducePlatformState,
} from '../../src/platform/platform-state.js';

describe('platform degraded states', () => {
  it('distinguishes offline-ready from offline-not-ready without disabling gameplay', () => {
    let state = createInitialPlatformState(false, false);
    expect([...deriveDegradedModes(state)]).toEqual(['offline-not-ready']);
    state = reducePlatformState(state, {type: 'OFFLINE_READINESS_CHANGED', readiness: 'ready'});
    expect([...deriveDegradedModes(state)]).toEqual(['offline-ready']);
    expect(state.coreGameplayAvailable).toBe(true);
  });

  it('contains tile and cloud failures as optional degraded modes', () => {
    let state = createInitialPlatformState(true, true);
    state = reducePlatformState(state, {type: 'TILES_CHANGED', state: 'unavailable'});
    state = reducePlatformState(state, {type: 'CLOUD_CHANGED', state: 'unavailable'});
    expect([...deriveDegradedModes(state)]).toEqual(['online', 'tiles-unavailable', 'cloud-unavailable']);
    expect(state.coreGameplayAvailable).toBe(true);
  });

  it('stores only location status, never coordinates', () => {
    const state = reducePlatformState(
      createInitialPlatformState(true, false),
      {type: 'LOCATION_CHANGED', state: 'denied'},
    );
    expect(state.location).toBe('denied');
    expect(JSON.stringify(state)).not.toMatch(/latitude|longitude|accuracy|coordinates/i);
  });
});
