# R1.1 — Spanish-only handoff

Completed 1 October 2026.

- Runtime UI and story resolve only Spanish.
- Parent Corner has no language selector.
- Schema 3 migrates every prior save to `preferredLocale: "es"` while retaining family setup and progress.
- IndexedDB remains the offline source of truth; Supabase is intentionally deferred.
