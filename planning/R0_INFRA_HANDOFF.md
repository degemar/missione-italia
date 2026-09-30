# R0 Infrastructure/licensing handoff

**Completed:** 30 September 2026  
**Tasks:** `INF-R01`, `INF-R02`, `INF-R03`  
**Scope:** planning and evidence only; no dependency, runtime, build, or app-content change.

## Deliverables

- [`ASSET_PROVENANCE_REGISTER.md`](ASSET_PROVENANCE_REGISTER.md) — immutable repository snapshots, the shipped Phosphor artifact, conservative source boundaries, concept-board hashes, and the mandatory file-level import template.
- [`R0_PERFORMANCE_BUDGET.md`](R0_PERFORMANCE_BUDGET.md) — measured V1 baseline and hard budgets for shell, precache, artwork, motion, and optional narration.
- [`../THIRD_PARTY_NOTICES.md`](../THIRD_PARTY_NOTICES.md) — corrected shipped-versus-candidate notices for every approved repository.

## Clearance result

- The only reviewed third-party material currently shipped is `@phosphor-icons/react@2.1.10` under MIT, locked by the npm integrity in `package-lock.json`.
- `awesome-inspiration` and Awesome Tailwind Templates remain inspiration-only. Their linked or embedded material is not cleared by directory/README language.
- shadcn/ui and Magic UI are MIT candidates, not installed or copied. Exact source files and dependencies must be pinned before R2.
- Sketch Illustrations remains file-level conditional: no SVG is approved until its exact path, revision, provenance, and subject rights are recorded.
- Lucide is a fallback candidate only; Simple Icons is blocked by default because brand rights are separate from the repository's CC0 status.
- Lagoon Lantern, Fold-Out Field Guide, and Stamp Theatre boards were visually inspected and hashed. They are internally generated concept artifacts, contain no imported third-party assets according to the UX handoff, and are prohibited from runtime use.

## Budget decision support

- V1 executable shell baseline is 119,287 bytes gzip; V2 hard limit is 221,687 bytes gzip.
- Treatment chapter-art ceilings: Lagoon Lantern 400 KiB, Fold-Out Field Guide 220 KiB, Stamp Theatre 140 KiB.
- All treatments can proceed to user selection under these gates. Stamp Theatre has the largest performance margin and lowest art-production risk; this supports, but does not replace, UX's recommendation.
- Optional audio is never first-load or default-precache content; the complete downloadable pack is capped at 8 MiB.

## Open product gate

R0 infrastructure is complete, but R0 as a whole remains open until the user:

1. selects Treatment 1, 2, or 3; and
2. approves the Spanish `VEN-01` sample copy.

After selection, R1 may begin. No reusable artwork has been chosen, so no third-party art clearance blocks the decision. Before R2 imports any file, its completed `CLEARED` provenance row and notice must land in the same change.
