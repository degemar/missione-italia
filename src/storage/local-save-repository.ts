import {resetProgress, type SaveEnvelopeV1} from '../contracts/save-contract.js';
import {integrityHash} from './canonical-json.js';
import {
  type ContentCatalog,
  IncompatibleContentError,
  reconcileSaveWithContent,
  validationContextFromCatalog,
} from './content-reconciliation.js';
import {migrateSave, UnsupportedSaveVersionError} from './save-migrations.js';
import {
  assertUnchangedImportPreview,
  createSaveExport,
  previewSaveImport,
  type SaveImportPreview,
  SaveTransferError,
} from './save-transfer.js';
import {assertValidSaveEnvelope, SaveValidationError} from './save-validation.js';
import {
  IndexedDbStorageEngine,
  type LocalStorageEngine,
  type LocalStorageTransaction,
  MemoryStorageEngine,
  type OutboxMarker,
  type RecoveryReason,
  type RecoveryRecord,
  type StoredSaveRecord,
} from './storage-engine.js';

export const MAX_RECOVERY_SNAPSHOTS = 3;

export type DurabilityReason = 'none' | 'unavailable' | 'quota' | 'storage-error';
export interface DurabilityStatus {
  mode: 'persistent' | 'memory-only';
  reason: DurabilityReason;
  parentMessage: string | null;
}

export interface LoadSaveResult {
  save: SaveEnvelopeV1 | null;
  source: 'canonical' | 'recovery' | 'none';
  recovered: boolean;
  writable: boolean;
  warning: 'corrupt-canonical' | 'newer-schema' | 'invalid-save' | null;
  durability: DurabilityStatus;
}

export interface CommitSaveResult {
  save: SaveEnvelopeV1;
  changed: boolean;
  persisted: boolean;
  durability: DurabilityStatus;
}

export interface DeleteTripResult {
  deleted: boolean;
  canonicalPresent: boolean;
  recoveryCount: number;
  outboxPresent: boolean;
}

export interface PersistenceRequestResult {
  status: 'granted' | 'already-granted' | 'denied' | 'unsupported' | 'memory-only';
}

export interface StoragePersistenceApi {
  persisted?: () => Promise<boolean>;
  persist?: () => Promise<boolean>;
}

export interface RepositoryOptions {
  catalog: ContentCatalog;
  indexedDBFactory?: IDBFactory | null;
  engine?: LocalStorageEngine;
  storagePersistence?: StoragePersistenceApi | null;
  databaseName?: string;
  now?: () => Date;
  recoveryId?: () => string;
}

export class LocalSaveRepository {
  private queue: Promise<void> = Promise.resolve();
  private readonly lastKnown = new Map<string, SaveEnvelopeV1>();
  private recoverySequence = 0;

  private constructor(
    private engine: LocalStorageEngine,
    private readonly catalog: ContentCatalog,
    private durability: DurabilityStatus,
    private readonly storagePersistence: StoragePersistenceApi | null,
    private readonly now: () => Date,
    private readonly recoveryId: () => string,
  ) {}

  static async create(options: RepositoryOptions): Promise<LocalSaveRepository> {
    const now = options.now ?? (() => new Date());
    const fallbackId = () => `recovery-${now().getTime()}-${Math.random().toString(36).slice(2)}`;
    const storagePersistence = options.storagePersistence ?? (typeof navigator !== 'undefined' ? navigator.storage : null);
    if (options.engine) {
      const persistent = options.engine.kind === 'indexeddb';
      return new LocalSaveRepository(
        options.engine,
        options.catalog,
        persistent ? {mode: 'persistent', reason: 'none', parentMessage: null} : {mode: 'memory-only', reason: 'unavailable', parentMessage: 'Progress works for now but is not saved after this app closes.'},
        storagePersistence,
        now,
        options.recoveryId ?? fallbackId,
      );
    }
    const factory = options.indexedDBFactory === undefined ? globalThis.indexedDB : options.indexedDBFactory;
    if (!factory) {
      return new LocalSaveRepository(
        new MemoryStorageEngine(), options.catalog,
        {mode: 'memory-only', reason: 'unavailable', parentMessage: 'Progress works for now but is not saved after this app closes.'},
        storagePersistence, now, options.recoveryId ?? fallbackId,
      );
    }
    try {
      const engine = await IndexedDbStorageEngine.open(factory, options.databaseName);
      return new LocalSaveRepository(engine, options.catalog, {mode: 'persistent', reason: 'none', parentMessage: null}, storagePersistence, now, options.recoveryId ?? fallbackId);
    } catch {
      return new LocalSaveRepository(
        new MemoryStorageEngine(), options.catalog,
        {mode: 'memory-only', reason: 'unavailable', parentMessage: 'Progress works for now but is not saved after this app closes.'},
        storagePersistence, now, options.recoveryId ?? fallbackId,
      );
    }
  }

