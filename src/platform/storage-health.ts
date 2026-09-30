import type {DurabilityStatus, PersistenceRequestResult} from '../storage/local-save-repository.js';

export interface StorageManagerPort {
  estimate?: () => Promise<{usage?: number; quota?: number}>;
  persisted?: () => Promise<boolean>;
  persist?: () => Promise<boolean>;
}

export interface StorageHealth {
  readonly api: 'available' | 'unsupported' | 'error';
  readonly durability: DurabilityStatus;
  readonly usageBytes: number | null;
  readonly quotaBytes: number | null;
  readonly persisted: boolean | null;
}

const finiteNonNegative = (value: number | undefined): number | null =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null;

export class StorageHealthAdapter {
  constructor(
    private readonly storage: StorageManagerPort | null = typeof navigator === 'undefined' ? null : navigator.storage,
  ) {}

  async inspect(durability: DurabilityStatus): Promise<StorageHealth> {
    if (!this.storage) {
      return {api: 'unsupported', durability, usageBytes: null, quotaBytes: null, persisted: null};
    }
    try {
      const [estimate, persisted] = await Promise.all([
        this.storage.estimate?.() ?? Promise.resolve({} as {usage?: number; quota?: number}),
        this.storage.persisted?.() ?? Promise.resolve(null),
      ]);
      return {
        api: 'available',
        durability,
        usageBytes: finiteNonNegative(estimate.usage),
        quotaBytes: finiteNonNegative(estimate.quota),
        persisted,
      };
    } catch {
      return {api: 'error', durability, usageBytes: null, quotaBytes: null, persisted: null};
    }
  }

  async requestPersistence(durability: DurabilityStatus): Promise<PersistenceRequestResult> {
    if (durability.mode === 'memory-only') return {status: 'memory-only'};
    if (!this.storage?.persist) return {status: 'unsupported'};
    try {
      if (this.storage.persisted && await this.storage.persisted()) return {status: 'already-granted'};
      return {status: await this.storage.persist() ? 'granted' : 'denied'};
    } catch {
      return {status: 'denied'};
    }
  }
}
