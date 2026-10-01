# Illustration and asset production contract

**Task:** UX-007  
**Direction:** Living Storybook Atlas  
**Runtime register:** `public/content/assets.json` contains existing files only  
**Status:** PWA icon family exists; all in-app story illustrations and fonts listed as pending remain ungenerated/unbundled

This document is the production brief and inventory. A planned row is not a file, licensed deliverable, or runtime asset. Do not add its ID to `assets.json`, a mission `assetIds` array, or the precache until the exact file exists and passes the provenance, crop, size, hash, and visual checks below.

## One illustration system

Use the existing Bussola app icon as the palette/finish anchor, not as a commercial style reference:

- original flat-polished raster storybook illustration; adventurous, warm, and not babyish;
- crisp dark-ink silhouette; line weight equivalent to 3 px at 1× / 6 px at 2×;
- warm paper grain at low strength on non-text areas; no distress behind UI copy;
- upper-left warm light and one restrained down-right shadow contained inside the crop;
- core palette: ink `#14212B`, paper `#FFF8E7`, lake teal `#005A5D`, tomato `#A83224`, sun gold `#DFA500`, violet `#5C3A92`; brass may use `#F4C04E`, `#D78A1C`, and `#784116`;
- one clear focal object, large readable shapes, no tiny visual riddles, embedded words, numbers, logos, watermarks, emoji, UI controls, or photorealism;
- no copied tourism artwork, shop patterns, commercial glass/lace designs, copyrighted characters, stereotypes, residents as scenery, or exact navigation claims.

Bussola is a brass travel compass, not a human-like child: no face, eyes, mouth, arms, legs, clothing, or gender coding. Personality comes from needle angle, object tilt, and composition. Chapter art contains objects and place motifs, not caricatured people.

## Existing verified assets

Hashes, dimensions, and byte sizes were re-read from disk on 29 September 2026. The source was also visually inspected: a complete brass compass with cream face, dark-ink outline, tomato needle, and generous margin on a full-bleed deep-teal textured square.

| Runtime ID / evidence | File | Pixels | Bytes | SHA-256 | Status and alt intent |
|---|---|---:|---:|---|---|
| `bussola-app-icon-source` | `public/assets/brand/bussola-app-icon-source.png` | 1254×1254 | 2,082,101 | `92ce7573bae68f6c336b5745debdc3f01375b378146f2e034238ef91fab19a6d` | Existing source master; not precached and not rendered in-app; no alt |
| `bussola-app-icon-192` | `public/assets/brand/pwa-192x192.png` | 192×192 | 45,752 | `46255405ae186b77aec69940094a8c06af2cb79babb190b328092044a3a3f9c5` | Existing PWA any-purpose; OS app name is label-equivalent |
| `bussola-app-icon-512` | `public/assets/brand/pwa-512x512.png` | 512×512 | 313,549 | `df3798f06f4265942b6ee771984a8abb7f0b7108769fbdfedbf1adeebd6850bb` | Existing PWA any-purpose; OS app name is label-equivalent |
| `bussola-app-icon-maskable-512` | `public/assets/brand/pwa-maskable-512x512.png` | 512×512 | 313,549 | `df3798f06f4265942b6ee771984a8abb7f0b7108769fbdfedbf1adeebd6850bb` | Existing PWA maskable; complete composition is inside central safe area |
| `bussola-app-icon-apple-touch` | `public/assets/brand/apple-touch-icon.png` | 180×180 | 40,889 | `895bdcb2f06db31d3c3af696cd78ab9d8573f3a48e067c5eda7b1b01c5f0f894` | Existing Apple touch icon; OS app name is label-equivalent |

Existing provenance: OpenAI built-in image generation plus one crop-safety edit on 29 September 2026; no external source assets; exact final prompt is recorded in `public/assets/brand/README.md`. Pillow `11.3.0` created full-frame Lanczos derivatives with no crop. The two 512 px hashes are intentionally identical. `public/content/assets.json` currently matches all five files; no runtime asset-register edit is needed in this wave.

## Installed functional icon evidence

