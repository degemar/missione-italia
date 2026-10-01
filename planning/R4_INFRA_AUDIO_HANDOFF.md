# R4 infrastructure handoff — optional Bussola narration

**Status:** `INF-R20` implemented on 1 October 2026. No audio file is required until an entry is registered.

## Production contract

- Manifest: `public/audio/narration/v1/manifest.json`
- Schema: `schemas/content/v1/narration-pack.schema.json`
- Files: `public/audio/narration/v1/<chapterId>/<lowercase-segment-id>.mp3`
- Chapter groups: `journey`, `road`, `venice`, `lagoon-islands`, `verona`
- Limits: mono MP3, 24 kHz, 48 kbps, `-18 LUFS ±1`, true peak `<= -1 dBTP`, 60 seconds/1 MiB per clip, 8 MiB per pack
- Every registered entry supplies `segmentId`, exact matching `scriptRef`/`captionRef`, `url`, `chapterId`, `bytes`, `durationMs`, `sha256`, loudness/peak measurements, generator/model/revision/voice preset, and generation timestamp.

The empty `awaiting-audio-production` manifest is valid. Registering an entry immediately makes its exact-case file, byte count, SHA-256, MP3 signature, script/caption references, audio measurements, and provenance fields mandatory in `npm run validate:content`.

## Frontend interface

```ts
const pack = await loadNarrationPack({
  contentVersion: bundle.manifest.contentVersion,
  chapterIds: bundle.chapters.map(({id}) => id),
  narration: spanishResources.narration,
});

const audio = new NarrationChapterCache(pack);
await audio.getChapterStatus(chapterId);
await audio.downloadChapter(chapterId, onProgress);
await audio.removeChapter(chapterId);
audio.getAudioUrl(segmentId);
await audio.getCachedAudio(segmentId);
```

Imports:

```ts
import {loadNarrationPack} from '../audio/narration-pack.js';
import {NarrationChapterCache} from '../audio/narration-cache.js';
```

`getChapterStatus` reports `unavailable`, `unsupported`, `not-downloaded`, `incomplete`, or `downloaded` from the actual verified Cache Storage contents. `getCachedAudio` returns a verified `Blob` for an object URL; `getAudioUrl` returns the base-path-safe GitHub Pages URL for online streaming.

Each chapter uses one versioned cache named `missione-italia-narration-<packVersion>-<chapterId>`. Download verifies declared bytes and SHA-256 before insertion and rolls back newly inserted files if the chapter fails. Removal deletes only that chapter cache. These APIs never read or write family saves.

## App-shell boundary

Narration MP3 files are explicitly ignored by Workbox and rejected by the precache policy. The small versioned JSON manifest may remain in the shell so the app can explain offline availability. Playback remains opt-in: the manifest requires `autoplay: false`, and no runtime API starts media.

## Verification

- TypeScript: pass
- ESLint: pass
- Content/assets/narration contract gate: pass with zero registered clips
- Focused Vitest: 13/13 pass, covering base paths, contract drift, exact captions, download/hash verification, rollback, status, removal, unsupported Cache Storage, and precache exclusion
