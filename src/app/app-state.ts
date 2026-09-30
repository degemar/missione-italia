import type {SaveEnvelopeV1} from '../contracts/save-contract.js';
import type {ContentBundle, RoleId} from '../content/types.js';
import type {DurabilityStatus} from '../storage/index.js';

export type MissionScreenId = 'MISSION' | 'STORY' | 'LOOK-UP' | 'CHALLENGE' | 'CELEBRATION';

export type AppScreen =
  | {id: 'BOOT'}
  | {id: 'CONTENT-ERROR'}
  | {id: 'WELCOME'; mode: 'intro' | 'opening'; openingStep: 0 | 1 | 2}
  | {id: 'SETUP'}
  | {id: 'ATLAS'}
  | {id: 'CHAPTER'; chapterId: string}
  | {id: 'MISSION'; chapterId: string | null; missionId: string}
  | {id: 'STORY'; chapterId: string | null; missionId: string}
  | {id: 'LOOK-UP'; chapterId: string | null; missionId: string}
  | {id: 'CHALLENGE'; chapterId: string | null; missionId: string}
  | {id: 'CELEBRATION'; chapterId: string | null; missionId: string; result: 'completed' | 'manual' | 'skipped'}
  | {id: 'PASSPORT'}
  | {id: 'EPILOGUE'}
  | {id: 'PARENT'}
  | {id: 'DEGRADED'};

export interface ChallengeState {
  revealedRoles: Record<RoleId, boolean>;
  roleChecks: Record<RoleId, boolean>;
  roleShift: number;
  selectedChoiceId: string | null;
  answerStatus: 'idle' | 'incorrect' | 'correct';
  answerHint: string | null;
}

export interface AppState {
  bundle: ContentBundle | null;
  save: SaveEnvelopeV1 | null;
  screen: AppScreen;
  busy: boolean;
  durability: DurabilityStatus | null;
  loadWarning: 'corrupt-canonical' | 'newer-schema' | 'invalid-save' | null;
  notice: string | null;
  manuallyUnlocked: ReadonlySet<string>;
  challenge: ChallengeState;
  parentReturnTo: AppScreen | null;
}

const emptyChallenge = (): ChallengeState => ({
  revealedRoles: {spotter: false, detective: false, navigator: false},
  roleChecks: {spotter: false, detective: false, navigator: false},
  roleShift: 0,
  selectedChoiceId: null,
  answerStatus: 'idle',
  answerHint: null,
});

export const initialAppState: AppState = {
  bundle: null,
  save: null,
  screen: {id: 'BOOT'},
  busy: false,
  durability: null,
  loadWarning: null,
  notice: null,
  manuallyUnlocked: new Set<string>(),
  challenge: emptyChallenge(),
  parentReturnTo: null,
};

export function screenFromSave(bundle: ContentBundle, save: SaveEnvelopeV1 | null): AppScreen {
  if (!save || save.family.members.length === 0) return {id: 'WELCOME', mode: 'intro', openingStep: 0};
  const route = save.route;
  if (route.screenId === 'WELCOME') return {id: 'WELCOME', mode: 'opening', openingStep: 0};
  if (route.screenId === 'SETUP') return {id: 'SETUP'};
  if (route.screenId === 'CHAPTER' && route.chapterId && bundle.chapterById.has(route.chapterId)) {
    return {id: 'CHAPTER', chapterId: route.chapterId};
  }
  if (
    ['MISSION', 'STORY', 'LOOK-UP', 'CHALLENGE'].includes(route.screenId) &&
    route.missionId && bundle.missionById.has(route.missionId)
  ) {
    const mission = bundle.missionById.get(route.missionId);
    return {id: 'MISSION', chapterId: mission?.chapterId ?? null, missionId: route.missionId};
  }
  if (route.screenId === 'CELEBRATION' && route.missionId && bundle.missionById.has(route.missionId)) {
    const progress = save.missionProgress[route.missionId];
    const mission = bundle.missionById.get(route.missionId);
    if (progress?.state === 'completed' || progress?.state === 'manual' || progress?.state === 'skipped') {
      return {id: 'CELEBRATION', chapterId: mission?.chapterId ?? null, missionId: route.missionId, result: progress.state};
    }
  }
  if (route.screenId === 'PASSPORT') return {id: 'PASSPORT'};
  if (route.screenId === 'EPILOGUE') return {id: 'EPILOGUE'};
  return {id: 'ATLAS'};
}

