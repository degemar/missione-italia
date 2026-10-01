# R4 audio production handoff

**Status:** `AUD-R01` and `AUD-R02` completed on 1 October 2026. This record covers the immutable files currently registered in `public/audio/narration/v1/manifest.json`.

## Production identity

| Field | Recorded value |
|---|---|
| Generator | `qwen-tts` 0.1.1, called directly from `scripts/generate-narration.py` |
| Model | `Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice` |
| Model revision | `85e237c12c027371202489a0ec509ded67b5e4b5` |
| Voice | Built-in synthetic preset `Serena` |
| Language | Spanish |
| Synthesis mode | `generate_custom_voice`; no voice-cloning input or human reference audio |
| Local acceleration | PyTorch `bfloat16` and FlashAttention 2; authoring only, not shipped |
| Post-production | Two-pass FFmpeg `loudnorm`, then mono 24 kHz / 48 kbps MP3 |
| Target | `-18 LUFS`, true peak `<= -1 dBTP` |

Voicebox was considered during architecture design but was not used to create, edit, or export these files. The production script invoked Qwen3-TTS directly. SoundFile and FFmpeg/imageio-ffmpeg were also local authoring dependencies; no model, Python package, accelerator, or editor is present in the web runtime.

## Verified release inventory

| Check | Result |
|---|---:|
| Manifest entries | 32 |
| MP3 files | 32 |
| Missing/orphan files | 0 / 0 |
| Byte mismatches | 0 |
| SHA-256 mismatches | 0 |
| Total size | 4,299,472 bytes (4.10 MiB) |
| Pack ceiling | 8,388,608 bytes (8 MiB) |
| Budget used | 51.3% |
| Declared duration | 713,520 ms (11 min 53.52 s) |
| Encoded format | MPEG audio, mono, 24 kHz, nominal 48 kbps |
| Loudness metadata | -18.1 to -17.7 LUFS |
| True-peak metadata | -2.3 to -1.0 dBTP |

Chapter totals:

| Chapter | Clips | Bytes | Duration |
|---|---:|---:|---:|
| Journey | 2 | 338,152 | 56.16 s |
| Road | 5 | 650,332 | 107.92 s |
| Venice | 6 | 754,536 | 125.20 s |
| Lagoon islands | 5 | 671,068 | 111.36 s |
| Verona | 14 | 1,885,384 | 312.88 s |

The release audit recalculated every file hash and byte count. A separate MPEG-frame inspection found valid audio frames in every file, confirmed 24 kHz mono encoding, and found a maximum 88 ms difference between frame duration and the manifest duration. That difference is within normal MP3 encoder delay/padding. Loudness and true-peak values were captured from FFmpeg's normalized second pass by the generation script; all 32 recorded measurements satisfy the manifest contract (`-18 LUFS ±1`, true peak at or below `-1 dBTP`).

## Script and caption freeze

The manifest maps every `segmentId` to identical `scriptRef` and `captionRef` values. The Spanish source is frozen in `public/content/locales/trip-manifest.es.json`, the 32 stable segment mappings are in `public/content/locales/narration.es.json`, and Italian-name pronunciation notes are retained in `planning/r4-research/`. Any script change requires regenerating the affected MP3, updating its duration/loudness/hash record, and rerunning the complete narration contract.

## Distribution record

The pinned Qwen checkpoint and the Qwen3-TTS source/package family are published under Apache License 2.0. The application distributes only project-authored Spanish scripts rendered with Qwen's named synthetic preset. No identifiable person's voice was supplied, cloned, or claimed. The pinned model identity and release links are preserved in `THIRD_PARTY_NOTICES.md`; each output has immutable provenance in the audio manifest.

This is a technical provenance and release record, not legal advice.

## Gate result

`ST-R30`, `AUD-R01`, `AUD-R02`, and `INF-R20` are ready for the frontend playback work. `FE-R40` and `FE-R41` remain open: the audio must still receive accessible controls, exact visible captions, no-autoplay behavior, stop-on-navigation/backgrounding, and silent fallback in the app.
