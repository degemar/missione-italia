import {CheckCircle, DownloadSimple, SpeakerHigh, Trash} from '@phosphor-icons/react';
import {useEffect, useMemo, useState} from 'react';

import {
  type NarrationChapterStatus,
  type NarrationDownloadProgress,
  NarrationChapterCache,
} from '../audio/narration-cache.js';
import type {Chapter} from '../content/types.js';
import {translate as t} from '../i18n/strings.js';

const formatBytes = (bytes: number): string => bytes < 1024 * 1024
  ? `${Math.max(1, Math.round(bytes / 1024))} KB`
  : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

const statusText = (status: NarrationChapterStatus): string => {
  if (status.state === 'downloaded') return t('audio.pack.downloaded', {size: formatBytes(status.bytes)});
  if (status.state === 'incomplete') return t('audio.pack.incomplete', {cached: status.cachedFiles, total: status.files});
  if (status.state === 'unsupported') return t('audio.pack.unsupported');
  if (status.state === 'unavailable') return t('audio.pack.unavailable');
  return t('audio.pack.notDownloaded', {size: formatBytes(status.bytes)});
};

export function NarrationDownloads({cache, chapters, disabled, onStop}: {
  readonly cache: NarrationChapterCache | null;
  readonly chapters: readonly Chapter[];
  readonly disabled: boolean;
  readonly onStop: () => void;
}) {
  const [statuses, setStatuses] = useState<Readonly<Record<string, NarrationChapterStatus>>>({});
  const [busyChapter, setBusyChapter] = useState<string | null>(null);
  const [progress, setProgress] = useState<NarrationDownloadProgress | null>(null);
  const [failedChapter, setFailedChapter] = useState<string | null>(null);
  const chapterIds = useMemo(
    () => cache?.manifest.chapters.map(({chapterId}) => chapterId) ?? [],
    [cache],
  );

  useEffect(() => {
    if (!cache) {
      setStatuses({});
      return;
    }
    let active = true;
    void Promise.all(chapterIds.map((chapterId) => cache.getChapterStatus(chapterId)))
      .then((next) => {
        if (active) setStatuses(Object.fromEntries(next.map((status) => [status.chapterId, status])));
      })
      .catch(() => {
        if (active) setStatuses({});
      });
    return () => { active = false; };
  }, [cache, chapterIds]);

  const setStatus = (status: NarrationChapterStatus) => {
    setStatuses((current) => ({...current, [status.chapterId]: status}));
  };

  const download = async (chapterId: string) => {
    if (!cache) return;
    onStop();
    setBusyChapter(chapterId);
    setFailedChapter(null);
    setProgress(null);
    try {
      setStatus(await cache.downloadChapter(chapterId, setProgress));
    } catch {
      setFailedChapter(chapterId);
      try { setStatus(await cache.getChapterStatus(chapterId)); } catch { /* Keep the readable fallback. */ }
    } finally {
      setBusyChapter(null);
      setProgress(null);
    }
  };

  const remove = async (chapterId: string) => {
    if (!cache) return;
    onStop();
    setBusyChapter(chapterId);
    setFailedChapter(null);
    try {
      await cache.removeChapter(chapterId);
      setStatus(await cache.getChapterStatus(chapterId));
    } catch {
      setFailedChapter(chapterId);
    } finally {
      setBusyChapter(null);
    }
  };

  const titleFor = (chapterId: string): string => chapterId === 'journey'
    ? t('audio.pack.journey')
    : chapters.find((chapter) => chapter.id === chapterId)?.title ?? chapterId;

  return (
    <section className="parent-section parent-section--audio" aria-labelledby="parent-audio-heading">
      <h2 id="parent-audio-heading"><SpeakerHigh aria-hidden="true" weight="bold" /> {t('audio.pack.title')}</h2>
      <p>{t('audio.pack.help')}</p>
      {!cache ? <p className="control-help">{t('audio.pack.unavailable')}</p> : (
        <div className="parent-list audio-pack-list">
          {chapterIds.map((chapterId) => {
            const status = statuses[chapterId];
            const downloading = busyChapter === chapterId;
            const itemProgress = progress?.chapterId === chapterId ? progress : null;
            return (
              <div className="audio-pack" key={chapterId}>
                <div className="audio-pack__heading">
                  <strong>{titleFor(chapterId)}</strong>
                  {status?.state === 'downloaded' ? <CheckCircle aria-hidden="true" weight="fill" /> : null}
                </div>
                <p>{status ? statusText(status) : t('audio.pack.checking')}</p>
                {itemProgress ? (
                  <div className="audio-pack__progress" role="status">
                    <progress max={itemProgress.totalBytes} value={itemProgress.completedBytes} aria-label={t('audio.pack.progressLabel', {chapter: titleFor(chapterId)})} />
                    <span>{t('audio.pack.progress', {done: itemProgress.completedFiles, total: itemProgress.totalFiles})}</span>
                  </div>
                ) : null}
                {failedChapter === chapterId ? <p className="control-help" role="status">{t('audio.pack.failed')}</p> : null}
                {status && !['unsupported', 'unavailable'].includes(status.state) ? (
                  <div className="parent-action-grid">
                    {status.state !== 'downloaded' ? (
                      <button className="parent-button secondary-button" type="button" disabled={disabled || downloading} onClick={() => void download(chapterId)}>
                        <DownloadSimple aria-hidden="true" weight="bold" />{downloading ? t('audio.pack.downloading') : t('audio.pack.download')}
                      </button>
                    ) : null}
                    {status.cachedFiles > 0 ? (
                      <button className="parent-button quiet-button" type="button" disabled={disabled || downloading} onClick={() => void remove(chapterId)}>
                        <Trash aria-hidden="true" weight="bold" />{t('audio.pack.remove')}
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
