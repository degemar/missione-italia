import {SAVE_HARD_LIMIT_BYTES, type SaveEnvelopeV1} from '../contracts/save-contract.js';
import {canonicalJson, sha256Hex, utf8Bytes} from './canonical-json.js';
import {type ContentCatalog, reconcileSaveWithContent, validationContextFromCatalog} from './content-reconciliation.js';
import {migrateSave} from './save-migrations.js';
import {assertValidSaveEnvelope} from './save-validation.js';

export const SAVE_EXPORT_FORMAT = 'missione-italia-save' as const;
export const SAVE_EXPORT_VERSION = 1 as const;
export const MAX_IMPORT_BYTES = SAVE_HARD_LIMIT_BYTES + 32_768;

export interface SaveExportV1 {
  format: typeof SAVE_EXPORT_FORMAT;
  exportVersion: typeof SAVE_EXPORT_VERSION;
  label: 'Missione Italia family save';
  exportedAt: string;
  tripKey: string;
  contentVersion: string;
  storageSchemaVersion: number;
  payloadBytes: number;
  checksum: {algorithm: 'SHA-256'; value: string};
  payload: SaveEnvelopeV1;
}

export interface SaveImportPreview {
  candidate: SaveEnvelopeV1;
  candidateChecksum: string;
  sourceContentVersion: string;
  sourceSchemaVersion: number;
  migrated: boolean;
  contentReconciled: boolean;
  summary: {
    memberCount: number;
    resolvedMissionCount: number;
    inProgressMissionCount: number;
    unknownMissionCount: number;
    journeyState: SaveEnvelopeV1['journeyState'];
  };
}

export class SaveTransferError extends Error {
  constructor(readonly code: string, message: string) {
    super(message);
    this.name = 'SaveTransferError';
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

export const createSaveExport = async (save: SaveEnvelopeV1, exportedAt = new Date().toISOString()): Promise<string> => {
  const validated = assertValidSaveEnvelope(save);
  const payloadBytes = utf8Bytes(validated);
  const checksum = await sha256Hex(validated);
  const envelope: SaveExportV1 = {
    format: SAVE_EXPORT_FORMAT,
    exportVersion: SAVE_EXPORT_VERSION,
    label: 'Missione Italia family save',
    exportedAt,
    tripKey: validated.tripKey,
    contentVersion: validated.contentVersion,
    storageSchemaVersion: validated.schemaVersion,
    payloadBytes,
    checksum: {algorithm: 'SHA-256', value: checksum},
    payload: validated,
  };
  return `${canonicalJson(envelope)}\n`;
};

export const previewSaveImport = async (raw: string, catalog: ContentCatalog): Promise<SaveImportPreview> => {
  const inputBytes = new TextEncoder().encode(raw).byteLength;
  if (inputBytes > MAX_IMPORT_BYTES) throw new SaveTransferError('import-size', `Import is ${inputBytes} bytes; maximum is ${MAX_IMPORT_BYTES}.`);
  let parsed: unknown;
  try { parsed = JSON.parse(raw); } catch { throw new SaveTransferError('invalid-json', 'Import is not valid JSON.'); }
  if (!isRecord(parsed)) throw new SaveTransferError('invalid-envelope', 'Import envelope must be an object.');
  const allowed = new Set(['format', 'exportVersion', 'label', 'exportedAt', 'tripKey', 'contentVersion', 'storageSchemaVersion', 'payloadBytes', 'checksum', 'payload']);
  if (Object.keys(parsed).some((key) => !allowed.has(key))) throw new SaveTransferError('invalid-envelope', 'Import envelope contains an unsupported field.');
  if (parsed.format !== SAVE_EXPORT_FORMAT || parsed.exportVersion !== SAVE_EXPORT_VERSION || parsed.label !== 'Missione Italia family save') throw new SaveTransferError('unsupported-export', 'Unsupported save export format.');
  if (typeof parsed.exportedAt !== 'string' || Number.isNaN(Date.parse(parsed.exportedAt))) throw new SaveTransferError('invalid-envelope', 'Invalid export timestamp.');
  if (!isRecord(parsed.checksum) || parsed.checksum.algorithm !== 'SHA-256' || typeof parsed.checksum.value !== 'string') throw new SaveTransferError('checksum', 'Missing SHA-256 checksum.');
  const payloadBytes = utf8Bytes(parsed.payload);
  if (payloadBytes !== parsed.payloadBytes || payloadBytes > SAVE_HARD_LIMIT_BYTES) throw new SaveTransferError('payload-size', 'Payload byte count is invalid.');
  const actualChecksum = await sha256Hex(parsed.payload);
  if (actualChecksum !== parsed.checksum.value) throw new SaveTransferError('checksum', 'Save checksum does not match.');
  const migrated = migrateSave(parsed.payload, validationContextFromCatalog(catalog));
  if (parsed.tripKey !== migrated.save.tripKey || parsed.contentVersion !== (parsed.payload as Record<string, unknown>).contentVersion || parsed.storageSchemaVersion !== migrated.fromVersion) throw new SaveTransferError('metadata-mismatch', 'Export metadata does not match its payload.');
  if (migrated.save.tripKey !== catalog.tripKey) throw new SaveTransferError('trip-mismatch', `Import belongs to ${migrated.save.tripKey}, not ${catalog.tripKey}.`);
  const reconciled = reconcileSaveWithContent(migrated.save, catalog);
  const candidate = assertValidSaveEnvelope(reconciled.save, validationContextFromCatalog(catalog));
  const candidateChecksum = await sha256Hex(candidate);
  const resolved = Object.values(reconciled.activeMissionProgress).filter(({state}) => state === 'completed' || state === 'manual' || state === 'skipped').length;
  const inProgress = Object.values(reconciled.activeMissionProgress).filter(({state}) => state === 'in-progress').length;
  return {
    candidate,
    candidateChecksum,
    sourceContentVersion: migrated.save.contentVersion,
    sourceSchemaVersion: migrated.fromVersion,
    migrated: migrated.migrated,
    contentReconciled: reconciled.contentVersionChanged || reconciled.routeRecovered || reconciled.missionIdsChanged,
    summary: {
      memberCount: candidate.family.members.length,
      resolvedMissionCount: resolved,
      inProgressMissionCount: inProgress,
      unknownMissionCount: Object.keys(reconciled.unknownMissionProgress).length,
      journeyState: candidate.journeyState,
    },
  };
};

export const assertUnchangedImportPreview = async (preview: SaveImportPreview): Promise<void> => {
  if (await sha256Hex(preview.candidate) !== preview.candidateChecksum) throw new SaveTransferError('preview-changed', 'Import preview changed after validation.');
};
