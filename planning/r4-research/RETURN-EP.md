# R4 research — `RETURN-EP` · La quinta dirección

**Scope:** story and interaction research only; runtime remains untouched  
**Stable contract:** keep `RETURN-EP`, order `17`, `chapterId: null`, `scored: false`, no reward and no fifth power

## Recommendation

Replace **La flecha de casa** with **La quinta dirección**, a short interactive epilogue that resolves the original Lost Compass premise instead of explaining privacy, scoring, driving or app operation.

Bussola has recovered Curiosidad, Asombro, Creatividad and Trabajo en equipo, yet its needle cannot find the way home. The app—not a parent—calls the three stored nicknames in a deterministic order. One child chooses a restored power, one chooses among three authored memory cards generated from the saved journey, and one chooses how the family will carry that memory. Their three choices fold the four powers into a fifth fictional direction: **CASA**.

There is no open prompt, role negotiation, invented parent story, score, quiz failure, new stamp or safety speech. Every choice is finite, illustrated and written by the app. The ending is fully meaningful with audio muted.

## Why the current epilogue breaks the story

The existing copy opens with logistics—“antes de conducir”, “parada segura”, “sin conexión”, “no guarda historial”—and then asks the family to supply the emotional content. It behaves like a compliance note after the adventure has already ended.

It also misses the premise payoff. Bussola began unable to remember why people explore. The return should demonstrate what it learned from the four powers. Pointing an offline arrow toward Basel is not that answer, and it risks looking like navigation despite the app having no navigation authority.

The rewrite should:

- make Bussola's last uncertainty the dramatic question;
- recall only powers and memories the runtime can derive;
- assign every turn automatically from saved nicknames;
- provide every line and choice in advance;
- end the Lost Compass arc rather than summarizing product rules;
- remain optional, unscored and replayable.

## Journey continuity ledger

The epilogue does not reteach place facts. It transforms the motifs already established across the journey.

| Power | Earlier story language | Epilogue function |
|---|---|---|
| Curiosidad | passports, questions, the Alpine heartbeat and five lit words | opens the folded Atlas |
| Asombro | claw-wing-book, bridge prints, boat wakes and invisible waves | makes one memory shine |
| Creatividad | a flower inside glass, wooden water-paths and a thread drawing in air | reshapes the memory into an arrow |
| Trabajo en equipo | stone feather, three-era letter, recovered bridge pieces and the chosen Friday trail | joins different pieces without erasing their differences |

`VER-06` restores the fourth power. `RETURN-EP` never repeats that ceremony. It asks what the restored compass can now do that it could not do at the opening.

## Story direction

### Display title

**La quinta dirección**

### Objective

**Convertir un recuerdo del viaje en la flecha de casa.**

### Opening story beat

> El Atlas se cierra, pero Bussola sigue despierta. Curiosidad, Asombro, Creatividad y Trabajo en equipo brillan en sus cuatro puntas. La aguja intenta señalar el camino a casa… y se queda quieta. “Creo que aún me falta una dirección”, susurra. No está al norte, al sur, al este ni al oeste. Para encontrarla, tres manos tendrán que escoger un poder, rescatar un recuerdo y decidir cómo llevarlo con nosotros.

This beat is fiction and contains no external claim. `sourceIds` remains empty.

## Deterministic family turn order

The screen must never say “decidid quién”, “que un adulto elija” or “inventad una historia”.

```text
turnOrder = rotate(save.family.members, save.family.roleRotationIndex)
turn 1 = turnOrder[0]
turn 2 = turnOrder[1]
turn 3 = turnOrder[2]
```

The visible heading is `Turno de {nickname}`. Narration stays pre-generated and says “primera mano”, “segunda mano” and “tercera mano”; it never tries to synthesize a nickname. If a damaged or legacy save has fewer than three members, cycle the available names without asking the parent to allocate turns.

The legacy `spotter`, `detective` and `navigator` records may remain internally for content compatibility, but the epilogue UI does not display role pills. The three actions are already ordered and equally important.

