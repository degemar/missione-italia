import {
  Binoculars,
  BookmarkSimple,
  CheckCircle,
  Compass,
  Crosshair,
  HandTap,
  LockKey,
  MagnifyingGlass,
  MapPin,
} from '@phosphor-icons/react';
import {useState, type FormEvent, type ReactNode} from 'react';

import type {ChallengeState} from '../app/app-state.js';
import type {AgeBand, FamilyMember, MissionProgress, SaveEnvelopeV1} from '../contracts/save-contract.js';
import {getEffectiveMission} from '../content/content-repository.js';
import type {Chapter, ContentBundle, EffectiveMission, Mission, RoleId, TripManifest} from '../content/types.js';
import {derivePassport, getChapterProgress, isChapterAvailable, isResolved} from '../game/progress.js';
import {getRoleAssignments} from '../game/roles.js';
import {translate as t, type UiStringKey} from '../i18n/strings.js';
import {assetUrl} from '../content/content-urls.js';
import {StampButton, StampCard, StampMark, TheatreConfetti} from './StampTheatre.js';
import './screens.css';

const roleLabelKeys: Record<RoleId, UiStringKey> = {
  spotter: 'role.spotter',
  detective: 'role.detective',
  navigator: 'role.navigator',
};

const avatarLabelKeys: Record<string, UiStringKey> = {
  binoculars: 'avatar.binoculars',
  magnifier: 'avatar.magnifier',
  compass: 'avatar.compass',
};

const completionLabel = (progress: MissionProgress | undefined): string => {
  if (progress?.state === 'completed') return t('common.complete');
  if (progress?.state === 'manual') return t('common.manual');
  if (progress?.state === 'skipped') return t('common.skipped');
  if (progress?.state === 'in-progress') return t('common.inProgress');
  return t('common.available');
};

function RoleIcon({role}: {role: RoleId}) {
  if (role === 'spotter') return <Binoculars aria-hidden="true" weight="bold" />;
  if (role === 'detective') return <MagnifyingGlass aria-hidden="true" weight="bold" />;
  return <Compass aria-hidden="true" weight="bold" />;
}

function AvatarIcon({id}: {id: string}) {
  if (id === 'binoculars') return <Binoculars aria-hidden="true" weight="bold" />;
  if (id === 'magnifier') return <MagnifyingGlass aria-hidden="true" weight="bold" />;
  return <Compass aria-hidden="true" weight="bold" />;
}

function ScreenIntro({eyebrow, title, children}: {eyebrow: string; title: string; children?: ReactNode}) {
  return (
    <header className="screen-intro">
      <p className="eyebrow">{eyebrow}</p>
      <h1 data-screen-heading tabIndex={-1}>{title}</h1>
      {children}
    </header>
  );
}

function Bussola({className = ''}: {className?: string}) {
  return <img className={`bussola ${className}`.trim()} src={assetUrl('assets/brand/pwa-192x192.png')} alt="" width="96" height="96" />;
}

export function LoadingScreen() {
  return (
    <section className="hero-card hero-card--center" aria-busy="true">
      <Compass className="hero-icon" aria-hidden="true" weight="duotone" />
      <h1 data-screen-heading tabIndex={-1}>{t('app.loading')}</h1>
    </section>
  );
}

export function ContentErrorScreen({onRetry}: {onRetry: () => void}) {
  return (
    <section className="paper-card">
      <ScreenIntro eyebrow={t('common.adult')} title={t('app.contentErrorTitle')}>
        <p>{t('app.contentErrorBody')}</p>
      </ScreenIntro>
      <button className="primary-button parent-button" type="button" onClick={onRetry}>
        <LockKey aria-hidden="true" weight="bold" />
        {t('app.retry')}
      </button>
    </section>
  );
}

export function WelcomeScreen({onBegin}: {onBegin: () => void}) {
  return (
    <section className="hero-card hero-card--welcome screen-welcome">
      <div className="welcome-stage">
        <span className="stage-sun" aria-hidden="true" />
        <Bussola className="welcome-icon" />
        <StampMark title={t('app.iconAlt')} />
      </div>
      <ScreenIntro eyebrow={t('welcome.eyebrow')} title={t('welcome.title')}><p className="lead">{t('welcome.body')}</p></ScreenIntro>
      <StampButton tone="tomato" onClick={onBegin}>
        <Compass aria-hidden="true" weight="bold" />
        {t('welcome.begin')}
      </StampButton>
    </section>
  );
}

