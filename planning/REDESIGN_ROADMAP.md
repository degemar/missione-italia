# Missione Italia — Spanish and artistic V2 roadmap

**Goal:** transform the working local-first trip app into an original Spanish-only illustrated adventure for children without losing offline reliability, saved progress, or the free GitHub Pages deployment.

## Locked product decisions

- Spanish is the child-facing language; Italian appears only as short travel phrases.
- Bussola, the lost compass, is the storyteller and guide. No second mascot is introduced.
- Keep React 19, TypeScript, Vite, PWA, IndexedDB, and GitHub Pages. Supabase remains optional and outside the redesign critical path.
- Mobile-first at 320–430 px; layouts expand cleanly to tablet/desktop. Touch targets remain at least 48 px.
- Preserve V1 as the rollback build. Redesign work may not rewrite mission IDs, completion rules, or save semantics without an approved migration.
- No wireframes. UX produces three high-fidelity art treatments within the Living Storybook Atlas concept; the user selects one before implementation.
- No live generative AI, remote text-to-speech, analytics, ads, or child accounts.

## Approved design sources and boundaries

| Source | Approved use | Boundary |
|---|---|---|
| `SHSFWork/awesome-inspiration` | Discover layout, mobile, accessibility, and motion patterns | Directory only; links and screenshots are not licensed assets |
| `shadcn-ui/ui` | Accessible component structure and source primitives | Restyle completely; do not ship a generic shadcn theme |
| `magicuidesign/magicui` | One or two focal effects per screen | No constant sparkle, marquees, or motion competing with reading |
| `Redwiat/awesome-tailwind-templates` | Composition reference and selectively adapted MIT code after file-level review | Never copy a full template or its branding |
| `atman-33/sketch-illustrations` | Candidate hand-drawn SVG artwork | Import only assets whose CC0 provenance is recorded in the asset register |
| `phosphor-icons/core` | Primary interface icon language | Use one coherent weight/duotone policy |
| `lucide-icons/lucide` | Fallback only when Phosphor has no suitable semantic icon | Do not mix icon families decoratively |
| `simple-icons/simple-icons` | Exceptional functional brand mark only | Default is no brand logos; verify each mark's trademark/licence before use |

Every shipped third-party file records source URL, commit/tag, original path, licence, local path, modifications, and purpose. `THIRD_PARTY_NOTICES.md` is updated in the same change that imports the file.

## Original art direction

The selected product concept remains **Living Storybook Atlas**, upgraded into an illustrated theatre of the trip:

- layered paper landscapes, inked routes, stamps, fold-outs, and tactile chapter cards;
- a warm Mediterranean palette with distinct Venice, Lagoon, Verona, and Road accents;
- Bussola reacts to progress through expression, pose, speech, and a small number of meaningful transitions;
- destination artwork is place-specific and educational, not generic tourism decoration;
- shadcn primitives provide the invisible interaction skeleton; custom tokens, shapes, type, artwork, and motion create the identity;
- motion uses transform/opacity, respects reduced motion, and never blocks the next action.

## Free technical approach

- Add Tailwind/shadcn source components only where they replace a defined primitive: button, card, dialog, sheet, progress, tabs, and toast. Keep existing CSS during incremental migration.
- Add a motion dependency only if the chosen Magic UI effects require it; otherwise port the minimal MIT effect into local CSS.
- Keep Phosphor React as the normal icon dependency. Lucide and Simple Icons are not installed by default.
- Store locale content in typed `es`, `en`, and `it-phrases` modules; components render keys, never destination prose.
- Use responsive SVG/WebP artwork, lazy-loaded by chapter. Essential shell art is precached; heavy chapter art is cached after first use.
- Use static MP3 narration with synchronized text/captions. Voicebox may be an offline authoring tool, but it is never bundled or required at runtime.

## Wave R0 — contracts, audit, and art selection

Run: **Story → UX/UI → Infrastructure → Product decision**.

### Story

- [x] `ST-R01` Inventory every child-facing, parent-facing, accessibility, error, and PWA string. See `planning/R0_STORY_STRING_INVENTORY.md`.
- [x] `ST-R02` Define Spanish voice, vocabulary level, names, Italian phrase policy, and translation glossary. See `planning/R0_SPANISH_VOICE_AND_GLOSSARY.md`.
- [x] `ST-R03` Produce one representative Spanish chapter plus mission, quiz, celebration, and caption script for art testing. See `planning/R0_SPANISH_SAMPLE_FLOW.md`.

### UX/UI

