# Missione Italia

Portable, phone-first React PWA foundation for the family trip on 4–10 October 2026. The current UI is deliberately a platform shell; gameplay views are delivered in later waves.

## Public-data boundary

Everything committed here or deployed to GitHub Pages is public. Never add names, precise location, progress, photos, credentials, private travel documents, Supabase secrets, or service-role keys. Browser `VITE_*` values are public by design.

## Requirements

- Node 24.15.0
- npm 11.12.1

## Commands

```text
npm ci
npm run dev
npm run typecheck
npm run lint
npm run validate:content
npm test
npm run build
npm run preview -- --host 127.0.0.1
npm run verify
```

The default Pages base path is `/missione-italia/`. Override only `VITE_BASE_PATH` for a differently named project site or `/` for a user site/custom domain. The app builds with cloud configuration absent; `VITE_V1_CLOUD_BACKUP` defaults to `off`.

See `MANUAL_IMPORT.md` for the personal GitHub handoff and `docs/installing-the-app.md` for browser/PWA use.