interface SetupDraft {
  nickname: string;
  ageBand: AgeBand;
  avatarId: string;
}

const initialDrafts: SetupDraft[] = [
  {nickname: '', ageBand: '4-6', avatarId: 'binoculars'},
  {nickname: '', ageBand: '7-8', avatarId: 'magnifier'},
  {nickname: '', ageBand: '9-11', avatarId: 'compass'},
];

export function SetupScreen({
  existing,
  busy,
  onSave,
}: {
  existing: SaveEnvelopeV1 | null;
  busy: boolean;
  onSave: (members: FamilyMember[], sound: boolean) => void;
}) {
  const [drafts, setDrafts] = useState<SetupDraft[]>(() => initialDrafts.map((draft, index) => {
    const member = existing?.family.members[index];
    return member ? {nickname: member.nickname, ageBand: member.ageBand, avatarId: member.avatarId ?? draft.avatarId} : {...draft};
  }));
  const [sound, setSound] = useState(existing?.settings.sound ?? false);
  const [error, setError] = useState(false);

  const updateDraft = (index: number, next: Partial<SetupDraft>) => {
    setDrafts((current) => current.map((draft, draftIndex) => draftIndex === index ? {...draft, ...next} : draft));
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const active = drafts.filter((draft) => draft.nickname.trim());
    const normalized = active.map((draft) => draft.nickname.trim().toLocaleLowerCase('en'));
    const invalid = active.length === 0 || active.some((draft) => draft.nickname.trim().length > 24) || new Set(normalized).size !== normalized.length;
    setError(invalid);
    if (invalid) return;
    const members = active.map((draft, index) => ({
      id: `child-${index + 1}` as FamilyMember['id'],
      nickname: draft.nickname.trim(),
      ageBand: draft.ageBand,
      avatarId: draft.avatarId,
    }));
    onSave(members, sound);
  };

  return (
    <form className="screen-stack screen-setup" onSubmit={submit} noValidate>
      <div className="setup-stage" aria-hidden="true"><Bussola /><span>✦</span><span>✦</span></div>
      <ScreenIntro eyebrow={t('setup.eyebrow')} title={t('setup.title')}>
        <p>{t('setup.body')}</p>
      </ScreenIntro>
      {drafts.map((draft, index) => (
        <fieldset className="setup-member paper-card" key={index}>
          <legend>{t('setup.member', {number: index + 1})}</legend>
          <label className="field-label" htmlFor={`nickname-${index}`}>{t('setup.nickname')}</label>
          <input
            id={`nickname-${index}`}
            value={draft.nickname}
            maxLength={24}
            autoComplete="off"
            onChange={(event) => updateDraft(index, {nickname: event.target.value})}
          />
          <label className="field-label" htmlFor={`age-${index}`}>{t('setup.ageBand')}</label>
          <select id={`age-${index}`} value={draft.ageBand} onChange={(event) => updateDraft(index, {ageBand: event.target.value as AgeBand})}>
            <option value="4-6">{t('setup.age46')}</option>
            <option value="7-8">{t('setup.age78')}</option>
            <option value="9-11">{t('setup.age911')}</option>
          </select>
          <span className="field-label">{t('setup.avatar')}</span>
          <div className="avatar-options" role="group" aria-label={t('setup.avatar')}>
            {Object.keys(avatarLabelKeys).map((avatarId) => (
              <button
                className="avatar-button"
                type="button"
                aria-pressed={draft.avatarId === avatarId}
                key={avatarId}
                onClick={() => updateDraft(index, {avatarId})}
              >
                <AvatarIcon id={avatarId} />
                <span>{t(avatarLabelKeys[avatarId] ?? 'avatar.compass')}</span>
              </button>
            ))}
          </div>
        </fieldset>
      ))}
      <label className="toggle-row paper-card">
        <input type="checkbox" checked={sound} onChange={(event) => setSound(event.target.checked)} />
        <span>{t('setup.sound')}</span>
      </label>
      <p className="privacy-note"><LockKey aria-hidden="true" weight="bold" />{t('setup.note')}</p>
      {error ? <p className="form-error" role="alert">{t('setup.validation')}</p> : null}
      <div className="sticky-actions">
        <button className="primary-button" type="submit" disabled={busy} aria-busy={busy}>
          <Compass aria-hidden="true" weight="bold" />
          {busy ? t('common.saving') : t('setup.save')}
        </button>
      </div>
    </form>
  );
}