  getDurabilityStatus(): DurabilityStatus {
    return {...this.durability};
  }

  load(tripKey: string): Promise<LoadSaveResult> {
    return this.enqueue(() => this.withStorageFallback(() => this.loadInternal(tripKey)));
  }

  update(
    tripKey: string,
    initialize: () => SaveEnvelopeV1,
    mutation: (current: SaveEnvelopeV1) => SaveEnvelopeV1,
    reason: Exclude<RecoveryReason, 'before-import' | 'corrupt-canonical'> = 'before-write',
  ): Promise<CommitSaveResult> {
    return this.enqueue(() => this.withStorageFallback(() => this.updateInternal(tripKey, initialize, mutation, reason)));
  }

  resetProgress(tripKey: string, initialize: () => SaveEnvelopeV1): Promise<CommitSaveResult> {
    return this.update(tripKey, initialize, resetProgress);
  }

  async exportTrip(tripKey: string): Promise<string> {
    const result = await this.load(tripKey);
    if (!result.save) throw new SaveTransferError('missing-save', 'No local trip save exists to export.');
    return createSaveExport(result.save, this.now().toISOString());
  }

  previewImport(raw: string): Promise<SaveImportPreview> {
    return previewSaveImport(raw, this.catalog);
  }

  replaceFromImport(preview: SaveImportPreview): Promise<CommitSaveResult> {
    return this.enqueue(async () => {
      await assertUnchangedImportPreview(preview);
      return this.withStorageFallback(() => this.replaceInternal(preview.candidate, 'before-import'));
    });
  }

  deleteLocalTripData(tripKey: string): Promise<DeleteTripResult> {
    return this.enqueue(async () => {
      await this.engine.transaction('readwrite', async (transaction) => {
        await transaction.deleteSave(tripKey);
        for (const recovery of await transaction.getRecoveries(tripKey)) await transaction.deleteRecovery(recovery.id);
        await transaction.deleteOutbox(tripKey);
      });
      this.lastKnown.delete(tripKey);
      return this.engine.transaction('readonly', async (transaction) => {
        const canonicalPresent = Boolean(await transaction.getSave(tripKey));
        const recoveryCount = (await transaction.getRecoveries(tripKey)).length;
        const outboxPresent = Boolean(await transaction.getOutbox(tripKey));
        return {deleted: !canonicalPresent && recoveryCount === 0 && !outboxPresent, canonicalPresent, recoveryCount, outboxPresent};
      });
    });
  }

  async requestPersistentStorage(): Promise<PersistenceRequestResult> {
    if (this.durability.mode === 'memory-only') return {status: 'memory-only'};
    if (!this.storagePersistence?.persist) return {status: 'unsupported'};
    if (this.storagePersistence.persisted && await this.storagePersistence.persisted()) return {status: 'already-granted'};
    return {status: await this.storagePersistence.persist() ? 'granted' : 'denied'};
  }

  flush(): Promise<void> {
    return this.enqueue(async () => undefined);
  }

  close(): void {
    this.engine.close();
  }

  private enqueue<T>(operation: () => Promise<T>): Promise<T> {
    const result = this.queue.then(operation, operation);
    this.queue = result.then(() => undefined, () => undefined);
    return result;
  }

  private async withStorageFallback<T>(operation: () => Promise<T>): Promise<T> {
    try { return await operation(); }
    catch (error) {
      if (!this.isStorageFailure(error) || this.engine.kind === 'memory') throw error;
      const reason: DurabilityReason = error instanceof DOMException && error.name === 'QuotaExceededError' ? 'quota' : 'storage-error';
      await this.switchToMemory(reason);
      return operation();
    }
  }