## Complete playable sequence

### Beat 1 — The compass hesitates

**Visual:** the closed Atlas sits behind Bussola. Four static power lights are already visible. A small blank paper point appears at the centre; it is not a route arrow.

**Narration:**

> El Atlas se cierra, pero Bussola sigue despierta. Sus cuatro poderes brillan y, aun así, la aguja no se mueve. “He aprendido a mirar, a maravillarme, a crear y a avanzar con vosotros. Pero todavía no sé cómo se señala casa.” En el centro aparece una punta de papel vacía. No pide una carretera. Pide un recuerdo.

### Beat 2 — First hand: choose a power

The app shows the first stored nickname and four large illustrated cards. All four are valid; there is no check-answer button.

**Prompt:**

> Primera mano: toca el poder que abrirá el Atlas una vez más.

| Choice ID | Label | Symbol | Exact branch narration |
|---|---|---|---|
| `curiosity` | Curiosidad | question-shaped path | “Curiosidad abre una rendija entre las páginas. Es el poder que pregunta ‘¿qué habrá aquí?’ y se queda el tiempo suficiente para descubrirlo.” |
| `wonder` | Asombro | winged spark | “Asombro enciende una luz bajo el papel. Es el poder que convierte un detalle pequeño en algo que merece ser recordado.” |
| `creativity` | Creatividad | three-part rosette | “Creatividad dobla una esquina del Atlas y aparece una forma nueva. Es el poder que une piezas conocidas para crear algo que antes no existía.” |
| `teamwork` | Trabajo en equipo | four linked marks | “Trabajo en equipo alinea cuatro marcas distintas. Es el poder que no exige mirar igual: encuentra la forma de avanzar con todas las pistas.” |

The chosen light moves to the blank centre point. In reduced motion it appears there with a direct state change.

### Beat 3 — Second hand: rescue one memory

The app shows the second nickname and exactly three authored memory cards. The cards come from the saved journey through the deterministic rule below. No one has to remember something aloud or compose text.

**Prompt:**

> Segunda mano: elige el recuerdo que viajará dentro de la flecha.

After the tap, Bussola reads the card's exact callback line. The card slides beneath the selected power; reduced motion replaces the slide with a static stacked composition.

### Beat 4 — Third hand: choose how it travels

The app shows the third nickname and three seals. All are complete endings, not personality tests.

**Prompt:**

> Tercera mano: elige cómo viajará este recuerdo.

| Seal ID | Visible label | Exact branch narration |
|---|---|---|
| `retell` | Para volver a contarlo | “El sello dice: VOLVER A CONTAR. Cada vez que la historia pase de una voz a otra, la flecha abrirá de nuevo esta página.” |
| `keep-close` | Para guardarlo cerca | “El sello dice: GUARDAR CERCA. No encerrará el recuerdo: lo mantendrá a mano para los días que necesiten un poco de viaje.” |
| `next-story` | Para abrir otra aventura | “El sello dice: OTRA AVENTURA. El recuerdo será la primera página de algo que todavía no conocemos.” |

The seal is a story choice only. It creates no persisted badge, score or unlock.

### Beat 5 — The fifth direction

**Common final narration:**

> El poder elegido, el recuerdo y el sello se pliegan juntos. La punta vacía se convierte en una flecha y encaja en el centro de Bussola. La aguja tiembla. El norte sigue donde siempre estuvo, pero ahora aparece una palabra nueva: **CASA**.
>
> Bussola por fin lo entiende. Estaba buscando casa fuera del mapa. Pero una aventura vuelve a casa cada vez que alguien puede decir: “Yo estuve allí, y estuvimos juntos”. El Atlas se cierra con un clic.
>
> **Bussola ya no está perdida.**

Final button: **Cerrar el primer viaje**. Secondary replay action: **Escuchar otra vez**. Do not route this result through the generic stamp celebration.

## Memory-card selection rule

Cards never expose a skipped mission as a failure and never claim that the family saw something absent from its saved journey.

