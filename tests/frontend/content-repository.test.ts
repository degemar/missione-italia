import {describe, expect, it} from 'vitest';

import {ContentLoadError, getEffectiveMission, loadContentBundle} from '../../src/content/content-repository.js';
import {createContentFetcher, loadTestBundle, readContentJson} from './helpers.js';

describe('content repository', () => {
  it('loads the base-safe manifest in declared order with 16 scored clues and one epilogue', async () => {
    const bundle = await loadTestBundle();
    expect(bundle.chapters.map((chapter) => chapter.id)).toEqual(['road', 'venice', 'lagoon-islands', 'verona']);
    expect(bundle.missions.filter((mission) => mission.scored)).toHaveLength(16);
    expect(bundle.missionById.get(bundle.manifest.epilogueMissionId)?.scored).toBe(false);
    expect(bundle.missions.some((mission) => mission.title.toLocaleLowerCase('en').includes('gardaland'))).toBe(false);
  });

  it('resolves a selected excursion variant without changing the stable mission ID', async () => {
    const bundle = await loadTestBundle();
    const slot = bundle.missionById.get('VER-04');
    expect(slot).toBeDefined();
    const effective = getEffectiveMission(slot!, 'sigurta-borghetto');
    expect(effective.id).toBe('VER-04');
    expect(effective.resolvedVariantId).toBe('sigurta-team-maze');
    expect(effective.title).toBe('Sigurtà Team Maze');
  });

  it('fails safely when the manifest is malformed', async () => {
    const manifest = await readContentJson('trip-manifest.json') as Record<string, unknown>;
    await expect(loadContentBundle({
      fetcher: createContentFetcher({'trip-manifest.json': {...manifest, chapters: []}}),
      basePath: '/missione-italia/',
    })).rejects.toBeInstanceOf(ContentLoadError);
  });

  it('rejects a package whose content version does not match the manifest', async () => {
    const contentPackage = await readContentJson('content-package.json') as Record<string, unknown>;
    await expect(loadContentBundle({
      fetcher: createContentFetcher({'content-package.json': {...contentPackage, contentVersion: 'wrong-version'}}),
      basePath: '/missione-italia/',
    })).rejects.toThrow('do not match');
  });

  it('rejects content that requires a newer app or incompatible storage version', async () => {
    const contentPackage = await readContentJson('content-package.json') as Record<string, unknown>;
    const compatibility = contentPackage.compatibility as Record<string, unknown>;
    await expect(loadContentBundle({
      fetcher: createContentFetcher({'content-package.json': {
        ...contentPackage,
        compatibility: {...compatibility, minimumAppVersion: '99.0.0'},
      }}),
      basePath: '/missione-italia/',
      appVersion: '0.1.0',
      storageVersion: 1,
    })).rejects.toThrow('newer application');
    await expect(loadContentBundle({
      fetcher: createContentFetcher({'content-package.json': {
        ...contentPackage,
        compatibility: {...compatibility, minimumStorageVersion: 2, maximumStorageVersion: 2},
      }}),
      basePath: '/missione-italia/',
      appVersion: '0.1.0',
      storageVersion: 1,
    })).rejects.toThrow('local storage version');
  });
});