export function OpeningScreen({opening, step, busy, onNext}: {
  opening: TripManifest['narrative']['opening'];
  step: 0 | 1 | 2;
  busy: boolean;
  onNext: () => void;
}) {
  const action = step === 0 ? t('opening.wake') : step === 1 ? t('opening.next') : t('opening.atlas');
  return (
    <section className="screen-stack screen-opening">
      <div className="opening-stage" aria-hidden="true"><Bussola /><span className="opening-orbit" /></div>
      <ScreenIntro eyebrow={t('opening.eyebrow')} title={step === 1 ? t('opening.oathTitle') : t('opening.title')}>
        <p className="step-count">{t('opening.step', {current: step + 1, total: 3})}</p>
      </ScreenIntro>
      <StampCard as="article" tone="teal" className="read-aloud-card">
        {step === 0 ? <><p>{opening.storyBeat}</p><p className="youngest-cue">{opening.youngestAction}</p></> : null}
        {step === 1 ? <p>{opening.familyOath}</p> : null}
        {step === 2 ? <ol className="tutorial-list">{opening.tutorialSteps.map((item) => <li key={item}>{item}</li>)}</ol> : null}
      </StampCard>
      <div className="sticky-actions">
        <button className="primary-button" type="button" onClick={onNext} disabled={busy} aria-busy={busy}>
          <HandTap aria-hidden="true" weight="bold" />
          {busy ? t('common.saving') : action}
        </button>
      </div>
    </section>
  );
}

export function AtlasScreen({bundle, save, manuallyUnlocked, onChapter, onPassport, onEpilogue}: {
  bundle: ContentBundle;
  save: SaveEnvelopeV1;
  manuallyUnlocked: ReadonlySet<string>;
  onChapter: (chapter: Chapter) => void;
  onPassport: () => void;
  onEpilogue: () => void;
}) {
  return (
    <section className="screen-stack screen-atlas">
      <div className="atlas-stage" aria-hidden="true"><span>Basel</span><i /><span>Italia</span><Bussola /></div>
      <ScreenIntro eyebrow={t('atlas.eyebrow')} title={t('atlas.title')}>
        <p>{t('atlas.body')}</p>
      </ScreenIntro>
      <div className="chapter-grid">
        {bundle.chapters.map((chapter) => {
          const progress = getChapterProgress(chapter, save);
          const available = isChapterAvailable(bundle, save, chapter, manuallyUnlocked);
          return (
            <StampCard as="article" tone={chapter.id === 'venice' ? 'teal' : chapter.id === 'lagoon-islands' ? 'gold' : chapter.id === 'verona' ? 'violet' : 'tomato'} className="chapter-card" data-chapter={chapter.id} key={chapter.id}>
              <div className="chapter-card__heading">
                {progress.complete ? <CheckCircle aria-hidden="true" weight="fill" /> : available ? <Compass aria-hidden="true" weight="duotone" /> : <LockKey aria-hidden="true" weight="bold" />}
                <div>
                  <p className="eyebrow">{chapter.power}</p>
                  <h2>{chapter.title}</h2>
                </div>
              </div>
              <p>{t('atlas.chapterProgress', {resolved: progress.resolved, total: progress.total})}</p>
              <p className="status-label">{progress.complete ? t('atlas.powerAwake', {power: chapter.power}) : t('atlas.powerWaiting', {power: chapter.power})}</p>
              {available ? (
                <button className="secondary-button" type="button" onClick={() => onChapter(chapter)}>
                  {progress.resolved ? t('atlas.continueChapter') : t('atlas.openChapter')}
                </button>
              ) : (
                <p className="parent-instruction">
                  <LockKey aria-hidden="true" weight="bold" />
                  {t('atlas.parentUnlockHelp')}
                </p>
              )}
            </StampCard>
          );
        })}
      </div>
      <div className="atlas-extras">
        <button className="secondary-button" type="button" onClick={onPassport}>
          <MapPin aria-hidden="true" weight="bold" />
          {t('atlas.passport')}
        </button>
        <button className="quiet-button" type="button" onClick={onEpilogue}>
          {t('atlas.epilogue')}
        </button>
      </div>
    </section>
  );
}