1. Eligible memories are scored missions saved as `completed` or `manual`; exclude `skipped`, `in-progress` and `RETURN-EP`.
2. Resolve `VER-04` and `VER-05` to their saved effective variant before reading the memory token.
3. Bucket eligible memories by chapter in manifest order.
4. Start with the chapter whose power was selected in Beat 2. Within a bucket, prefer the highest-order `completed` mission, then the highest-order `manual` mission.
5. Continue clockwise through the remaining chapters until there are three cards.
6. When a chapter has no eligible memory, use its generic power card. This is neutral story art, not a skipped-place substitute.
7. Stable card IDs, not array positions or random numbers, determine the result. Reopening the epilogue with the same save and first choice produces the same three cards.

### Generic power cards

| ID | Label | Callback line |
|---|---|---|
| `power-curiosity` | Una pregunta abierta | “Una pregunta dobló una esquina del mapa y dejó entrar la Curiosidad.” |
| `power-wonder` | Una chispa inesperada | “Un detalle pequeño encendió el Asombro y el mundo pareció más grande.” |
| `power-creativity` | Tres piezas, una forma nueva | “Tres piezas distintas se encontraron y la Creatividad les dio una forma nueva.” |
| `power-teamwork` | Pistas que encajan | “Ninguna pista bastaba sola; juntas despertaron el Trabajo en equipo.” |

## Mission memory-token register

These are poetic callbacks, not new factual claims. If implementation expands a line into a place fact, it must reuse that mission's approved source ID and wording.

| Stable source | Card label | Exact callback line |
|---|---|---|
| `ROAD-01` | Dos páginas recuperadas | “Dos páginas perdidas volvieron al Pasaporte y la Curiosidad abrió la primera puerta.” |
| `ROAD-02` | El Latido Alpino | “Pum, pausa, pum: luz, roca y ritmo devolvieron el latido a la montaña de papel.” |
| `ROAD-03` | Cinco focos encendidos | “Cinco palabras encendieron el teatrino y Bussola recuperó su voz italiana.” |
| `VEN-01` | Garra, ala y libro | “Tres pistas imposibles encontraron al guardián que camina, vuela y guarda palabras.” |
| `VEN-02` | La huella de un puente | “Forma, materia y detalle dejaron una huella de puente que ningún otro equipo habría creado.” |
| `VEN-03` | Tres estelas de agua | “Un nombre, unas ruedas y un emblema verde devolvieron movimiento al archivo de barcos.” |
| `VEN-04` | El mapa que se escucha | “Agua, aviso y marea volvieron a dibujar un mapa hecho de ondas.” |
| `ISL-01` | La flor dentro del vidrio | “Centro, anillo y pétalos revelaron una flor que viajaba escondida dentro de un dibujo.” |
| `ISL-02` | El alfabeto de madera | “Toc, toc-toc-toc: los postes de madera hicieron visible un camino de agua.” |
| `ISL-03` | El hilo que dibuja en el aire | “Niebla, límite y espuma encontraron su lugar en una red de hilo y memoria.” |
| `VER-01` | El ala que no vuela | “Una pluma de piedra abrió la máquina del tiempo de la Arena.” |
| `VER-02` | La carta de tres épocas | “Piedra, pluma y luz de teatro aprendieron a compartir una misma carta.” |
| `VER-03` | El puente que volvió | “Cinco arcos y piezas recuperadas enseñaron a un puente cómo regresar.” |
| `VER-04/sigurta-team-maze` | Las tres señales verdes | “Una Y, un muro vivo y una torre reunieron las sombras del laberinto.” |
| `VER-04/sirmione-castle-water` | El escudo del puerto | “Almena, muro y agua cerraron un escudo alrededor de un puerto de papel.” |
| `VER-04/verona-natural-history` | El océano de piedra | “Aleta, hoja y ola despertaron el recuerdo de un mar guardado en la roca.” |
| `VER-05/borghetto-water-mill` | El hilo y la rueda | “Una rueda inmóvil separó la historia, la leyenda y el hilo inventado por Bussola.” |
| `VER-05/lazise-bonus-spotter` | El cuarto lado azul | “Una ola encajó donde faltaba la pared y completó la ciudad de papel.” |
| `VER-05/verona-childrens-museum` | La estrella de seis puertas | “Agua, luz, mecánica, sonido, lógica y cuerpo cerraron una estrella de preguntas.” |
| `VER-06` | Las cuatro puntas | “Cuatro poderes distintos se alinearon porque todas las pistas pertenecían al mismo equipo.” |

