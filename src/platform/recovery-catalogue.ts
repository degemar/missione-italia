export type InfrastructureFailureKind =
  | 'render'
  | 'content-load'
  | 'indexeddb'
  | 'service-worker'
  | 'map-tiles'
  | 'location'
  | 'cloud';

export type RecoveryAction =
  | 'retry'
  | 'continue-offline'
  | 'manual-override'
  | 'open-diagnostics'
  | 'deliberate-reset';

export interface RecoveryEntry {
  readonly code: DiagnosticCode;
  readonly title: string;
  readonly parentMessage: string;
  readonly actions: readonly RecoveryAction[];
  readonly blocksWholeApp: boolean;
}

export type DiagnosticCode =
  | 'MI_RENDER_FAILED'
  | 'MI_CONTENT_LOAD_FAILED'
  | 'MI_STORAGE_UNAVAILABLE'
  | 'MI_SERVICE_WORKER_FAILED'
  | 'MI_MAP_TILES_FAILED'
  | 'MI_LOCATION_FAILED'
  | 'MI_CLOUD_UNAVAILABLE';

export const RECOVERY_CATALOGUE: Readonly<Record<InfrastructureFailureKind, RecoveryEntry>> = Object.freeze({
  render: {
    code: 'MI_RENDER_FAILED',
    title: 'This part of the adventure needs a retry',
    parentMessage: 'Progress was not reset. A grown-up can retry or open diagnostics.',
    actions: ['retry', 'open-diagnostics'],
    blocksWholeApp: false,
  },
  'content-load': {
    code: 'MI_CONTENT_LOAD_FAILED',
    title: 'The bundled adventure did not open',
    parentMessage: 'Retry the local story package. Existing family progress stays unchanged.',
    actions: ['retry', 'open-diagnostics'],
    blocksWholeApp: true,
  },
  indexeddb: {
    code: 'MI_STORAGE_UNAVAILABLE',
    title: 'Progress may not stay on this device',
    parentMessage: 'The family can continue in this session. Retry storage or export before a deliberate reset.',
    actions: ['retry', 'continue-offline', 'open-diagnostics', 'deliberate-reset'],
    blocksWholeApp: false,
  },
  'service-worker': {
    code: 'MI_SERVICE_WORKER_FAILED',
    title: 'Offline setup is not ready',
    parentMessage: 'The online app still works. Retry before travel; local progress is unchanged.',
    actions: ['retry', 'continue-offline', 'open-diagnostics'],
    blocksWholeApp: false,
  },
  'map-tiles': {
    code: 'MI_MAP_TILES_FAILED',
    title: 'The live map is unavailable',
    parentMessage: 'Use the bundled checkpoint list and continue the mission without live tiles.',
    actions: ['continue-offline', 'manual-override', 'open-diagnostics'],
    blocksWholeApp: false,
  },
  location: {
    code: 'MI_LOCATION_FAILED',
    title: 'Location is unavailable',
    parentMessage: 'No coordinates were saved. Choose the place manually and continue.',
    actions: ['manual-override', 'open-diagnostics'],
    blocksWholeApp: false,
  },
  cloud: {
    code: 'MI_CLOUD_UNAVAILABLE',
    title: 'Cloud backup is unavailable',
    parentMessage: 'Local progress remains authoritative and gameplay continues offline.',
    actions: ['continue-offline', 'retry', 'open-diagnostics'],
    blocksWholeApp: false,
  },
});

export const recoveryFor = (kind: InfrastructureFailureKind): RecoveryEntry => RECOVERY_CATALOGUE[kind];
