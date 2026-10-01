# R2 infrastructure handoff

**Status:** complete on 1 October 2026.

- No new dependency was necessary. R2 continues to use React 19.3.0, Vite 8.3.1, Workbox 7.4.1, and `@phosphor-icons/react` 2.1.10; exact licence/version records are in `THIRD_PARTY_NOTICES.md`.
- `npm run validate:assets` is now part of `npm run validate:content`. It checks runtime filenames, media types, SHA-256 hashes, dimensions, byte budgets, provenance, alt intent, orphan files/policy rows, and direct unregistered asset references.
- SVG checks reject executable/embedded/remote/font content and enforce an explicit path budget. WebP headers are dimension-checked. MP3/Ogg signatures and byte budgets are checked; narration timing and loudness remain future production provenance requirements.
- `public/content/assets.json` now records each asset's alt intent and provenance. The one visible current icon has a Spanish alternative in `config/runtime-asset-policy.json`; PWA-only icons are label-equivalent and the source master is not rendered.

Run before registering any R2/R3 asset:

```text
npm run validate:content
npm run build
```