## Narration manifest

No audio starts on page load. **Escuchar a Bussola** is the explicit opt-in gesture. Once enabled for this epilogue, each power, memory and seal tap may start its selected clip because the tap is itself an intentional user action; pause and replay remain visible. Captions equal the spoken Spanish exactly.

| Segment ID | Target | Approx. length | Audio behavior |
|---|---|---:|---|
| `RETURN-EP-S01` | Beat 1 narration | 19 s | fixed |
| `RETURN-EP-PROMPT-POWER` | Beat 2 prompt | 5 s | fixed |
| `RETURN-EP-POWER-{id}` | selected power | 9–12 s | one of four branch clips |
| `RETURN-EP-PROMPT-MEMORY` | Beat 3 prompt | 5 s | fixed |
| `RETURN-EP-MEMORY-{stable-id}` | selected memory | 6–10 s | mission/variant clip or generic power clip |
| `RETURN-EP-PROMPT-SEAL` | Beat 4 prompt | 5 s | fixed |
| `RETURN-EP-SEAL-{id}` | selected seal | 8–11 s | one of three branch clips |
| `RETURN-EP-CLOSE-01` | first final paragraph | 13 s | fixed |
| `RETURN-EP-CLOSE-02` | second final paragraph | 15 s | fixed |
| `RETURN-EP-CLOSE-03` | final line | 3 s | fixed; allow a quiet two-second hold after it |

Maximum spoken path is about 93 seconds; expected interactive duration is 2.5–3.5 minutes. Do not add music under the final line. A soft paper fold and one restrained brass click may accompany the visual if separately licensed and if captions already carry all meaning.

## Pronunciation

| Term | Direction for Spanish voice |
|---|---|
| Bussola | `BÚS-so-la`; stress the first syllable, clean short vowels |
| Curiosidad | natural Spanish; do not over-emphasize as a badge name |
| Asombro | natural Spanish; warm, not theatrical horror |

The epilogue does not need to pronounce Basilea, Italian sites or craft terms. They are intentionally absent from the final narration so the emotional close belongs to the whole journey rather than one route.

## Visual and motion direction

- Replace confetti with one authored paper-fold transformation.
- Show the four earned power marks from the first frame; the epilogue does not award them again.
- The selected power, memory card and seal become three paper layers. Their outer corners align into the home-arrow silhouette.
- The final word **CASA** is readable text, not an inferred icon and not a geographical direction.
- Keep Bussola object-like: personality comes from a small tilt and needle movement, never a face or limbs.
- Normal motion: three folds, each 180–240 ms; final needle emphasis no more than 12 degrees; total final animation under 1.4 s.
- Reduced motion: render the completed layered arrow immediately with no rotation, translation, confetti or delayed meaning.
- No map of Basel, route trace, car, road, GPS dot or directional instruction appears.

The existing epilogue art brief says “no power motif”. R4 should amend it: the four already-earned power marks are the narrative raw material, but the scene still contains no new power fill, score or reward burst.

## Copy and fallback policy

This screen needs no visible safety panel, location card, duration/energy card, role summary, privacy explanation or generic fallback list. It asks for no walking, looking outside, route decision, public performance, sound recognition or physical action beyond tapping the current screen.

The content schema currently forces at least one `safety` item. During implementation, permit `safety: []` only when `status` is `fixed-unscored-epilogue`; preserve the existing minimum for location-based missions. Do not retain a hidden requirement by rendering a generic driver warning elsewhere in this flow.

