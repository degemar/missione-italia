import {
  Binoculars,
  BookmarkSimple,
  CheckCircle,
  ClipboardText,
  Compass,
  Database,
  HandTap,
  HardDrive,
  LockKey,
  MagnifyingGlass,
  SpeakerHigh,
  Trash,
} from '@phosphor-icons/react';
import {useReducer} from 'react';

import type {NarrationChapterCache} from '../audio/narration-cache.js';
import type {NarratorController} from '../audio/narrator-controller.js';
import type {AppScreen} from '../app/app-state.js';
import type {SaveEnvelopeV1} from '../contracts/save-contract.js';
import type {ContentBundle, RoleId} from '../content/types.js';
import {isChapterAvailable, isResolved} from '../game/progress.js';
import {getRoleAssignments} from '../game/roles.js';
import {translate as t} from '../i18n/strings.js';
import {
  missionIdFromScreen,
  offlinePresentation,
  reduceParentMaintenance,
  shouldRenderCloudControls,
  updatePresentation,
  type ParentMaintenanceStage,
} from '../parent/parent-controls.js';
import type {PlatformState} from '../platform/platform-state.js';
import type {StorageHealth} from '../platform/storage-health.js';
import type {TripMaintenanceAction} from '../platform/trip-data-maintenance.js';
import type {PersistenceRequestResult} from '../storage/index.js';
import {AccessibleDialog} from './AccessibleDialog.js';
import {InstallGuide} from './InstallGuide.js';
import {NarrationDownloads} from './NarrationDownloads.js';
import './parent-corner-r3.css';

interface ParentCornerProps {
  readonly bundle: ContentBundle;
  readonly save: SaveEnvelopeV1;
  readonly origin: AppScreen | null;
  readonly roleShift: number;
  readonly manuallyUnlocked: ReadonlySet<string>;
  readonly busy: boolean;
  readonly platform: PlatformState;
  readonly storageHealth: StorageHealth | null;
  readonly persistenceResult: PersistenceRequestResult['status'] | null;
  readonly diagnosticPreview: string | null;
  readonly copyStatus: 'idle' | 'copied' | 'unavailable';
  readonly updateAvailable: boolean;
  readonly canApplyUpdate: boolean;
  readonly narrationCache: NarrationChapterCache | null;
  readonly narrator: NarratorController | null;
  readonly onDone: () => void;
  readonly onRotateRoles: () => void;
  readonly onResolveMission: (result: 'manual' | 'skipped') => void;
  readonly onUnlockChapter: (chapterId: string) => void;
  readonly onSelectPair: (pairId: string) => void;
  readonly onSetting: (setting: 'sound' | 'reducedMotion', value: boolean) => void;
  readonly onInspectStorage: () => void;
  readonly onRequestPersistence: () => void;
  readonly onCreateDiagnostics: () => void;
  readonly onCopyDiagnostics: () => void;
  readonly onApplyUpdate: () => void;
  readonly onMaintenance: (action: TripMaintenanceAction) => void;
}

const roleLabel = (role: RoleId): string => {
  if (role === 'spotter') return t('role.spotter');
  if (role === 'detective') return t('role.detective');
  return t('role.navigator');
};

function RoleIcon({role}: {readonly role: RoleId}) {
  if (role === 'spotter') return <Binoculars aria-hidden="true" weight="bold" />;
  if (role === 'detective') return <MagnifyingGlass aria-hidden="true" weight="bold" />;
  return <Compass aria-hidden="true" weight="bold" />;
}

