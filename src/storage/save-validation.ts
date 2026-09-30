import {
  JOURNEY_STATES,
  MISSION_STATES,
  SAVE_HARD_LIMIT_BYTES,
  SAVE_SCHEMA_VERSION,
  SUPPORTED_LOCALES,
  type SaveEnvelopeV1,
} from '../contracts/save-contract.js';
import {utf8Bytes} from './canonical-json.js';

export interface SaveValidationIssue {
  code: string;
  path: string;
  message: string;
}

export type SaveValidationResult =
  | {ok: true; value: SaveEnvelopeV1; bytes: number}
  | {ok: false; issues: SaveValidationIssue[]; bytes: number};

export interface SaveValidationContext {
  scoredMissionIds?: ReadonlySet<string>;
  variantIdsByMission?: ReadonlyMap<string, ReadonlySet<string>>;
}

const TOP_KEYS = ['schemaVersion', 'tripKey', 'contentVersion', 'journeyState', 'localRevision', 'family', 'route', 'missionProgress', 'excursionSelection', 'settings', 'backup'] as const;
const PROHIBITED_KEYS = new Set([
  'accesstoken', 'analyticsid', 'authtoken', 'biography', 'birthday', 'dateofbirth', 'deviceid',
  'email', 'face', 'fullname', 'gpshistory', 'locationhistory', 'photo', 'refreshtoken',
  'routehistory', 'school', 'surname', 'voice',
]);
const MISSION_ID = /^[A-Z]+(?:-[A-Z0-9]+)+$/;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const CONTENT_VERSION = /^trip-[0-9]{4}\.[0-9]{2}-v[1-9][0-9]*$/;
const STABLE_SCREENS = new Set(['WELCOME', 'SETUP', 'ATLAS', 'CHAPTER', 'MISSION', 'STORY', 'LOOK-UP', 'CHALLENGE', 'CELEBRATION', 'PASSPORT', 'EPILOGUE', 'PARENT']);
const STAGES = new Set([null, 'story', 'look-up', 'challenge', 'celebration']);
const AGE_BANDS = new Set(['4-6', '7-8', '9-11']);

const isRecord = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const isNullableString = (value: unknown): value is string | null => value === null || typeof value === 'string';
const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean';
const isNonNegativeInteger = (value: unknown): value is number => Number.isInteger(value) && (value as number) >= 0;

const addExactKeyIssues = (value: Record<string, unknown>, allowed: readonly string[], path: string, issues: SaveValidationIssue[]) => {
  const allowedSet = new Set(allowed);
  for (const key of allowed) if (!(key in value)) issues.push({code: 'required', path: `${path}.${key}`, message: 'Required field is missing.'});
  for (const key of Object.keys(value)) if (!allowedSet.has(key)) issues.push({code: 'additional-property', path: `${path}.${key}`, message: 'Field is not allowed.'});
};

