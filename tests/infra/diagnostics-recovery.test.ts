import {describe, expect, it} from 'vitest';

import {
  createDiagnosticPreview,
  createDiagnosticSnapshot,
  DIAGNOSTIC_STORAGE_KEY,
  LocalDiagnosticBuffer,
  MAX_DIAGNOSTIC_ENTRIES,
} from '../../src/platform/diagnostics.js';
import {createInitialPlatformState} from '../../src/platform/platform-state.js';
import {RECOVERY_CATALOGUE} from '../../src/platform/recovery-catalogue.js';

class MemoryKeyValueStorage {
  readonly values = new Map<string, string>();
  getItem(key: string): string | null { return this.values.get(key) ?? null; }
  setItem(key: string, value: string): void { this.values.set(key, value); }
  removeItem(key: string): void { this.values.delete(key); }
}

describe('local diagnostics and recovery catalogue', () => {
  it('retains at most 20 code/timestamp records with no free-form payload', () => {
    const storage = new MemoryKeyValueStorage();
    let tick = 0;
    const buffer = new LocalDiagnosticBuffer(
      storage,
      () => new Date(Date.UTC(2026, 8, 30, 12, 0, tick++)),
    );
    for (let index = 0; index < 25; index += 1) buffer.record('MI_STORAGE_UNAVAILABLE');
    expect(buffer.entries()).toHaveLength(MAX_DIAGNOSTIC_ENTRIES);
    const raw = storage.getItem(DIAGNOSTIC_STORAGE_KEY) ?? '';
    expect(raw).not.toMatch(/nickname|answer|token|https?:|stack|\\Users\\/i);
    expect(Object.keys(buffer.entries()[0] ?? {}).sort()).toEqual(['at', 'code']);
  });

  it('drops malformed or unknown stored entries', () => {
    const storage = new MemoryKeyValueStorage();
    storage.setItem(DIAGNOSTIC_STORAGE_KEY, JSON.stringify([
      {code: 'ARBITRARY_MESSAGE', at: '2026-09-30T12:00:00.000Z', token: 'secret'},
      {code: 'MI_MAP_TILES_FAILED', at: '2026-09-30T12:00:00.000Z'},
    ]));
    expect(new LocalDiagnosticBuffer(storage).entries()).toEqual([
      {code: 'MI_MAP_TILES_FAILED', at: '2026-09-30T12:00:00.000Z'},
    ]);
  });

  it('creates an exact local preview containing only the diagnostic contract', () => {
    const platform = createInitialPlatformState(false, false);
    const snapshot = createDiagnosticSnapshot({
      build: {appVersion: '0.1.0', databaseVersion: 1, commitSha: 'abc123'},
      contentVersion: 'trip-2026.10-v1',
      serviceWorker: 'offline-ready',
      platform,
      storage: {
        api: 'available',
        durability: {mode: 'persistent', reason: 'none', parentMessage: null},
        usageBytes: 42,
        quotaBytes: 100,
        persisted: true,
      },
      cloudBackup: false,
      recentCodes: [{code: 'MI_SERVICE_WORKER_FAILED', at: '2026-09-30T12:00:00.000Z'}],
    });
    const preview = createDiagnosticPreview(snapshot);
    expect(JSON.parse(preview)).toEqual(snapshot);
    expect(preview).not.toMatch(/nickname|answer|url|token|stack|path/i);
  });

  it('provides distinct safe recovery paths and never makes reset the first action', () => {
    const codes = Object.values(RECOVERY_CATALOGUE).map(({code}) => code);
    expect(new Set(codes).size).toBe(codes.length);
    expect(RECOVERY_CATALOGUE.indexeddb.actions[0]).not.toBe('deliberate-reset');
    expect(RECOVERY_CATALOGUE['map-tiles']).toMatchObject({blocksWholeApp: false});
    expect(RECOVERY_CATALOGUE.cloud.actions).toContain('continue-offline');
  });
});
