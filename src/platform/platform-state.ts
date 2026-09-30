export type ConnectivityState = 'online' | 'offline';
export type OfflineReadinessState = 'checking' | 'ready' | 'not-ready';
export type TileState = 'not-used' | 'loading' | 'available' | 'unavailable';
export type LocationState = 'not-requested' | 'requesting' | 'available' | 'denied' | 'unavailable' | 'unsupported';
export type CloudState = 'disabled' | 'idle' | 'available' | 'unavailable';

export interface PlatformState {
  readonly connectivity: ConnectivityState;
  readonly offlineReadiness: OfflineReadinessState;
  readonly tiles: TileState;
  readonly location: LocationState;
  readonly cloud: CloudState;
  readonly coreGameplayAvailable: true;
}

export type PlatformStateEvent =
  | {readonly type: 'CONNECTIVITY_CHANGED'; readonly online: boolean}
  | {readonly type: 'OFFLINE_READINESS_CHANGED'; readonly readiness: OfflineReadinessState}
  | {readonly type: 'TILES_CHANGED'; readonly state: TileState}
  | {readonly type: 'LOCATION_CHANGED'; readonly state: LocationState}
  | {readonly type: 'CLOUD_CHANGED'; readonly state: CloudState};

export const createInitialPlatformState = (
  online: boolean,
  cloudEnabled: boolean,
): PlatformState => ({
  connectivity: online ? 'online' : 'offline',
  offlineReadiness: 'checking',
  tiles: 'not-used',
  location: 'not-requested',
  cloud: cloudEnabled ? 'idle' : 'disabled',
  coreGameplayAvailable: true,
});

export function reducePlatformState(state: PlatformState, event: PlatformStateEvent): PlatformState {
  switch (event.type) {
    case 'CONNECTIVITY_CHANGED':
      return {...state, connectivity: event.online ? 'online' : 'offline'};
    case 'OFFLINE_READINESS_CHANGED':
      return {...state, offlineReadiness: event.readiness};
    case 'TILES_CHANGED':
      return {...state, tiles: event.state};
    case 'LOCATION_CHANGED':
      return {...state, location: event.state};
    case 'CLOUD_CHANGED':
      return {...state, cloud: event.state};
  }
}

export type DegradedMode = 'online' | 'offline-ready' | 'offline-not-ready' | 'tiles-unavailable' | 'cloud-unavailable';

export function deriveDegradedModes(state: PlatformState): ReadonlySet<DegradedMode> {
  const modes = new Set<DegradedMode>();
  if (state.connectivity === 'online') modes.add('online');
  else if (state.offlineReadiness === 'ready') modes.add('offline-ready');
  else modes.add('offline-not-ready');
  if (state.tiles === 'unavailable') modes.add('tiles-unavailable');
  if (state.cloud === 'unavailable') modes.add('cloud-unavailable');
  return modes;
}

interface ConnectivityTarget {
  addEventListener(type: 'online' | 'offline', listener: () => void): void;
  removeEventListener(type: 'online' | 'offline', listener: () => void): void;
}

export class PlatformStateController {
  private state: PlatformState;
  private readonly listeners = new Set<(state: PlatformState) => void>();
  private readonly onlineListener = () => this.dispatch({type: 'CONNECTIVITY_CHANGED', online: true});
  private readonly offlineListener = () => this.dispatch({type: 'CONNECTIVITY_CHANGED', online: false});

  constructor(
    online: boolean,
    cloudEnabled: boolean,
    private readonly connectivityTarget: ConnectivityTarget | null = typeof window === 'undefined' ? null : window,
  ) {
    this.state = createInitialPlatformState(online, cloudEnabled);
    this.connectivityTarget?.addEventListener('online', this.onlineListener);
    this.connectivityTarget?.addEventListener('offline', this.offlineListener);
  }

  snapshot(): PlatformState {
    return {...this.state};
  }

  subscribe(listener: (state: PlatformState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  dispatch(event: PlatformStateEvent): void {
    const next = reducePlatformState(this.state, event);
    if (next === this.state) return;
    this.state = next;
    for (const listener of this.listeners) listener(this.snapshot());
  }

  close(): void {
    this.connectivityTarget?.removeEventListener('online', this.onlineListener);
    this.connectivityTarget?.removeEventListener('offline', this.offlineListener);
    this.listeners.clear();
  }
}
