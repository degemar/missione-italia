import {useEffect, useReducer, useRef, useState} from 'react';

import {AppShell} from '../components/AppShell.js';
import {ParentCorner} from '../components/ParentCorner.js';
import {
  AtlasScreen,
  CelebrationScreen,
  ChallengeScreen,
  ChapterScreen,
  ContentErrorScreen,
  EpilogueScreen,
  LoadingScreen,
  LookUpScreen,
  MissionCardScreen,
  OpeningScreen,
  PassportScreen,
  SetupScreen,
  StoryScreen,
  WelcomeScreen,
} from '../components/screens.js';
import {selectSpanishContent} from '../content/content-localization.js';
import {getEffectiveMission, loadContentBundle, loadSpanishContentResources} from '../content/content-repository.js';
import type {Mission, RoleId} from '../content/types.js';
import type {ResolvedMissionState, SaveEnvelopeV1} from '../contracts/save-contract.js';
import {
  allScoredMissionsResolved,
  nextUnresolvedScoredMission,
  resolvedScoredCount,
} from '../game/progress.js';
import {translate as t} from '../i18n/strings.js';
import {
  createDiagnosticPreview,
  createDiagnosticSnapshot,
  LocalDiagnosticBuffer,
} from '../platform/diagnostics.js';
import {InfrastructureErrorBoundary} from '../platform/InfrastructureErrorBoundary.js';
import {applyReducedMotion, getInitialReducedMotion} from '../platform/motion-preference.js';
import {
  createInitialPlatformState,
  PlatformStateController,
} from '../platform/platform-state.js';
import {StorageHealthAdapter, type StorageHealth} from '../platform/storage-health.js';
import {
  confirmTripMaintenance,
  prepareTripMaintenance,
  type TripMaintenanceAction,
} from '../platform/trip-data-maintenance.js';
import {usePwaLifecycle} from '../platform/use-pwa-lifecycle.js';
import type {CommitSaveResult, PersistenceRequestResult} from '../storage/index.js';
import {appReducer, initialAppState, type AppScreen} from './app-state.js';
import {LocalGameController, type StableRouteInput} from './game-controller.js';

const routeForScreen = (screen: AppScreen): StableRouteInput => {
  switch (screen.id) {
    case 'WELCOME': return {screenId: 'WELCOME'};
    case 'SETUP': return {screenId: 'SETUP'};
    case 'ATLAS': return {screenId: 'ATLAS'};
    case 'CHAPTER': return {screenId: 'CHAPTER', chapterId: screen.chapterId};
    case 'MISSION': return {screenId: 'MISSION', chapterId: screen.chapterId, missionId: screen.missionId};
    case 'STORY': return {screenId: 'STORY', chapterId: screen.chapterId, missionId: screen.missionId, stage: 'story'};
    case 'LOOK-UP': return {screenId: 'LOOK-UP', chapterId: screen.chapterId, missionId: screen.missionId, stage: 'look-up'};
    case 'CHALLENGE': return {screenId: 'CHALLENGE', chapterId: screen.chapterId, missionId: screen.missionId, stage: 'challenge'};
    case 'CELEBRATION': return {screenId: 'CELEBRATION', chapterId: screen.chapterId, missionId: screen.missionId, stage: 'celebration'};
    case 'PASSPORT': return {screenId: 'PASSPORT'};
    case 'EPILOGUE': return {screenId: 'EPILOGUE'};
    case 'PARENT': return {screenId: 'PARENT'};
    case 'BOOT':
    case 'CONTENT-ERROR':
    case 'DEGRADED':
      return {screenId: 'ATLAS'};
  }
};

const resultFromSave = (save: SaveEnvelopeV1, missionId: string): ResolvedMissionState | null => {
  const state = save.missionProgress[missionId]?.state;
  return state === 'completed' || state === 'manual' || state === 'skipped' ? state : null;
};

