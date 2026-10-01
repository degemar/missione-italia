# Missione Italia — Master Task Board

**Purpose:** authoritative execution order and ownership for the roadmap  
**Release:** trip-ready local-first build by 3 October 2026  
**Rule:** this file resolves ownership conflicts; lane files contain the detailed task definitions and acceptance criteria

## Specialist lanes

| Agent lane | Detailed backlog | Owns |
|---|---|---|
| Story and destination content | [`planning/STORY_TASKS.md`](planning/STORY_TASKS.md) | Narrative, 16 missions, facts, source register, copy, localization, island/Verona content, content QA |
| UX/UI | [`planning/UX_UI_TASKS.md`](planning/UX_UI_TASKS.md) | Living Storybook Atlas direction, states, tokens, components, motion, accessibility, asset brief, visual QA |
| Frontend | [`planning/FRONTEND_TASKS.md`](planning/FRONTEND_TASKS.md) | React views, gameplay flow, mission engine, Passport, Parent Corner, adapter integration, frontend tests |
| Infrastructure | [`planning/INFRA_TASKS.md`](planning/INFRA_TASKS.md) | Repository, Vite/PWA platform, service worker, GitHub Pages, maps/location adapters, CI/CD, performance, release/rollback |
| Backend and data | [`planning/BACKEND_TASKS.md`](planning/BACKEND_TASKS.md) | Static/save schemas, IndexedDB, migrations/recovery, export/delete, optional Supabase/RLS/sync |

The frontend lane is required in addition to the four requested specialist types: without it, the UX contract, story content, infrastructure, and backend would never be assembled into the working app.

## Decision gate

Close these tasks before their dependent implementation begins.

- [x] **DEC-001 — Confirm the calendar.** Completed in [`planning/TRIP_CALENDAR.md`](planning/TRIP_CALENDAR.md): 4–10 October, Venice nights Monday–Tuesday, Verona nights Wednesday–Friday, return Saturday.
- [x] **DEC-002 — Confirm child-facing language.** V2 is Spanish-only, with a small Italian phrase layer for learning.
- [x] **DEC-003 — Set the device decision.** V1 is phone-only; exact primary/backup models are deferred to the real-device release gate and do not block implementation.
- [x] **DEC-004 — Confirm the GitHub handoff.** Codex builds a portable package and manual-import guide; it never uses the connected professional GitHub account or pushes to the personal account.
- [x] **DEC-005 — Choose the visual direction.** Living Storybook Atlas; no wireframe phase.
- [x] **DEC-006 — Set the cloud default.** Supabase is off for the trip build unless every local/offline P0 gate passes by 2 October.
- [x] **DEC-007 — Record family constraints.** None declared. Inclusive no-ticket, no-GPS, read-aloud, reduced-motion, and manual fallbacks still ship; Arena and Juliet's House are exterior-first.
- [x] **DEC-008 — Decide Road scope.** Include Sunday as a lightweight Curiosity chapter and Saturday as a lightweight, non-required return epilogue. Gardaland remains excluded.

No implementation blocker remains. Deferred release inputs and the manual account boundary are recorded in [`planning/BLOCKING_DECISIONS.md`](planning/BLOCKING_DECISIONS.md) and [`planning/MANUAL_HANDOFF_INPUTS.md`](planning/MANUAL_HANDOFF_INPUTS.md).

## Fixed product decisions

- Cooperative shared quest; no individual leaderboard.
- Gardaland is excluded from app content, navigation, maps, rewards, and tests.
- Road, Venice, Murano/Burano, and Verona are required; Saturday's return epilogue is deliberately simple and never blocks completion.
- One parent-controlled phone; no child accounts.
- Mobile-first web/PWA; 320–430 px remains the primary target and V2 expands gracefully to tablet/desktop.
- Living Storybook Atlas visual system.
- Self-hosted Phosphor functional icons plus original story illustrations.
- Curated walks, not dynamic route generation.
- Leaflet/OpenStreetMap in-app map and Google Maps URL handoff.
- Foreground one-shot location only; no stored coordinates or route history.
- Static story/mission content and IndexedDB-first progress.
- No analytics, ads, cloud photos, push notifications, or live generative AI.
- All core gameplay works with map tiles, Google, and Supabase unavailable.
- Codex creates local source, workflow, migration, and instruction packages only; personal GitHub/Supabase activation is user-run.

## Spanish and artistic V2 redesign

The authoritative redesign backlog is [`planning/REDESIGN_ROADMAP.md`](planning/REDESIGN_ROADMAP.md). It supersedes earlier inspiration sources but does not replace unfinished trip-critical map, recovery, or field-test tasks below.

