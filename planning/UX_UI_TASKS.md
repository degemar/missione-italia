# Missione Italia — UX/UI task backlog

## Chosen direction: Living Storybook Atlas

> V2 redesign tasks, approved repositories, responsive scope, Spanish-first rules, and three-treatment selection are authoritative in [`REDESIGN_ROADMAP.md`](REDESIGN_ROADMAP.md). The tasks below remain the V1 behavioral contract.

The app should feel like a pocket adventure book that has come alive: warm paper, inked map lines, collectible travel stickers, a slightly mischievous brass compass, and restrained motion that reveals the next clue. It should feel adventurous to a nine-year-old without feeling too grown-up for the four-year-old or too babyish for the seven-year-old.

Use one clear action per screen, large tactile controls, short read-aloud copy, and visual hierarchy strong enough for use outdoors. Motion is feedback and storytelling—not decoration. The phone repeatedly sends the family back to the place around them.

Do not create wireframes. Define reusable behavior, visual rules, components, and test states directly from the roadmap and content schema.

### Locked delivery and asset choices

- Design mobile-first at 320–430 CSS px wide and expand cleanly through tablet/desktop; browser and installed-PWA modes remain supported.
- Use self-hosted [Phosphor Icons](https://phosphoricons.com/) as the single functional icon family; record its MIT licence in the asset manifest.
- Create an original compass character, chapter scenes, stamps, map markers, and offline route art in one consistent illustrated style. Do not depend on attribution-heavy stock illustration packs.
- Self-host approved fonts and assets; no runtime design CDN is allowed.

### Current chapter scope

- **Required:** Venice, Murano/Burano Lagoon Islands, and Verona.
- **Required:** lightweight Road, Venice, Murano/Burano Lagoon Islands, and Verona chapters, followed by a short return epilogue.
- The ordered chapter list still comes from the content manifest; no fixed indices, labels, or compass segments belong in UI code.

### Reference principles

- Use shadcn/ui for accessible component structure and restyle it into the original Living Storybook Atlas system.
- Use Magic UI only for a small number of meaningful reveals and celebrations with complete reduced-motion equivalents.
- Use Phosphor as the primary icon family; Lucide is fallback only for a missing semantic icon.
- Use Sketch Illustrations only after asset-level provenance review; Awesome Inspiration and Awesome Tailwind Templates are pattern references, not designs to copy.
- Avoid Simple Icons unless a brand mark is functionally required and individually cleared.

Do not copy complete layouts, templates, artwork, or branded interactions. Follow `THIRD_PARTY_NOTICES.md` and the provenance gate in `REDESIGN_ROADMAP.md`.

## Priority

- **P0:** required for the trip-ready build.
- **P1:** add only after the complete offline game loop is stable.
- **P2:** post-trip.

## Tasks

### UX-001 — Lock the visual direction

- **Priority:** P0
- **Dependencies:** approved `ROADMAP.md`; Story chapter names and tone
- **Deliverables:** one-page art-direction brief; reference board with annotated principles; “use/avoid” list; chapter mood notes
- **Acceptance criteria:**
  - Living Storybook Atlas remains the product direction. V2 explores three high-fidelity treatments inside that direction; no wireframe phase is required.
  - The brief defines paper/sticker/ink/compass usage without imitating any reference site.
  - The direction works across Road, Venice, Murano/Burano Lagoon Islands, Verona, and the return epilogue while retaining one visual system.
  - The lagoon-islands treatment uses original travel, boat, glass, lace, and colorful-house motifs without copying tourism or commercial brand assets.

### UX-002 — Define the experience and screen-state contract

- **Priority:** P0
- **Dependencies:** UX-001; Story mission schema
- **Deliverables:** annotated state inventory for Welcome, Setup, Adventure Map, Chapter, Mission, Story, Challenge, Celebration, Passport, and Parent Corner; transition table; primary-action labels
- **Acceptance criteria:**
  - Every screen has one obvious primary action and a defined back/close behavior.
  - The normal loop and skip/manual-unlock fallback both reach Celebration and persist progress.
  - Story and clue states include a deliberate “look up / put the phone down” handoff.
  - Parent-only actions are visually distinct but do not require a fake PIN.
  - No logistics, booking, or itinerary-management UI is introduced.
  - Chapter navigation and progress render from an ordered manifest and pass with both three-chapter and four-chapter fixtures.

### UX-003 — Create the design-token contract

- **Priority:** P0
- **Dependencies:** UX-001
- **Deliverables:** token specification for color, typography, spacing, radii, borders, shadows, layers, icon sizes, touch targets, and motion; chapter and role semantic tokens
- **Acceptance criteria:**
  - Base palette includes warm paper, dark ink, tomato red, lake teal, sun gold, and one violet accent, with exact light/dark semantic assignments.
  - Role identity uses icon + label + shape; color is never the only differentiator.
  - Chapter tokens are keyed by chapter ID with safe defaults; they do not assume a fixed count or ordinal position.
  - Body/read-aloud text defaults to at least 18 CSS px; primary controls have at least a 48×48 CSS px target.
  - All text and essential controls meet WCAG 2.2 AA contrast; outdoor-critical text targets 7:1 where practical.
  - Display and body fonts are free, self-hostable, Latin/Italian capable, and licensed in the asset manifest. Start evaluation with Fredoka for display and Atkinson Hyperlegible Next for reading text.

### UX-004 — Specify the child-first component set

- **Priority:** P0
- **Dependencies:** UX-002, UX-003
- **Deliverables:** visual and behavior specification for buttons, mission cards, role clue cards, answer choices, progress compass, chapter tabs, badges/stamps, bottom sheets, dialogs, banners, toasts, and press-and-hold parent entry
- **Acceptance criteria:**
  - Each interactive component defines default, pressed, keyboard-focus, selected, disabled, loading, success, and error states where applicable.
  - Selected answers remain obvious without animation or color.
  - Wrong answers encourage another look and never shame, deduct points, or identify a losing child.
  - Challenge controls can be operated one-handed by the parent and understood when three children share one screen.
  - Destructive reset/delete controls are separated from routine controls and require clear confirmation.
  - Chapter tabs, passport progress, and the compass component accept three or four manifest entries without empty slots or layout changes.

### UX-005 — Design the cooperative mission interaction

- **Priority:** P0
- **Dependencies:** UX-002, UX-004; Story role/clue content
- **Deliverables:** interaction specification for role rotation, clue reveal, group answer, hint, retry, skip, completion, and stamp collection
- **Acceptance criteria:**
  - Spotter, Detective, and Navigator each have a meaningful action in every mission.
  - Roles rotate visibly and can be reassigned by the parent without penalty.
  - A mission can be completed with pointing/read-aloud interaction; typing is never required.
  - The youngest child's task is not merely decorative and can affect completion.
  - Completion rewards the family once, with no individual score or leaderboard.

### UX-006 — Define the motion and celebration system

- **Priority:** P0 for essential feedback; P1 for sound and extra polish
- **Dependencies:** UX-003, UX-004; Infra performance budget
- **Deliverables:** motion token table; transition choreography; compass-power and stamp celebration storyboard; reduced-motion equivalents; optional sound cue list
- **Acceptance criteria:**
  - Tap feedback appears within 100 ms; common transitions use roughly 150–300 ms; celebrations finish or become skippable within 2.5 seconds.
  - Motion uses transform/opacity where possible and targets 60 fps on the actual family phone.
  - One shared object—the compass—provides continuity between mission, celebration, map, and passport.
  - Compass-power fills and the final ceremony derive their segment count from the active manifest rather than assuming four powers.
  - No looping movement competes with reading, maps, or location decisions.
  - `prefers-reduced-motion` removes zoom, parallax, bounce, confetti, and nonessential sequencing without hiding information.
  - Sound defaults to off or follows the setup choice; success is fully understandable when muted.

### UX-007 — Produce the illustration and asset brief

- **Priority:** P0
- **Dependencies:** UX-001, UX-003; Story final mission inventory
- **Deliverables:** asset list and size matrix; art brief for compass character, four chapter scenes, lightweight return-epilogue treatment, role symbols, map markers, stamps, offline route cards, PWA icons, and install splash treatment; provenance/licence manifest
- **Acceptance criteria:**
  - The compass is a hand-drawn brass travel object with personality, not a human-like child or a derivative commercial character.
  - Chapter assets share line weight, texture, palette, lighting, and crop rules.
  - Murano/Burano assets distinguish boat travel, glassmaking, lace, and colorful island streets without stereotyping or using unlicensed commercial imagery.
  - Functional icons use self-hosted Phosphor Icons; the package version and MIT licence are recorded. Illustrations are original and have recorded generation/source provenance.
  - No emoji, placeholder boxes, or CSS/SVG approximations stand in for final visible assets.
  - Essential assets are locally bundled, optimized, and legible at 1× and 2×; the essential offline asset budget is agreed with Infra.
  - Every asset has alt-text intent: informative, decorative, or label-equivalent.

### UX-008 — Specify the adventure map and walk experience

- **Priority:** P0
- **Dependencies:** UX-003, UX-004; Story checkpoint coordinates and walk order; Infra Leaflet shell
- **Deliverables:** map style contract; marker and route states; checkpoint sheet behavior; foreground-location affordance; Google Maps handoff; offline illustrated-route fallback
- **Acceptance criteria:**
  - Current location, next checkpoint, completed checkpoint, locked chapter, and selected checkpoint are distinguishable without color alone.
  - “Where are we?” is a parent-triggered action; the UI never implies background tracking.
  - Tired Legs and Full Explorer clearly show approximate duration and mission count before starting.
  - Tile failure/offline mode replaces the live map with a simple chapter illustration plus ordered checkpoint list; missions remain playable.
  - OpenStreetMap attribution remains readable and unobstructed.
  - “Walk there” or “Drive there” names the external Google Maps handoff before leaving the PWA.
  - The lagoon-islands chapter supports ordered checkpoints and transport handoffs without treating boat movement as live location tracking.

### UX-009 — Design permission, connectivity, and recovery states

- **Priority:** P0
- **Dependencies:** UX-002, UX-004; Infra offline/location state model; Backend local-save states
- **Deliverables:** copy and presentation rules for first run, offline ready/not ready, tile unavailable, GPS request/denied/inaccurate/unavailable, local save success/failure, update available, and optional cloud backup states
- **Acceptance criteria:**
  - Permission requests explain the immediate benefit before the browser prompt and always offer “Play without location.”
  - No state blocks mission play solely because GPS, map tiles, mobile data, or Supabase is unavailable.
  - Offline status is calm and actionable, not styled as a failure when cached play is available.
  - Recovery copy uses parent-readable language and never exposes technical errors to children.
  - Update prompts cannot replace the frozen trip build mid-mission.

### UX-010 — Cover phone, browser, and installed-PWA layouts

- **Priority:** P0
- **Dependencies:** UX-003, UX-004; Infra app shell and PWA manifest
- **Deliverables:** phone-width, safe-area, keyboard, browser-vs-standalone, and portrait/landscape rules; install guidance for the actual phones
- **Acceptance criteria:**
  - Core flows work without horizontal scroll from 320×568 through 430×932 CSS px; tablet and desktop layouts are outside V1 design scope.
  - Portrait is optimized; landscape never hides the primary action or progress.
  - Sticky controls respect iOS/Android safe areas and browser chrome.
  - At 200% text zoom, content reflows without clipping essential labels or controls.
  - Install guidance is platform-specific, dismissible, and never required to play.

### UX-011 — Complete accessibility and child-safety review

- **Priority:** P0
- **Dependencies:** UX-002 through UX-010; Story safety review
- **Deliverables:** WCAG 2.2 AA checklist; keyboard and screen-reader order; read-aloud review; cognitive-load and outdoor-use checklist; safety copy audit
- **Acceptance criteria:**
  - All actions work with keyboard/switch-style navigation and expose useful names, roles, states, and errors.
  - Heading order and live announcements make mission progress understandable without sight.
  - Instructions avoid left/right-only directions, color-only clues, time pressure, running, unsafe crossings, and required ride participation.
  - Long words and Italian terms include parent-friendly pronunciation help only where useful.
  - Each screen can be understood in a glance, and each child-facing sentence is short enough to read aloud comfortably.

### UX-012 — Run visual QA and field-readiness validation

- **Priority:** P0
- **Dependencies:** implemented UX-001 through UX-011; Infra production-like build; complete Story content
- **Deliverables:** screenshot/state matrix; issue log with P0/P1 severity; child observation notes; signed visual freeze checklist
- **Acceptance criteria:**
  - Verify fresh setup, partial progress, completed chapter, all chapters, parent controls, offline, tile failure, GPS denied/inaccurate, loading, empty/error, reduced-motion, muted, and 200% text states.
  - Repeat chapter-map, compass, passport, final-ceremony, and reset checks with both three-chapter and four-chapter manifests.
  - Verify at minimum 320×568, 360×800, 390×844, and 430×932, then test on the actual family phone in browser and installed mode.
  - Outdoor test confirms readable contrast, reachable controls, understandable location states, and no reliance on subtle shadows or low-contrast textures.
  - Each child completes one representative role task with only normal parental reading help.
  - No clipped text, obstructed OpenStreetMap attribution, accidental destructive action, layout shift on asset load, or essential motion-only information remains.
  - Visual freeze is recorded before travel; only blocking fixes enter the frozen build.

### UX-013 — Add optional delight after the stable loop

- **Priority:** P1
- **Dependencies:** UX-012 passed with no P0 defects
- **Deliverables:** optional read-aloud controls, tiny sound set, secondary compass expressions, photo-mission camera handoff, and one hidden family easter egg
- **Acceptance criteria:**
  - Every enhancement is removable without changing progress or mission completion.
  - It works offline except for the external camera handoff and adds no account requirement.
  - Audio, photos, and animations remain opt-in and parent-controlled.

### UX-014 — Learn from the trip and generalize carefully

- **Priority:** P2
- **Dependencies:** trip observations; no changes to frozen travel build
- **Deliverables:** observed-friction report; retained/changed design decisions; reusable trip-theme and mission-pattern proposal
- **Acceptance criteria:**
  - Findings distinguish observed child behavior from adult assumptions.
  - Changes preserve cooperative play, local-first use, and parent control.
  - No generalized multi-family product work begins without a new privacy and scope decision.

## Critical path

`UX-001 → UX-002/UX-003 → UX-004 → UX-005/UX-006/UX-008/UX-009/UX-010 → UX-011 → UX-012`

UX-007 begins after UX-001 and runs in parallel once Story supplies the final mission inventory. UX-013 and UX-014 are outside the trip-ready critical path.

## Cross-lane inputs needed

- **Story:** final chapter tone, mission schema, role actions, factual content, checkpoint names, and safety wording.
- **Infra:** target-phone/browser matrix, asset-size budget, PWA lifecycle, offline/tile-failure signals, and performance measurements.
- **Backend:** local-save/error states, reset/delete behavior, content-version handling, and whether optional Supabase backup is enabled before travel.