export function ChapterScreen({bundle, save, chapter, onMission}: {
  bundle: ContentBundle;
  save: SaveEnvelopeV1;
  chapter: Chapter;
  onMission: (mission: Mission) => void;
}) {
  const progress = getChapterProgress(chapter, save);
  const missions = chapter.missionIds.flatMap((id) => {
    const mission = bundle.missionById.get(id);
    return mission ? [mission] : [];
  });
  const hasExcursionSlots = missions.some((mission) => mission.variants?.length);
  const selectedPair = bundle.manifest.excursionSelection.candidatePairs.find(
    (pair) => pair.id === save.excursionSelection.selectedPairId,
  );
  return (
    <section className="screen-stack screen-chapter" data-chapter={chapter.id}>
      <div className="chapter-stage" aria-hidden="true"><Bussola /><span>{chapter.power}</span></div>
      <ScreenIntro eyebrow={t('chapter.eyebrow', {power: chapter.power})} title={chapter.title}>
        <p>{chapter.openingBeat}</p>
      </ScreenIntro>
      {hasExcursionSlots ? (
        <p className="parent-instruction">
          <LockKey aria-hidden="true" weight="bold" />
          {selectedPair
            ? t('chapter.parentRouteSelected', {route: selectedPair.label})
            : t('chapter.parentRouteHelp')}
        </p>
      ) : null}
      <div className="mission-list">
        {missions.map((mission) => {
          const missionProgress = save.missionProgress[mission.id];
          const effective = getEffectiveMission(mission, save.excursionSelection.selectedPairId, missionProgress?.resolvedVariantId ?? null);
          const unresolvedMystery = Boolean(mission.variants?.length) && !effective.resolvedVariantId;
          return (
            <StampCard as="article" tone="paper" className="mission-card" key={mission.id}>
              <div className="mission-card__title">
                {isResolved(missionProgress) ? <CheckCircle aria-hidden="true" weight="fill" /> : <Crosshair aria-hidden="true" weight="bold" />}
                <div>
                  <p className="eyebrow">{completionLabel(missionProgress)}</p>
                  <h2>{unresolvedMystery ? t('chapter.mysteryTitle') : effective.title}</h2>
                </div>
              </div>
              <p>{unresolvedMystery ? t('chapter.parentLater') : effective.objective}</p>
              <p className="mission-meta">{t('common.minutesEnergy', {minutes: mission.durationMinutes, energy: mission.energy})}</p>
              <p className="mission-location">{t('mission.location', {location: effective.location.label})}</p>
              <button className="secondary-button" type="button" onClick={() => onMission(mission)}>{t('chapter.openMission')}</button>
            </StampCard>
          );
        })}
      </div>
      {progress.complete ? <p className="chapter-closing"><CheckCircle aria-hidden="true" weight="fill" />{chapter.closingBeat}</p> : null}
    </section>
  );
}