- [x] **R0 — contracts and provenance:** completed 30 September 2026. Stamp Theatre selected, Spanish sample approved, and provenance/performance contracts recorded.
- [x] **R1 — Spanish foundation:** completed 1 October 2026. Spanish UI/story content, Spanish-only save migration, and the integrated verification gate pass.
- [ ] **R2 — visual system:** build the selected shadcn-based component layer, original illustration kit, Phosphor icon rules, and reduced-motion equivalents.
- [ ] **R3 — screen rebuild:** migrate setup, atlas, chapter, mission, celebration, Passport, and Parent Corner without changing gameplay contracts.
- [ ] **R4 — storyteller:** add optional pre-generated Spanish narration, captions, download/cache controls, and silent fallback; no runtime AI or server is required.
- [ ] **R5 — release:** run mobile/responsive, accessibility, offline, performance, licence, migration, and production-URL gates; retain the V1 rollback package.

**Launch rule:** run one specialist agent at a time in the order defined by each wave. No implementation begins until R0 ends with one approved art treatment and a clean provenance register.

## Ownership rules

These boundaries prevent agents from editing the same implementation area:

1. **Backend/data** owns schemas, IndexedDB repositories, migrations, export/import/reset, and optional Supabase.
2. **Infrastructure** owns the runtime/build platform, service worker, environment injection, maps/location adapters, CI, deployment, and rollback.
3. **Frontend** consumes typed backend and infrastructure adapters; React components never access IndexedDB, geolocation, Supabase, or service-worker internals directly.
4. **Story** owns all factual and narrative strings. Components contain localization keys, not embedded destination facts.
5. **UX/UI** owns visual and interaction contracts. It does not change story facts or platform behavior.
6. When a lane file contains a duplicated cross-lane requirement, the owning lane implements it and the other lane verifies it as an acceptance gate.

## Execution plan

### Wave 0 — decisions and contracts

Run one specialist agent at a time, handing approved artifacts forward in this order: Story foundation → UX/UI → Backend/data → Infrastructure.

- [x] Product lead closes `DEC-002`–`DEC-004`, `DEC-007`, and `DEC-008`.
- [x] Story completes `ST-001`–`ST-009`: calendar, destination set, story bible, style/safety guide, sources, schemas, rewards, and mission manifest. Evidence: `planning/STORY_FOUNDATION_HANDOFF.md`.
- [x] UX/UI completes `UX-001`–`UX-004`: art direction, screen-state contract, design tokens, and component behavior. Evidence: `planning/UX_FOUNDATION_HANDOFF.md`.
- [x] Backend completes `BE-001`, `BE-010`, `BE-011`, and `BE-020`: data boundary, static schema/versioning, and save envelope. Evidence: `planning/BACKEND_FOUNDATION_HANDOFF.md`.
- [x] Infrastructure completes `INF-001`–`INF-011`: standalone repository, toolchain, environment contract, CI/Pages, manifest, service worker, and offline bundle boundary. Evidence: [`planning/INFRA_FOUNDATION_HANDOFF.md`](planning/INFRA_FOUNDATION_HANDOFF.md). Local contract is complete; personal Pages and physical-phone release verification remain explicitly deferred.

**Wave gate:** stable IDs, schemas, state inventory, visual rules, repository URL, and first offline shell are agreed. No feature work begins against draft contracts.

### Wave 1 — core local-first app

Continue one specialist at a time against the locked contracts; Frontend starts only after the four foundational lane handoffs are coherent.

- [x] Story completes chapter arcs and playable mission copy `ST-010`–`ST-035`. Evidence: `planning/STORY_WAVE1_HANDOFF.md`.
- [x] UX/UI completes cooperative mission interaction, motion/celebration, and asset-production contracts `UX-005`–`UX-007`. Evidence: `planning/UX_WAVE1_HANDOFF.md`.
- [x] Backend completes `BE-021`–`BE-024` and `BE-030`: IndexedDB, migrations, recovery, export/import/reset, and fixtures. Evidence: `planning/BACKEND_WAVE1_HANDOFF.md`.
- [x] Frontend completes `FE-001`–`FE-015`: state flow, app shell, content loader, setup, atlas, chapters, 16-mission engine, roles, celebrations, and Passport. Evidence: `planning/FRONTEND_WAVE1_HANDOFF.md`.
- [ ] Infrastructure completes safe update, degraded-state, storage-health, schema-validation, and asset-integrity requirements `INF-012`–`INF-017` and `INF-023`–`INF-025`. Local adapters/audit pass in `planning/INFRA_WAVE1_HANDOFF.md`; map fallback and deployed rollback evidence keep the grouped gate open.
- [ ] UX/UI reviews the implemented primitives against `UX-003`–`UX-006`; fixes contract gaps before polish.

**Wave gate:** the complete Lost Compass story loop works offline with local persistence and without maps or Supabase.

### Wave 2 — places, maps, recovery, and final content

