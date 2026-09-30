# R0 performance, motion, art, and audio budget

**Target:** a family phone outdoors, unreliable mobile data, and offline reuse. The real family phone is the release authority; emulation is an earlier gate only.

## Measured V1 baseline

Measured from the existing `dist` output on 30 September 2026; no rebuild was run.

| Measure | Baseline |
|---|---:|
| Executable shell: HTML + main JS + CSS + Workbox window | 409,135 bytes raw / 119,287 bytes gzip |
| Main JavaScript | 387,229 bytes raw / 112,665 bytes gzip |
| Main CSS | 15,380 bytes raw / 4,021 bytes gzip |
| Generated precache | 15 files / 1,213,825 bytes raw / 855,566 bytes gzip |

## R1–R5 release budgets

### Shell and loading

- Executable shell hard limit: **221,687 bytes gzip** (V1 baseline + 100 KiB).
- Main JavaScript: **≤195 KiB gzip**; main CSS: **≤30 KiB gzip**.
- HTML, executable shell, critical content, critical font subsets, and above-fold art: **≤350 KiB compressed transfer** on first use.
- Core offline precache excluding optional narration: target **≤5 MiB**, hard limit **≤8 MiB**. A release decision is required before raising either limit.
- No remote font, icon, illustration, animation, or audio dependency. Self-hosted first-load font subsets total **≤80 KiB compressed**; system fonts are the fallback.
- Chapter art and narration are lazy by chapter. Optional narration is excluded from the app shell and default precache.

### Artwork

- Shared Bussola and motif kit: **≤100 KiB compressed** total; critical subset **≤60 KiB**.
- Per-chapter optimized art ceiling follows the treatment promise: Lagoon Lantern **≤400 KiB**, Fold-Out Field Guide **≤220 KiB**, Stamp Theatre **≤140 KiB**.
- One raster image: **≤180 KiB compressed**, **≤1.5 megapixels decoded**, responsive `srcset`, WebP/AVIF with a fallback only when needed.
- One SVG: **≤60 KiB compressed**, no embedded raster/font/script, no unbounded filter, and target **≤250 rendered paths**.
- Decorative texture behind text is forbidden. Every informative image has localized alt text; decorative images use empty alt text.
- The three R0 PNG boards are planning files and must never be copied to `public`, imported by the app, or included in the service-worker manifest.

### Motion

- Target **60 fps** on the family phone; over a representative transition, dropped frames **<5%** and p95 frame time **≤16.7 ms**.
- No new task attributable to an animation may block the main thread for **>50 ms**.
- Animate transform and opacity only. Maximum **two moving elements** at once, one focal effect per screen, and no idle loop.
- Navigation feedback begins within **100 ms**; normal transitions finish within **600 ms**; finite celebration motion finishes within **1.2 s**.
- With `prefers-reduced-motion: reduce`, travel, parallax, confetti, curtain, and route drawing are removed; the same final state appears immediately or with opacity **≤100 ms**.
- Before family-phone testing, emulate a mid-range phone with 4× CPU slowdown. If the real phone misses the budget, remove the effect rather than relaxing the gate.

### Narration

- Static mono MP3 target: **64 kbps**, 44.1 kHz; each clip **≤60 s / 500 KiB**.
- Per-chapter downloadable audio: **≤1.5 MiB**. Complete trip audio pack: target **≤6 MiB**, hard limit **≤8 MiB**.
- Audio downloads require a parent/user action, show the size first, can be removed, and do not affect completion. No autoplay.
- Captions and text fallback ship with content and remain usable before audio download, offline eviction, decode failure, or muted playback.
- Production export target: integrated loudness **−18 LUFS ±1 LU** and true peak **≤−1 dBTP**; clip duration and caption timing are recorded in the audio manifest.

## Acceptance evidence

R2/R5 must publish a budget report containing bundle gzip sizes, precache total, each art/audio file size, target-phone model/OS/browser, frame trace for the heaviest transition, reduced-motion capture, and a cold install → offline restart result. A failed hard limit blocks release unless the user records an explicit scope trade-off.