export function MissionCardScreen({mission, effective, save, roleShift, busy, paused, onRotateRoles, onStart}: {
  mission: Mission;
  effective: EffectiveMission;
  save: SaveEnvelopeV1;
  roleShift: number;
  busy: boolean;
  paused: boolean;
  onRotateRoles: () => void;
  onStart: () => void;
}) {
  const assignments = getRoleAssignments(save.family.members, save.family.roleRotationIndex, roleShift);
  const mystery = Boolean(mission.variants?.length) && !effective.resolvedVariantId;
  return (
    <section className="screen-stack screen-mission-card">
      <div className="mission-stage" aria-hidden="true"><StampMark /><Bussola /></div>
      <ScreenIntro eyebrow={t('mission.eyebrow')} title={mystery ? t('chapter.mysteryTitle') : effective.title}>
        <p className="lead">{effective.objective}</p>
      </ScreenIntro>
      {paused ? <p className="notice-card" role="status">{t('mission.pauseNotice')}</p> : null}
      {mystery ? <p className="parent-panel"><LockKey aria-hidden="true" weight="bold" /> {t('mission.noPair')}</p> : null}
      <StampCard tone="gold" className="mission-facts paper-card">
        <p>{t('common.minutesEnergy', {minutes: effective.durationMinutes, energy: effective.energy})}</p>
        <p><MapPin aria-hidden="true" weight="bold" />{t('mission.location', {location: effective.location.label})}</p>
      </StampCard>
      <section aria-labelledby="role-heading">
        <h2 id="role-heading">{t('mission.rolesTitle')}</h2>
        <div className="role-summary">
          {assignments.map(({role, member}) => (
            <div className={`role-pill role-pill--${role}`} key={role}>
              <RoleIcon role={role} />
              <span>{t('mission.roleAssignment', {role: t(roleLabelKeys[role]), nickname: member?.nickname ?? t('role.unassigned')})}</span>
            </div>
          ))}
        </div>
        <button className="quiet-button parent-button" type="button" onClick={onRotateRoles}>
          <LockKey aria-hidden="true" weight="bold" />
          {t('adult.rotateRoles')}
        </button>
      </section>
      <div className="sticky-actions">
        <button className="primary-button" type="button" onClick={onStart} disabled={busy} aria-busy={busy}>
          <Compass aria-hidden="true" weight="bold" />
          {busy ? t('common.saving') : t('mission.hearStory')}
        </button>
      </div>
    </section>
  );
}

export function StoryScreen({mission, onLookUp, onPause, busy}: {
  mission: EffectiveMission;
  onLookUp: () => void;
  onPause: () => void;
  busy: boolean;
}) {
  return (
    <section className="screen-stack screen-story">
      <div className="story-stage" aria-hidden="true"><Bussola /><span>✦</span><span>✦</span><span>✦</span></div>
      <ScreenIntro eyebrow={t('story.eyebrow')} title={t('story.title')} />
      <StampCard as="article" tone="teal" className="read-aloud-card"><p>{mission.storyBeat}</p></StampCard>
      <aside className="safety-card">
        <h2><LockKey aria-hidden="true" weight="bold" />{t('story.safety')}</h2>
        <ul>{mission.safety.map((item) => <li key={item}>{item}</li>)}</ul>
      </aside>
      <div className="sticky-actions sticky-actions--stacked">
        <button className="primary-button" type="button" onClick={onLookUp} disabled={busy}>{t('story.lookUp')}</button>
        <button className="quiet-button" type="button" onClick={onPause} disabled={busy}>{t('story.pause')}</button>
      </div>
    </section>
  );
}

export function LookUpScreen({mission, onReady, busy}: {mission: EffectiveMission; onReady: () => void; busy: boolean}) {
  return (
    <section className="look-up-screen screen-look-up">
      <div>
        <ScreenIntro eyebrow={t('lookup.eyebrow')} title={t('lookup.title')}>
          <p className="lead">{t('lookup.body')}</p>
        </ScreenIntro>
        <p className="look-up-objective">{mission.objective}</p>
        <ul className="safety-list">{mission.safety.map((item) => <li key={item}>{item}</li>)}</ul>
      </div>
      <div className="sticky-actions">
        <button className="primary-button" type="button" onClick={onReady} disabled={busy}>{t('lookup.ready')}</button>
      </div>
    </section>
  );
}

