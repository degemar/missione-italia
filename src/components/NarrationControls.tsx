import {Pause, Play, Repeat} from '@phosphor-icons/react';
import {useEffect, useState} from 'react';

import {NarratorController, type NarratorState} from '../audio/narrator-controller.js';
import {translate as t} from '../i18n/strings.js';
import './narration-controls.css';

export interface NarrationBinding {
  readonly controller: NarratorController;
  readonly segmentId: string;
}

export function NarrationControls({binding, captionId}: {
  readonly binding: NarrationBinding | null;
  readonly captionId: string;
}) {
  const [state, setState] = useState<NarratorState>(() => binding?.controller.snapshot() ?? {
    phase: 'idle', segmentId: null, positionMs: 0, durationMs: 0,
  });

  useEffect(() => {
    if (!binding) return;
    return binding.controller.subscribe(setState);
  }, [binding]);

  if (!binding || !binding.controller.hasSegment(binding.segmentId)) return null;
  const active = state.segmentId === binding.segmentId;
  const playing = active && state.phase === 'playing';
  const loading = active && state.phase === 'loading';
  const failed = active && state.phase === 'error';
  const position = active ? state.positionMs : 0;
  const duration = active ? state.durationMs : 0;

  return (
    <div className="narration-controls" aria-describedby={captionId}>
      <div className="narration-controls__buttons">
        <button
          className="narration-controls__primary"
          type="button"
          disabled={loading}
          aria-pressed={playing}
          onClick={() => void binding.controller.toggle(binding.segmentId)}
        >
          {playing ? <Pause aria-hidden="true" weight="fill" /> : <Play aria-hidden="true" weight="fill" />}
          {loading ? t('audio.loading') : playing ? t('audio.pause') : t('audio.listen')}
        </button>
        <button
          className="narration-controls__replay"
          type="button"
          disabled={loading}
          onClick={() => void binding.controller.replay(binding.segmentId)}
        >
          <Repeat aria-hidden="true" weight="bold" />
          {t('audio.replay')}
        </button>
      </div>
      <progress
        className="narration-controls__progress"
        max={Math.max(duration, 1)}
        value={Math.min(position, Math.max(duration, 1))}
        aria-label={t('audio.progress')}
      />
      <span className="narration-controls__status" role="status">
        {failed ? t('audio.unavailable') : active && state.phase === 'paused' ? t('audio.paused') : active && state.phase === 'ended' ? t('audio.ended') : ''}
      </span>
    </div>
  );
}