export function App() {
  const [state, dispatch] = useReducer(appReducer, initialAppState);
  const [bootAttempt, setBootAttempt] = useState(0);
  const [platformState, setPlatformState] = useState(() => createInitialPlatformState(
    typeof navigator === 'undefined' ? true : navigator.onLine,
    false,
  ));
  const [storageHealth, setStorageHealth] = useState<StorageHealth | null>(null);
  const [persistenceResult, setPersistenceResult] = useState<PersistenceRequestResult['status'] | null>(null);
  const [diagnosticPreview, setDiagnosticPreview] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'unavailable'>('idle');
  const savedReducedMotion = state.save?.settings.reducedMotion;
  const controllerRef = useRef<LocalGameController | null>(null);
  const platformControllerRef = useRef<PlatformStateController | null>(null);
  const diagnosticBufferRef = useRef<LocalDiagnosticBuffer | null>(null);
  const storageHealthAdapterRef = useRef<StorageHealthAdapter | null>(null);
  const initialReducedMotionRef = useRef(getInitialReducedMotion());
  if (!diagnosticBufferRef.current) diagnosticBufferRef.current = new LocalDiagnosticBuffer();
  if (!storageHealthAdapterRef.current) storageHealthAdapterRef.current = new StorageHealthAdapter();

  useEffect(() => {
    if (savedReducedMotion !== undefined) applyReducedMotion(savedReducedMotion);
  }, [savedReducedMotion]);
  const {
    readiness,
    updateAvailable,
    canApplyUpdate,
    applyUpdate,
    trackLocalTransaction,
  } = usePwaLifecycle({
    safeParentMoment: (state.screen.id === 'ATLAS' || state.screen.id === 'PARENT') && !state.busy,
    commitLocalState: async () => controllerRef.current?.flushLocalState(),
  });

  useEffect(() => {
    const controller = new PlatformStateController(
      typeof navigator === 'undefined' ? true : navigator.onLine,
      false,
    );
    platformControllerRef.current = controller;
    setPlatformState(controller.snapshot());
    const unsubscribe = controller.subscribe(setPlatformState);
    return () => {
      unsubscribe();
      controller.close();
      if (platformControllerRef.current === controller) platformControllerRef.current = null;
    };
  }, []);

  useEffect(() => {
    platformControllerRef.current?.dispatch({
      type: 'OFFLINE_READINESS_CHANGED',
      readiness: readiness === 'offline-ready' ? 'ready' : readiness === 'registration-failed' ? 'not-ready' : 'checking',
    });
    if (readiness === 'registration-failed') diagnosticBufferRef.current?.record('MI_SERVICE_WORKER_FAILED');
  }, [readiness]);

  useEffect(() => {
    let cancelled = false;
    let created: LocalGameController | null = null;

    const boot = async () => {
      try {
        const baseBundle = await loadContentBundle();
        const spanishContent = await loadSpanishContentResources(baseBundle);
        created = await LocalGameController.create(baseBundle);
        const loaded = await created.hydrate();
        if (cancelled) {
          created.close();
          return;
        }
        const bundle = selectSpanishContent(baseBundle, spanishContent);
        controllerRef.current = created;
        dispatch({type: 'BOOT_SUCCESS', bundle, save: loaded.save, durability: loaded.durability, warning: loaded.warning});
        if (loaded.durability.mode === 'memory-only') diagnosticBufferRef.current?.record('MI_STORAGE_UNAVAILABLE');
      } catch {
        if (!cancelled) {
          diagnosticBufferRef.current?.record('MI_CONTENT_LOAD_FAILED');
          dispatch({type: 'BOOT_ERROR'});
        }
      }
    };

    void boot();
    return () => {
      cancelled = true;
      created?.close();
      if (controllerRef.current === created) controllerRef.current = null;
    };
  }, [bootAttempt]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      window.scrollTo({top: 0, left: 0, behavior: 'auto'});
      document.querySelector<HTMLElement>('[data-screen-heading]')?.focus({preventScroll: true});
    });
    return () => cancelAnimationFrame(frame);
  }, [state.screen]);

  const bundle = state.bundle;
  const save = state.save;
  useEffect(() => {
    document.documentElement.lang = 'es';
  }, []);
  const resolved = bundle && save ? resolvedScoredCount(bundle, save) : 0;
  const total = bundle ? bundle.missions.filter((mission) => mission.scored).length : 0;

  const banners = (() => {
    const messages: string[] = [];
    if (platformState.connectivity === 'offline') {
      messages.push(platformState.offlineReadiness === 'ready' ? t('app.offlineReady') : t('app.offlineFailed'));
    } else if (readiness === 'checking') messages.push(t('app.offlinePreparing'));
    else if (readiness === 'offline-ready') messages.push(t('app.offlineReady'));
    else if (readiness === 'registration-failed') messages.push(t('app.offlineFailed'));
    if (updateAvailable && !canApplyUpdate) messages.push(t('app.updateBlocked'));
    if (state.durability?.mode === 'memory-only') {
      if (state.durability.reason === 'quota') messages.push(t('status.quota'));
      else if (state.durability.reason === 'storage-error') messages.push(t('status.storageError'));
      else messages.push(t('status.memoryOnly'));
    }
    if (state.loadWarning === 'corrupt-canonical') messages.push(t('status.recovered'));
    if (state.loadWarning === 'newer-schema') messages.push(t('status.newerSave'));
    if (state.loadWarning === 'invalid-save') messages.push(t('status.invalidSave'));
    if (state.notice) messages.push(state.notice);
    return [...new Set(messages)];
  })();

  const commit = async (
    operation: () => Promise<CommitSaveResult>,
    screen: AppScreen | ((committed: SaveEnvelopeV1) => AppScreen),
    notice: string | null = null,
  ): Promise<CommitSaveResult | null> => {
    if (state.busy) return null;
    dispatch({type: 'SET_BUSY', busy: true});
    try {
      const result = await trackLocalTransaction(operation);
      dispatch({
        type: 'SAVE_ACCEPTED',
        save: result.save,
        durability: result.durability,
        screen: typeof screen === 'function' ? screen(result.save) : screen,
        notice,
      });
      return result;
    } catch {
      diagnosticBufferRef.current?.record('MI_STORAGE_UNAVAILABLE');
      dispatch({type: 'SET_BUSY', busy: false});
      dispatch({type: 'SET_NOTICE', notice: t('status.saveError')});
      return null;
    }
  };

  const navigate = async (screen: AppScreen, notice: string | null = null) => {
    const controller = controllerRef.current;
    if (!controller || !save) {
      dispatch({type: 'NAVIGATE', screen, notice});
      return;
    }
    await commit(() => controller.navigate(routeForScreen(screen)), screen, notice);
  };

  const openMission = async (mission: Mission) => {
    const existingResult = save ? resultFromSave(save, mission.id) : null;
    const screen: AppScreen = existingResult
      ? {id: 'CELEBRATION', chapterId: mission.chapterId, missionId: mission.id, result: existingResult}
      : {id: 'MISSION', chapterId: mission.chapterId, missionId: mission.id};
    await navigate(screen);
  };

  const startMission = async (mission: Mission) => {
    const controller = controllerRef.current;
    if (!controller) return;
    await commit(
      () => controller.beginMission(mission.id),
      {id: 'STORY', chapterId: mission.chapterId, missionId: mission.id},
    );
  };

  const resolveMission = async (mission: Mission, requested: ResolvedMissionState) => {
    const controller = controllerRef.current;
    if (!controller) return;
    await commit(
      () => controller.resolveMission(mission.id, requested),
      (committed) => ({
        id: 'CELEBRATION',
        chapterId: mission.chapterId,
        missionId: mission.id,
        result: resultFromSave(committed, mission.id) ?? requested,
      }),
      t('status.saved'),
    );
  };

  const inspectStorage = async (announce = true): Promise<StorageHealth | null> => {
    const controller = controllerRef.current;
    const adapter = storageHealthAdapterRef.current;
    if (!controller || !adapter) return null;
    const health = await adapter.inspect(controller.getDurabilityStatus());
    setStorageHealth(health);
    if (announce) dispatch({type: 'SET_NOTICE', notice: t('status.storageChecked')});
    return health;
  };

  const openParent = () => {
    setCopyStatus('idle');
    dispatch({type: 'OPEN_PARENT'});
    void inspectStorage(false);
  };

  const closeParent = async () => {
    const destination = state.parentReturnTo ?? {id: 'ATLAS'} as AppScreen;
    await navigate(destination);
  };

  const updateParentSetting = async (setting: 'sound' | 'reducedMotion', value: boolean) => {
    const controller = controllerRef.current;
    if (!controller) return;
    if (setting === 'reducedMotion') applyReducedMotion(value);
    await commit(() => controller.updateSettings({[setting]: value}), {id: 'PARENT'}, t('status.settingsSaved'));
  };

  const requestPersistence = async () => {
    const controller = controllerRef.current;
    if (!controller || state.busy) return;
    dispatch({type: 'SET_BUSY', busy: true});
    try {
      const result = await controller.requestPersistentStorage();
      setPersistenceResult(result.status);
      await inspectStorage(false);
    } catch {
      setPersistenceResult('denied');
      diagnosticBufferRef.current?.record('MI_STORAGE_UNAVAILABLE');
    } finally {
      dispatch({type: 'SET_BUSY', busy: false});
    }
  };

  const createDiagnostics = async () => {
    if (!bundle) return;
    const health = await inspectStorage(false);
    if (!health) return;
    const snapshot = createDiagnosticSnapshot({
      contentVersion: bundle.manifest.contentVersion,
      serviceWorker: readiness === 'offline-ready' ? 'offline-ready' : readiness === 'registration-failed' ? 'registration-failed' : 'checking',
      platform: platformState,
      storage: health,
      cloudBackup: false,
      recentCodes: diagnosticBufferRef.current?.entries() ?? [],
    });
    setDiagnosticPreview(createDiagnosticPreview(snapshot));
    setCopyStatus('idle');
    dispatch({type: 'SET_NOTICE', notice: t('status.diagnosticsReady')});
  };

  const copyDiagnostics = async () => {
    if (!diagnosticPreview || !navigator.clipboard?.writeText) {
      setCopyStatus('unavailable');
      return;
    }
    try {
      await navigator.clipboard.writeText(diagnosticPreview);
      setCopyStatus('copied');
    } catch {
      setCopyStatus('unavailable');
    }
  };

  const performMaintenance = async (action: TripMaintenanceAction) => {
    const controller = controllerRef.current;
    if (!controller || !bundle || state.busy) return;
    const prepared = prepareTripMaintenance(action, bundle.manifest.tripKey);
    const intent = confirmTripMaintenance(prepared, prepared.confirmationLabel);
    if (!intent) return;
    if (action === 'reset-progress') {
      await commit(() => controller.resetProgress(intent), {id: 'ATLAS'}, t('status.resetComplete'));
      return;
    }
    dispatch({type: 'SET_BUSY', busy: true});
    try {
      await trackLocalTransaction(() => controller.deleteTripData(intent, {
        cacheStorage: typeof caches === 'undefined' ? null : {
          delete: async (cacheName) => {
            try { return await caches.delete(cacheName); }
            catch { return false; }
          },
        },
        clearDiagnostics: () => diagnosticBufferRef.current?.clear(),
      }));
      setDiagnosticPreview(null);
      setStorageHealth(null);
      setPersistenceResult(null);
      dispatch({type: 'TRIP_DELETED', notice: t('status.familyDeleted')});
    } catch {
      dispatch({type: 'SET_BUSY', busy: false});
      dispatch({type: 'SET_NOTICE', notice: t('status.saveError')});
    }
  };

  const retryBoot = () => {
    dispatch({type: 'RETRY_BOOT'});
    setBootAttempt((value) => value + 1);
  };

  const backScreen = (): AppScreen | null => {
    switch (state.screen.id) {
      case 'SETUP': return {id: 'WELCOME', mode: 'intro', openingStep: 0};
      case 'CHAPTER': return {id: 'ATLAS'};
      case 'MISSION': return state.screen.chapterId ? {id: 'CHAPTER', chapterId: state.screen.chapterId} : {id: 'ATLAS'};
      case 'STORY': return {id: 'MISSION', chapterId: state.screen.chapterId, missionId: state.screen.missionId};
      case 'LOOK-UP': return {id: 'STORY', chapterId: state.screen.chapterId, missionId: state.screen.missionId};
      case 'CHALLENGE': return {id: 'LOOK-UP', chapterId: state.screen.chapterId, missionId: state.screen.missionId};
      case 'CELEBRATION': return state.screen.chapterId ? {id: 'CHAPTER', chapterId: state.screen.chapterId} : {id: 'ATLAS'};
      case 'PASSPORT':
      case 'EPILOGUE': return {id: 'ATLAS'};
      case 'PARENT': return state.parentReturnTo ?? {id: 'ATLAS'};
      default: return null;
    }
  };

  const renderMissionScreen = (missionId: string, screenId: AppScreen['id']) => {
    if (!bundle || !save) return <ContentErrorScreen onRetry={retryBoot} />;
    const mission = bundle.missionById.get(missionId);
    if (!mission) return <ContentErrorScreen onRetry={retryBoot} />;
    const progress = save.missionProgress[mission.id];
    const effective = getEffectiveMission(mission, save.excursionSelection.selectedPairId, progress?.resolvedVariantId ?? null);

    if (screenId === 'MISSION') {
      return (
        <MissionCardScreen
          mission={mission}
          effective={effective}
          save={save}
          roleShift={state.challenge.roleShift}
          busy={state.busy}
          paused={progress?.state === 'in-progress'}
          onRotateRoles={() => dispatch({type: 'ROTATE_ROLE_NAMES'})}
          onStart={() => void startMission(mission)}
        />
      );
    }
    if (screenId === 'STORY') {
      return (
        <StoryScreen
          mission={effective}
          busy={state.busy}
          onLookUp={() => void navigate({id: 'LOOK-UP', chapterId: mission.chapterId, missionId: mission.id})}
          onPause={() => void navigate({id: 'MISSION', chapterId: mission.chapterId, missionId: mission.id}, bundle.manifest.narrative.states.interrupted)}
        />
      );
    }
    if (screenId === 'LOOK-UP') {
      return (
        <LookUpScreen
          mission={effective}
          busy={state.busy}
          onReady={() => void navigate({id: 'CHALLENGE', chapterId: mission.chapterId, missionId: mission.id})}
        />
      );
    }
    if (screenId === 'CHALLENGE') {
      const checkChoice = () => {
        const choice = effective.choices.find((candidate) => candidate.id === state.challenge.selectedChoiceId);
        if (!choice) return;
        dispatch({type: 'CHECK_CHOICE', correct: choice.correct, hint: choice.correct ? null : choice.hint});
      };
      return (
        <ChallengeScreen
          mission={effective}
          save={save}
          challenge={state.challenge}
          busy={state.busy}
          onReveal={(role: RoleId) => dispatch({type: 'REVEAL_ROLE', role})}
          onRevealAll={() => dispatch({type: 'REVEAL_ALL_ROLES'})}
          onToggleRole={(role: RoleId) => dispatch({type: 'TOGGLE_ROLE_CHECK', role})}
          onRotateRoles={() => dispatch({type: 'ROTATE_ROLE_NAMES'})}
          onSelectChoice={(choiceId) => dispatch({type: 'SELECT_CHOICE', choiceId})}
          onCheckChoice={checkChoice}
          onComplete={(result) => void resolveMission(mission, result)}
          onPause={() => void navigate({id: 'MISSION', chapterId: mission.chapterId, missionId: mission.id}, bundle.manifest.narrative.states.interrupted)}
        />
      );
    }
    return <ContentErrorScreen onRetry={retryBoot} />;
  };

  const renderScreen = () => {
    switch (state.screen.id) {
      case 'BOOT': return <LoadingScreen />;
      case 'CONTENT-ERROR': return <ContentErrorScreen onRetry={retryBoot} />;
      case 'WELCOME': {
        if (state.screen.mode === 'intro') {
          return <WelcomeScreen onBegin={() => dispatch({type: 'NAVIGATE', screen: {id: 'SETUP'}})} />;
        }
        if (!bundle) return <ContentErrorScreen onRetry={retryBoot} />;
        const openingStep = state.screen.openingStep;
        return (
          <OpeningScreen
            opening={bundle.manifest.narrative.opening}
            step={openingStep}
            busy={state.busy}
            onNext={() => {
              if (openingStep < 2) dispatch({type: 'OPENING_NEXT'});
              else void navigate({id: 'ATLAS'});
            }}
          />
        );
      }
      case 'SETUP': {
        const controller = controllerRef.current;
        return (
          <SetupScreen
            existing={save}
            busy={state.busy}
            onSave={(members, sound) => {
              if (!controller) return;
              void commit(() => controller.saveFamily({members, sound}), {id: 'WELCOME', mode: 'opening', openingStep: 0});
            }}
          />
        );
      }
      case 'ATLAS': {
        if (!bundle || !save) return <ContentErrorScreen onRetry={retryBoot} />;
        return (
          <AtlasScreen
            bundle={bundle}
            save={save}
            manuallyUnlocked={state.manuallyUnlocked}
            onChapter={(chapter) => void navigate({id: 'CHAPTER', chapterId: chapter.id})}
            onPassport={() => void navigate({id: 'PASSPORT'})}
            onEpilogue={() => void navigate({id: 'EPILOGUE'})}
          />
        );
      }
      case 'CHAPTER': {
        if (!bundle || !save) return <ContentErrorScreen onRetry={retryBoot} />;
        const chapter = bundle.chapterById.get(state.screen.chapterId);
        if (!chapter) return <ContentErrorScreen onRetry={retryBoot} />;
        return (
          <ChapterScreen
            bundle={bundle}
            save={save}
            chapter={chapter}
            onMission={(mission) => void openMission(mission)}
          />
        );
      }
      case 'MISSION':
      case 'STORY':
      case 'LOOK-UP':
      case 'CHALLENGE':
        return renderMissionScreen(state.screen.missionId, state.screen.id);
      case 'CELEBRATION': {
        if (!bundle || !save) return <ContentErrorScreen onRetry={retryBoot} />;
        const mission = bundle.missionById.get(state.screen.missionId);
        if (!mission) return <ContentErrorScreen onRetry={retryBoot} />;
        const progress = save.missionProgress[mission.id];
        const effective = getEffectiveMission(mission, save.excursionSelection.selectedPairId, progress?.resolvedVariantId ?? null);
        return (
          <CelebrationScreen
            bundle={bundle}
            save={save}
            mission={effective}
            result={resultFromSave(save, mission.id) ?? state.screen.result}
            onContinue={() => {
              if (!mission.scored || allScoredMissionsResolved(bundle, save)) {
                void navigate({id: 'PASSPORT'});
                return;
              }
              const next = nextUnresolvedScoredMission(bundle, save);
              if (next) void navigate({id: 'MISSION', chapterId: next.chapterId, missionId: next.id});
              else void navigate({id: 'PASSPORT'});
            }}
          />
        );
      }
      case 'PASSPORT': {
        if (!bundle || !save) return <ContentErrorScreen onRetry={retryBoot} />;
        return <PassportScreen bundle={bundle} save={save} onHome={() => void navigate({id: 'ATLAS'})} onEpilogue={() => void navigate({id: 'EPILOGUE'})} />;
      }
      case 'EPILOGUE': {
        if (!bundle || !save) return <ContentErrorScreen onRetry={retryBoot} />;
        const mission = bundle.missionById.get(bundle.manifest.epilogueMissionId);
        if (!mission) return <ContentErrorScreen onRetry={retryBoot} />;
        const result = resultFromSave(save, mission.id);
        if (result) {
          const effective = getEffectiveMission(mission, save.excursionSelection.selectedPairId, save.missionProgress[mission.id]?.resolvedVariantId ?? null);
          return <CelebrationScreen bundle={bundle} save={save} mission={effective} result={result} onContinue={() => void navigate({id: 'PASSPORT'})} />;
        }
        return <EpilogueScreen mission={mission} busy={state.busy} onStart={() => void resolveMission(mission, 'completed')} />;
      }
      case 'PARENT': {
        if (!bundle || !save) return <ContentErrorScreen onRetry={retryBoot} />;
        const controller = controllerRef.current;
        const originMissionId = state.parentReturnTo && 'missionId' in state.parentReturnTo
          ? state.parentReturnTo.missionId
          : null;
        const originMission = originMissionId ? bundle.missionById.get(originMissionId) ?? null : null;
        return (
          <ParentCorner
            bundle={bundle}
            save={save}
            origin={state.parentReturnTo}
            roleShift={state.challenge.roleShift}
            manuallyUnlocked={state.manuallyUnlocked}
            busy={state.busy}
            platform={platformState}
            storageHealth={storageHealth}
            persistenceResult={persistenceResult}
            diagnosticPreview={diagnosticPreview}
            copyStatus={copyStatus}
            updateAvailable={updateAvailable}
            canApplyUpdate={canApplyUpdate}
            onDone={() => void closeParent()}
            onRotateRoles={() => dispatch({type: 'ROTATE_ROLE_NAMES'})}
            onResolveMission={(result) => {
              if (originMission) void resolveMission(originMission, result);
            }}
            onUnlockChapter={(chapterId) => {
              const chapter = bundle.chapterById.get(chapterId);
              dispatch({type: 'UNLOCK_CHAPTER', chapterId});
              if (chapter) dispatch({type: 'SET_NOTICE', notice: t('status.chapterUnlocked', {chapter: chapter.title})});
            }}
            onSelectPair={(pairId) => {
              if (!controller) return;
              void commit(() => controller.selectExcursionPair(pairId), {id: 'PARENT'}, t('status.routeSaved'));
            }}
            onSetting={(setting, value) => void updateParentSetting(setting, value)}
            onInspectStorage={() => void inspectStorage()}
            onRequestPersistence={() => void requestPersistence()}
            onCreateDiagnostics={() => void createDiagnostics()}
            onCopyDiagnostics={() => void copyDiagnostics()}
            onApplyUpdate={() => void applyUpdate()}
            onMaintenance={(action) => void performMaintenance(action)}
          />
        );
      }
      case 'DEGRADED':
        return <ContentErrorScreen onRetry={retryBoot} />;
    }
  };

  const previous = backScreen();
  const passportAvailable = Boolean(
    bundle && save && !['PASSPORT', 'PARENT', 'BOOT', 'CONTENT-ERROR', 'SETUP'].includes(state.screen.id),
  );
  const parentAvailable = Boolean(
    bundle && save && !['PARENT', 'BOOT', 'CONTENT-ERROR', 'SETUP'].includes(state.screen.id),
  );

  return (
    <AppShell
      resolved={resolved}
      total={total}
      banners={banners}
      onBack={previous ? () => void (state.screen.id === 'PARENT' ? closeParent() : navigate(previous)) : undefined}
      onPassport={passportAvailable ? () => void navigate({id: 'PASSPORT'}) : undefined}
      onUpdate={updateAvailable && state.screen.id !== 'PARENT' ? () => void applyUpdate() : undefined}
      updateDisabled={!canApplyUpdate}
      onParentOpen={parentAvailable ? openParent : undefined}
      reducedMotion={save?.settings.reducedMotion ?? initialReducedMotionRef.current}
    >
      <InfrastructureErrorBoundary
        failureKind="render"
        onDiagnosticCode={(code) => diagnosticBufferRef.current?.record(code)}
        fallback={(_entry, retry) => (
          <section className="paper-card parent-recovery" role="alert">
            <h1 data-screen-heading tabIndex={-1}>{t('recovery.renderTitle')}</h1>
            <p>{t('recovery.renderBody')}</p>
            <div className="parent-action-grid">
              <button className="primary-button parent-button" type="button" onClick={retry}>{t('recovery.retry')}</button>
              {save ? (
                <button className="secondary-button parent-button" type="button" onClick={() => { retry(); openParent(); }}>
                  {t('recovery.openParent')}
                </button>
              ) : null}
            </div>
          </section>
        )}
      >
        {renderScreen()}
      </InfrastructureErrorBoundary>
    </AppShell>
  );
}
