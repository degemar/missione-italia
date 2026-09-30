import {describe, expect, it} from 'vitest';

import {assertLocalizedContentContracts, LocalizedContentContractError} from '../../src/content/localized-content.js';
import type {AssetRegister, NarrationManifest, TripManifest} from '../../src/content/types.js';
import {readFixture} from './helpers.js';

const base = readFixture<TripManifest>('public/content/trip-manifest.json');
const localized = readFixture<unknown>('public/content/locales/trip-manifest.es.json');
const narration = readFixture<unknown>('public/content/locales/narration.es.json');
const assets = readFixture<AssetRegister>('public/content/assets.json');

describe('localized content contracts', () => {
  it('accepts the complete Spanish overlay and exact-caption narration metadata', () => {
    const result = assertLocalizedContentContracts(localized, narration, base, assets);
    expect(Object.keys(result.localized.missions)).toHaveLength(base.missions.length);
    expect(result.narration.segments).toHaveLength(32);
    expect(result.narration.segments.every(({scriptRef, captionRef}) => scriptRef === captionRef)).toBe(true);
  });

  it('rejects changed stable IDs, caption drift, and unknown assets', () => {
    const changedIds = structuredClone(localized) as {missions: Record<string, unknown>};
    changedIds.missions['NEW-01'] = changedIds.missions['ROAD-01'];
    delete changedIds.missions['ROAD-01'];
    expect(() => assertLocalizedContentContracts(changedIds, narration, base, assets)).toThrow(LocalizedContentContractError);

    const changedCaption = structuredClone(narration) as NarrationManifest;
    changedCaption.segments[0] = {...changedCaption.segments[0]!, captionRef: 'narrative.states.resume'};
    expect(() => assertLocalizedContentContracts(localized, changedCaption, base, assets)).toThrow(/exact script/);

    const changedAsset = structuredClone(narration) as NarrationManifest;
    changedAsset.segments[0] = {...changedAsset.segments[0]!, audioAssetId: 'missing-audio'};
    expect(() => assertLocalizedContentContracts(localized, changedAsset, base, assets)).toThrow(/unknown asset/);
  });
});
