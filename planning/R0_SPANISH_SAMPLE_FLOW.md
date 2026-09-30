# R0 representative Spanish sample flow

**Task:** `ST-R03`  
**Art-test flow:** Venice chapter → `VEN-01` → story → eyes-up action → quiz → celebration.  
**Contract:** `VEN-01`, `venice`, `wonder`, `eagle-eye`, choice IDs and completion states remain unchanged.

## 1. Chapter card

**Eyebrow:** Capítulo de Asombro  
**Title:** La ciudad que flota  
**Opening:** Bussola despierta en una ciudad donde los barcos hacen trabajos de calle y los caminos de piedra cruzan el agua. Para recuperar el Asombro, el equipo buscará un león, leerá un puente, comparará barcos y hará una parada para escuchar Venecia.

**Progress:** 0 de 4 pistas  
**Primary action:** Empezar capítulo

## 2. Mission card — `VEN-01`

**Eyebrow:** Tarjeta de misión  
**Title:** Encuentra el león alado  
**Place:** Cualquier león alado visible desde un lugar seguro de Venecia  
**Time/energy:** 8 min · energía baja  
**Objective:** Encontrar un león alado desde un lugar público y seguro.

**Team roles**

- **Vigía:** señala las alas.
- **Detective:** elige qué hace especial a este león.
- **Guía:** confirma con el adulto que todo el equipo puede detenerse con seguridad.

**Primary action:** Leer la historia  
**Parent alternative:** Resolver de otra forma / Guardar para luego

## 3. Bussola story

**Eyebrow:** Leer en voz alta  
**Title:** La historia de Bussola

> Bussola ha llegado a Venecia, pero el Asombro sigue escondido. Un león puede ayudar… aunque el león de esta ciudad lleva alas. El equipo se detiene en un lugar público y seguro. El Vigía busca las alas, el Detective descubre qué hace especial al animal y el Guía comprueba con el adulto que todos pueden mirar sin acercarse al agua ni cruzar entre la gente.

**Safety first:** El equipo se detiene junto. El adulto sostiene el teléfono. Nadie cruza ni entra en una multitud para buscar la pista.

**Primary action:** Ojos arriba

## 4. Eyes-up interstitial

**Eyebrow:** Ojos arriba, exploradores  
**Title:** Teléfono abajo, lugar primero  
**Body:** El equipo se detiene. El adulto guarda el teléfono mientras cada explorador completa su parte en el mundo real.  
**Primary action on return:** Ya estamos listos

## 5. Team check-in and quiz

**Title:** Tres pistas, un solo equipo  
**Instruction:** Toca cada papel cuando haya ayudado.  
**Role completion:** Hecho  
**Quiz title:** Elegid juntos

**Question:** ¿Qué hace especial al león que habéis encontrado?

| Stable choice ID | Spanish label | Result | Hint after check |
|---|---|---|---|
| `wings` | Tiene alas | correct | — |
| `fins` | Tiene aletas | retry | Mira encima del lomo del león. |
| `wheels` | Tiene ruedas | retry | Mira encima del lomo del león. |

**No selection:** Elegid una respuesta antes de comprobarla.  
**Check:** Comprobar  
**Correct:** Esa pista encaja.  
**Retry:** Mirad otra vez. Buscad la forma que aparece encima del lomo.  
**Complete:** Equipo listo

## 6. Celebration

**Eyebrow:** Aventura guardada  
**Title:** ¡Pista completada!  
**Success line:** León encontrado: el Asombro ya tiene su primera pista.  
**Stamp:** Sello familiar: Ojo de águila  
**Power progress:** El Asombro sigue reuniendo pistas del equipo.  
**Discovery label:** Lo que ha descubierto el equipo  
**Fact:** **HECHO:** El león alado de San Marcos es un símbolo de Venecia.  
**Explanation:** El león alado representa a San Marcos y es uno de los símbolos más conocidos de Venecia. Puede aparecer en esculturas, banderas y carteles.  
**Primary action:** Siguiente pista  
**Secondary actions:** Volver al capítulo · Ver Pasaporte

Alternative completion titles remain kind and equal:

- `manual`: **Lo habéis resuelto a vuestra manera**
- `skipped`: **Pista guardada para luego**

Neither state changes the stable result IDs or blocks the chapter story.

## 7. Caption/narration script

Narration is optional, never autoplayed, and captions match the spoken text exactly.

| Segment | Screen | Spoken caption | Visual beat for art testing |
|---|---|---|---|
| `VEN-01-C01` | Chapter | “Bussola despierta en una ciudad donde los barcos hacen trabajos de calle y los caminos de piedra cruzan el agua.” | Paper city unfolds; one working boat crosses beneath a stone bridge |
| `VEN-01-C02` | Chapter | “Para recuperar el Asombro, el equipo buscará cuatro maneras de leer Venecia.” | Four empty compass marks appear; no looping motion |
| `VEN-01-S01` | Story | “Bussola ha llegado a Venecia, pero el Asombro sigue escondido.” | Bussola’s wonder point is dim |
| `VEN-01-S02` | Story | “Un león puede ayudar… aunque el león de esta ciudad lleva alas.” | Wing shapes unfold behind a friendly carved-lion silhouette |
| `VEN-01-S03` | Story | “El equipo se detiene en un lugar público y seguro.” | Children remain abstract team markers beside an adult marker, away from the canal edge |
| `VEN-01-S04` | Story | “El Vigía busca las alas, el Detective descubre qué hace especial al animal y el Guía comprueba con el adulto que todos pueden mirar con seguridad.” | Three role tokens attach to one shared clue card |
| `VEN-01-Q01` | Quiz success | “Esa pista encaja. El león alado es un símbolo de Venecia.” | Wings align with the lion; reduced-motion version changes state instantly |
| `VEN-01-R01` | Celebration | “León encontrado: el Asombro ya tiene su primera pista.” | One compass mark lights; family stamp lands once |

**Pronunciation notes:** Bussola `BÚS-so-la`; San Marcos uses normal Spanish pronunciation; Venecia uses Spanish pronunciation. Italian pronunciation is not needed in this mission.

## 8. Fallback copy used by the same art test

- **Sin ubicación:** El adulto elige cualquier león que pueda verse con seguridad.
- **Lugar cerrado:** Usad las tarjetas y elegid entre un león normal y un león alado.
- **Ha cambiado el tiempo:** Usad las tarjetas; las alas son la pista decisiva.
- **Piernas cansadas:** Completad la misión sentados o resolvedla de otra forma.
- **Reduced motion:** all information appears immediately; the stamp and compass state change without travel, spin, bounce or sound.

## Acceptance result

`ST-R03` is complete: one source-faithful, age-layered Spanish chapter flow covers story, mission, quiz, celebration, narration captions, safety and fallbacks without changing gameplay contracts.
