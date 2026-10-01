# R3 UX and story implementation review

**Status:** implementation acceptance contract. `UX-R20` and `ST-R20` remain **pending implementation review** until migrated screens are inspected in the running app.

## Non-negotiable migration rules

- Preserve all current route IDs, mission IDs, completion rules, save behavior, back destination, scroll reset, focus target, offline banners, and parent hold gate.
- Migrate one screen family at a time. A screen may change its composition, not its meaning, action order, or persisted result.
- Spanish is the only runtime language. Italian appears only as optional, labelled phrase content.
- Use `StampCard`, `StampButton`, `StampMark`, and the registered original Bussola/motif/stamp assets. Do not introduce a generic dashboard, tourism stock art, a permanent mascot, new icon family, or decorative logo.

## Screen-by-screen acceptance criteria

| R3 work | Screen(s) | Required Stamp Theatre outcome | Behaviour/state checks |
|---|---|---|---|
| `FE-R30` | Welcome, setup, opening | Welcome is a single invitation scene with curious Bussola and one tomato action. Setup is a calm family-ticket sequence; each child slot has a clear selected avatar state and no dense form wall. Opening uses three finite paper-theatre beats. | Existing names, age bands, avatar choices, sound toggle, validation, save busy label, privacy note, and the three opening steps stay intact. Focus begins on the heading; submit errors retain input values. |
| `FE-R31` | Atlas, chapter | Atlas is a vertical route of distinct road, Venice, lagoon, and Verona chapter scenes. One current chapter is visually dominant; completed chapters show labelled stamps and unavailable chapters say why in text. Chapter is a place-specific curtain scene followed by a quiet mission list with one current mission focal point. | Chapter availability, manual unlock visibility, progress counts, passport and epilogue actions, excursion-parent message, variant mystery state, and mission routes remain identical. No route diagram is presented as live navigation. |
| `FE-R32` | Mission, story, eyes-up, challenge, fallback | Mission presents the clue as the hero, then small ticket metadata and equal role tickets. Story uses listening Bussola and short readable paper captions. Eyes-up removes nonessential chrome. Challenge uses large equal role tickets and pictorial/text-equivalent answer panels; fallback is a discreet adult sheet, not a child failure card. | Role reveal/check order, rotate/show-all adult actions, Italian phrase content, answer retry/correct state, completion gate, pause, manual completion, skip, and all safety text remain equivalent. Every selection and correct/retry state is named in text. |
| `FE-R33` | Celebration, passport, epilogue | Celebration begins with the committed result, then a finite stamp reveal and proud Bussola; skipped/manual results have equal dignity. Passport resembles a usable paper passport with visible labels beside every mark. Epilogue is a return-ticket finale, not a points summary. | Saved result is visible before animation; fact/explanation, stamp/power state, next destination, home, and epilogue actions preserve current rules. No celebration depends on audio or motion. |
| `FE-R34` | Parent Corner, loading, content error, install/storage/update/reset | Adult surfaces are squared, quiet utility panels visually separate from child theatre. Loading/error/offline states use the registered utility art with Spanish reason and recovery action. | Parent hold gate, parent return route, toggles, diagnostics, persistence request, install guidance, update deferral, reset/delete confirmations, and status announcements stay exact. |
| `FE-R35` | Shell and every migrated route | Shell is compact: back/passport/progress/adult entry are readable but do not outrank the current beat. Only the active story beat receives a motif/pose. | Back, return focus, scroll-to-top, offline/update banners, keyboard order, safe-area layout, PWA restart, and exact-screen recovery must be manually checked after each family migration. |

## Spanish reading and wrapping contract

- Child title: one idea, normally 2–5 words; may wrap to two lines, never truncate or shrink below 24 px on 320 px screens.
- Eyebrow/status: uppercase only when it remains a short label; never use all-caps for paragraphs, safety, or instructions.
- Child body: one action or fact per sentence; paragraphs no longer than 2 short sentences in the active beat. Keep source facts and safety wording intact.
- Button labels: explicit Spanish verbs, generally 1–3 words. Do not concatenate fragments or use English fallback strings.
- Role ticket: role name and child nickname remain on separate readable units; a long nickname wraps without covering its icon or selected state.
- Italian phrase: visible Italian, plain Spanish meaning, and optional pronunciation are separate fields. Italian is never required to continue.
- At 320 px and 200% text zoom, allow natural wrapping and normal document flow. Hide/crop only decorative outer motifs; never reduce text, clip labels, overlap the sticky action, or convert vital copy to tooltip-only content.
- Story and fact cards use Atkinson reading type. Fredoka is reserved for short titles, stamps, and no more than one short celebratory line.

## Responsive composition checks

| Width/state | Required result |
|---|---|
| 320 / 360 | 16 px (12 px only at <=350) inset, single column, one primary action, full-width role and answer tickets, 48 px targets, decorative art crops outside reading surfaces only. |
| 390 / 430 | Default theatre composition: one hero scene, one dominant action, chapter motif may sit beside short metadata; content column remains readable and never becomes a dashboard. |
| 768 | Center a 640 px child reading/action column. A passive motif or Passport summary may enter a side rail; no second interactive mission column. |
| 1024 | Center <=760 px action column with <=220 px passive side rail; dialogs <=560 px. Keep mission completion flow one column. |
| Orientation/safe area | Respect `env(safe-area-inset-*)`; sticky actions must not cover content and become normal-flow when large text or keyboard would obscure it. |

