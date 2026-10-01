import {spanishRewardLabels} from '../i18n/locales/es-rewards.js';
import type {
  ContentBundle,
  LocalizedPlayableContent,
  Mission,
  MissionFact,
  MissionVariant,
  SpanishContentResources,
  TripManifest,
} from './types.js';

const localizedFacts = (base: readonly MissionFact[], localized: LocalizedPlayableContent['facts'] | undefined): MissionFact[] => {
  const factMap = localized ?? {};
  const unused = Object.entries(factMap).filter(([id]) => !base.some((fact) => fact.sourceId === id));
  let fallbackIndex = 0;
  return base.map((fact) => {
    const value = fact.sourceId ? factMap[fact.sourceId] : unused[fallbackIndex++]?.[1];
    return value ? {...fact, label: value.label, text: value.text} : {...fact};
  });
};

const localizePlayable = <T extends Mission | MissionVariant>(base: T, localized: LocalizedPlayableContent): T => ({
  ...base,
  title: localized.title ?? base.title,
  storyBeat: localized.storyBeat ?? base.storyBeat,
  objective: localized.objective ?? base.objective,
  roles: base.roles.map((role) => ({...role, action: localized.roles[role.role] ?? role.action})),
  choices: base.choices.map((choice) => ({
    ...choice,
    label: localized.choices?.[choice.id]?.label ?? choice.label,
    hint: localized.choices?.[choice.id]?.hint ?? choice.hint,
  })),
  facts: localizedFacts(base.facts, localized.facts),
  completion: {...base.completion, ...localized.completion},
  fallbacks: {...base.fallbacks, ...localized.fallbacks},
  safety: localized.safety ?? base.safety,
} as T);

function localizeMission(base: Mission, localized: LocalizedPlayableContent): Mission {
  const mission = localizePlayable(base, localized);
  const phrases = base.phrases?.map((phrase) => ({
    ...phrase,
    en: localized.phrases?.[phrase.it]?.meaning ?? phrase.en,
    pronunciation: localized.phrases?.[phrase.it]?.pronunciation ?? phrase.pronunciation,
    gesture: localized.phrases?.[phrase.it]?.gesture ?? phrase.gesture,
  }));
  return {
    ...mission,
    location: {...base.location, label: localized.locationLabel ?? base.location.label},
    ...(phrases ? {phrases} : {}),
    ...(base.variants ? {variants: base.variants.map((variant) => {
      const value = localized.variants?.[variant.id];
      return value
        ? {...localizePlayable(variant, value), locationLabel: value.locationLabel ?? variant.locationLabel}
        : variant;
    })} : {}),
  };
}

const buildBundle = (source: ContentBundle, manifest: TripManifest): ContentBundle => {
  const chapters = [...manifest.chapters].sort((left, right) => left.order - right.order);
  const missions = [...manifest.missions].sort((left, right) => left.order - right.order);
  const rewards = {
    ...source.rewards,
    powers: source.rewards.powers.map((power) => ({...power, label: spanishRewardLabels.powers[power.id as keyof typeof spanishRewardLabels.powers] ?? power.label})),
    stamps: source.rewards.stamps.map((stamp) => ({...stamp, label: spanishRewardLabels.stamps[stamp.id as keyof typeof spanishRewardLabels.stamps] ?? stamp.label})),
  };
  return {
    ...source,
    locale: 'es',
    manifest,
    rewards,
    chapters,
    missions,
    chapterById: new Map(chapters.map((chapter) => [chapter.id, chapter])),
    missionById: new Map(missions.map((mission) => [mission.id, mission])),
    stampLabelById: new Map(rewards.stamps.map((stamp) => [stamp.id, stamp.label])),
    powerLabelById: new Map(rewards.powers.map((power) => [power.id, power.label])),
  };
};

export function selectSpanishContent(
  base: ContentBundle,
  spanish: SpanishContentResources,
): ContentBundle {
  const overlay = spanish.localized;
  const candidatePairs = base.manifest.excursionSelection.candidatePairs.map((pair) => {
    const localized = (overlay.excursionSelection.candidatePairs as Record<string, {label?: string; reason?: string}> | undefined)?.[pair.id];
    return localized ? {...pair, label: localized.label ?? pair.label, reason: localized.reason ?? pair.reason} : pair;
  });
  const tutorial = overlay.narrative.opening.tutorialSteps;
  const manifest: TripManifest = {
    ...base.manifest,
    narrative: {
      opening: {
        ...base.manifest.narrative.opening,
        ...overlay.narrative.opening,
        tutorialSteps: [
          tutorial.meet ?? base.manifest.narrative.opening.tutorialSteps[0],
          tutorial.roles ?? base.manifest.narrative.opening.tutorialSteps[1],
          tutorial.observe ?? base.manifest.narrative.opening.tutorialSteps[2],
        ],
      },
      states: {...base.manifest.narrative.states, ...overlay.narrative.states},
    },
    chapters: base.manifest.chapters.map((chapter) => ({...chapter, ...overlay.chapters[chapter.id]})),
    excursionSelection: {...base.manifest.excursionSelection, candidatePairs},
    missions: base.manifest.missions.map((mission) => {
      const localized = overlay.missions[mission.id];
      return localized ? localizeMission(mission, localized) : mission;
    }),
  };
  return buildBundle(base, manifest);
}