| Package | Installed/locked version | Licence evidence | Use boundary |
|---|---:|---|---|
| `@phosphor-icons/react` | `2.1.10` | installed `node_modules/@phosphor-icons/react/LICENSE`, MIT, copyright 2020 Phosphor Icons | Controls, roles, markers, completion/status only; locally bundled by Vite, no CDN |

Verified exports: `Binoculars`, `MagnifyingGlass`, `Compass`, `MapPin`, `MapPinLine`, `CheckCircle`, `LockKey`, `Crosshair`, `BookmarkSimple`, and `HandTap`. Icons use visible text plus the geometric shapes in `design-tokens.json`; icons are `aria-hidden` when adjacent text supplies the name.

## Production inventory

### Original raster assets still to generate

| Asset family / runtime paths | Source master | Runtime 1× / 2× | Crop and use | Alt intent | Per-file raw cap |
|---|---:|---:|---|---|---:|
| Bussola shared character: `assets/story/bussola-neutral-256.webp`, `...-512.webp` | 1536×1536 transparent PNG | 256×256 / 512×512 WebP alpha | Full square, 12% transparent safe margin; same asset in Mission, Celebration, Atlas, Passport | Informative in first introduction: “Bussola, a brass compass with a red needle.” Decorative later when named in adjacent text | 45 / 110 KiB |
| Road chapter/offline card: `chapter-road-400.webp`, `...-800.webp` | 1600×1000 PNG, 16:10 | 400×250 / 800×500 WebP | No runtime crop; focal motifs inside central 84%; reused above manifest-driven offline mission list | Decorative; title/list carry meaning | 70 / 160 KiB |
| Venice chapter/offline card: `chapter-venice-400.webp`, `...-800.webp` | same | same | same | Decorative | 70 / 160 KiB |
| Lagoon Islands chapter/offline card: `chapter-lagoon-islands-400.webp`, `...-800.webp` | same | same | same | Decorative | 70 / 160 KiB |
| Verona chapter/offline card: `chapter-verona-400.webp`, `...-800.webp` | same | same | same | Decorative | 70 / 160 KiB |
| Epilogue: `epilogue-home-arrow-400.webp`, `...-800.webp` | same | same | No score/power motif; full-frame 16:10 | Decorative; epilogue text explains the home arrow | 70 / 160 KiB |
| Six stamps: `stamp-{id}-96.webp`, `...-192.webp` | six 1024×1024 transparent PNGs | 96×96 / 192×192 WebP alpha | Circular silhouette inside central 82%; never crop | Decorative beside always-visible stamp label; if used alone, alt is exact reward label | 12 / 28 KiB each |

The six exact stamp IDs are `eagle-eye`, `pattern-maker`, `story-sleuth`, `kind-navigator`, `sound-scout`, and `team-spark`. Repeated stamp types reuse the same asset; do not create mission-specific badges.

### No new raster required

| Need | Production treatment |
|---|---|
| Role symbols | Actual Phosphor `Binoculars`, `MagnifyingGlass`, and `Compass`, always with Spotter/Detective/Navigator label and circle/diamond/triangle |
| Map/checkpoint markers | Phosphor `Crosshair`, `MapPin`, `MapPinLine`, `CheckCircle`, and `LockKey` plus text/number/shape; no illustrated pin asset |
| Offline route cards | Reuse the matching chapter 16:10 art above a dynamic ordered manifest list. Art contains no route labels, dots, or exact geography, so three/four chapters and content updates remain safe |
| Install splash | No standalone splash raster. Current manifest uses the verified icon family with background `#FFF8E7` and theme `#005A5D`; browsers/OS compose launch treatment |
| PWA/install icons | Existing verified files only; do not regenerate unless the source/provenance changes |

### Fonts still absent

Fredoka and Atkinson Hyperlegible Next font binaries are not present and are not registered. Before bundling, acquire exact self-hostable Latin/Italian WOFF2 files from their authoritative distribution, record file/version/source/SHA-256 and OFL-1.1 text, then add only those real files to the runtime register. Reserve at most 220 KiB total. Until then the declared system fallbacks remain the honest runtime behavior.

## Exact generation briefs