const scanProhibited = (value: unknown, issues: SaveValidationIssue[], path = '$') => {
  if (typeof value === 'string' && (/data:(?:image|audio)\//i.test(value) || /;base64,/i.test(value))) {
    issues.push({code: 'binary-media', path, message: 'Binary and base64 media are prohibited.'});
  }
  if (Array.isArray(value)) value.forEach((item, index) => scanProhibited(item, issues, `${path}[${index}]`));
  else if (isRecord(value)) {
    for (const [key, child] of Object.entries(value)) {
      if (PROHIBITED_KEYS.has(key.toLowerCase())) issues.push({code: 'prohibited-field', path: `${path}.${key}`, message: 'Prohibited persisted field.'});
      scanProhibited(child, issues, `${path}.${key}`);
    }
  }
};

export const validateSaveEnvelope = (input: unknown, context: SaveValidationContext = {}): SaveValidationResult => {
  const issues: SaveValidationIssue[] = [];
  const bytes = utf8Bytes(input);
  if (bytes > SAVE_HARD_LIMIT_BYTES) issues.push({code: 'size', path: '$', message: `Save is ${bytes} bytes; maximum is ${SAVE_HARD_LIMIT_BYTES}.`});
  scanProhibited(input, issues);
  if (!isRecord(input)) return {ok: false, issues: [...issues, {code: 'type', path: '$', message: 'Save must be an object.'}], bytes};
  addExactKeyIssues(input, TOP_KEYS, '$', issues);
  if (input.schemaVersion !== SAVE_SCHEMA_VERSION) issues.push({code: 'schema-version', path: '$.schemaVersion', message: `Expected ${SAVE_SCHEMA_VERSION}.`});
  if (typeof input.tripKey !== 'string' || !SLUG.test(input.tripKey) || input.tripKey.length > 96) issues.push({code: 'trip-key', path: '$.tripKey', message: 'Invalid trip key.'});
  if (typeof input.contentVersion !== 'string' || !CONTENT_VERSION.test(input.contentVersion)) issues.push({code: 'content-version', path: '$.contentVersion', message: 'Invalid content version.'});
  if (typeof input.journeyState !== 'string' || !(JOURNEY_STATES as readonly string[]).includes(input.journeyState)) issues.push({code: 'journey-state', path: '$.journeyState', message: 'Invalid journey state.'});
  if (!isNonNegativeInteger(input.localRevision)) issues.push({code: 'revision', path: '$.localRevision', message: 'Revision must be a non-negative integer.'});

  if (!isRecord(input.family)) issues.push({code: 'family', path: '$.family', message: 'Family must be an object.'});
  else {
    addExactKeyIssues(input.family, ['members', 'roleRotationIndex'], '$.family', issues);
    if (!Array.isArray(input.family.members) || input.family.members.length > 3) issues.push({code: 'family-members', path: '$.family.members', message: 'Zero to three members are allowed.'});
    else {
      const ids = new Set<string>();
      input.family.members.forEach((member, index) => {
        const path = `$.family.members[${index}]`;
        if (!isRecord(member)) { issues.push({code: 'member', path, message: 'Member must be an object.'}); return; }
        addExactKeyIssues(member, ['id', 'nickname', 'ageBand', 'avatarId'], path, issues);
        if (typeof member.id !== 'string' || !/^child-[1-3]$/.test(member.id) || ids.has(member.id)) issues.push({code: 'member-id', path: `${path}.id`, message: 'Member ID must be unique child-1 through child-3.'});
        else ids.add(member.id);
        if (typeof member.nickname !== 'string' || member.nickname.length < 1 || member.nickname.length > 24 || /[\r\n<>]/.test(member.nickname)) issues.push({code: 'nickname', path: `${path}.nickname`, message: 'Nickname must be 1–24 safe characters.'});
        if (typeof member.ageBand !== 'string' || !AGE_BANDS.has(member.ageBand)) issues.push({code: 'age-band', path: `${path}.ageBand`, message: 'Invalid age band.'});
        if (!isNullableString(member.avatarId) || (typeof member.avatarId === 'string' && !SLUG.test(member.avatarId))) issues.push({code: 'avatar-id', path: `${path}.avatarId`, message: 'Invalid avatar ID.'});
      });
    }
    if (![0, 1, 2].includes(input.family.roleRotationIndex as number)) issues.push({code: 'role-rotation', path: '$.family.roleRotationIndex', message: 'Role rotation must be 0, 1, or 2.'});
  }

  if (!isRecord(input.route)) issues.push({code: 'route', path: '$.route', message: 'Route must be an object.'});
  else {
    addExactKeyIssues(input.route, ['screenId', 'chapterId', 'missionId', 'stage', 'selectedWalkId'], '$.route', issues);
    if (typeof input.route.screenId !== 'string' || !STABLE_SCREENS.has(input.route.screenId)) issues.push({code: 'screen', path: '$.route.screenId', message: 'Only a stable screen may be persisted.'});
    if (!isNullableString(input.route.chapterId) || (typeof input.route.chapterId === 'string' && !SLUG.test(input.route.chapterId))) issues.push({code: 'chapter-id', path: '$.route.chapterId', message: 'Invalid chapter ID.'});
    if (!isNullableString(input.route.missionId) || (typeof input.route.missionId === 'string' && !MISSION_ID.test(input.route.missionId))) issues.push({code: 'mission-id', path: '$.route.missionId', message: 'Invalid mission ID.'});
    if (!STAGES.has(input.route.stage as string | null)) issues.push({code: 'stage', path: '$.route.stage', message: 'Invalid stable stage.'});
    if (!isNullableString(input.route.selectedWalkId) || (typeof input.route.selectedWalkId === 'string' && !SLUG.test(input.route.selectedWalkId))) issues.push({code: 'walk-id', path: '$.route.selectedWalkId', message: 'Invalid walk ID.'});
  }

  if (!isRecord(input.missionProgress)) issues.push({code: 'mission-progress', path: '$.missionProgress', message: 'Mission progress must be an object.'});
  else {
    if (Object.keys(input.missionProgress).length > 512) issues.push({code: 'mission-count', path: '$.missionProgress', message: 'Too many mission records.'});
    for (const [missionId, progress] of Object.entries(input.missionProgress)) {
      const path = `$.missionProgress.${missionId}`;
      if (!MISSION_ID.test(missionId)) issues.push({code: 'mission-id', path, message: 'Invalid mission ID.'});
      if (!isRecord(progress)) { issues.push({code: 'mission-progress', path, message: 'Mission progress must be an object.'}); continue; }
      addExactKeyIssues(progress, ['state', 'resolvedVariantId'], path, issues);
      if (typeof progress.state !== 'string' || !(MISSION_STATES as readonly string[]).includes(progress.state)) issues.push({code: 'mission-state', path: `${path}.state`, message: 'Invalid mission state.'});
      if (!isNullableString(progress.resolvedVariantId) || (typeof progress.resolvedVariantId === 'string' && !SLUG.test(progress.resolvedVariantId))) issues.push({code: 'variant-id', path: `${path}.resolvedVariantId`, message: 'Invalid variant ID.'});
      const knownVariants = context.variantIdsByMission?.get(missionId);
      if (typeof progress.resolvedVariantId === 'string' && knownVariants && !knownVariants.has(progress.resolvedVariantId)) issues.push({code: 'unknown-variant', path: `${path}.resolvedVariantId`, message: 'Variant is not active for this mission.'});
    }
    const count = Object.keys(input.missionProgress).length;
    if ((input.journeyState === 'fresh' || input.journeyState === 'reset') && count) issues.push({code: 'lifecycle', path: '$.missionProgress', message: 'Fresh/reset saves cannot contain progress.'});
    if (input.journeyState === 'in-progress' && !count) issues.push({code: 'lifecycle', path: '$.missionProgress', message: 'In-progress save needs mission progress.'});
    if (input.journeyState === 'completed' && context.scoredMissionIds) {
      for (const id of context.scoredMissionIds) {
        const progress = input.missionProgress[id];
        if (!isRecord(progress) || !['completed', 'manual', 'skipped'].includes(progress.state as string)) issues.push({code: 'incomplete', path: `$.missionProgress.${id}`, message: 'Completed journey is missing a resolved scored mission.'});
      }
    }
  }

  if (!isRecord(input.excursionSelection)) issues.push({code: 'excursion', path: '$.excursionSelection', message: 'Excursion selection must be an object.'});
  else {
    addExactKeyIssues(input.excursionSelection, ['selectedPairId'], '$.excursionSelection', issues);
    if (!isNullableString(input.excursionSelection.selectedPairId) || (typeof input.excursionSelection.selectedPairId === 'string' && !SLUG.test(input.excursionSelection.selectedPairId))) issues.push({code: 'pair-id', path: '$.excursionSelection.selectedPairId', message: 'Invalid pair ID.'});
  }

  if (!isRecord(input.settings)) issues.push({code: 'settings', path: '$.settings', message: 'Settings must be an object.'});
  else {
    addExactKeyIssues(input.settings, ['preferredLocale', 'italianPhrases', 'sound', 'reducedMotion', 'highContrast'], '$.settings', issues);
    if (!(SUPPORTED_LOCALES as readonly unknown[]).includes(input.settings.preferredLocale)) issues.push({code: 'locale', path: '$.settings.preferredLocale', message: 'Unsupported preferred locale.'});
    for (const key of ['italianPhrases', 'sound', 'reducedMotion', 'highContrast'] as const) if (!isBoolean(input.settings[key])) issues.push({code: 'setting', path: `$.settings.${key}`, message: 'Setting must be boolean.'});
  }

  if (!isRecord(input.backup)) issues.push({code: 'backup', path: '$.backup', message: 'Backup metadata must be an object.'});
  else {
    addExactKeyIssues(input.backup, ['enabled', 'dirty', 'lastSuccessfulRevision', 'lastSuccessfulSyncAt'], '$.backup', issues);
    if (!isBoolean(input.backup.enabled) || !isBoolean(input.backup.dirty)) issues.push({code: 'backup-flag', path: '$.backup', message: 'Backup flags must be boolean.'});
    if (input.backup.lastSuccessfulRevision !== null && !isNonNegativeInteger(input.backup.lastSuccessfulRevision)) issues.push({code: 'backup-revision', path: '$.backup.lastSuccessfulRevision', message: 'Invalid backup revision.'});
    if (typeof input.localRevision === 'number' && typeof input.backup.lastSuccessfulRevision === 'number' && input.backup.lastSuccessfulRevision > input.localRevision) issues.push({code: 'backup-revision', path: '$.backup.lastSuccessfulRevision', message: 'Backup revision cannot exceed local revision.'});
    if (input.backup.lastSuccessfulSyncAt !== null && (typeof input.backup.lastSuccessfulSyncAt !== 'string' || Number.isNaN(Date.parse(input.backup.lastSuccessfulSyncAt)))) issues.push({code: 'backup-time', path: '$.backup.lastSuccessfulSyncAt', message: 'Invalid backup timestamp.'});
  }

  return issues.length ? {ok: false, issues, bytes} : {ok: true, value: input as unknown as SaveEnvelopeV1, bytes};
};

export const assertValidSaveEnvelope = (input: unknown, context: SaveValidationContext = {}): SaveEnvelopeV1 => {
  const result = validateSaveEnvelope(input, context);
  if (!result.ok) throw new SaveValidationError(result.issues);
  return result.value;
};

export class SaveValidationError extends Error {
  constructor(readonly issues: SaveValidationIssue[]) {
    super(issues.map(({path, message}) => `${path}: ${message}`).join('; '));
    this.name = 'SaveValidationError';
  }
}
