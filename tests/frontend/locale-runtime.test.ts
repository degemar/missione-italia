import {describe, expect, it} from 'vitest';

import {selectContentLocale} from '../../src/content/content-localization.js';
import {loadSpanishContentResources} from '../../src/content/content-repository.js';
import {createDefaultSave} from '../../src/contracts/save-contract.js';
import {setActiveLocale, translate, translateForLocale} from '../../src/i18n/strings.js';
import {migrateSave} from '../../src/storage/save-migrations.js';
import {appReducer, initialAppState} from '../../src/app/app-state.js';
import {catalog, readFixture} from '../backend/helpers.js';
import {createContentFetcher, loadTestBundle} from './helpers.js';

describe('locale runtime', () => {
  it('uses Spanish for a new family and switches UI strings without navigation', () => {
    const save = createDefaultSave('italy-family-2026', 'trip-2026.10-v1');
    expect(save.settings.preferredLocale).toBe('es');
    setActiveLocale(save.settings.preferredLocale);
    expect(translate('welcome.begin')).toBe('Comenzar la aventura');
    setActiveLocale('en');
    expect(translate('welcome.begin')).toBe('Begin adventure');
  });

  it('falls back to the English UI string when a Spanish key is unavailable', () => {
    expect(translateForLocale('es', 'welcome.begin', {}, {})).toBe('Begin adventure');
  });

  it('keeps migrated V1 families visibly English', () => {
    const legacy = readFixture<unknown>('tests/fixtures/save/migration/v1.json');
    const migrated = migrateSave(legacy, {scoredMissionIds: catalog.scoredMissionIds});
    expect(migrated.save.settings.preferredLocale).toBe('en');
    expect(translateForLocale(migrated.save.settings.preferredLocale, 'parent.title')).toBe('Parent Corner');
  });

  it('selects Spanish content by stable IDs and returns the untouched English fallback', async () => {
    const base = await loadTestBundle();
    const spanish = await loadSpanishContentResources(base, {
      fetcher: createContentFetcher(),
      basePath: '/family-trip/',
    });
    const localized = selectContentLocale(base, 'es', spanish);
    expect(localized.locale).toBe('es');
    expect(localized.missionById.get('VEN-01')?.title).toBe('Encuentra el león alado');
    expect(localized.missionById.get('VEN-01')?.id).toBe('VEN-01');
    expect(localized.chapterById.get('venice')?.title).toBe('La ciudad que flota');
    expect(localized.stampLabelById.get('eagle-eye')).toBe('Ojo de águila');
    expect(selectContentLocale(base, 'en', spanish).missionById.get('VEN-01')?.title).toBe('Find the Winged Lion');
    expect(selectContentLocale(base, 'es', null)).toBe(base);
    const state = {...initialAppState, bundle: base, screen: {id: 'PARENT'} as const};
    const switched = appReducer(state, {type: 'SET_BUNDLE', bundle: localized});
    expect(switched.screen).toEqual({id: 'PARENT'});
  });
});
