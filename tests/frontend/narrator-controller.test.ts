import {readFileSync} from 'node:fs';
import {join} from 'node:path';

import {describe, expect, it, vi} from 'vitest';

import {NarratorController, type NarrationAudioSource} from '../../src/audio/narrator-controller.js';
import type {NarrationPackManifest} from '../../src/audio/narration-pack.js';

const manifest = JSON.parse(readFileSync(join(process.cwd(), 'public/audio/narration/v1/manifest.json'), 'utf8')) as NarrationPackManifest;

class FakeMedia {
  src = '';
  preload = '';
  currentTime = 0;
  duration = 20;
  readonly play = vi.fn(async () => undefined);
  readonly pause = vi.fn();
  readonly load = vi.fn();
  readonly removeAttribute = vi.fn((name: string) => { if (name === 'src') this.src = ''; });
  readonly addEventListener = vi.fn();
  readonly removeEventListener = vi.fn();
}

const source = (cached: Blob | null = null): NarrationAudioSource => ({
  manifest,
  getAudioUrl: (segmentId) => manifest.chapters.some((chapter) => chapter.entries.some((entry) => entry.segmentId === segmentId))
    ? `/missione-italia/${segmentId.toLocaleLowerCase()}.mp3`
    : null,
  getCachedAudio: async () => cached,
});

describe('Bussola narrator controller', () => {
  it('never autoplays and maps visible scripts to their registered segment', () => {
    const media = new FakeMedia();
    const controller = new NarratorController(source(), {createMedia: () => media});
    expect(media.play).not.toHaveBeenCalled();
    expect(controller.segmentForScriptRef('narrative.opening.storyBeat')).toBe('OPENING-STORY');
    expect(controller.snapshot()).toMatchObject({phase: 'idle', segmentId: null});
  });

  it('uses one media element for play, pause, replay, and destructive stop', async () => {
    const media = new FakeMedia();
    const createMedia = vi.fn(() => media);
    const controller = new NarratorController(source(), {createMedia});

    await controller.play('OPENING-STORY');
    expect(createMedia).toHaveBeenCalledTimes(1);
    expect(media.src).toContain('opening-story');
    expect(controller.snapshot().phase).toBe('playing');

    controller.pause();
    expect(controller.snapshot().phase).toBe('paused');
    media.currentTime = 8;
    await controller.replay('OPENING-STORY');
    expect(media.currentTime).toBe(0);

    await controller.play('RETURN-EP-STORY');
    expect(createMedia).toHaveBeenCalledTimes(1);

    controller.stop();
    expect(media.removeAttribute).toHaveBeenCalledWith('src');
    expect(media.load).toHaveBeenCalled();
    expect(controller.snapshot()).toMatchObject({phase: 'idle', segmentId: null});
  });

  it('falls back to readable text state when playback is rejected', async () => {
    const media = new FakeMedia();
    media.play.mockRejectedValueOnce(new Error('blocked'));
    const controller = new NarratorController(source(), {createMedia: () => media});
    await controller.play('OPENING-STORY');
    expect(controller.snapshot()).toMatchObject({phase: 'error', segmentId: 'OPENING-STORY'});
    expect(media.src).toBe('');
  });
});
