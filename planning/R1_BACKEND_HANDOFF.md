# R1 Backend/data handoff

**Date:** 30 September 2026  
**Scope:** `BE-R10`–`BE-R12`  
**Result:** Complete. Local-first behavior is unchanged; no cloud, UI, route, or mission-ID work was added.

## Delivered

| Task | Result |
|---|---|
| `BE-R10` | Added typed Spanish locale-overlay and narration contracts, including exact-caption references, optional caption text, and optional content/audio asset IDs. Runtime validation rejects changed mission/chapter/variant IDs, caption drift, duplicate narration IDs, and unknown registered assets. |
| `BE-R11` | Advanced the save contract to schema 2 and replaced the fixed `language` field with `settings.preferredLocale`. New saves default to `es`. V1 saves migrate deterministically to `preferredLocale: en`, preserving their previous language value and all unrelated data; V0 saves migrate through both steps. |
| `BE-R12` | Added focused proof that migration and export/import preserve family members, role rotation, route, settings, locale, and earned mission/stamp progress. Reset retains family setup and locale while intentionally clearing mission progress/stamps, matching the existing reset contract. |

## Integration contract

- Frontend reads and writes `save.settings.preferredLocale`; supported values are `es` and `en`.
- `createDefaultSave()` produces Spanish (`es`) for a new family.
- An existing V1 save remains English after migration because V1 explicitly stored `language: en`; frontend may expose the language control without silently changing that preference.
- English base content remains the fallback. Spanish overlay keys must exactly match the stable base chapter, mission, and variant IDs.
- Narration keeps `autoplay: false`. With `captionPolicy: exact-script`, `captionRef` must equal `scriptRef`; a future audio file is linked by `audioAssetId` only after it exists in the asset register.
- Static stamps are still derived from stable resolved mission IDs. No stamp collection or mission ID was renamed.

## Evidence

- `npm run validate:content`: passed all **11 contract check groups** after aligning the independent validator with schema 2 and the `es`/`en` `preferredLocale` contract.
- Focused Vitest run: **4 files, 38 tests passed**.
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- Initial sandboxed Vitest startup hit the known Windows `spawn EPERM` restriction; the same focused command passed outside that restriction.

## Files

- `src/contracts/save-contract.ts`
- `src/storage/save-migrations.ts`
- `src/storage/save-validation.ts`
- `src/content/types.ts`
- `src/content/localized-content.ts`
- `src/app/game-controller.ts`
- `scripts/validate-contracts.mjs`
- `tests/backend/localized-content-contract.test.ts`
- `tests/backend/save-contract.test.ts`
- `tests/backend/transfer.test.ts`
- `tests/backend/repository.test.ts`
- `tests/fixtures/save/migration/v1.json`
- updated schema-2 save fixtures

## Frontend boundary

R1 Frontend may now implement locale resolution and the Parent Corner language control. It should not duplicate save migration logic or infer localized content by array position.
