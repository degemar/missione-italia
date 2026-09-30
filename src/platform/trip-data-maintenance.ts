import type {SaveEnvelopeV1} from '../contracts/save-contract.js';
import type {
  CommitSaveResult,
  DeleteTripResult,
} from '../storage/local-save-repository.js';

export type TripMaintenanceAction = 'reset-progress' | 'delete-trip-data';

export interface PreparedTripMaintenance {
  readonly action: TripMaintenanceAction;
  readonly tripKey: string;
  readonly confirmationLabel: 'Reset progress' | 'Delete trip data';
}

const confirmedIntent = Symbol('confirmed-trip-maintenance');

export interface ConfirmedTripMaintenance extends PreparedTripMaintenance {
  readonly [confirmedIntent]: true;
}

export interface TripMaintenanceRepository {
  resetProgress(tripKey: string, initialize: () => SaveEnvelopeV1): Promise<CommitSaveResult>;
  deleteLocalTripData(tripKey: string): Promise<DeleteTripResult>;
}

export interface CacheStoragePort {
  delete(cacheName: string): Promise<boolean>;
}

export interface TripDeletionResult {
  readonly local: DeleteTripResult;
  readonly tripDataCacheDeleted: boolean;
}

export const TRIP_DATA_CACHE_PREFIX = 'missione-italia-trip-data-v1:';

const assertTripKey = (tripKey: string): void => {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(tripKey)) throw new Error('Invalid trip key.');
};

export function prepareTripMaintenance(
  action: TripMaintenanceAction,
  tripKey: string,
): PreparedTripMaintenance {
  assertTripKey(tripKey);
  return Object.freeze({
    action,
    tripKey,
    confirmationLabel: action === 'reset-progress' ? 'Reset progress' : 'Delete trip data',
  });
}

export function confirmTripMaintenance(
  prepared: PreparedTripMaintenance,
  activatedLabel: string,
): ConfirmedTripMaintenance | null {
  if (activatedLabel !== prepared.confirmationLabel) return null;
  return Object.freeze({...prepared, [confirmedIntent]: true as const});
}

export const tripDataCacheName = (tripKey: string): string => {
  assertTripKey(tripKey);
  return `${TRIP_DATA_CACHE_PREFIX}${tripKey}`;
};

export class TripDataMaintenance {
  constructor(
    private readonly tripKey: string,
    private readonly repository: TripMaintenanceRepository,
    private readonly initialize: () => SaveEnvelopeV1,
    private readonly cacheStorage: CacheStoragePort | null = typeof caches === 'undefined' ? null : caches,
    private readonly clearDiagnostics: () => void = () => undefined,
  ) {
    assertTripKey(tripKey);
  }

  reset(intent: ConfirmedTripMaintenance): Promise<CommitSaveResult> {
    this.assertIntent(intent, 'reset-progress');
    return this.repository.resetProgress(this.tripKey, this.initialize);
  }

  async delete(intent: ConfirmedTripMaintenance): Promise<TripDeletionResult> {
    this.assertIntent(intent, 'delete-trip-data');
    const local = await this.repository.deleteLocalTripData(this.tripKey);
    const tripDataCacheDeleted = await this.cacheStorage?.delete(tripDataCacheName(this.tripKey)) ?? false;
    this.clearDiagnostics();
    return {local, tripDataCacheDeleted};
  }

  private assertIntent(intent: ConfirmedTripMaintenance, action: TripMaintenanceAction): void {
    if (intent[confirmedIntent] !== true || intent.action !== action || intent.tripKey !== this.tripKey) {
      throw new TripMaintenanceConfirmationError();
    }
  }
}

export class TripMaintenanceConfirmationError extends Error {
  constructor() {
    super('Trip maintenance requires a matching deliberate confirmation.');
    this.name = 'TripMaintenanceConfirmationError';
  }
}
