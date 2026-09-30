import type {AppScreen} from '../app/app-state.js';
import type {PlatformState} from '../platform/platform-state.js';
import type {TripMaintenanceAction} from '../platform/trip-data-maintenance.js';

export const PARENT_HOLD_DURATION_MS = 900;

export interface ParentEntryState {
  readonly phase: 'idle' | 'holding' | 'confirming';
  readonly startedAt: number | null;
  readonly progress: number;
}

export type ParentEntryEvent =
  | {readonly type: 'HOLD_STARTED'; readonly now: number}
  | {readonly type: 'HOLD_TICK'; readonly now: number}
  | {readonly type: 'HOLD_CANCELLED'}
  | {readonly type: 'DIRECT_ACTIVATED'}
  | {readonly type: 'CONFIRMATION_CLOSED'};

export const initialParentEntryState: ParentEntryState = {
  phase: 'idle',
  startedAt: null,
  progress: 0,
};

export function reduceParentEntry(state: ParentEntryState, event: ParentEntryEvent): ParentEntryState {
  switch (event.type) {
    case 'HOLD_STARTED':
      return state.phase === 'idle' ? {phase: 'holding', startedAt: event.now, progress: 0} : state;
    case 'HOLD_TICK': {
      if (state.phase !== 'holding' || state.startedAt === null) return state;
      const progress = Math.min(100, Math.max(0, Math.floor(((event.now - state.startedAt) / PARENT_HOLD_DURATION_MS) * 100)));
      return progress >= 100
        ? {phase: 'confirming', startedAt: null, progress: 100}
        : {...state, progress};
    }
    case 'DIRECT_ACTIVATED':
      return {phase: 'confirming', startedAt: null, progress: 100};
    case 'HOLD_CANCELLED':
    case 'CONFIRMATION_CLOSED':
      return initialParentEntryState;
  }
}

export const missionIdFromScreen = (screen: AppScreen | null): string | null =>
  screen && 'missionId' in screen ? screen.missionId : null;

export type ParentMaintenanceStage =
  | {readonly stage: 'idle'}
  | {readonly stage: 'confirm'; readonly action: TripMaintenanceAction};

export type ParentMaintenanceEvent =
  | {readonly type: 'PREPARE'; readonly action: TripMaintenanceAction}
  | {readonly type: 'CANCEL'}
  | {readonly type: 'COMMITTED'};

export function reduceParentMaintenance(
  state: ParentMaintenanceStage,
  event: ParentMaintenanceEvent,
): ParentMaintenanceStage {
  if (event.type === 'PREPARE') return {stage: 'confirm', action: event.action};
  if (event.type === 'CANCEL' || event.type === 'COMMITTED') return {stage: 'idle'};
  return state;
}

export type OfflinePresentation = 'online' | 'offline-ready' | 'offline-not-ready';

export function offlinePresentation(platform: PlatformState): OfflinePresentation {
  if (platform.connectivity === 'online') return 'online';
  return platform.offlineReadiness === 'ready' ? 'offline-ready' : 'offline-not-ready';
}

export const shouldRenderCloudControls = (platform: PlatformState): boolean => platform.cloud !== 'disabled';

export type UpdatePresentation = 'hidden' | 'waiting' | 'ready';

export function updatePresentation(updateAvailable: boolean, canApplyUpdate: boolean): UpdatePresentation {
  if (!updateAvailable) return 'hidden';
  return canApplyUpdate ? 'ready' : 'waiting';
}
