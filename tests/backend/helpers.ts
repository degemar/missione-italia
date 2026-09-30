import {readFileSync} from 'node:fs';
import {join} from 'node:path';

import {IDBFactory} from 'fake-indexeddb';

import {type SaveEnvelopeV1} from '../../src/contracts/save-contract.js';
import {type ContentCatalog} from '../../src/storage/content-reconciliation.js';
import {LocalSaveRepository} from '../../src/storage/local-save-repository.js';
import {IndexedDbStorageEngine, type LocalStorageEngine} from '../../src/storage/storage-engine.js';

interface TestMission {
  id: string;
  scored: boolean;
  chapterId: string | null;
  variants?: Array<{id: string}>;
}

interface TestManifest {
  tripKey: string;
  contentVersion: string;
  chapters: Array<{id: string}>;
  missions: TestMission[];
}

export const manifest = JSON.parse(readFileSync(join(process.cwd(), 'public/content/trip-manifest.json'), 'utf8')) as TestManifest;

export const catalog: ContentCatalog = {
  tripKey: manifest.tripKey,
  contentVersion: manifest.contentVersion,
  chapterIds: new Set(manifest.chapters.map(({id}) => id)),
  missionIds: new Set(manifest.missions.map(({id}) => id)),
  scoredMissionIds: new Set(manifest.missions.filter(({scored}) => scored).map(({id}) => id)),
  variantIdsByMission: new Map(manifest.missions.map(({id, variants}) => [id, new Set((variants ?? []).map((variant) => variant.id))])),
  compatibleFromContentVersions: new Set([manifest.contentVersion, 'trip-2026.09-v1']),
};

export const readFixture = <T>(path: string): T => JSON.parse(readFileSync(join(process.cwd(), path), 'utf8')) as T;
export const freshSave = (): SaveEnvelopeV1 => readFixture<SaveEnvelopeV1>('tests/fixtures/save/valid/fresh.json');

export interface TestHarness {
  factory: IDBFactory;
  engine: LocalStorageEngine;
  repository: LocalSaveRepository;
  databaseName: string;
  reopen(): Promise<TestHarness>;
}

let databaseSequence = 0;

export const createHarness = async (existing?: {factory: IDBFactory; databaseName: string; clock: {tick: number}; ids: {value: number}}): Promise<TestHarness> => {
  const factory = existing?.factory ?? new IDBFactory();
  const databaseName = existing?.databaseName ?? `missione-test-${databaseSequence++}`;
  const clock = existing?.clock ?? {tick: 0};
  const ids = existing?.ids ?? {value: 0};
  const engine = await IndexedDbStorageEngine.open(factory, databaseName);
  const repository = await LocalSaveRepository.create({
    catalog,
    engine,
    now: () => new Date(Date.UTC(2026, 8, 29, 12, 0, clock.tick++)),
    recoveryId: () => `recovery-${++ids.value}`,
    storagePersistence: null,
  });
  return {
    factory,
    engine,
    repository,
    databaseName,
    reopen: async () => {
      repository.close();
      return createHarness({factory, databaseName, clock, ids});
    },
  };
};
