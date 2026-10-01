# R2 UX handoff — Stamp Theatre

**Status:** UX-R10 to UX-R13 complete. This is the implementation contract for R2 frontend and infrastructure work. It is Spanish-only and does not alter mission IDs, completion, saves, or navigation.

## UX-R10 — frozen visual tokens

[`docs/design-tokens.json`](../docs/design-tokens.json) is now the machine source at version `0.2.0`.

| Area | Decision |
|---|---|
| Canvas and ink | Cream `#FFF7DF`, deep ink `#062C45`, solid white reading cards. Paper texture is an illustration-only overlay at <= 8% opacity and never sits beneath copy. |
| Stage accents | Accessible tomato `#B42E2B` is the primary actionable red. Bright stage red `#E7342C` is decorative only. Teal, violet and sun identify places/roles only when label + icon/shape also appear. |
| Type | Fredoka 600/700 for short display moments; Atkinson Hyperlegible Next 400/700 for all reading and controls; system fallbacks remain until font files are licence-cleared. |
| Geometry | 4px spacing grid; 16px standard phone inset; 48px minimum target; child surfaces 16px radius, adult surfaces 8px radius, cards 24px radius. |
| Icon rule | Phosphor Duotone/Bold, ink-colored, 24px normally and 28–32px only for hero/role emphasis. Icons never carry state alone. |
| Texture | Original uneven ink belongs inside the four R2 vector sheets, not CSS noise or a text background. |
| Motion | Curtain/reveal, active-role spotlight, ticket perforation, and finite stamp celebration use only opacity/transform; <=2 moving elements, <=600ms except 1.2s reward. Reduced motion removes spatial/decorative movement. |

## UX-R11 — primitive and state contract

shadcn supplies interaction semantics only; final geometry and appearance follow the tokens above.

| Primitive | Normal / pressed / focus | Disabled / loading | Success / error / offline / reduced motion |
|---|---|---|---|
| Primary child button | Tomato fill, cream label; pressed scale `.98`; 3px focus ring with 3px cream gap | Disabled only when no action exists; loading retains label and adds progress text | Success becomes a stamped confirmation; errors name a recoverable action; offline says saved locally; no motion changes information |
| Quiet child button | White/cream surface, 2px ink border; pressed ink offset/shadow reduction | Same footprint and readable label | Inline state message below, never color-only |
| Adult control | Squared 8px corners, lock icon, `ADULTO` label | Disabled only for genuinely unavailable parent action | Parent errors use plain recovery copy; no child-style celebration |
| Chapter card | 2px ink frame, semantic motif, title and progress | Skeleton reserves final image ratio; no layout jump | Completed uses stamp + label; unavailable chapter uses a clear "Próximamente" state, not a lock-only card |
| Role ticket | Circle/diamond/triangle + icon + Spanish role name | Ticket remains selectable while a different child is active | Selected ticket receives spotlight border; reduce mode changes border immediately |
| Quiz tile | Equal-width, full-label panels; pressed inset | Disabled only after the answer is resolved | Correct state names the reason; retry is neutral and never framed as failure; offline behavior equals online |
| Dialog/sheet/toast | Focus trap, visible close, return focus | Loading keeps close where cancel is safe | Error uses utility-state illustration plus direct retry; toast never covers primary sticky action |
| Progress/passport stamp | Static label and count always visible | No disabled version | Celebration ends in the same visible stamp and count; reduced mode begins there |

All focus indicators are 3px `focusBlue` outside a 2px cream gap. Keyboard order follows visual reading order; every dialog has one initial logical focus target; live messages announce only completion/recovery, not decorative changes.

## UX-R12 — original art kit

The original vector source sheets live in [`planning/r2-stamp-theatre-art`](r2-stamp-theatre-art), with hashes and export rules in [`R2_UX_ASSET_MANIFEST.json`](R2_UX_ASSET_MANIFEST.json). They are not yet public/runtime files: that prevents an unregistered source master from being cached before the consuming screen and asset checks exist.

| Kit | Intended moments |
|---|---|
| Bussola poses | Curious: invitation; proud: completed clue; listening: story or sound clue; resting: pause/return. Personality comes only from compass tilt and needle direction. |
| Chapter motifs | Road ribbon/tunnel rhythm; Venice arch/ripple; lagoon glass/lace/boat pattern; Verona arch/bridge rhythm. They are place-specific but decorative, not maps or instructions. |
| Stamp set | Six repeatable rewards: ojo de águila, creador de patrones, detective de historias, navegante amable, explorador de sonidos, chispa de equipo. Use visible reward labels beside the mark. |
| Utility states | Saved ticket for empty/pause; signal cloud for recoverable load/offline errors. Always pair with Spanish reason + next action. |

No third-party illustration, font, logo, or template was imported; `THIRD_PARTY_NOTICES.md` needs no update for this UX-only source kit. Infra must create output derivatives, add provenance and hashes, register them, and then allow frontend consumption.

## UX-R13 — responsive composition

| Width | Composition rule |
|---:|---|
| 320px | 16px inset; one-column cards; 48px controls; headline max 32px; motifs may crop only decorative outer margin. |
| 360px | Same single column; role/quiz tickets remain full-width; stage header may put progress beside title only if labels remain whole. |
| 390px | Default phone composition: 16px inset, 24px card radius, one dominant action; chapter motif can sit alongside short metadata. |
| 430px | Default phone composition with max 398px readable content; no dense two-column quiz answers. |
| 768px | Centered 640px reading column; a nonessential motif or passive Passport summary may occupy a side rail; child action flow remains one column. |
| 1024px | Centered 760px action column plus <=220px passive side rail. Dialogs max 560px. No desktop dashboard, multi-column mission flow, or smaller touch targets. |

At 200% text zoom: hide/defer decorative motif before reducing text; title wraps naturally; sticky action becomes normal-flow if it would cover content. Every screen reserves image aspect ratio, supports browser/PWA safe areas, and has a reduced-motion final state on first paint.

## Gate evidence

- Token JSON parses and all references remain local.
- Four original SVG source sheets total **5,341 bytes**; no embedded raster, font, script, or third-party source.
- No runtime behavior, global CSS, App component, dependency, service-worker, or asset-register change is included in this handoff.
- R2 remains blocked on INF-R10–R12 and FE-R20–R22 before the primitive/art gate can close.
