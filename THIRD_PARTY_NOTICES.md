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
- Voicebox is not shipped, bundled, called, or cleared as a production dependency. Any later offline narration workflow requires separate tool, model, voice, and output-distribution provenance.
