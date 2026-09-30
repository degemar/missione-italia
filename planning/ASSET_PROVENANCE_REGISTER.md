# Asset provenance register

**Snapshot date:** 30 September 2026  
**Rule:** a repository approval is not an asset approval. Only entries marked `CLEARED` may ship. Every copied file must use an immutable source, retain required notices, and be reviewed again if its source or purpose changes.

## Status vocabulary

- `SHIPPED`: present in the current app and covered by an exact package/file record.
- `REFERENCE`: visual or structural research only; no code or asset may be copied.
- `CANDIDATE`: repository-level licence identified, but no individual file is cleared.
- `CLEARED`: exact source file, revision, licence, local destination, modifications, and purpose approved.
- `CONCEPT_ONLY`: internal direction artifact; never packaged or used as production artwork.
- `BLOCKED`: not permitted without the stated additional evidence.

## Current shipped third-party material

| ID | Status | Source and immutable artifact | Licence | Local use | Evidence |
|---|---|---|---|---|---|
| `pkg-phosphor-react-2.1.10` | `SHIPPED` | `@phosphor-icons/react@2.1.10`; npm tarball `https://registry.npmjs.org/@phosphor-icons/react/-/react-2.1.10.tgz`; integrity `sha512-vt8Tvq8GLjheAZZYa+YG/pW7HDbov8El/MANW8pOAz4eGxrwhnbfrQZq0Cp4q8zBEu8NIhHdnr+r8thnfRSNYA==` | MIT | Interface icons bundled by Vite; no CDN | `package-lock.json`; source repository snapshot `81ac06f9bf4b4dedf9b8fead0a1ebd47c41d67ef` |

The application icon and current brand files are project assets, not third-party files. Their existing runtime records remain in `public/content/assets.json` and `config/runtime-asset-policy.json`.

## Approved repositories: pinned review snapshot

These rows pin what R0 reviewed. They do not clear any file for import.

| Source | Snapshot commit | R0 status | Repository-level evidence | File-level boundary |
|---|---|---|---|---|
| `SHSFWork/awesome-inspiration` | `5aa67c4330fc44689bc43d2637ddef30a0926fa7` | `REFERENCE` | Curated directory; no reusable-content licence established in R0 | Links, screenshots, names, and linked projects remain third-party; use only to discover patterns |
| `shadcn-ui/ui` | `a9c1da49ec4eab488dc99c69ae20a7ffaa4897d4` | `CANDIDATE` | Root `LICENSE.md`: MIT | Clear each copied source file and all dependencies; restyle rather than importing a full block or theme |
| `magicuidesign/magicui` | `d7207e5692d14c00dceafa8488d6d01f197fa0e4` | `CANDIDATE` | Root `LICENSE.md`: MIT | Clear the exact component plus its dependencies; at most the selected focal effects may enter the app |
| `Redwiat/awesome-tailwind-templates` | `3a0c3b8af02e6bbd010e54e7b3aeb1b1f1a3d87a` | `REFERENCE` | README states MIT; a standalone licence file and per-asset rights were not established in R0 | No code, images, fonts, or branding may be imported until the exact file and applicable notice are verified |
| `atman-33/sketch-illustrations` | `364a429250ff72bd4c757cb04d68f49deeb333a6` | `CANDIDATE` | README describes `public/illustrations` samples as CC0 | Clear each SVG separately, including its exact path/history and any depicted mark/person; repository description alone is insufficient |
| `phosphor-icons/core` | `2b75f3ad12b420c9504ef05df8d2564a28f8500e` | `CANDIDATE` | Root licence: MIT | Prefer the already shipped React package; record any raw SVG copied outside that package |
| `lucide-icons/lucide` | `5a92b9ba262de5bf10e864219883267672c05db8` | `CANDIDATE` | Root licence: ISC; listed Feather-derived icons also carry MIT terms | Use only for a documented semantic gap in Phosphor; record icon name and whether the Feather notice applies |
| `simple-icons/simple-icons` | `d4e6ba93e48f178898707f0145ec285f28b64b38` | `BLOCKED` | Repository is CC0, but its disclaimer says individual icons may have different licences and trademark/guideline requirements | Default is no brand logos; an exception requires functional need, exact icon revision, brand licence, current brand guidelines, and approval |

Pinned source form: `https://github.com/{owner}/{repo}/tree/{40-character-commit}`. Future reviews must not replace a commit with a moving branch name.

## R0 concept artifacts

| Artifact | Bytes | SHA-256 | Status | Decision |
|---|---:|---|---|---|
| `planning/r0-ux-options/lagoon-lantern.png` | 2,336,956 | `c337e5a6894b585385710b9c5c00953f6a2c4bd4c095418fe0ee82b5df945c3e` | `CONCEPT_ONLY` | Internally generated treatment board; no third-party asset imported; exclude from build and production art |
| `planning/r0-ux-options/fold-out-field-guide.png` | 2,570,625 | `099e2933b5dadce060771f8a7368bb1fcf4075568d9640fd02d028ce05c1d2a7` | `CONCEPT_ONLY` | Internally generated treatment board; no third-party asset imported; exclude from build and production art |
| `planning/r0-ux-options/stamp-theatre.png` | 2,357,937 | `76a711f10a893e1073deda21e62a8dee1225d3105c20d7d2978e43f0f4bf298f` | `CONCEPT_ONLY` | Internally generated treatment board; no third-party asset imported; exclude from build and production art |

The boards communicate layout, palette, density, and motion intent only. Their rendered text and imagery are not source assets and carry no clearance for extraction, tracing, cropping, or redistribution.

## Required row for every future imported file

Copy this row before import; leave status `BLOCKED` until every field is complete.

| Asset ID | Status | Source repository | Commit/tag | Original path | Licence and copyright | Local path | Modification | Purpose | Dependency/trademark review | Reviewer/date |
|---|---|---|---|---|---|---|---|---|---|---|
| `TBD` | `BLOCKED` | `https://github.com/...` | 40-character SHA | `path/in/repo` | exact licence + required notice | `public/assets/...` | recolor/crop/none | one sentence | passed/blocked + reason | name, YYYY-MM-DD |

For generated narration add tool/model/version, voice identity or preset, generation date, source script ID, distribution terms, output hash, and proof that neither the tool nor model is bundled. Voicebox is not a cleared dependency or production service in R0.