Use no external tourism/commercial reference image. Save each final prompt verbatim with the generated master. Generate masters first; approve the master before deriving runtime sizes.

### Bussola shared character

Reference only `public/assets/brand/bussola-app-icon-source.png` (SHA-256 above).

> Create an original transparent-background raster cutout of the same Missione Italia brass travel compass shown in the provided app-icon reference. Preserve its complete top loop, warm brass body, cream paper face, crisp dark-ink outline, dark-teal cardinal marks, and tomato-red needle. Give it gentle personality only through a slight eight-degree object tilt and a mildly wobbly needle angle; add no eyes, mouth, face, limbs, clothes, letters, numbers, logo, landmark, extra object, watermark, or text. Flat-polished children's travel-storybook finish, subtle paper grain on the compass face, upper-left warm light, one soft contained down-right shadow. Center the complete compass inside the middle 76 percent of a square canvas with at least 12 percent transparent margin on every side. No background color, no crop, no photorealism, no 3D render, no commercial character style.

### Chapter and epilogue base prompt

For every row below, use this base followed by the exact subject clause.

> Create an original 16:10 raster illustration for Missione Italia's Living Storybook Atlas. Flat-polished children's travel-storybook style, warm paper texture, crisp dark-ink outlines, large readable shapes, upper-left warm light, restrained down-right shadows, adventurous but calm and not babyish. Use ink #14212B, paper #FFF8E7, lake teal #005A5D, tomato #A83224, sun gold #DFA500, violet #5C3A92, and warm brass accents. Keep every essential motif inside the central 84 percent and leave a quiet 8 percent edge on all sides. No people, faces, text, letters, numbers, flags, logos, brands, watermark, UI, route directions, exact map, photorealism, 3D render, emoji, copyrighted character, or copied tourism/commercial artwork.

| Asset | Exact subject clause appended to the base |
|---|---|
| Road | “Show a folded abstract route ribbon, three neutral clue cards, and a repeated dark-light tunnel-arch rhythm. The scene suggests safe seated noticing without showing a driver, moving phone use, named road, road sign, licence plate, border logo, or exact tunnel.” |
| Venice | “Show an original small winged-lion silhouette, a stone arch, water ripples, and two simple working-boat silhouettes doing different jobs. Keep the viewpoint calm and safely away from water edges; no crowd, gondola branding, exact building, or transport instruction.” |
| Lagoon Islands | “Clearly combine four distinct motifs: a small lagoon boat, original translucent glass shapes, an original lace-like geometric rhythm, and a row of colourful island façades. Copy no real glass object, lace pattern, shop display, transit logo, house, or resident; show no furnace or merchandise handling.” |
| Verona | “Combine repeating Roman-style arches, a five-span stone-bridge rhythm, one blank message ribbon, and three path marks converging around a tiny brass compass motif. Exterior atmosphere only; no Juliet statue, balcony recreation, romance caricature, crowd, ticket, or venue interior.” |
| Epilogue | “Show a calm brass home arrow beside one earned blank stamp silhouette, a folded route card with no markings, and an abstract Alpine horizon. The mood is quiet closure; no score, new power, GPS trail, exact Basel map, road, or navigation instruction.” |

### Stamp base prompt

Use this base followed by one subject clause. Produce six separate masters, not a sprite sheet.

> Create one original circular travel-stamp illustration for Missione Italia on a transparent square canvas. Flat ink-and-paper storybook style matching the Bussola compass: crisp #14212B outline, warm paper and limited tomato/teal/gold/violet accents, large simple silhouette, subtle uneven ink pressure, no text, letters, numbers, logo, watermark, emoji, face, character, score, ribbon, star rating, photorealism, or copied badge design. Keep the full mark inside the central 82 percent with transparent margin; readable at 96 pixels.