  private isStorageFailure(error: unknown): boolean {
    return !(error instanceof SaveValidationError || error instanceof UnsupportedSaveVersionError || error instanceof IncompatibleContentError || error instanceof SaveTransferError || error instanceof RepositoryBlockedError);
  }

  private async switchToMemory(reason: DurabilityReason): Promise<void> {
    this.engine.close();
    const memory = new MemoryStorageEngine();
    await memory.transaction('readwrite', async (transaction) => {
      for (const save of this.lastKnown.values()) await transaction.putSave(this.makeStoredRecord(save));
    });
    this.engine = memory;
    this.durability = {
      mode: 'memory-only',
      reason,
      parentMessage: reason === 'quota'
        ? 'This device is low on storage. Progress continues for now but may be lost when the app closes.'
        : 'Progress continues for now but could not be saved on this device.',
    };
  }

  private async loadInternal(tripKey: string): Promise<LoadSaveResult> {
    const result = await this.engine.transaction('readwrite', async (transaction) => {
      const record = await transaction.getSave(tripKey);
      if (!record) return {save: null, source: 'none', recovered: false, writable: true, warning: null} as const;
      try {
        const decoded = this.decodeRecord(record);
        if (decoded.changed) {
          await this.addRecovery(transaction, record, decoded.migrated ? 'before-migration' : 'before-write');
          await transaction.putSave(this.makeStoredRecord(decoded.save));
          await this.updateOutbox(transaction, decoded.save);
          await this.pruneRecovery(transaction, tripKey);
        }
        return {save: decoded.save, source: 'canonical', recovered: false, writable: true, warning: null} as const;
      } catch (error) {
        const recovery = await this.newestValidRecovery(transaction, tripKey);
        if (error instanceof UnsupportedSaveVersionError) {
          return {save: recovery?.save ?? null, source: recovery ? 'recovery' : 'none', recovered: Boolean(recovery), writable: false, warning: 'newer-schema'} as const;
        }
        if (recovery) {
          await transaction.putSave(this.makeStoredRecord(recovery.save));
          await this.updateOutbox(transaction, recovery.save);
          return {save: recovery.save, source: 'recovery', recovered: true, writable: true, warning: 'corrupt-canonical'} as const;
        }
        return {save: null, source: 'none', recovered: false, writable: false, warning: 'invalid-save'} as const;
      }
    });
    if (result.save) this.lastKnown.set(tripKey, structuredClone(result.save));
    return {...result, durability: this.getDurabilityStatus()};
  }

  private async updateInternal(
    tripKey: string,
    initialize: () => SaveEnvelopeV1,
    mutation: (current: SaveEnvelopeV1) => SaveEnvelopeV1,
    reason: RecoveryReason,
  ): Promise<CommitSaveResult> {
    const result = await this.engine.transaction('readwrite', async (transaction) => {
      const record = await transaction.getSave(tripKey);
      let current: SaveEnvelopeV1;
      if (record) {
        try { current = this.decodeRecord(record).save; }
        catch (error) {
          if (error instanceof UnsupportedSaveVersionError) throw new RepositoryBlockedError('A newer save exists and will not be overwritten.');
          const recovery = await this.newestValidRecovery(transaction, tripKey);
          if (!recovery) throw new RepositoryBlockedError('No valid local save or recovery copy is available.');
          current = recovery.save;
        }
      } else current = assertValidSaveEnvelope(initialize(), validationContextFromCatalog(this.catalog));
      if (current.tripKey !== tripKey) throw new SaveValidationError([{code: 'trip-key', path: '$.tripKey', message: 'Initializer trip key does not match repository key.'}]);
      const candidate = reconcileSaveWithContent(assertValidSaveEnvelope(mutation(structuredClone(current)), validationContextFromCatalog(this.catalog)), this.catalog).save;
      const currentHash = integrityHash(current);
      const candidateHash = integrityHash(candidate);
      if (currentHash === candidateHash) return {save: current, changed: false};
      if (candidate.localRevision !== current.localRevision + 1) throw new SaveValidationError([{code: 'revision', path: '$.localRevision', message: 'A persisted mutation must increment revision exactly once.'}]);
      if (record) await this.addRecovery(transaction, record, reason);
      await transaction.putSave(this.makeStoredRecord(candidate));
      await this.updateOutbox(transaction, candidate);
      await this.pruneRecovery(transaction, tripKey);
      return {save: candidate, changed: true};
    });
    this.lastKnown.set(tripKey, structuredClone(result.save));
    return {...result, persisted: this.durability.mode === 'persistent', durability: this.getDurabilityStatus()};
  }

