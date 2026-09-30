export const LOCAL_DB_NAME = 'missione-italia-local';
export const LOCAL_DB_VERSION = 1;
export const LOCAL_STORES = {
  saves: 'saves',
  recovery: 'recovery',
  outbox: 'outbox',
} as const;

export type RecoveryReason = 'before-write' | 'before-migration' | 'before-import' | 'corrupt-canonical';

export interface StoredSaveRecord {
  tripKey: string;
  payload: unknown;
  integrity: string;
  storedAt: string;
}

export interface RecoveryRecord extends StoredSaveRecord {
  id: string;
  createdAt: string;
  reason: RecoveryReason;
}

export interface OutboxMarker {
  tripKey: string;
  contentVersion: string;
  localRevision: number;
  queuedAt: string;
}

export interface LocalStorageTransaction {
  getSave(tripKey: string): Promise<StoredSaveRecord | undefined>;
  putSave(record: StoredSaveRecord): Promise<void>;
  deleteSave(tripKey: string): Promise<void>;
  getRecoveries(tripKey: string): Promise<RecoveryRecord[]>;
  putRecovery(record: RecoveryRecord): Promise<void>;
  deleteRecovery(id: string): Promise<void>;
  getOutbox(tripKey: string): Promise<OutboxMarker | undefined>;
  putOutbox(marker: OutboxMarker): Promise<void>;
  deleteOutbox(tripKey: string): Promise<void>;
}

export interface LocalStorageEngine {
  readonly kind: 'indexeddb' | 'memory';
  transaction<T>(mode: IDBTransactionMode, operation: (transaction: LocalStorageTransaction) => Promise<T>): Promise<T>;
  close(): void;
}

const requestResult = <T>(request: IDBRequest<T>): Promise<T> => new Promise((resolve, reject) => {
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error ?? new Error('IndexedDB request failed.'));
});

const transactionComplete = (transaction: IDBTransaction): Promise<void> => new Promise((resolve, reject) => {
  transaction.oncomplete = () => resolve();
  transaction.onabort = () => reject(transaction.error ?? new DOMException('IndexedDB transaction aborted.', 'AbortError'));
  transaction.onerror = () => reject(transaction.error ?? new Error('IndexedDB transaction failed.'));
});

export class IndexedDbStorageEngine implements LocalStorageEngine {
  readonly kind = 'indexeddb' as const;

  private constructor(private readonly database: IDBDatabase) {}

  static open(factory: IDBFactory, databaseName = LOCAL_DB_NAME): Promise<IndexedDbStorageEngine> {
    return new Promise((resolve, reject) => {
      let request: IDBOpenDBRequest;
      try { request = factory.open(databaseName, LOCAL_DB_VERSION); }
      catch (error) { reject(error); return; }
      request.onupgradeneeded = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains(LOCAL_STORES.saves)) database.createObjectStore(LOCAL_STORES.saves, {keyPath: 'tripKey'});
        if (!database.objectStoreNames.contains(LOCAL_STORES.recovery)) database.createObjectStore(LOCAL_STORES.recovery, {keyPath: 'id'});
        if (!database.objectStoreNames.contains(LOCAL_STORES.outbox)) database.createObjectStore(LOCAL_STORES.outbox, {keyPath: 'tripKey'});
      };
      request.onsuccess = () => resolve(new IndexedDbStorageEngine(request.result));
      request.onerror = () => reject(request.error ?? new Error('IndexedDB could not be opened.'));
      request.onblocked = () => reject(new DOMException('IndexedDB upgrade is blocked.', 'InvalidStateError'));
    });
  }

  async transaction<T>(mode: IDBTransactionMode, operation: (transaction: LocalStorageTransaction) => Promise<T>): Promise<T> {
    const transaction = this.database.transaction(Object.values(LOCAL_STORES), mode);
    const completed = transactionComplete(transaction);
    const saves = transaction.objectStore(LOCAL_STORES.saves);
    const recovery = transaction.objectStore(LOCAL_STORES.recovery);
    const outbox = transaction.objectStore(LOCAL_STORES.outbox);
    const api: LocalStorageTransaction = {
      getSave: (tripKey) => requestResult(saves.get(tripKey) as IDBRequest<StoredSaveRecord | undefined>),
      putSave: async (record) => { await requestResult(saves.put(record)); },
      deleteSave: async (tripKey) => { await requestResult(saves.delete(tripKey)); },
      getRecoveries: async (tripKey) => (await requestResult(recovery.getAll() as IDBRequest<RecoveryRecord[]>)).filter((record) => record.tripKey === tripKey),
      putRecovery: async (record) => { await requestResult(recovery.put(record)); },
      deleteRecovery: async (id) => { await requestResult(recovery.delete(id)); },
      getOutbox: (tripKey) => requestResult(outbox.get(tripKey) as IDBRequest<OutboxMarker | undefined>),
      putOutbox: async (marker) => { await requestResult(outbox.put(marker)); },
      deleteOutbox: async (tripKey) => { await requestResult(outbox.delete(tripKey)); },
    };
    let result: T;
    try { result = await operation(api); }
    catch (error) {
      try { transaction.abort(); } catch { /* transaction already ended */ }
      await completed.catch(() => undefined);
      throw error;
    }
    await completed;
    return result;
  }

  close(): void {
    this.database.close();
  }
}

export class MemoryStorageEngine implements LocalStorageEngine {
  readonly kind = 'memory' as const;
  private readonly saves = new Map<string, StoredSaveRecord>();
  private readonly recoveries = new Map<string, RecoveryRecord>();
  private readonly outbox = new Map<string, OutboxMarker>();

  async transaction<T>(_mode: IDBTransactionMode, operation: (transaction: LocalStorageTransaction) => Promise<T>): Promise<T> {
    const saves = new Map(this.saves);
    const recoveries = new Map(this.recoveries);
    const outbox = new Map(this.outbox);
    const clone = <V>(value: V): V => structuredClone(value);
    const api: LocalStorageTransaction = {
      getSave: async (tripKey) => { const value = saves.get(tripKey); return value ? clone(value) : undefined; },
      putSave: async (record) => { saves.set(record.tripKey, clone(record)); },
      deleteSave: async (tripKey) => { saves.delete(tripKey); },
      getRecoveries: async (tripKey) => [...recoveries.values()].filter((record) => record.tripKey === tripKey).map(clone),
      putRecovery: async (record) => { recoveries.set(record.id, clone(record)); },
      deleteRecovery: async (id) => { recoveries.delete(id); },
      getOutbox: async (tripKey) => { const value = outbox.get(tripKey); return value ? clone(value) : undefined; },
      putOutbox: async (marker) => { outbox.set(marker.tripKey, clone(marker)); },
      deleteOutbox: async (tripKey) => { outbox.delete(tripKey); },
    };
    const result = await operation(api);
    this.saves.clear();
    this.recoveries.clear();
    this.outbox.clear();
    for (const [key, value] of saves) this.saves.set(key, value);
    for (const [key, value] of recoveries) this.recoveries.set(key, value);
    for (const [key, value] of outbox) this.outbox.set(key, value);
    return result;
  }

  close(): void {}
}

export class FailingStorageEngine implements LocalStorageEngine {
  readonly kind = 'indexeddb' as const;
  constructor(private readonly errorFactory: () => Error) {}
  async transaction<T>(): Promise<T> {
    throw this.errorFactory();
  }
  close(): void {}
}
