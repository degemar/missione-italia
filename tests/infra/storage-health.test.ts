import {describe, expect, it} from 'vitest';

import {StorageHealthAdapter} from '../../src/platform/storage-health.js';
import type {DurabilityStatus} from '../../src/storage/local-save-repository.js';

const persistent: DurabilityStatus = {mode: 'persistent', reason: 'none', parentMessage: null};

describe('storage health adapter', () => {
  it('reads estimate and persisted status without a permission request', async () => {
    let persistCalls = 0;
    const adapter = new StorageHealthAdapter({
      estimate: async () => ({usage: 42, quota: 100}),
      persisted: async () => false,
      persist: async () => { persistCalls += 1; return true; },
    });
    await expect(adapter.inspect(persistent)).resolves.toEqual({
      api: 'available', durability: persistent, usageBytes: 42, quotaBytes: 100, persisted: false,
    });
    expect(persistCalls).toBe(0);
  });

  it('reports a denied best-effort request without claiming persistence', async () => {
    const adapter = new StorageHealthAdapter({persisted: async () => false, persist: async () => false});
    await expect(adapter.requestPersistence(persistent)).resolves.toEqual({status: 'denied'});
    expect((await adapter.inspect(persistent)).persisted).toBe(false);
  });

  it('never requests persistence in memory-only mode', async () => {
    let called = false;
    const adapter = new StorageHealthAdapter({persist: async () => { called = true; return true; }});
    await expect(adapter.requestPersistence({mode: 'memory-only', reason: 'unavailable', parentMessage: 'not saved'}))
      .resolves.toEqual({status: 'memory-only'});
    expect(called).toBe(false);
  });
});