- [x] `UX-R01` Audit current screens against the full state inventory; identify preserve, simplify, and redesign decisions. See `planning/R0_UX_CURRENT_STATE_AUDIT.md`.
- [x] `UX-R02` Create three high-fidelity mobile art treatments for the same representative flow; no wireframes and no copied layouts. See `planning/R0_UX_ART_TREATMENTS.md`.
- [x] `UX-R03` For each treatment define tokens, typography, illustration treatment, component anatomy, icon weight, motion signature, and reduced-motion state.
- [x] `UX-R04` Recommend one treatment with accessibility, performance, and asset-production trade-offs. **Selected by the user on 30 September 2026: Treatment 3 — Stamp Theatre.**

### Infrastructure/licensing

- [x] `INF-R01` Create the asset provenance register and verify each candidate file at a pinned source revision. See `planning/ASSET_PROVENANCE_REGISTER.md`; no third-party art file is cleared yet.
- [x] `INF-R02` Update `THIRD_PARTY_NOTICES.md`; treat unverified linked assets as inspiration-only.
- [x] `INF-R03` Establish measurable shell, precache, art, motion, and narration budgets. See `planning/R0_PERFORMANCE_BUDGET.md`.

**Gate status: CLOSED 30 September 2026.** Treatment 3 — Stamp Theatre selected; representative Spanish sample approved; provenance and budget contracts complete.

## Wave R1 — Spanish and data foundation

Run: **Story → Backend/data → Frontend**.

### Story

- [x] `ST-R10` Adapt all UI, stories, facts, clues, quizzes, celebrations, fallbacks, and Parent Corner copy into natural Spanish. Evidence: `planning/R1_STORY_HANDOFF.md`.
- [x] `ST-R11` Preserve source-backed facts and age layers for ages 4, 7, and 9; do not translate proper names mechanically. Evidence: `planning/R1_STORY_HANDOFF.md`.
- [x] `ST-R12` Write short storyteller scripts and matching captions for every narrated segment. Evidence: `public/content/locales/narration.es.json`.
- [x] `ST-R13` Run native-quality language, read-aloud, safety, and factual parity review. Editorial/automated review complete; independent native-speaker device sign-off is an R5 recommendation. Evidence: `planning/R1_STORY_HANDOFF.md`.

### Backend/data

- [x] `BE-R10` Extend typed content contracts for locale variants, narration metadata, caption text, and asset IDs. Evidence: `planning/R1_BACKEND_HANDOFF.md`.
- [x] `BE-R11` Add Spanish-only save settings and a non-destructive migration for existing saves. Evidence: `planning/R1_BACKEND_HANDOFF.md`.
- [x] `BE-R12` Prove export/import and migration retain family setup, stamps, mission progress, and locale; reset intentionally clears progress while retaining family setup and locale. Evidence: `planning/R1_BACKEND_HANDOFF.md`.

### Frontend

- [x] `FE-R10` Resolve Spanish content at boot without a language control or content-key flashes. Evidence: `planning/R1_FRONTEND_HANDOFF.md`.
- [x] `FE-R11` Replace embedded copy with typed keys and Spanish-default locale modules. Evidence: `planning/R1_FRONTEND_HANDOFF.md`.
- [x] `FE-R12` Add missing-key tests; Italian phrases remain explicitly scoped. Evidence: `planning/R1_FRONTEND_HANDOFF.md`.

**Gate:** the complete existing app runs in Spanish and an old V1 save opens with identical progress.

**Gate status: CLOSED 1 October 2026.** The complete app resolves Spanish for every family, preserves migrated V1 progress while upgrading saves to schema 3, and passes the integrated verification gate.

## Wave R2 — design system and artwork

Run: **UX/UI → Infrastructure → Frontend**.

### UX/UI

- [x] `UX-R10` Freeze the selected color, type, spacing, radius, shadow, texture, icon, illustration, and motion tokens. Evidence: `planning/R2_UX_HANDOFF.md`, `docs/design-tokens.json`.
- [x] `UX-R11` Specify shadcn-based primitives and every normal, pressed, focused, disabled, loading, success, error, offline, and reduced-motion state. Evidence: `planning/R2_UX_HANDOFF.md`.
- [x] `UX-R12` Create the Bussola expression/pose set, chapter hero scenes, route landmarks, stamps, quiz objects, and empty/error illustrations. Evidence: `planning/r2-stamp-theatre-art/`, `planning/R2_UX_ASSET_MANIFEST.json`.
- [x] `UX-R13` Define responsive composition for 320, 360, 390, 430, 768, and 1024 px widths. Evidence: `planning/R2_UX_HANDOFF.md`.

### Infrastructure/licensing

