import {describe, expect, it} from 'vitest';

import {resolveMission} from '../../src/contracts/save-contract.js';
import {SafeUpdateCoordinator} from '../../src/platform/safe-update.js';
import {catalog, createHarness, freshSave} from '../backend/helpers.js';

describe('safe application update', () => {
  it('blocks activation outside a safe parent moment and while a save is in flight', async () => {
    let releaseTransaction: () => void = () => undefined;
    const transactionGate = new Promise<void>((resolve) => { releaseTransaction = resolve; });
    let activationCount = 0;
    const coordinator = new SafeUpdateCoordinator({
      commitLocalState: async () => undefined,
      activateWaitingWorker: async () => { activationCount += 1; },
    });

    coordinator.setWaiting(true);
    expect(await coordinator.applyUpdate()).toEqual({status: 'blocked-screen'});
    coordinator.setSafeParentMoment(true);
    const transaction = coordinator.trackLocalTransaction(() => transactionGate);
    expect(await coordinator.applyUpdate()).toEqual({status: 'blocked-transaction'});
    expect(activationCount).toBe(0);
    releaseTransaction();
    await transaction;
    expect(coordinator.snapshot().canApply).toBe(true);
  });

  it('flushes committed local state before activating and preserves completion after reopen', async () => {
    let harness = await createHarness();
    await harness.repository.update(
      catalog.tripKey,
      freshSave,
      (save) => resolveMission(save, 'ROAD-01', 'completed', catalog.missionIds),
    );
    const order: string[] = [];
    const coordinator = new SafeUpdateCoordinator({
      commitLocalState: async () => {
        await harness.repository.flush();
        order.push('committed');
      },
      activateWaitingWorker: async () => { order.push('activated'); },
    });
    coordinator.setWaiting(true);
    coordinator.setSafeParentMoment(true);

    await expect(coordinator.applyUpdate()).resolves.toEqual({status: 'applied'});
    expect(order).toEqual(['committed', 'activated']);
    harness = await harness.reopen();
    expect((await harness.repository.load(catalog.tripKey)).save?.missionProgress['ROAD-01']?.state).toBe('completed');
    harness.repository.close();
  });

  it('does not activate when the final commit fails', async () => {
    let activated = false;
    const coordinator = new SafeUpdateCoordinator({
      commitLocalState: async () => { throw new Error('write failed'); },
      activateWaitingWorker: async () => { activated = true; },
    });
    coordinator.setWaiting(true);
    coordinator.setSafeParentMoment(true);

    await expect(coordinator.applyUpdate()).resolves.toEqual({status: 'failed'});
    expect(activated).toBe(false);
  });
});
