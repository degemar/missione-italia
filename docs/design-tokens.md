# Design-token contract

The machine source is [`design-tokens.json`](design-tokens.json). Token references use `{dot.path}` and must resolve inside that file. Values are CSS-ready unless a token says otherwise.

## Core palette and contrast intent

| Token | Value | Intent |
|---|---:|---|
| `color.base.paper` | `#FFF7DF` | warm stage canvas |
| `color.base.paperRaised` | `#FFFFFF` | raised reading surface |
| `color.base.ink` | `#062C45` | outdoor-critical text |
| `color.base.inkMuted` | `#405563` | secondary text; still AA on paper |
| `color.base.tomato` | `#B42E2B` | primary action / creativity |
| `color.base.lakeTeal` | `#005A5D` | water / wonder |
| `color.base.sunGold` | `#DFA500` | teamwork highlight with dark ink |
| `color.base.violet` | `#5C3A92` | curiosity / focus accent |

Essential text and controls meet WCAG 2.2 AA. Outdoor-critical body text targets 7:1: ink on paper/white, white on tomato/teal/violet, and ink on gold are the intended pairs. Texture, chapter tint, and shadow are never required to read a boundary or state.

Semantic status uses label + icon + shape as well as color. Error means a recoverable system problem, never a wrong child answer. `disabled` is reserved for genuinely unavailable actions; offline, denied location, manual completion, and skip do not disable mission play.

## Typography

- V1 display family: **Fredoka**, weights 600/700; self-host the exact approved files.
- V1 reading family: **Atkinson Hyperlegible Next**, weights 400/700; self-host the exact approved files.
- Both stacks include system fallbacks and must cover Spanish plus the small Italian phrase layer.
- Record exact file/version, source, and OFL-1.1 licence evidence in the UX-007 asset manifest before bundling.
- Child body/read-aloud text is 18–20 px. The 16 px size is for parent metadata only, never core child instructions.
- Text reflows at 200% zoom; labels are not converted into images or truncated.

## Geometry, touch, and layout

- Spacing follows a 4 px base with named steps from 4–64 px.
- Minimum interactive target: 48×48 CSS px, including icon-only close/back controls.
- Phone content inline inset: 16 px; reading measure: 34 characters; supported width: 320–430 CSS px.
- Sticky actions include `env(safe-area-inset-bottom)` and never rely on a fixed viewport height. Browser mode allows chrome expansion; standalone mode uses the same content contract with installed safe areas.
- Borders, not shadows alone, define interactive surfaces. Parent-only surfaces use `radius.controlParent` and an `ADULT` label; child surfaces use `radius.controlChild`.

## Roles and chapters

Roles always render icon + text label + geometric marker:

| Role | Phosphor icon name | Shape | Accent |
|---|---|---|---|
| Observador | `binoculars` | circle | tomato |
| Detective | `magnifying-glass` | diamond | violet |
| Navegante | `compass` | triangle | lake teal |

Chapter styling is a dictionary keyed by the manifest `chapter.id`, plus `semantic.chapter.default`. Code requests a token set by ID and falls back to `default`; it never selects by array index or assumes a chapter count. Progress segment count is `manifest.chapters.length`; the unscored epilogue is not a segment.

## Motion slots

`tap` (80 ms; 100 ms response ceiling), `fast` (150 ms), `standard` (220 ms), `slow` (300 ms), and `celebration` (1200 ms; skip available at 600 ms; hard stop 2500 ms) are named slots, not mandatory animation. Spatial offsets are 8/16 px; press scale is 0.98; no more than two elements move concurrently. Prefer opacity and transform. Reduced motion maps feedback/state changes to 80/100 ms opacity changes and all spatial/decorative slots to zero; state text, icon, focus, and live announcements remain. The normative choreography is in [`motion-and-celebration-system.md`](motion-and-celebration-system.md).

## Layer and state rules

Layers are `base` 0, `sticky` 10, `sheet` 20, `modal` 30, `toast` 40, and native browser permission UI above the app. Only one modal layer is active. Toasts do not cover the sticky primary action, safe area, or browser attribution.

See [`ux-screen-state-contract.md`](ux-screen-state-contract.md) for state ownership and [`component-behavior-contract.md`](component-behavior-contract.md) for component application.