| Stamp ID | Exact subject clause appended to the base |
|---|---|
| `eagle-eye` | “Use an original feather-shaped viewing lens framing one simple eye motif; observant, not fierce.” |
| `pattern-maker` | “Use three bold geometric tiles where one repeated shape changes once.” |
| `story-sleuth` | “Use four small layered story cards with distinct dot, wave, spiral, and compass marks plus a small lens; no written evidence labels.” |
| `kind-navigator` | “Use a small compass rose surrounded by three linked path dots that stay together; no real route arrow.” |
| `sound-scout` | “Use three calm ripple rings meeting a small listening-shell shape; no musical note or recording device.” |
| `team-spark` | “Use a circle, diamond, and triangle converging into one gentle central spark; all three shapes remain visible and equal.” |

## Derivative, crop, and runtime rules

- Keep source masters outside `public/` in the approved art-source archive; publish only optimized derivatives and provenance records. The existing Bussola icon source is the documented exception.
- Convert to sRGB, strip nonessential metadata, and export WebP with visually lossless alpha or quality 82–86 for opaque art. Never upscale a runtime derivative.
- Derive 1× and 2× from the same approved master using full-frame Lanczos resize. No independent regeneration, stretch, smart crop, or subject repositioning between densities.
- Render with explicit width/height or `aspect-ratio` to prevent layout shift. Use `srcset` density selection; 1× must remain crisp and identifiable outdoors.
- Chapter/offline art is always full-frame 16:10 with `object-fit: contain`; dynamic labels and checkpoint order sit outside the image.
- V1 UI uses the approved light paper palette. Do not invert, recolor, filter, or generate a dark story-art variant. Full-bleed teal PWA icons remain unchanged in light/dark OS launch surfaces; future dark UI must place story art on a paper surface.

## Offline budget

Current verified production precache is 1,046,361 raw bytes / 813,553 gzip bytes across 15 entries. The Infra hard guard is 5 MiB per precache candidate; UX adds a stricter whole-app target:

| Budget | Raw cap |
|---|---:|
| New P0 story art, six stamps, and self-hosted fonts | 2 MiB total |
| Reserved future code/content growth | 512 KiB |
| Target complete trip precache | 4 MiB total |
| Optional P1 sound | 96 KiB total, still inside the 4 MiB target |

The per-file caps above consume at most about 1.51 MiB for raster art plus 220 KiB for fonts (about 1.73 MiB total), leaving conversion variance inside the 2 MiB allocation. `npm run build` and the precache inventory are the release truth; oversize work is recompressed or removed, never silently excluded when marked offline-critical.

## Provenance and registration gate

For each new asset, record in a sidecar before registration:

1. stable asset ID, intended screens, alt intent, and offline-critical decision;
2. final prompt, generation tool/model/version, UTC generation date, operator, and every input file with SHA-256;
3. source-master dimensions/hash, human selection/edit/crop history, and confirmation that no external source asset was used;
4. project-use licence statement, plus third-party licence/source where applicable;
5. derivative tool/version, exact crop box (normally full-frame), sizes, byte counts, and SHA-256 hashes;
6. visual QA at 1×/2×, 320–430 CSS px, bright light, 200% text context, reduced motion, and light/dark OS launch surfaces.

Only then:

- copy real runtime derivatives to `public/assets/...`;
- add only existing derivative IDs/paths/hashes/licences to `public/content/assets.json`;
- add manifest `assetIds` only where that registered asset is actually consumed;
- run content validation, build, precache audit, missing-file/hash checks, and visual QA.

## R2 deterministic registration gate

`npm run validate:assets` is the mechanical gate for every registered runtime asset. It rejects a missing or duplicate policy record, orphaned media file, unregistered app reference, filename outside lowercase kebab-case, media-type/extension mismatch, hash drift, byte or dimension overflow, absent provenance, or missing alt intent. Informative assets additionally require Spanish `altText` in `config/runtime-asset-policy.json`.

SVGs must be self-contained: no script, `foreignObject`, raster image, embedded/remote data, font, or style payload; their declared path budget is enforced. WebP dimensions are read from the file header. MP3/Ogg files must match their container signature and receive explicit byte and maximum-duration budgets plus a caption reference; duration/loudness/caption timing remain required provenance fields before audio registration.

No planned filename in this contract is a placeholder to render. Until approved art exists, the implementation uses text plus actual licensed functional icons and must not draw substitutes with emoji, CSS, HTML, handwritten SVG, or empty boxes.
