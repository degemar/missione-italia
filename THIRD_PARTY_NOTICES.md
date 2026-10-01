# Third-party notices

This file distinguishes software/assets shipped by Missione Italia from planning references. Repository-level licensing never clears a particular file automatically. Exact file provenance is maintained in `planning/ASSET_PROVENANCE_REGISTER.md`.

## Currently shipped

### R2 dependency decision

R2 adds **no package**. The existing React/CSS/Vite stack and Phosphor icon package are sufficient for the design-system phase; shadcn/ui, Magic UI, Lucide, Simple Icons, Sketch Illustrations, Tailwind, and Voicebox remain unbundled. This keeps the Pages bundle, licence surface, and offline cache small.

| Package | Exact version | Licence | Use |
|---|---:|---|---|
| `react` | 19.3.0 | MIT | Runtime UI |
| `react-dom` | 19.3.0 | MIT | Browser renderer |
| `workbox-window` | 7.4.1 | MIT | PWA update lifecycle |
| `vite` | 8.3.1 | MIT | Build tool; development only |
| `vite-plugin-pwa` | 1.3.0 | MIT | Build-time service-worker generation; development only |

Exact tarball URLs, integrity hashes, and transitive dependency records are locked in `package-lock.json`. All five package licences are available in their installed package directories; no third-party artwork or fonts ship in this wave.

### Generated Bussola narration

The app ships 32 synthetic Spanish MP3 clips in `public/audio/narration/v1/`. The project-authored scripts were generated locally with `qwen-tts` 0.1.1 and the built-in `Serena` preset from `Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice` at immutable revision `85e237c12c027371202489a0ec509ded67b5e4b5`.

- Model and package family: Qwen3-TTS, Apache License 2.0
- Pinned model card: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice/tree/85e237c12c027371202489a0ec509ded67b5e4b5
- Source and licence: https://github.com/QwenLM/Qwen3-TTS and https://github.com/QwenLM/Qwen3-TTS/blob/main/LICENSE
- PyPI release used: https://pypi.org/project/qwen-tts/0.1.1/
- Voice identity: Qwen's synthetic `Serena` preset; no human recording, imported voice, speaker embedding, or voice-cloning reference was used.
- Shipped output: generated MP3 files and their manifest only. Qwen model weights, `qwen-tts`, PyTorch, FlashAttention 2, SoundFile, and FFmpeg/imageio-ffmpeg were local authoring tools and are not bundled, called, or required at runtime.
- Voicebox was not used to generate or edit these files. It informed the optional-pack architecture only and is neither a production dependency nor part of the audio provenance chain.

The model card marks the pinned checkpoint Apache-2.0, supports Spanish, and describes `Serena` as a built-in warm, gentle synthetic preset. The release contains no imitation of an identified person. Audio-level hashes, dates, script references, loudness measurements, and exact generator/model metadata are recorded in `public/audio/narration/v1/manifest.json`; the production verification record is `planning/R4_AUDIO_PRODUCTION_HANDOFF.md`. This notice records technical provenance and is not legal advice.

### Phosphor Icons for React

- Source: https://github.com/phosphor-icons/react
- Package: `@phosphor-icons/react` 2.1.10
- Locked artifact: `https://registry.npmjs.org/@phosphor-icons/react/-/react-2.1.10.tgz`
- Integrity: `sha512-vt8Tvq8GLjheAZZYa+YG/pW7HDbov8El/MANW8pOAz4eGxrwhnbfrQZq0Cp4q8zBEu8NIhHdnr+r8thnfRSNYA==`
- Licence: MIT
- Use: interface icons bundled locally by Vite; no CDN

MIT License

Copyright (c) 2020 Phosphor Icons

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Approved references and candidates — not shipped

| Repository | Repository-level finding | Shipping boundary |
|---|---|---|
| `SHSFWork/awesome-inspiration` | Discovery directory; no reusable-content licence established in R0 | Inspiration/discovery only. Linked sites, images, screenshots, code, and assets retain their own rights. |
| `shadcn-ui/ui` | MIT | Exact copied source and dependencies require a pinned provenance row and MIT notice. Do not import a whole theme or branded block. |
| `magicuidesign/magicui` | MIT | Exact component and dependencies require a pinned provenance row and MIT notice. Use only a selected focal effect. |
| `Redwiat/awesome-tailwind-templates` | README states MIT; R0 did not establish standalone and per-asset licence evidence | Inspiration only until the exact code file, notice, images, fonts, and other embedded assets are independently cleared. |
| `atman-33/sketch-illustrations` | README describes the sample catalog as CC0 | Each SVG requires exact path/revision and subject/trademark review. Repository description alone does not clear an asset. |
| `phosphor-icons/core` | MIT | Prefer the shipped React package. Record any separately copied SVG and preserve the MIT notice. |
| `lucide-icons/lucide` | ISC; listed Feather-derived icons also include MIT terms | Fallback only for a documented Phosphor gap. Record the icon name and include every applicable notice. |
| `simple-icons/simple-icons` | Repository CC0; project disclaimer says individual icons may have separate licences and trademark rules | No brand marks by default. Each exception needs current icon-specific licence, brand guidelines, functional need, and approval. |

Review snapshots are pinned in `planning/ASSET_PROVENANCE_REGISTER.md`; moving branches are not acceptable import sources.

## Explicit exclusions

- The three `planning/r0-ux-options/*.png` boards are internally generated concept artifacts, not third-party assets and not production artwork. They are excluded from the app and service-worker cache.
- Voicebox is not shipped, bundled, called, or part of the production-generation chain. It was reviewed only as architectural inspiration; the shipped narration was generated directly through the local `qwen-tts` Python workflow documented above.
