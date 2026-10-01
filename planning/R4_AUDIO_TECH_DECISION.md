# R4 audio technical decision

**Decision date:** 1 October 2026  
**Status:** architecture approved for implementation after the Spanish scripts freeze; no runtime or audio assets changed by this decision.

## Decision

Ship **pre-generated Spanish MP3 narration** as optional, versioned chapter packs. Use [Voicebox](https://github.com/jamiepine/voicebox) only as a local production studio, with **Qwen3-TTS 0.6B CustomVoice** as the first audition engine. Bussola keeps one voice across the whole trip. Audio never calls a cloud service, never autoplays, and is not part of the initial PWA precache.

The first voice audition should use the built-in `Serena` preset because Qwen describes it as warm and gentle, plus two contrasting preset takes. The model supports Spanish but recommends native-language use for best results, so the final preset is accepted only after a native Spanish review and an Italian-name pronunciation review. If the three preset auditions fail that gate, use Qwen3-TTS VoiceDesign locally with the same architecture; do not fall back to a cloned public voice.

Voicebox is useful here as an **authoring tool**, not as a library or hosted service. It is a local Tauri/Python application with large model downloads and a localhost API, while GitHub Pages is static hosting and cannot run its backend. Export WAV masters locally, normalize them, encode MP3 derivatives, then publish only the MP3 files and their manifest.

## Options assessed

| Option | Cost and offline behavior | Voice consistency | Decision |
|---|---|---|---|
| Voicebox + Qwen3-TTS, exported MP3 | Free local generation; published files work offline after explicit download | One controlled voice and exact reproducible files on every phone | **Use** |
| Browser `speechSynthesis` | Free, but installed voices differ by phone and a voice may be local or remote | Voice, pacing, pronunciation, availability and offline behavior vary | Do not use for production narration |
| Piper local generation | Free local CLI; Spanish voices exist | Reproducible, but each voice has its own model card/licence and the current engine is GPL-3.0-or-later | Valid emergency generator, not the first quality choice |
| Kokoro local generation | Apache-2.0 weights; three Spanish presets | Small and fast, but its own voice notes warn that non-English support can be thin and the Spanish voices have no published quality grade | Keep as an audition fallback only |
| TTS model in the browser | Can be offline after downloading hundreds of megabytes | Consistent but far beyond this PWA's 8 MiB audio budget and family-phone simplicity target | Reject |

`speechSynthesis` remains inappropriate even though the API is widely available. The API exposes only the voices present on the device, loads that list asynchronously on some browsers, and explicitly distinguishes local from remote voices. It cannot guarantee the same warm Spanish narrator or offline service on the family phone. The exact caption is the failure path; no synthetic browser-voice fallback is needed.

## Size decision

The current narration manifest contains **32 clips / 1,902 words**. At 145 Spanish words per minute this is about **13.1 minutes**:

| Encoding | Estimated payload before small container overhead |
|---|---:|
| MP3 mono 48 kbps | 4.50 MiB |
| MP3 mono 64 kbps | 6.00 MiB |

Use **mono MP3, 24 kHz, 48 kbps CBR** for the mobile derivative, with the existing target of `-18 LUFS ±1` and true peak at or below `-1 dBTP`. Keep the lossless WAV masters outside `public/`. MP3 is chosen over an Opus-only pack for simpler mobile compatibility and one-file-per-clip validation.

Clip count is not the budget driver; total spoken duration is. At 48 kbps the current 8 MiB hard limit permits about **23 minutes**. After the new stories freeze, regenerate the word/duration report. If the complete audio exceeds 8 MiB, keep audio for Bussola's story openings, key reveals and endings, while retaining every intermediate line as an exact visible caption. Do not lower intelligibility or precache the pack to force it under budget.

## Production workflow

1. Freeze every Spanish narration string and its stable segment ID. The visible caption and spoken script must resolve from the same source string.
2. Pin the Voicebox release/commit, engine checkpoint, preset, generation settings and seed where supported.
3. Generate local WAV takes. Use a preset voice; do not clone a third-party speaker. Keep the selected take and pronunciation review record.
4. Normalize and encode each approved take to mono MP3. Record duration, byte size, SHA-256, LUFS and true peak.
5. Register each MP3 in the runtime asset register and narration manifest only after the file exists. Add tool/model/preset/version provenance to `THIRD_PARTY_NOTICES.md` and the asset register.
6. Validate exact caption equality, MP3 signature, per-file duration/byte limits, aggregate chapter size and aggregate pack size in CI.

Proposed paths:

```text
public/audio/narration/v1/<chapter>/<segment-id>.mp3
public/audio/narration/v1/manifest.json
```

The manifest entry needs: `segmentId`, `scriptRef`, `captionRef`, `url`, `chapterId`, `bytes`, `durationMs`, `sha256`, `lufs`, `truePeakDbtp`, `generator`, `model`, `modelRevision`, `voicePreset`, and `generatedAt`.

## Runtime contract

- Render the complete exact caption before any audio state is known.
- Show one explicit **Escuchar a Bussola** control; never call `play()` on mount, route entry or download completion.
- Use one shared `HTMLAudioElement` with `preload="none"`. Starting a new clip stops and rewinds the previous clip.
- Await the promise from `play()` and leave the caption usable if playback is rejected or decoding fails.
- On every route change, component unmount and story close: `pause()`, set `currentTime = 0`, remove `src`, and call `load()`. Do the same on pack removal.
- Do not queue clips. A child action starts only one segment and the control exposes Play/Pause/Restart with a visible playing state.
- Keep completion, answers and navigation independent from playback position or availability.

## Download, offline and removal

- Audio is excluded from the generated app-shell precache.
- Parent Corner shows chapter name and exact pack size before **Descargar narración**.
- A user tap opens a versioned Cache Storage cache such as `missione-italia-narration-v1-<chapter>` and fetches every declared file. Mark the chapter downloaded only after every response is present and its declared byte count/hash checks pass.
- Playback first checks the named narration cache and otherwise streams the static GitHub Pages URL while online. A missing file returns to the caption without an error modal.
- **Eliminar narración** stops playback and deletes only the matching named audio cache. It never touches saves, the PWA shell or story progress.
- Offer whole-pack download only if the final pack remains under 8 MiB; chapter packs remain the default.
- Cache Storage is browser-managed and may be evicted. The UI reports `Descargada`, `No descargada` or `Incompleta` by checking the actual cache, not a stale save flag.

GitHub Pages serves the MP3 files as ordinary static assets. Its project subpath must be built with `import.meta.env.BASE_URL`; never hard-code `/audio/...` from the domain root.

## Licensing and provenance

| Item | Terms and implication |
|---|---|
| Voicebox | Repository code is MIT. It is a local production tool and is not bundled, so the app does not inherit a runtime dependency. Record the exact version/commit in provenance. Its responsible-use policy requires rights to any cloned/imported voice; this plan avoids cloning. |
| Qwen3-TTS | Code/checkpoint family is published under Apache-2.0 and supports Spanish. Keep the model identity and revision in provenance; preserve applicable Apache notice information in `THIRD_PARTY_NOTICES.md` even though only generated audio is shipped. |
| Kokoro | Model weights are Apache-2.0. If selected later, pin the exact model/voice files and their hashes and preserve the notice. |
| Piper | Current engine is GPL-3.0-or-later and every voice model can have separate terms. Local generation does not require bundling the engine, but no Piper voice may be used until its individual `MODEL_CARD` is cleared. |
| Generated MP3 | Record that it is synthetic, source script ID, tool/model/version, preset, settings, date and hash. Do not claim a real performer. The project owns the script; model/tool terms still require the provenance review above. |

This is a technical provenance record, not a legal opinion. The release gate is satisfied only by the pinned model/version documents that apply on the generation date.

## Primary sources

- Voicebox repository, architecture and engines: https://github.com/jamiepine/voicebox
- Voicebox MIT licence: https://github.com/jamiepine/voicebox/blob/main/LICENSE
- Voicebox responsible-use/voice-consent rules: https://github.com/jamiepine/voicebox/blob/main/RESPONSIBLE_USE.md
- Voicebox installation and model sizes: https://github.com/jamiepine/voicebox/blob/main/docs/content/docs/overview/installation.mdx
- Qwen3-TTS repository and supported languages: https://github.com/QwenLM/Qwen3-TTS
- Qwen3-TTS Apache-2.0 licence: https://github.com/QwenLM/Qwen3-TTS/blob/main/LICENSE
- Qwen3-TTS 0.6B CustomVoice model card and preset descriptions: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice
- Kokoro Apache-2.0 model card: https://huggingface.co/hexgrad/Kokoro-82M
- Kokoro Spanish voices and model caveats: https://huggingface.co/hexgrad/Kokoro-82M/blob/main/VOICES.md
- Piper engine and GPL declaration: https://github.com/OHF-Voice/piper1-gpl
- Piper voice/licence guidance: https://github.com/OHF-Voice/piper1-gpl/blob/main/docs/VOICES.md
- Browser speech synthesis and device voice list: https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis
- Local versus remote browser voices: https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisVoice/localService
- Media playback promise and autoplay rejection: https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/play
- Autoplay policy: https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay
- Cache Storage availability and lifecycle: https://developer.mozilla.org/en-US/docs/Web/API/CacheStorage
- GitHub Pages static-hosting boundary: https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages

## R4 implementation gate

Do not generate or wire production audio until all of these are true:

- the final Spanish scripts and stable segment IDs are frozen;
- the final word-count estimate fits the 8 MiB pack ceiling;
- one Bussola voice passes Spanish warmth/clarity and Italian proper-name review;
- every audio asset has exact transcript, provenance, hash, duration and loudness data;
- download, removal, no-autoplay, stop-on-navigation and offline-restart tests are specified.
