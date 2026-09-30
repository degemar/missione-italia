# R0 current-state UX audit

**Captured:** 30 September 2026  
**Surface:** live GitHub Pages build at 390 × 844 CSS px  
**Scope:** shared-phone child journey and the eight VEN-01 art-test beats

## Verdict

V1 has a sound, accessible interaction skeleton: one dominant action, strong contrast, large controls, explicit adult boundaries, cooperative roles, safe eyes-up language and reliable offline/save status. It feels operational rather than magical because global utility chrome persists through every beat, most states are long text inside similar outlined containers, and destination/story identity is carried almost entirely by copy.

The redesign should preserve the state model and safety behavior, simplify the shell, and invest visual energy only in the current story beat.

## Flow evidence

| Step | Captured state | Health | Evidence-based finding | R0 decision |
|---|---|---|---|---|
| 1 | Atlas / chapter selection | Fair | Progress and chapter order are clear, but a passport action, brand block, adult gate and offline banner consume much of the first viewport before the adventure begins. Full chapter cards create a long, repetitive scroll. | Preserve progress/order; condense utilities; redesign chapter art and active-story emphasis. |
| 2 | Chapter | Fair | Chapter title and mission availability are understandable. Long introduction copy and near-identical mission cards make place, mood and narrative progression hard to distinguish at a glance. | Preserve manifest-driven list; shorten visible copy; give one active mission a stronger story focal point. |
| 3 | Mission card | Good | Duration, place, shared roles and a sticky primary action are visible. The hierarchy is clear, but the mission reads as a form and Bussola has no visual storytelling role. | Preserve anatomy and sticky action; make the clue the visual hero; keep metadata secondary. |
| 4 | Bussola story | Fair | Read-aloud copy and safety section are explicit and legible. A large text panel fills the viewport; there is no narrator portrait, caption/audio control or visual beat to help the youngest child follow. | Preserve text and safety meaning; split narration into short caption beats; introduce Bussola once, not as decoration on every screen. |
| 5 | Eyes-up | Good | The screen removes task complexity and makes the real-world handoff clear. Persistent utility chrome still competes with the safety handoff. | Preserve this minimal state; hide nonessential utilities; keep one return action. |
| 6 | Role check-in / quiz | Good structurally | Roles are equal, named and color-plus-icon coded; completion is gated correctly. Adult controls and the disabled action occupy significant space. The VEN-01 visual-choice quiz is specified in Story but not available in the captured V1 mission. | Preserve role equality and explicit check; reveal one role at a time; make quiz choices large, pictorial and text-equivalent. |
| 7 | Celebration | Fair | Save success, completion and next action are unambiguous. The reward is a generic tall card with no authored family-stamp moment or destination-specific visual memory. | Preserve immediate committed result; redesign as a finite stamp scene with text present at frame zero. |
| 8 | Fallback / reduced motion | Contract only | The Story handoff defines safe alternatives and instant state changes, but this state could not be reached in the captured representative mission. Screenshot evidence cannot prove runtime reduced-motion behavior. | Give the alternative equal visual dignity; never present it as failure; verify behavior during R2/R5. |

## Preserve, simplify, redesign

### Preserve

- Stable chapter/mission/choice IDs, save semantics and completion rules.
- One dominant action, 48 px targets, strong outlines and high-contrast reading surfaces.
- Adult gate, offline/save visibility, safe eyes-up wording and cooperative role equality.
- Progress as story progress—not navigation, points or live location.
- Persistent text result before optional celebration motion.

### Simplify

- Collapse passport, global progress, adult entry and offline status into a compact shell; expand them only when relevant.
- Replace repeated full-width cards with one focused current beat and a quiet continuation list.
- Shorten child-facing visible copy to the Story handoff limits; put parent detail behind an explicit ADULT affordance.
- Reduce borders and surfaces; use spacing and typography before another container.
- Keep Bussola to story, help and celebration moments instead of persistent mascot chrome.

### Redesign

- Place-specific chapter art, Bussola’s narrator presence, family stamp and quiz objects.
- A coherent eight-beat visual progression with one memorable transition signature.
- Spanish-first layout that also survives longer English fallback strings and 200% zoom.
- Caption/audio anatomy with no autoplay; text remains complete without sound.
- Equal-quality fallback and reduced-motion states.

## Accessibility and evidence limits

The audit inspected visible hierarchy, target sizing, contrast intent, copy density and the keyboard/screen-reader-facing labels exposed by the browser. It did **not** verify WCAG conformance, 200% zoom, switch control, screen-reader reading order, bright-sun use, reduced-motion runtime, color contrast ratios, frame rate or the physical family phone. These remain acceptance checks for R2/R5.

