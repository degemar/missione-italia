# R1 Spanish language contract

**Locale:** `es` (neutral, family-friendly Spanish)  
**Audience:** one adult reader and children aged 4, 7, and 9  
**Authority:** approved R0 sample flow plus the source-backed English manifest

## Voice

- Warm, adventurous, concrete, and lightly playful; never babyish.
- Address the children as **exploradores** and the family as **equipo**.
- Prefer short active sentences suitable for reading aloud outdoors.
- Use **vosotros** for shared child actions (`elegid`, `mirad`, `usad`) and **el adulto** for parent-only decisions. Avoid regional slang.
- Translate meaning, not English syntax. Keep place names and Italian names in their established form.
- Bussola remains **Bussola** and is treated as a friendly compass character.

## Rhythm and contextual safety

- Do not repeat generic adult-supervision reminders on ordinary story, quiz, celebration, and fallback screens.
- Place one concise safety cue at the genuine hazard or transition point: before driving, crossing, entering a crowd, approaching water or an edge, requesting permission, or handling tickets/routes.
- Once a flow has established the safe position, subsequent copy should continue the adventure without restating it.
- Parent-only controls remain clearly labelled, but child-facing prose mentions the adult only when the adult has a concrete action.
- Streamlining repetition must never remove a real prohibition or transfer a parent-only decision to a child.

## Canonical vocabulary

| Stable concept/ID | Spanish display term |
|---|---|
| `curiosity` | Curiosidad |
| `wonder` | Asombro |
| `creativity` | Creatividad |
| `teamwork` | Trabajo en equipo |
| `spotter` | Vigía |
| `detective` | Detective |
| `navigator` | Guía |
| `FACT` | HECHO |
| `TRADITION` | TRADICIÓN |
| `LEGEND` | LEYENDA |
| `OUR STORY` | NUESTRA HISTORIA |
| `completed` | completada |
| `manual` | resuelta de otra forma |
| `skipped` | guardada para luego |
| Passport | Pasaporte |
| Parent Corner | Rincón para adultos |

Stable IDs, enum values, source IDs, dates, completion states, and save keys remain untranslated.

## Proper names

Use the Spanish forms **Venecia**, **San Marcos**, **Puente de Rialto** and **lago de Garda** in prose. Preserve **Murano**, **Burano**, **Verona**, **Arena de Verona**, **Casa de Julieta**, **Adigio**, **Piazza Bra**, **Piazza delle Erbe**, **Ponte Pietra**, **Sigurtà**, **Borghetto**, **Sirmione**, **Lazise**, **Ponte Visconteo**, and official venue names when a translated official name is not established. Do not mechanically translate IDs or source titles.

## Five-phrase Italian layer

The layer contains exactly these five phrases; Spanish supplies all meaning.

| Italian | Spanish meaning | Parent pronunciation aid | Gesture |
|---|---|---|---|
| `ciao` | hola o adiós | chao | Un pequeño saludo con la mano. |
| `buongiorno` | buenos días | buón-yor-no | Dibujar un sol que sube con las manos. |
| `grazie` | gracias | grá-tsie | Poner una mano sobre el corazón. |
| `per favore` | por favor | per fa-vó-re | Abrir una palma con amabilidad. |
| `arrivederci` | adiós | arri-ve-dér-chi | Despedirse lentamente con la mano. |

Pronunciation aids are practical prompts for the adult, not phonetic claims or comic accents. Children never have to address a stranger.

## Age and accessibility layers

- **Age 4 / Vigía:** point, match, gesture, or choose an icon; reading is never required.
- **Age 7 / Detective:** compare two visible clues, notice a pattern, or choose a reason.
- **Age 9 / Guía:** read a short instruction or help the adult choose among already-safe options; never direct real travel.
- Every audible idea has an identical caption. Hearing, color perception, motion, reading speed, venue entry, GPS, tickets, and live data are never required.
- Retry, manual completion, and save-for-later language remain equal and non-shaming.

## Storyteller contract

- Narration is optional, user-triggered, and never autoplayed.
- The spoken script and displayed caption resolve from the same Spanish string; no paraphrased audio-only facts.
- Narrated scope is the opening story, each chapter opening/closing, every mission `storyBeat`, and every excursion-variant `storyBeat`.
- Buttons, safety instructions, answers, and volatile visitor information are not hidden inside narration.
- Bussola pronunciation note for the adult: `BÚS-so-la`. Italian phrase pronunciation remains confined to the five-phrase cards.

## Safety and factual parity

Every necessary Spanish safety cue must retain the actor and prohibition from English: adults control phones, routes, driving, tickets, and stopping decisions; children stay together and away from traffic, crowds, edges, water, exhibits, merchandise, and strangers. Apply each cue at the relevant hazard or transition rather than repeating it on every screen. `HECHO`, `TRADICIÓN`, `LEYENDA`, and `NUESTRA HISTORIA` must never be merged. Dates, quantities, place history, and source associations must not be strengthened or generalized during adaptation.

## Review rule

Automated coverage and parity checks can prove keys, IDs, placeholders, source links, phrase count, and field presence. They cannot certify native idiom. A native Spanish speaker should perform the final device read-aloud review before public release; until then, the locale is complete for integration but carries that explicit editorial caveat.
