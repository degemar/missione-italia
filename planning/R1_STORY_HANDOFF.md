# R1 Story handoff — Spanish foundation

**Date:** 30 September 2026  
**Art direction:** Stamp Theatre  
**Result:** Spanish story assets and editorial parity review are complete for data/frontend integration. Independent native-speaker device review is retained as a release recommendation, not an R1 blocker.

## Delivered

| Scope | Runtime/source artifact | Coverage |
|---|---|---|
| UI, recovery, install, and Parent Corner copy | `src/i18n/locales/es.ts` | 249/249 stable UI keys; placeholder parity enforced |
| Powers and stamps | `src/i18n/locales/es-rewards.ts` | 4/4 powers and 6/6 stamps |
| Story and mission content | `public/content/locales/trip-manifest.es.json` | Opening/states, 4 chapters, excursion copy, 17/17 missions, and 6/6 variants |
| Italian learning layer | Same manifest overlay | Exactly 5 phrases with Spanish meaning, Spanish-oriented pronunciation aid, and gesture |
| Storyteller scripts/captions | `public/content/locales/narration.es.json` | 32/32 narrated segments; script and caption share the same text reference; autoplay disabled |
| Language, age, proper-name, rhythm, and safety policy | `planning/R1_SPANISH_LANGUAGE_CONTRACT.md` | Approved terminology and review rules recorded |

The English manifest remains unchanged and is the declared fallback. Spanish content uses stable chapter, mission, variant, role, choice, phrase, and source IDs rather than array positions. Save keys, completion enums, gameplay order, dates, facts, and source relationships were not translated or replaced.

## Contextual-safety revision

The R1 contract now keeps safety at real hazard or transition points instead of repeating generic supervision reminders through the story. Driving, roads, crowds, water/edges, permission, transport, booking, merchandise, and venue hazards remain explicit. Ordinary quiz, retry, celebration, and fallback copy keeps the narrative moving unless an adult has a concrete action.

## Evidence

- `node scripts/check-spanish-manifest-coverage.mjs` passes: **17 missions, 6 variants, 5 Italian phrases, and 32 exact-caption narration segments**.
- The checker requires every localized title, story, objective, location, role, choice, fact, completion line, fallback, and safety field present in the English source.
- `tests/frontend/spanish-locale.test.ts` proves exact UI key coverage and placeholder parity. Its focused run passed **250/250** when authored; the full suite passed **333 tests** before the final terminology-only adjustments.
- TypeScript typecheck passed after the final adjustments.
- A later local Vitest rerun was blocked at Vite startup by Windows sandbox `spawn EPERM`; this was an environment launch failure, not a test failure. The data coverage checker continued to pass.

## Task status

| Task | Status | Evidence |
|---|---|---|
| `ST-R10` | Complete | All specified UI/content categories have Spanish runtime artifacts. |
| `ST-R11` | Complete | Stable IDs and evidence labels preserved; role layers remain Vigía/Detective/Guía; facts and safety fields have complete keyed coverage. |
| `ST-R12` | Complete | 32 narrated story segments resolve script and caption from one identical Spanish source string. |
| `ST-R13` | Complete with release caveat | Editorial review and automated factual/safety structure checks passed. A native Spanish speaker has not yet signed off on idiom in the rendered app; schedule that independent check in R5. |

## Integration boundary

This lane did not wire locale selection, alter the loader, migrate saves, change gameplay, or add audio. Backend/data owns typed locale overlay contracts and validation. Frontend owns choosing `es` by default, falling back to `en`, rendering reward labels, and presenting the optional narration/caption controls.

## Recommended R5 native-review checklist

On a 320–430 px phone, a native Spanish speaker should read the opening, one mission per chapter, both excursion slots, the five Italian cards, destructive Parent Corner confirmations, and the epilogue aloud. Record only concrete corrections for idiom, line breaks, pronunciation, or ambiguous safety actors. No correction may change stable IDs, facts, sources, or completion behavior.
