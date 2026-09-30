import type {MissionProgress, SaveEnvelopeV1} from '../contracts/save-contract.js';
import {getEffectiveMission} from '../content/content-repository.js';
import type {Chapter, ContentBundle, Mission} from '../content/types.js';

export const isResolved = (progress: MissionProgress | undefined): boolean =>
  progress?.state === 'completed' || progress?.state === 'manual' || progress?.state === 'skipped';

export interface ChapterProgress {
  resolved: number;
  total: number;
  complete: boolean;
  observed: boolean;
}

export function getChapterProgress(chapter: Chapter, save: SaveEnvelopeV1): ChapterProgress {
  const progress = chapter.missionIds.map((id) => save.missionProgress[id]);
  const resolved = progress.filter(isResolved).length;
  const observed = progress.some((item) => item?.state === 'completed' || item?.state === 'manual');
  return {resolved, total: progress.length, complete: progress.length > 0 && resolved === progress.length, observed};
}

export function isChapterAvailable(
  bundle: ContentBundle,
  save: SaveEnvelopeV1,
  chapter: Chapter,
  manuallyUnlocked: ReadonlySet<string>,
): boolean {
  const chapterIndex = bundle.chapters.findIndex((item) => item.id === chapter.id);
  if (chapterIndex <= 0 || manuallyUnlocked.has(chapter.id)) return true;
  const prior = bundle.chapters[chapterIndex - 1];
  return prior ? getChapterProgress(prior, save).complete : true;
}

export function nextUnresolvedMission(chapter: Chapter, bundle: ContentBundle, save: SaveEnvelopeV1): Mission | null {
  for (const missionId of chapter.missionIds) {
    const mission = bundle.missionById.get(missionId);
    if (mission && !isResolved(save.missionProgress[missionId])) return mission;
  }
  return null;
}

export function nextUnresolvedScoredMission(bundle: ContentBundle, save: SaveEnvelopeV1): Mission | null {
  return bundle.missions.find((mission) => mission.scored && !isResolved(save.missionProgress[mission.id])) ?? null;
}

export function allScoredMissionsResolved(bundle: ContentBundle, save: SaveEnvelopeV1): boolean {
  const scored = bundle.missions.filter((mission) => mission.scored);
  return scored.length > 0 && scored.every((mission) => isResolved(save.missionProgress[mission.id]));
}

export function resolvedScoredCount(bundle: ContentBundle, save: SaveEnvelopeV1): number {
  return bundle.missions.filter((mission) => mission.scored && isResolved(save.missionProgress[mission.id])).length;
}

export interface PassportStamp {
  missionId: string;
  missionTitle: string;
  stampId: string;
  stampLabel: string;
  state: 'completed' | 'manual';
}

export interface PassportDiscovery {
  missionId: string;
  label: string;
  text: string;
}

export interface PassportModel {
  powers: Array<{chapter: Chapter; awake: boolean}>;
  stamps: PassportStamp[];
  savedForLater: Array<{missionId: string; missionTitle: string}>;
  discoveries: PassportDiscovery[];
}

export function derivePassport(bundle: ContentBundle, save: SaveEnvelopeV1): PassportModel {
  const stamps: PassportStamp[] = [];
  const savedForLater: Array<{missionId: string; missionTitle: string}> = [];
  const discoveries: PassportDiscovery[] = [];
  for (const mission of bundle.missions) {
    const progress = save.missionProgress[mission.id];
    if (!isResolved(progress)) continue;
    const effective = getEffectiveMission(mission, save.excursionSelection.selectedPairId, progress?.resolvedVariantId ?? null);
    if (progress?.state === 'skipped') {
      savedForLater.push({missionId: mission.id, missionTitle: effective.title});
      continue;
    }
    if (effective.reward.stamp && (progress?.state === 'completed' || progress?.state === 'manual')) {
      stamps.push({
        missionId: mission.id,
        missionTitle: effective.title,
        stampId: effective.reward.stamp,
        stampLabel: bundle.stampLabelById.get(effective.reward.stamp) ?? effective.reward.stamp,
        state: progress.state,
      });
    }
    for (const fact of effective.facts) discoveries.push({missionId: mission.id, label: fact.label, text: fact.text});
  }
  return {
    powers: bundle.chapters.map((chapter) => ({chapter, awake: getChapterProgress(chapter, save).complete})),
    stamps,
    savedForLater,
    discoveries,
  };
}