- [x] `INF-R10` Add only approved dependencies and record exact licences/versions. **No R2 dependency added; the existing React/CSS/Vite/Phosphor stack is sufficient.**
- [x] `INF-R11` Build deterministic SVG/WebP/audio optimization and filename/hash rules. **`npm run validate:assets` enforces registered media type, lowercase filename, hash, dimensions, SVG safety/path policy, and audio signature rules.**
- [x] `INF-R12` Add asset-integrity, orphan, missing-alt, and size-budget checks. **The same deterministic gate rejects orphaned files/policies, unregistered references, missing Spanish alt metadata, and byte-budget drift.**

### Frontend

- [x] `FE-R20` Implement tokens and the local component layer without changing feature behavior. Evidence: `src/components/StampTheatre.tsx`, `src/styles/global.css`.
- [x] `FE-R21` Implement reduced-motion from first render and keep all celebrations understandable without animation or sound. Evidence: `src/platform/motion-preference.ts`, `src/main.tsx`.
- [x] `FE-R22` Build a visual-development route covering every primitive and state outside the child journey. Evidence: `src/app/DevDesignSystem.tsx` at `#design-system` in development.

**Gate:** primitives and artwork pass contrast, focus, touch, reduced-motion, responsive, provenance, and budget review before screens migrate.

**Gate status: CLOSED 1 October 2026.** The integrated gate passed type checking, linting, 11 contract groups, asset integrity, 340 tests, and production/PWA build. Screens remain in their existing behavioral form until R3.

## Wave R3 — screen rebuild

Run: **Frontend → UX/UI review → Story review**.

- [ ] `FE-R30` Rebuild setup and family-team creation.
- [ ] `FE-R31` Rebuild atlas, chapter cards, route progress, and day context.
- [ ] `FE-R32` Rebuild story, mission, quiz, hint, role, checkpoint, and fallback states.
- [ ] `FE-R33` Rebuild celebration, stamp reveal, Passport, and return epilogue.
- [ ] `FE-R34` Rebuild Parent Corner, accessibility, storage, install, and reset states.
- [ ] `FE-R35` Preserve focus, scroll, navigation, offline, update, and exact-screen return behavior across every migration.
- [ ] `UX-R20` Review each completed screen against the selected treatment and state contract.
- [ ] `ST-R20` Review Spanish wrapping, reading length, captions, and factual context in the implemented screens.

**Gate:** every existing journey is behaviorally equivalent, visually approved, Spanish-first, responsive, and usable with motion disabled.

## Wave R4 — Bussola storyteller

Run: **Story → Audio production → Infrastructure → Frontend**.

- [ ] `ST-R30` Freeze narration scripts with pronunciation notes for Italian place names.
- [ ] `AUD-R01` Generate and edit warm Spanish narration offline; normalize loudness and export compact MP3 files.
- [ ] `AUD-R02` Record voice/tool provenance and confirm the generated voice can be distributed.
- [ ] `INF-R20` Add versioned audio manifests, lazy cache, offline availability state, and optional download/remove controls.
- [ ] `FE-R40` Add accessible play/pause/replay/progress controls with captions, no autoplay, and silent text fallback.
- [ ] `FE-R41` Stop audio on navigation, calls/backgrounding, or explicit parent action; narration never affects mission completion.

**Gate:** storyteller works offline after download, captions match audio, first load stays within budget, and the app remains fully playable with audio unavailable.

## Wave R5 — release and rollback

Run: **Story → UX/UI → Backend/data → Infrastructure → Frontend release**.

- [ ] `ST-R40` Run Spanish, factual, safety, and package-completeness QA.
- [ ] `UX-R40` Run outdoor-light, one-hand, child, reduced-motion, large-text, orientation, and responsive visual QA.
- [ ] `BE-R40` Re-run V1-save migration, corruption recovery, export/import, and reset tests.
- [ ] `INF-R40` Run licence/notices, asset integrity, PWA cache, Pages base-path, bundle, offline, and rollback checks.
- [ ] `FE-R50` Run full journeys at target widths and on the family phone; close blockers only.
- [ ] `REL-R01` Export a GitHub-ready package and preserve the previous working release as rollback.

**Gate:** production URL passes install → offline restart → Spanish mission → narration fallback → force-close → progress recovery, with the previous release recoverable.

## Agent launch order

Launch one specialist at a time and require a written handoff before the next starts:

1. `R0 Story`
2. `R0 UX/UI`
3. `R0 Infrastructure/licensing`
4. User art-direction decision
5. Continue R1–R5 in the order stated above

Do not launch backend work in R0, audio production before scripts freeze, or screen implementation before the R2 primitive gate.