- [ ] Story completes Verona run sheets/fallbacks `ST-040`–`ST-046` and copy/localization/accessibility `ST-050`–`ST-056`.
- [ ] Infrastructure completes maps/location/navigation/fallbacks `INF-019`–`INF-022` and critical automated tests `INF-026`–`INF-027`.
- [x] Frontend completes `FE-016`: deliberate accessible Parent Corner entry, exact-screen return, role/mission/chapter/excursion controls, install/help, local diagnostics, storage/settings, and scoped confirmed reset/delete. Evidence: `planning/FRONTEND_PARENT_CORNER_HANDOFF.md`.
- [ ] Frontend completes `FE-017`. Offline/update/storage presentation and safe update gating pass locally; tile and GPS states remain blocked by `INF-019`–`INF-022` and `FE-019`–`FE-021`.
- [ ] Frontend completes `FE-018`. The cloud-off boundary passes with no sign-in, sync controls, or cloud request; cloud-on states remain blocked by `BACKEND-GATE` and are intentionally absent.
- [ ] Frontend completes maps/navigation `FE-019`–`FE-021` and accessibility/motion/tests `FE-022`–`FE-025`.
- [ ] UX/UI completes map, permission, responsive, and accessibility contracts `UX-008`–`UX-011`.
- [ ] Backend completes local privacy review `BE-050` and prepares the frozen data contract `BE-060`.

**Wave gate:** every mission has normal, manual, no-GPS, no-map, closed-place, tired-legs, and poor-weather paths.

### Wave 3 — integration, field test, and freeze

- [ ] Frontend produces the complete candidate `FE-026`.
- [ ] Story runs factual, safety, age, package, and live-information QA `ST-060`–`ST-066`.
- [ ] UX/UI runs full visual and outdoor QA `UX-012`.
- [ ] Infrastructure runs actual-phone, outdoor, performance, security, rollback, and release tasks `INF-028`–`INF-039`.
- [ ] Backend validates airplane-mode recovery/export and freezes the save contract `BE-060`.
- [ ] Frontend closes field-test defects and freezes `FE-027`.

**Wave gate:** install → airplane-mode restart → mission → force-close → progress recovery passes on the production URL and actual family phone.

### Optional Wave 4 — cloud backup

Do not start before every Wave 3 trip-critical gate passes.

- [ ] Confirm `DEC-B01=enabled` and a viable parent email/SMTP path.
- [ ] Complete `BE-040`–`BE-046`: Supabase project, migrations, RLS, parent auth, whole-save backup, restore/delete, conflicts, and failure tests.
- [ ] Complete `INF-018` and `INF-037`: feature-flagged cloud adapter boundary and containment tests.
- [ ] Enable `FE-018` cloud states only after cross-owner and outage tests pass.
- [ ] Repeat `BE-050` and the actual-phone offline gate.

If unfinished by 2 October, omit cloud configuration and ship the local-first app.

## Confirmed calendar and provisional Verona content plan

The calendar is confirmed in [`planning/TRIP_CALENDAR.md`](planning/TRIP_CALENDAR.md). The Thursday/Friday destinations remain decisions:

| Date | Main blocks | App chapters/missions |
|---|---|---|
| Thu 8 — Verona; short trip still open | Arena, Juliet's House, historic-centre hunt; city afternoon or optional short trip | Arena Time Machine, Juliet's Message Mystery, Adige clue |
| Fri 9 — recommended Sigurtà/Borghetto | Sigurtà nature/maze; Borghetto mills and river | Team Maze, Water-Mill Mystery |
| Fri 9 alternate | Sirmione main visit; Lazise short optional stop | Castle-on-the-Water, bonus Spotter card |

Each block has a hotel/lunch reset and Verona indoor fallback. Date-specific hours, parking, tickets, ZTL rules, weather, and closures are rechecked on 2–3 October.

## Release scope

### Trip-critical P0

- Four chapters, 16 sourced age-adapted cooperative missions, and a lightweight return epilogue.
- Setup, atlas, mission engine, role rotation, celebration, Passport, and Parent Corner.
- IndexedDB persistence, export/recovery, offline content, manual overrides.
- Curated Venice/Verona checkpoint walks, Leaflet online map, offline route fallback, Google Maps handoff.
- Accessibility, reduced motion, no-audio path, actual-phone testing, public-data audit, rollback.

### P1 only after P0 passes

- Read-aloud/audio polish.
- Foreground proximity suggestions.
- Optional camera handoff without upload.
- Supabase cloud backup.

### P2 after the trip

- Family recap, generalized trip builder, multi-device use, private photos, additional destinations.

## Master completion gate

The roadmap is complete only when every P0 lane gate passes, all open decision records are resolved or explicitly deferred, the production build is frozen, the actual phone passes the offline recovery journey, and no essential gameplay depends on live maps, location, Google, or Supabase.
