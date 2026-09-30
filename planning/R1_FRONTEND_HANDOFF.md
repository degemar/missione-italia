# R1 Frontend handoff — Spanish runtime

**Date:** 30 September 2026  
**Scope:** `FE-R10`–`FE-R12`  
**Result:** Complete. The integrated R1 gate passed; R2 visual work was not started.

## Delivered

- Spanish is the default UI and story locale for new families; the initial HTML and install manifest use Spanish metadata.
- The validated Spanish manifest overlay is loaded during boot and applied by stable chapter, mission, variant, choice, fact, power, and stamp IDs.
- Parent Corner now switches between Español and English in place. The save, route, active Parent Corner screen, mission progress, and offline/cloud-off behavior remain unchanged.
- Migrated V1 saves stay English until the family explicitly changes the setting.
- UI and content fall back to English when a Spanish key or the Spanish content package is unavailable. Italian remains limited to the five intentional phrase cards.
- The switch updates `document.documentElement.lang` and persists `settings.preferredLocale`; no route reload or network runtime is introduced.
- Generic adult-supervision reminders were not added. Existing safety wording remains contextual to actual hazards and transitions.

## Main files

- `src/i18n/strings.ts`
- `src/content/content-localization.ts`
- `src/content/content-repository.ts`
- `src/content/content-urls.ts`
- `src/content/types.ts`
- `src/app/App.tsx`
- `src/app/app-state.ts`
- `src/components/ParentCorner.tsx`
- `tests/frontend/locale-runtime.test.ts`
- `tests/frontend/spanish-locale.test.ts`
- `tests/frontend/game-controller.test.ts`

## Validation

- `npm run typecheck`: passed.
- `npm run lint`: passed with zero warnings.
- `npm test`: **19 files, 345 tests passed**. After the final assertion-strengthening edits, the affected focused run also passed: **2 files, 8 tests**. The combined gate should still rerun the full suite after the backend validator fix.
- `npm run build`: passed; production PWA precache audit passed with **17 files, 1,291,465 bytes**.
- Final `npm run verify`: passed 30 September 2026 after the backend schema-2 validator correction.
  - Typecheck and lint passed with zero warnings.
  - All **11** content-contract check groups passed.
  - **19 test files, 345 tests** passed.
  - Production build and PWA precache audit passed: **17 files, 1,291,465 bytes**.

## R1 gate

Closed 30 September 2026. The complete existing app resolves Spanish for new families, preserves English and progress for migrated V1 saves, switches locale in place, and passes the integrated offline production gate.