## Focus, motion, offline, and state review

- Initial focus lands on the visible `data-screen-heading`; back/primary/secondary controls follow visual reading order.
- All clickable cards have a real button or labelled control. Pressed, selected, disabled, loading, success, error, and offline states use text plus icon/shape, never color alone.
- Focus is the token 3 px blue ring outside a 2 px cream gap. Dialog/sheet focus traps, close action, and return focus remain present.
- Motion is opacity/transform only: maximum two moving elements; curtain/reveal <=600 ms, reward <=1.2 s. No looping decorative animation.
- With reduce motion active on first paint, Bussola pose, stamp, selected ticket, and committed result appear in their final static state immediately. Information and controls do not disappear.
- Offline-ready, offline-not-ready, storage recovery, save error, content error, and update-deferred messages remain visible and understandable without a network. Offline status cannot cover the primary action.
- Loading skeleton/art reserves its final aspect ratio. Error state uses the signal-cloud utility art plus a Spanish retry action; no blank screen or English technical copy.

## Explicit Stamp Theatre visual checks

- Canvas is cream, reading cards are solid white, primary child action is tomato, adult controls are squared/violet; bright red remains decorative only.
- Ink outlines, 24 px child cards, 16 px child surfaces, and 8 px adult surfaces follow the R2 token source; texture sits in registered vector art at low opacity, never beneath body copy.
- Bussola is used only as curious invitation, listening story, proud completion, or resting pause/return. Pose and needle direction communicate the moment; no human-like facial mascot is added.
- Road/Venice/lagoon/Verona motifs match the chapter and remain decorative. Stamps always have their Spanish reward label beside the mark.
- Phosphor Duotone/Bold is the only visible interface icon language. Every meaningful icon has adjacent text or an accessible name.
- The page must still read as a coherent adventure when all SVG art is unavailable, all motion is disabled, and sound is off.

## Review evidence required to close UX-R20 and ST-R20

1. Capture each migrated screen family at 320, 390, 430, 768, and 1024 px; include one 200% text-zoom and one reduced-motion capture.
2. Walk normal, paused, completed, manual, skipped, incorrect/retry, offline, storage-warning, loading, and error states that exist for the family.
3. Record Spanish wrap/content fixes separately from functional fixes; no untranslated, clipped, concatenated, or overly long child-facing copy remains.
4. Verify keyboard focus and return focus for each dialog/sheet, and confirm the live region announces only committed/recovery changes.
5. Re-run the existing contract, asset, and production/PWA checks after each merged screen family.

**Closure rule:** only after the evidence above is reviewed against this document may `UX-R20` and `ST-R20` be marked complete.

## Implementation review — 1 October 2026

**Result:** `UX-R20` and `ST-R20` remain **pending**. Source inspection confirms that R3 has migrated the primary child and adult screen families into the Stamp Theatre component/CSS layer without changing their action props or state contracts. `npm run typecheck` passes.

### Evidence observed

- `screens.tsx` now gives welcome, setup, opening, atlas, chapter, mission, story, eyes-up, challenge, celebration, passport, and epilogue distinct theatre stages; uses `StampCard`/`StampButton` where introduced; retains the existing Spanish `t(...)` copy, role/quiz/fallback/complete handlers, and `data-screen-heading` focus target.
- `AppShell.tsx` compacts the navigation, visible progress, Passport, and adult entry into the theatre shell while retaining the existing banner/update and parent-entry controls.
- `ParentCorner.tsx` is visually separated as an adult theatre surface while retaining current maintenance, storage, offline, update, and confirmation actions.
- `screens.css`, `app-shell-r3.css`, and `parent-corner-r3.css` supply stage-specific paper/ink/ticket styling, 320/390 layout treatment, safe-area padding for the parent sticky action, and reduced-motion overrides.

### Remaining closure gates

1. **Responsive evidence is incomplete.** The R3 CSS defines a 390 px atlas change but no explicit 768/1024 child-flow/side-rail rules. Capture and verify 320, 390, 430, 768, and 1024 px plus 200% text zoom; add only the responsive rules proven necessary.
2. **Motion does not yet meet the R2 contract.** Welcome, opening, atlas, story sparkles, and confetti use repeating animation. Replace decorative loops with finite transform/opacity moments (or remove them), keeping no more than two moving elements; then verify the static reduced-motion first paint.
3. **Utility states are not yet theatre-reviewed.** Loading and content-error screens still use the legacy utility composition, rather than the registered saved-ticket/signal-cloud treatment. Inspect offline, storage-warning, update, error, and PWA restart states live.
4. **Art provenance/runtime use needs confirmation.** The new Bussola stages render the registered PWA icon; the original R2 Bussola/motif source kit is not visibly registered as runtime screen art. Either register/export the intended R2 derivatives or explicitly approve the PWA icon as the finished visual source.
5. **Spanish editorial visual QA is pending.** Inspect actual mission, Italian-phrase, long nickname, retry, manual, skip, parent, and error states at target widths. Confirm no clipping, English-visible value, overly dense child paragraph, or obscured sticky action.
6. **Interaction QA is pending.** Walk back/return focus, parent dialog focus restoration, role/answer selected states, offline banner overlap, and exact-screen recovery in the running PWA.