Fallbacks become presentation states, not prose blocks:

- audio unavailable: identical captions and choices;
- reduced motion: static layered arrow;
- offline: primary behavior, with all scripts and card art bundled;
- interrupted: reopen Beat 1; choices are short-lived session state and do not affect progress;
- tired/short mode: **Cerrar con la historia breve** plays only the fixed opening and common final narration, then completes normally.

## Exact content-model rewrite guidance

1. Keep `id`, `order`, `chapterId`, date, `scored`, status, reward, offline-critical flag and all dependency flags unchanged.
2. Replace title, story beat, objective, location label, roles, completion and fallback copy with this design.
3. Add a typed Spanish epilogue payload rather than encoding branching story state in React. It needs `powerChoices`, `genericMemoryCards`, `memoryTokens`, `sealChoices`, `segments` and `closingSegments` keyed by stable IDs.
4. Attach `memoryToken` to localized mission/variant content, or maintain one validated register keyed by mission plus effective variant. Missing tokens fail the content gate and fall back only to the generic power card at runtime.
5. The epilogue screen receives `bundle` and `save`, derives names/cards deterministically and owns only ephemeral choice state.
6. Do not persist the selected power, card or seal in the save envelope. `resolveMission(RETURN-EP, completed)` fires only after the common final narration is visible. Replaying is allowed and idempotent.
7. Do not send completed `RETURN-EP` to `CelebrationScreen`; render its authored final state and route **Cerrar el primer viaje** to Passport.
8. Replace the single `RETURN-EP-STORY` narration reference with the segmented manifest above. Captions are exact scripts, not summaries.
9. Update the asset-production contract and runtime asset policy for the four-layer home arrow. Keep all audio and art local, versioned and licence-recorded.
10. Remove visible strings equivalent to “epílogo sin puntos”, “no usa GPS”, “no guarda rutas”, “quien conduce”, “el adulto elige”, “inventad/contad una historia” and “apunta hacia Basilea” from this flow.

## Suggested compact runtime copy

```yaml
title: La quinta dirección
objective: Convertir un recuerdo del viaje en la flecha de casa.
locationLabel: Dentro del Atlas de Bussola
roles:
  spotter: Toca uno de los cuatro poderes.
  detective: Elige una de las tres tarjetas que abre la app.
  navigator: Sella la flecha con una de tres frases.
completion:
  retryLine: La flecha espera vuestra elección.
  explanation: Los cuatro poderes ya están despiertos. Ahora convierten un recuerdo en la dirección de casa.
  successLine: Bussola ya no está perdida.
safety: []
reward:
  stamp: null
  power: null
```

The visible epilogue component should use the richer typed payload; this compact record preserves compatibility with the current mission contract.

## Source boundary

No new external factual claim is required. The emotional premise, fifth direction, speaking compass and paper transformation are explicitly **NUESTRA HISTORIA**. Mission callback tokens paraphrase already researched story motifs and must not be expanded into new place facts during implementation. Therefore `RETURN-EP.sourceIds` remains `[]` and no web source is added solely to decorate the finale.

## R4 acceptance criteria

1. The first visible paragraph contains story, not logistics or safety boilerplate.
2. The app visibly assigns all three turns using saved nicknames; no parent allocation or improvisation remains.
3. Every interaction is a finite authored choice with no free text, microphone, camera or open-ended retelling.
4. The three memory cards are deterministic and never use a skipped mission as if it happened.
5. All four restored powers contribute to the ending; no fifth power or reward is created.
6. The final line resolves “the Lost Compass” premise: **Bussola ya no está perdida.**
7. Audio is optional, locally distributable, caption-identical and never begins on page load.
8. Silent, offline and reduced-motion paths preserve the complete story.
9. No driver, adult-supervision, GPS, route-history, scoring or platform explanation interrupts the child-facing flow.
10. Runtime IDs and save compatibility remain unchanged.
