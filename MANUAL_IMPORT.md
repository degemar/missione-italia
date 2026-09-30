# Manual personal-GitHub import

Codex does not connect to an account, create a remote, push, enable Pages, or deploy. Perform these steps from the personal account only.

## Import

1. Open the existing personal repository connected to the Supabase project. If that repository is for something else, create a dedicated **public** repository named `missione-italia`; GitHub Pages on the free plan publishes the site and its static files publicly.
2. Copy the source contents of this `missione-italia` folder into the target repository root. If the repository already contains files, do this on a temporary branch and review conflicts before merging. Do not copy `node_modules`, `dist`, parent-workspace files, `.env` files, private photos, or travel documents.
3. On a clean checkout, use Node 24.15.0 and run `npm ci` followed by `npm run verify`.
4. Commit `package-lock.json` with the source. Push to `main`. If the default branch has another name, replace `main` in both files under `.github/workflows/`.

## Base path

The checked-in default is `/missione-italia/`. If the repository slug differs, create the repository Actions variable `VITE_BASE_PATH` with `/<slug>/`. Use `/` only for `<owner>.github.io` or a custom domain. This is the single override used by Vite, content/asset URLs, the manifest, and the service worker.

## Enable Pages

1. Open **Settings → Pages** and set **Source** to **GitHub Actions**.
2. Run the `Deploy GitHub Pages` workflow or push to `main`.
3. Open the URL reported by the deploy job, refresh it, and confirm the platform shell loads.
4. In browser developer tools, confirm `manifest.webmanifest` and `sw.js` are under the configured base path and no request targets a site-root asset accidentally.

No repository secret or Supabase setting is needed. Do not add a GitHub token, Supabase secret key, or service-role key to browser variables.

## First release checks

- Complete one online load, then use the parent-facing install guidance.
- On the primary and backup phones, verify direct browser use, Home Screen installation, relaunch, update prompt behavior, and airplane-mode startup.
- Confirm there are no requests to analytics, Google Maps, OSM tiles, or Supabase during offline shell startup.

These phone and production-URL checks cannot be completed by the local package build and remain a manual release gate.

## Roll back

1. Identify the last known-good commit whose validation and device record passed.
2. In a clean checkout of that commit, run `npm ci` and `npm run verify`.
3. Redeploy that exact commit with `Deploy GitHub Pages` using `workflow_dispatch` after restoring it to `main`, or revert the broken commit and push the revert.
4. Open the production URL and accept the prompted update only when no mission transaction is active.

Never roll back by uploading an edited `dist` folder or by exposing a token locally.