  private async replaceInternal(save: SaveEnvelopeV1, reason: RecoveryReason): Promise<CommitSaveResult> {
    const candidate = reconcileSaveWithContent(assertValidSaveEnvelope(save, validationContextFromCatalog(this.catalog)), this.catalog).save;
    const result = await this.engine.transaction('readwrite', async (transaction) => {
      const record = await transaction.getSave(candidate.tripKey);
      if (record) {
        try { this.decodeRecord(record); }
        catch (error) { if (error instanceof UnsupportedSaveVersionError) throw new RepositoryBlockedError('A newer save exists and will not be overwritten.'); }
        await this.addRecovery(transaction, record, reason);
      }
      await transaction.putSave(this.makeStoredRecord(candidate));
      await this.updateOutbox(transaction, candidate);
      await this.pruneRecovery(transaction, candidate.tripKey);
      return {save: candidate, changed: !record || record.integrity !== integrityHash(candidate)};
    });
    this.lastKnown.set(candidate.tripKey, structuredClone(candidate));
    return {...result, persisted: this.durability.mode === 'persistent', durability: this.getDurabilityStatus()};
  }

  private decodeRecord(record: StoredSaveRecord): {save: SaveEnvelopeV1; migrated: boolean; changed: boolean} {
    if (record.integrity !== integrityHash(record.payload)) throw new CorruptRecordError();
    const migrated = migrateSave(record.payload, validationContextFromCatalog(this.catalog));
    const reconciled = reconcileSaveWithContent(migrated.save, this.catalog);
    return {
      save: reconciled.save,
      migrated: migrated.migrated,
      changed: migrated.migrated || reconciled.contentVersionChanged || reconciled.routeRecovered || reconciled.missionIdsChanged,
    };
  }

  private makeStoredRecord(save: SaveEnvelopeV1): StoredSaveRecord {
    return {tripKey: save.tripKey, payload: structuredClone(save), integrity: integrityHash(save), storedAt: this.now().toISOString()};
  }

  private async addRecovery(transaction: LocalStorageTransaction, record: StoredSaveRecord, reason: RecoveryReason): Promise<void> {
    const createdAt = this.now().toISOString();
    const recovery: RecoveryRecord = {
      ...structuredClone(record),
      id: this.recoveryId() || `recovery-${createdAt}-${this.recoverySequence++}`,
      createdAt,
      reason,
    };
    await transaction.putRecovery(recovery);
  }

  private async pruneRecovery(transaction: LocalStorageTransaction, tripKey: string): Promise<void> {
    const records = await transaction.getRecoveries(tripKey);
    records.sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id));
    for (const record of records.slice(MAX_RECOVERY_SNAPSHOTS)) await transaction.deleteRecovery(record.id);
  }

  private async newestValidRecovery(transaction: LocalStorageTransaction, tripKey: string): Promise<{save: SaveEnvelopeV1; record: RecoveryRecord} | null> {
    const records = await transaction.getRecoveries(tripKey);
    records.sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id));
    for (const record of records) {
      try { return {save: this.decodeRecord(record).save, record}; }
      catch { /* try older validated snapshot */ }
    }
    return null;
  }

  private async updateOutbox(transaction: LocalStorageTransaction, save: SaveEnvelopeV1): Promise<void> {
    if (!save.backup.enabled || !save.backup.dirty) {
      await transaction.deleteOutbox(save.tripKey);
      return;
    }
    const marker: OutboxMarker = {tripKey: save.tripKey, contentVersion: save.contentVersion, localRevision: save.localRevision, queuedAt: this.now().toISOString()};
    await transaction.putOutbox(marker);
  }
}

class CorruptRecordError extends Error {
  constructor() { super('Stored save integrity check failed.'); this.name = 'CorruptRecordError'; }
}

export class RepositoryBlockedError extends Error {
  constructor(message: string) { super(message); this.name = 'RepositoryBlockedError'; }
}