const formatBytes = (bytes: number | null): string => {
  if (bytes === null) return t('parent.storageUnknown');
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const initialMaintenance: ParentMaintenanceStage = {stage: 'idle'};

export function ParentCorner(props: ParentCornerProps) {
  const [maintenance, maintenanceDispatch] = useReducer(reduceParentMaintenance, initialMaintenance);
  const missionId = missionIdFromScreen(props.origin);
  const mission = missionId ? props.bundle.missionById.get(missionId) ?? null : null;
  const missionCanResolve = Boolean(mission && !isResolved(props.save.missionProgress[mission.id]));
  const assignments = getRoleAssignments(
    props.save.family.members,
    props.save.family.roleRotationIndex,
    props.roleShift,
  );
  const offline = offlinePresentation(props.platform);
  const update = updatePresentation(props.updateAvailable, props.canApplyUpdate);
  const persistenceLabel = props.persistenceResult ? t(`parent.persistence.${props.persistenceResult}`) : null;

  const prepareMaintenance = (action: TripMaintenanceAction) => maintenanceDispatch({type: 'PREPARE', action});
  const closeMaintenance = () => maintenanceDispatch({type: 'CANCEL'});
  const confirmMaintenance = () => {
    if (maintenance.stage !== 'confirm') return;
    props.onMaintenance(maintenance.action);
    maintenanceDispatch({type: 'COMMITTED'});
  };

  return (
    <section className="screen-stack parent-corner parent-theatre">
      <header className="screen-intro parent-corner__intro parent-theatre__masthead">
        <p className="eyebrow parent-theatre__eyebrow"><LockKey aria-hidden="true" weight="bold" /> {t('common.adult')}</p>
        <h1 data-screen-heading tabIndex={-1}>{t('parent.title')}</h1>
        <p>{t('parent.notAuthentication')}</p>
      </header>

      {mission ? (
        <section className="parent-section parent-section--mission" aria-labelledby="parent-mission-heading">
          <h2 id="parent-mission-heading">{t('parent.currentMission')}</h2>
          <p><strong>{mission.title}</strong></p>
          <div className="parent-role-list">
            {mission.roles.map(({role}) => (
              <div className={`role-pill role-pill--${role}`} key={role}>
                <RoleIcon role={role} />
                <span>{t('mission.roleAssignment', {
                  role: roleLabel(role),
                  nickname: assignments.find((assignment) => assignment.role === role)?.member?.nickname ?? t('role.unassigned'),
                })}</span>
              </div>
            ))}
          </div>
          <button className="parent-button secondary-button" type="button" disabled={props.busy} onClick={props.onRotateRoles}>
            {t('parent.reassignRoles')}
          </button>
          {missionCanResolve ? (
            <div className="parent-action-grid">
              <button className="parent-button secondary-button" type="button" disabled={props.busy} onClick={() => props.onResolveMission('manual')}>
                <HandTap aria-hidden="true" weight="bold" />{t('parent.manualComplete')}
              </button>
              <button className="parent-button quiet-button" type="button" disabled={props.busy} onClick={() => props.onResolveMission('skipped')}>
                <BookmarkSimple aria-hidden="true" weight="bold" />{t('parent.skipMission')}
              </button>
            </div>
          ) : <p className="control-help">{t('parent.noMissionAction')}</p>}
        </section>
      ) : null}

      <section className="parent-section parent-section--chapters" aria-labelledby="parent-chapters-heading">
        <h2 id="parent-chapters-heading">{t('parent.chapters')}</h2>
        <div className="parent-list">
          {props.bundle.chapters.map((chapter) => {
            const open = isChapterAvailable(props.bundle, props.save, chapter, props.manuallyUnlocked);
            return (
              <div className="parent-list__row" key={chapter.id}>
                <span>{chapter.title}</span>
                {open ? (
                  <span className="status-label"><CheckCircle aria-hidden="true" weight="fill" /> {t('parent.chapterOpen')}</span>
                ) : (
                  <button className="parent-button" type="button" onClick={() => props.onUnlockChapter(chapter.id)}>{t('parent.unlockChapter')}</button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="parent-section parent-section--route" aria-labelledby="parent-route-heading">
        <h2 id="parent-route-heading">{t('parent.excursionTitle')}</h2>
        <p>{t('parent.excursionBody')}</p>
        <div className="route-options">
          {props.bundle.manifest.excursionSelection.candidatePairs.map((pair) => {
            const selected = props.save.excursionSelection.selectedPairId === pair.id;
            return (
              <button
                className="route-button"
                type="button"
                aria-pressed={selected}
                disabled={props.busy}
                key={pair.id}
                onClick={() => props.onSelectPair(pair.id)}
              >
                <span>{selected ? t('chapter.routeChosen', {route: pair.label}) : t('chapter.chooseRoute', {route: pair.label})}</span>
                <small>{pair.reason}</small>
              </button>
            );
          })}
        </div>
      </section>

      <section className="parent-section parent-section--settings" aria-labelledby="parent-settings-heading">
        <h2 id="parent-settings-heading">{t('parent.settings')}</h2>
        <label className="toggle-row">
          <input
            type="checkbox"
            checked={props.save.settings.sound}
            disabled={props.busy}
            onChange={(event) => props.onSetting('sound', event.currentTarget.checked)}
          />
          <SpeakerHigh aria-hidden="true" weight="bold" />
          <span>{t('parent.sound')}</span>
        </label>
        <label className="toggle-row">
          <input
            type="checkbox"
            checked={props.save.settings.reducedMotion}
            disabled={props.busy}
            onChange={(event) => props.onSetting('reducedMotion', event.currentTarget.checked)}
          />
          <HandTap aria-hidden="true" weight="bold" />
          <span>{t('parent.reducedMotion')}</span>
        </label>
      </section>

      <NarrationDownloads
        cache={props.narrationCache}
        chapters={props.bundle.chapters}
        disabled={props.busy}
        onStop={() => props.narrator?.stop()}
      />

      <section className="parent-section parent-section--offline" aria-labelledby="parent-offline-heading">
        <h2 id="parent-offline-heading">{t('parent.offlineTitle')}</h2>
        <p>{offline === 'online' ? t('parent.online') : offline === 'offline-ready' ? t('parent.offlineReady') : t('parent.offlineNotReady')}</p>
        {update !== 'hidden' ? (
          <div className="parent-update">
            <p>{update === 'ready' ? t('parent.updateReady') : t('parent.updateWaiting')}</p>
            <button className="parent-button secondary-button" type="button" disabled={update !== 'ready' || props.busy} onClick={props.onApplyUpdate}>
              {t('app.update')}
            </button>
          </div>
        ) : null}
        {shouldRenderCloudControls(props.platform) ? (
          <p className="control-help">{t('parent.cloudGateClosed')}</p>
        ) : null}
      </section>

      <section className="parent-section parent-section--storage" aria-labelledby="parent-storage-heading">
        <h2 id="parent-storage-heading"><HardDrive aria-hidden="true" weight="bold" /> {t('parent.storageTitle')}</h2>
        <p>{props.save.backup.enabled ? t('parent.localAuthority') : t('parent.localOnly')}</p>
        {props.storageHealth ? (
          <dl className="parent-data-list">
            <div><dt>{t('parent.storageMode')}</dt><dd>{props.storageHealth.durability.mode === 'persistent' ? t('parent.storagePersistent') : t('parent.storageMemory')}</dd></div>
            <div><dt>{t('parent.storagePersisted')}</dt><dd>{props.storageHealth.persisted === true ? t('common.yes') : props.storageHealth.persisted === false ? t('common.no') : t('parent.storageUnknown')}</dd></div>
            <div><dt>{t('parent.storageUsage')}</dt><dd>{t('parent.storageUsageValue', {usage: formatBytes(props.storageHealth.usageBytes), quota: formatBytes(props.storageHealth.quotaBytes)})}</dd></div>
          </dl>
        ) : <p className="control-help">{t('parent.storageNotChecked')}</p>}
        {persistenceLabel ? <p className="notice-card" role="status">{persistenceLabel}</p> : null}
        <div className="parent-action-grid">
          <button className="parent-button secondary-button" type="button" disabled={props.busy} onClick={props.onInspectStorage}>{t('parent.checkStorage')}</button>
          <button className="parent-button secondary-button" type="button" disabled={props.busy} onClick={props.onRequestPersistence}>{t('parent.keepOnDevice')}</button>
        </div>
      </section>

      <section className="parent-section parent-section--help" aria-labelledby="parent-help-heading">
        <h2 id="parent-help-heading">{t('parent.helpTitle')}</h2>
        <p>{t('parent.helpBody')}</p>
        <InstallGuide />
      </section>

      <section className="parent-section parent-section--diagnostics" aria-labelledby="parent-diagnostics-heading">
        <h2 id="parent-diagnostics-heading"><Database aria-hidden="true" weight="bold" /> {t('parent.diagnosticsTitle')}</h2>
        <p>{t('parent.diagnosticsBody')}</p>
        <button className="parent-button secondary-button" type="button" disabled={props.busy} onClick={props.onCreateDiagnostics}>{t('parent.previewDiagnostics')}</button>
        {props.diagnosticPreview ? (
          <>
            <pre className="diagnostic-preview" tabIndex={0}>{props.diagnosticPreview}</pre>
            <button className="parent-button secondary-button" type="button" onClick={props.onCopyDiagnostics}>
              <ClipboardText aria-hidden="true" weight="bold" />{t('parent.copyDiagnostics')}
            </button>
            {props.copyStatus !== 'idle' ? <p role="status">{props.copyStatus === 'copied' ? t('parent.diagnosticsCopied') : t('parent.copyUnavailable')}</p> : null}
          </>
        ) : null}
      </section>

      <section className="parent-section parent-section--danger" aria-labelledby="parent-data-heading">
        <h2 id="parent-data-heading">{t('parent.dataTitle')}</h2>
        <p>{t('parent.dataBody')}</p>
        <button className="parent-button secondary-button" type="button" disabled={props.busy} onClick={() => prepareMaintenance('reset-progress')}>{t('parent.resetProgress')}</button>
        <button className="danger-button" type="button" disabled={props.busy} onClick={() => prepareMaintenance('delete-trip-data')}>
          <Trash aria-hidden="true" weight="bold" />{t('parent.deleteFamily')}
        </button>
      </section>

      <div className="sticky-actions">
        <button className="primary-button parent-button" type="button" disabled={props.busy} onClick={props.onDone}>{t('parent.done')}</button>
      </div>

      {maintenance.stage === 'confirm' ? (
        <AccessibleDialog
          title={maintenance.action === 'reset-progress' ? t('parent.resetConfirmTitle') : t('parent.deleteConfirmTitle')}
          onClose={closeMaintenance}
          safeAction={<button className="secondary-button" type="button" onClick={closeMaintenance}>{t('parent.keepEverything')}</button>}
          dangerousAction={(
            <button className="danger-button" type="button" disabled={props.busy} onClick={confirmMaintenance}>
              {maintenance.action === 'reset-progress' ? t('parent.resetProgress') : t('parent.deleteFamily')}
            </button>
          )}
        >
          <p>{maintenance.action === 'reset-progress' ? t('parent.resetConfirmBody') : t('parent.deleteConfirmBody')}</p>
        </AccessibleDialog>
      ) : null}
    </section>
  );
}