export type AppAction =
  | {type: 'BOOT_SUCCESS'; bundle: ContentBundle; save: SaveEnvelopeV1 | null; durability: DurabilityStatus; warning: AppState['loadWarning']}
  | {type: 'BOOT_ERROR'}
  | {type: 'SET_BUNDLE'; bundle: ContentBundle}
  | {type: 'RETRY_BOOT'}
  | {type: 'NAVIGATE'; screen: AppScreen; notice?: string | null}
  | {type: 'OPENING_NEXT'}
  | {type: 'SET_BUSY'; busy: boolean}
  | {type: 'SAVE_ACCEPTED'; save: SaveEnvelopeV1; durability: DurabilityStatus; screen?: AppScreen; notice?: string | null}
  | {type: 'UNLOCK_CHAPTER'; chapterId: string}
  | {type: 'REVEAL_ROLE'; role: RoleId}
  | {type: 'REVEAL_ALL_ROLES'}
  | {type: 'TOGGLE_ROLE_CHECK'; role: RoleId}
  | {type: 'ROTATE_ROLE_NAMES'}
  | {type: 'SELECT_CHOICE'; choiceId: string}
  | {type: 'CHECK_CHOICE'; correct: boolean; hint: string | null}
  | {type: 'SET_NOTICE'; notice: string | null}
  | {type: 'CLEAR_NOTICE'}
  | {type: 'OPEN_PARENT'}
  | {type: 'CLOSE_PARENT'}
  | {type: 'TRIP_DELETED'; notice: string};

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'BOOT_SUCCESS':
      return {
        ...state,
        bundle: action.bundle,
        save: action.save,
        screen: screenFromSave(action.bundle, action.save),
        durability: action.durability,
        loadWarning: action.warning,
        busy: false,
      };
    case 'BOOT_ERROR':
      return {...state, screen: {id: 'CONTENT-ERROR'}, busy: false};
    case 'SET_BUNDLE':
      return {...state, bundle: action.bundle};
    case 'RETRY_BOOT':
      return {...initialAppState};
    case 'NAVIGATE': {
      const previousMission = 'missionId' in state.screen ? state.screen.missionId : null;
      const nextMission = 'missionId' in action.screen ? action.screen.missionId : null;
      const returningFromParent = state.screen.id === 'PARENT' && action.screen === state.parentReturnTo;
      const resetChallenge = !returningFromParent && (previousMission !== nextMission || action.screen.id === 'MISSION');
      return {
        ...state,
        screen: action.screen,
        notice: action.notice ?? null,
        challenge: resetChallenge ? emptyChallenge() : state.challenge,
        parentReturnTo: action.screen.id === 'PARENT' ? state.parentReturnTo : null,
      };
    }
    case 'OPENING_NEXT': {
      if (state.screen.id !== 'WELCOME' || state.screen.mode !== 'opening') return state;
      const openingStep = Math.min(2, state.screen.openingStep + 1) as 0 | 1 | 2;
      return {...state, screen: {...state.screen, openingStep}};
    }
    case 'SET_BUSY':
      return {...state, busy: action.busy};
    case 'SAVE_ACCEPTED':
      {
        const requestedScreen = action.screen ?? state.screen;
        const screen = state.screen.id === 'PARENT' && requestedScreen.id === 'PARENT'
          ? state.screen
          : requestedScreen;
        const previousMission = 'missionId' in state.screen ? state.screen.missionId : null;
        const nextMission = 'missionId' in screen ? screen.missionId : null;
        const returningFromParent = state.screen.id === 'PARENT' && requestedScreen === state.parentReturnTo;
        const resetChallenge = !returningFromParent && (previousMission !== nextMission || screen.id === 'MISSION');
        return {
          ...state,
          save: action.save,
          durability: action.durability,
          busy: false,
          screen,
          notice: action.notice === undefined ? state.notice : action.notice,
          challenge: resetChallenge ? emptyChallenge() : state.challenge,
          parentReturnTo: screen.id === 'PARENT' ? state.parentReturnTo : null,
        };
      }
    case 'UNLOCK_CHAPTER': {
      const manuallyUnlocked = new Set(state.manuallyUnlocked);
      manuallyUnlocked.add(action.chapterId);
      return {...state, manuallyUnlocked};
    }
    case 'REVEAL_ROLE':
      return {...state, challenge: {...state.challenge, revealedRoles: {...state.challenge.revealedRoles, [action.role]: true}}};
    case 'REVEAL_ALL_ROLES':
      return {...state, challenge: {...state.challenge, revealedRoles: {spotter: true, detective: true, navigator: true}}};
    case 'TOGGLE_ROLE_CHECK':
      return {...state, challenge: {...state.challenge, roleChecks: {...state.challenge.roleChecks, [action.role]: !state.challenge.roleChecks[action.role]}}};
    case 'ROTATE_ROLE_NAMES':
      return {...state, challenge: {...state.challenge, roleShift: state.challenge.roleShift + 1}};
    case 'SELECT_CHOICE':
      return {...state, challenge: {...state.challenge, selectedChoiceId: action.choiceId, answerStatus: 'idle', answerHint: null}};
    case 'CHECK_CHOICE':
      return {...state, challenge: {...state.challenge, answerStatus: action.correct ? 'correct' : 'incorrect', answerHint: action.hint}};
    case 'SET_NOTICE':
      return {...state, notice: action.notice};
    case 'CLEAR_NOTICE':
      return {...state, notice: null};
    case 'OPEN_PARENT':
      if (state.screen.id === 'PARENT') return state;
      return {...state, parentReturnTo: state.screen, screen: {id: 'PARENT'}, notice: null};
    case 'CLOSE_PARENT':
      if (state.screen.id !== 'PARENT') return state;
      return {...state, screen: state.parentReturnTo ?? {id: 'ATLAS'}, parentReturnTo: null};
    case 'TRIP_DELETED':
      return {
        ...state,
        save: null,
        screen: {id: 'WELCOME', mode: 'intro', openingStep: 0},
        busy: false,
        notice: action.notice,
        manuallyUnlocked: new Set<string>(),
        challenge: emptyChallenge(),
        parentReturnTo: null,
      };
  }
}
