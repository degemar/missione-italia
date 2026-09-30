import {describe, expect, it} from 'vitest';

import type {SaveEnvelopeV1} from '../../src/contracts/save-contract.js';
import {
  confirmTripMaintenance,
  prepareTripMaintenance,
  TripDataMaintenance,
  TripMaintenanceConfirmationError,
  tripDataCacheName,
  type TripMaintenanceRepository,
} from '../../src/platform/trip-data-maintenance.js';
import {freshSave} from '../backend/helpers.js';

const tripKey = 'missione-italia-2026-10';

const repository = (): TripMaintenanceRepository & {calls: string[]} => ({
  calls: [],
  async resetProgress(key: string, initialize: () => SaveEnvelopeV1) {
    this.calls.push(`reset:${key}`);
    return {
      save: initialize(), changed: true, persisted: true,
      durability: {mode: 'persistent', reason: 'none', parentMessage: null},
    };
  },
  async deleteLocalTripData(key: string) {
    this.calls.push(`delete:${key}`);
    return {deleted: true, canonicalPresent: false, recoveryCount: 0, outboxPresent: false};
  },
});

describe('scoped trip maintenance', () => {
  it('requires the exact deliberate action before reset', async () => {
    const repo = repository();
    const maintenance = new TripDataMaintenance(tripKey, repo, freshSave, null);
    const prepared = prepareTripMaintenance('reset-progress', tripKey);
    expect(confirmTripMaintenance(prepared, 'Delete trip data')).toBeNull();
    expect(() => maintenance.reset(prepared as never)).toThrow(TripMaintenanceConfirmationError);
    const confirmed = confirmTripMaintenance(prepared, prepared.confirmationLabel);
    if (!confirmed) throw new Error('Expected confirmation');
    await maintenance.reset(confirmed);
    expect(repo.calls).toEqual([`reset:${tripKey}`]);
  });

  it('deletes only the exact owned trip-data cache and never enumerates browser caches', async () => {
    const repo = repository();
    const deletedCaches: string[] = [];
    let diagnosticsCleared = false;
    const maintenance = new TripDataMaintenance(
      tripKey,
      repo,
      freshSave,
      {delete: async (name) => { deletedCaches.push(name); return true; }},
      () => { diagnosticsCleared = true; },
    );
    const prepared = prepareTripMaintenance('delete-trip-data', tripKey);
    const confirmed = confirmTripMaintenance(prepared, prepared.confirmationLabel);
    if (!confirmed) throw new Error('Expected confirmation');

    await expect(maintenance.delete(confirmed)).resolves.toEqual({
      local: {deleted: true, canonicalPresent: false, recoveryCount: 0, outboxPresent: false},
      tripDataCacheDeleted: true,
    });
    expect(repo.calls).toEqual([`delete:${tripKey}`]);
    expect(deletedCaches).toEqual([tripDataCacheName(tripKey)]);
    expect(diagnosticsCleared).toBe(true);
  });
});