export function ChallengeScreen({mission, save, challenge, busy, onReveal, onRevealAll, onToggleRole, onRotateRoles, onSelectChoice, onCheckChoice, onComplete, onPause}: {
  mission: EffectiveMission;
  save: SaveEnvelopeV1;
  challenge: ChallengeState;
  busy: boolean;
  onReveal: (role: RoleId) => void;
  onRevealAll: () => void;
  onToggleRole: (role: RoleId) => void;
  onRotateRoles: () => void;
  onSelectChoice: (choiceId: string) => void;
  onCheckChoice: () => void;
  onComplete: (result: 'completed' | 'manual' | 'skipped') => void;
  onPause: () => void;
}) {
  const assignments = getRoleAssignments(save.family.members, save.family.roleRotationIndex, challenge.roleShift);
  const rolesDone = Object.values(challenge.roleChecks).every(Boolean);
  const answerReady = mission.choices.length === 0 || challenge.answerStatus === 'correct';
  const normalReady = rolesDone && answerReady;
  return (
    <section className="screen-stack screen-challenge">
      <div className="challenge-stage" aria-hidden="true"><span>¡</span><Bussola /><span>!</span></div>
      <ScreenIntro eyebrow={t('challenge.eyebrow')} title={t('challenge.title')}>
        <p>{mission.objective}</p>
      </ScreenIntro>
      <div className="role-challenge-list">
        {mission.roles.map((roleAction) => {
          const assigned = assignments.find((item) => item.role === roleAction.role)?.member;
          const revealed = challenge.revealedRoles[roleAction.role];
          const checked = challenge.roleChecks[roleAction.role];
          return (
            <article className={`role-card role-card--${roleAction.role}`} key={roleAction.role}>
              <button className="role-card__reveal" type="button" aria-expanded={revealed} onClick={() => onReveal(roleAction.role)}>
                <RoleIcon role={roleAction.role} />
                <span>{t('mission.roleAssignment', {role: t(roleLabelKeys[roleAction.role]), nickname: assigned?.nickname ?? t('role.unassigned')})}</span>
              </button>
              {revealed ? (
                <div className="role-card__action">
                  <p>{roleAction.action}</p>
                  <button className="role-check" type="button" aria-pressed={checked} onClick={() => onToggleRole(roleAction.role)}>
                    {checked ? <CheckCircle aria-hidden="true" weight="fill" /> : <HandTap aria-hidden="true" weight="bold" />}
                    {checked ? t('challenge.roleDone') : t('challenge.tapRole')}
                  </button>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
      <div className="compact-actions">
        <button className="quiet-button parent-button" type="button" onClick={onRevealAll}>{t('adult.showAllClues')}</button>
        <button className="quiet-button parent-button" type="button" onClick={onRotateRoles}>{t('adult.rotateRoles')}</button>
      </div>
      {mission.phrases?.length ? (
        <section className="phrase-section" aria-labelledby="phrase-heading">
          <h2 id="phrase-heading">{t('challenge.italianTitle')}</h2>
          <div className="phrase-grid">
            {mission.phrases.map((phrase) => (
              <article className="phrase-card" key={phrase.it}>
                <h3 lang="it">{phrase.it}</h3>
                <p>{phrase.en}</p>
                <p>{t('challenge.pronunciation', {pronunciation: phrase.pronunciation})}</p>
                <p>{t('challenge.gesture', {gesture: phrase.gesture})}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}
      {mission.choices.length ? (
        <fieldset className="answer-group">
          <legend>{t('challenge.answerTitle')}</legend>
          {mission.choices.map((choice) => (
            <label className="answer-choice" key={choice.id}>
              <input
                type="radio"
                name="mission-answer"
                value={choice.id}
                checked={challenge.selectedChoiceId === choice.id}
                onChange={() => onSelectChoice(choice.id)}
              />
              <span>{choice.label}</span>
            </label>
          ))}
          {challenge.answerStatus === 'incorrect' ? (
            <div className="retry-note" role="status">
              <strong>{t('challenge.takeAnotherLook')}</strong>
              <p>{challenge.answerHint ?? mission.completion.retryLine}</p>
            </div>
          ) : null}
          {challenge.answerStatus === 'correct' ? <p className="success-note" role="status"><CheckCircle aria-hidden="true" weight="fill" />{t('challenge.correct')}</p> : null}
          {challenge.answerStatus !== 'correct' ? (
            <>
              <button className="secondary-button" type="button" disabled={!challenge.selectedChoiceId} onClick={onCheckChoice}>{t('challenge.checkAnswer')}</button>
              {!challenge.selectedChoiceId ? <p className="control-help">{t('challenge.chooseAnswer')}</p> : null}
            </>
          ) : null}
        </fieldset>
      ) : null}
      {!normalReady ? <p className="control-help">{t('challenge.rolesRemaining')}</p> : null}
      <details className="fallback-panel">
        <summary><LockKey aria-hidden="true" weight="bold" />{t('adult.fallbackTitle')}</summary>
        <p>{t('fallback.body')}</p>
        <dl>
          <div><dt>{t('fallback.noGps')}</dt><dd>{mission.fallbacks.noGps}</dd></div>
          <div><dt>{t('fallback.closed')}</dt><dd>{mission.fallbacks.closedVenue}</dd></div>
          <div><dt>{t('fallback.weather')}</dt><dd>{mission.fallbacks.badWeather}</dd></div>
          <div><dt>{t('fallback.tired')}</dt><dd>{mission.fallbacks.tiredLegs}</dd></div>
        </dl>
        <div className="fallback-actions">
          <button className="parent-button secondary-button" type="button" disabled={busy} onClick={() => onComplete('manual')}>
            <HandTap aria-hidden="true" weight="bold" />{t('fallback.manual')}
          </button>
          <button className="parent-button quiet-button" type="button" disabled={busy} onClick={() => onComplete('skipped')}>
            <BookmarkSimple aria-hidden="true" weight="bold" />{t('fallback.skip')}
          </button>
        </div>
      </details>
      <div className="sticky-actions sticky-actions--stacked">
        <button className="primary-button" type="button" disabled={!normalReady || busy} aria-busy={busy} onClick={() => onComplete('completed')}>
          <CheckCircle aria-hidden="true" weight="bold" />
          {busy ? t('common.saving') : t('challenge.teamDone')}
        </button>
        <button className="quiet-button" type="button" disabled={busy} onClick={onPause}>{t('story.pause')}</button>
      </div>
    </section>
  );
}

export function CelebrationScreen({bundle, save, mission, result, onContinue}: {
  bundle: ContentBundle;
  save: SaveEnvelopeV1;
  mission: EffectiveMission;
  result: 'completed' | 'manual' | 'skipped';
  onContinue: () => void;
}) {
  const title = result === 'completed' ? t('celebration.completedTitle') : result === 'manual' ? t('celebration.manualTitle') : t('celebration.skippedTitle');
  const message = result === 'completed' ? mission.completion.successLine : result === 'manual' ? bundle.manifest.narrative.states.manual : bundle.manifest.narrative.states.skip;
  const stampLabel = mission.reward.stamp ? bundle.stampLabelById.get(mission.reward.stamp) : null;
  const chapter = mission.chapterId ? bundle.chapterById.get(mission.chapterId) : null;
  const powerLabel = mission.reward.power ? bundle.powerLabelById.get(mission.reward.power) : null;
  const powerAwake = chapter ? getChapterProgress(chapter, save).complete : false;
  const scoredComplete = bundle.missions.filter((item) => item.scored).every((item) => isResolved(save.missionProgress[item.id]));
  return (
    <section className={`celebration-card celebration-card--${result} screen-celebration`}>
      {result !== 'skipped' ? <TheatreConfetti /> : null}
      {result === 'skipped' ? <BookmarkSimple className="celebration-icon" aria-hidden="true" weight="fill" /> : result === 'manual' ? <HandTap className="celebration-icon" aria-hidden="true" weight="fill" /> : <CheckCircle className="celebration-icon" aria-hidden="true" weight="fill" />}
      <ScreenIntro eyebrow={t('celebration.eyebrow')} title={title}>
        <p className="lead">{message}</p>
      </ScreenIntro>
      {mission.scored && powerLabel ? (
        <p className="power-result">
          <Compass aria-hidden="true" weight="duotone" />
          {powerAwake ? t('celebration.powerAwake', {power: powerLabel}) : t('celebration.powerProgress', {power: powerLabel})}
        </p>
      ) : null}
      {result !== 'skipped' && stampLabel ? <p className="stamp-label"><Compass aria-hidden="true" weight="duotone" />{t('celebration.stamp', {stamp: stampLabel})}</p> : null}
      {result !== 'skipped' ? (
        <section className="discovery-card">
          <h2>{t('celebration.fact')}</h2>
          <p>{mission.completion.explanation}</p>
          {mission.facts.map((fact) => <p className="fact-row" key={`${fact.label}-${fact.text}`}><strong>{fact.label}</strong>{fact.text}</p>)}
        </section>
      ) : null}
      <div className="sticky-actions">
        <button className="primary-button" type="button" onClick={onContinue}>
          {scoredComplete ? t('celebration.passport') : mission.scored ? t('celebration.next') : t('celebration.finishStory')}
        </button>
      </div>
    </section>
  );
}

export function PassportScreen({bundle, save, onHome, onEpilogue}: {
  bundle: ContentBundle;
  save: SaveEnvelopeV1;
  onHome: () => void;
  onEpilogue: () => void;
}) {
  const passport = derivePassport(bundle, save);
  const awake = passport.powers.filter((power) => power.awake).length;
  return (
    <section className="screen-stack passport-screen screen-passport">
      <div className="passport-stage" aria-hidden="true"><Bussola /><StampMark /></div>
      <ScreenIntro eyebrow={t('passport.eyebrow')} title={t('passport.title')}>
        <p className="lead">{t('passport.progress', {awake, total: passport.powers.length})}</p>
      </ScreenIntro>
      <section aria-labelledby="powers-heading">
        <h2 id="powers-heading">{t('passport.powers')}</h2>
        <div className="power-list">
          {passport.powers.map(({chapter, awake: powerAwake}) => (
            <div className="power-card" data-chapter={chapter.id} key={chapter.id}>
              {powerAwake ? <CheckCircle aria-hidden="true" weight="fill" /> : <Compass aria-hidden="true" weight="duotone" />}
              <span>{powerAwake ? t('atlas.powerAwake', {power: chapter.power}) : t('atlas.powerWaiting', {power: chapter.power})}</span>
            </div>
          ))}
        </div>
      </section>
      <section aria-labelledby="stamps-heading">
        <h2 id="stamps-heading">{t('passport.stamps')}</h2>
        {passport.stamps.length || passport.savedForLater.length ? (
          <ul className="passport-list">
            {passport.stamps.map((stamp) => (
              <li key={stamp.missionId}>
                {stamp.state === 'manual' ? <HandTap aria-hidden="true" weight="bold" /> : <CheckCircle aria-hidden="true" weight="fill" />}
                <span>{stamp.state === 'manual' ? t('passport.stampFromManual', {stamp: stamp.stampLabel, mission: stamp.missionTitle}) : t('passport.stampFrom', {stamp: stamp.stampLabel, mission: stamp.missionTitle})}</span>
              </li>
            ))}
            {passport.savedForLater.map((item) => (
              <li key={item.missionId}><BookmarkSimple aria-hidden="true" weight="fill" /><span>{t('passport.savedMission', {mission: item.missionTitle})}</span></li>
            ))}
          </ul>
        ) : <p>{t('passport.emptyStamps')}</p>}
      </section>
      <section aria-labelledby="discoveries-heading">
        <h2 id="discoveries-heading">{t('passport.discoveries')}</h2>
        {passport.discoveries.length ? (
          <ul className="discovery-list">{passport.discoveries.map((item, index) => <li key={`${item.missionId}-${index}`}><strong>{item.label}</strong>{item.text}</li>)}</ul>
        ) : <p>{t('passport.emptyDiscoveries')}</p>}
      </section>
      <div className="sticky-actions sticky-actions--stacked">
        <button className="primary-button" type="button" onClick={onHome}>{t('passport.home')}</button>
        <button className="quiet-button" type="button" onClick={onEpilogue}>{t('passport.epilogue')}</button>
      </div>
    </section>
  );
}

export function EpilogueScreen({mission, busy, onStart}: {mission: Mission; busy: boolean; onStart: () => void}) {
  return (
    <section className="screen-stack screen-epilogue">
      <div className="epilogue-stage" aria-hidden="true"><Bussola /><TheatreConfetti /></div>
      <ScreenIntro eyebrow={t('epilogue.eyebrow')} title={mission.title}>
        <p className="lead">{mission.objective}</p>
      </ScreenIntro>
      <article className="read-aloud-card"><p>{mission.storyBeat}</p></article>
      <div className="role-summary">
        {mission.roles.map((role) => <div className={`role-pill role-pill--${role.role}`} key={role.role}><RoleIcon role={role.role} /><span>{role.action}</span></div>)}
      </div>
      <div className="sticky-actions">
        <button className="primary-button" type="button" disabled={busy} onClick={onStart}>{busy ? t('common.saving') : t('passport.epilogue')}</button>
      </div>
    </section>
  );
}
