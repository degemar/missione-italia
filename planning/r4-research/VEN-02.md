# R4 research — `VEN-02` La huella del puente

**Reviewed:** 1 October 2026  
**Runtime edited:** no  
**Recommendation:** replace the procedural role exercise with a fully authored bridge-fingerprint mystery, followed by two short fact puzzles narrated by Bussola.

## Existing-copy audit

The current Spanish mission reads like operating instructions. It asks an adult to choose where the team stands, exposes three roles before creating any dramatic question, repeats rail/phone rules, and ends with a generic manual observation. The only fact is about Rialto even though the mission can happen at any bridge. There is no fixed quiz, no authored reveal, and no narrative reason to notice a bridge's form.

Keep the stable mission ID, chapter, reward, offline behavior, and destination-independent location. Replace the title, story, objective, visible role copy, interaction, facts, completion, fallbacks, and narration. The app must deal the three actions automatically; no adult chooses a clue, invents a comparison, assigns a role, validates an answer, or decides what story to tell.

## Verified fact bank

| Proposed source ID | Child-sized fact | Evidence | Use |
|---|---|---|---|
| `SRC-VEN-TERRITORY-01` | Venecia está construida sobre un centenar de islitas, conectadas por más de 400 puentes y recorridas por unas 3.000 calles. | The official Venice tourism service describes “un centinaio di isolette”, “oltre 400 ponti”, and “circa 3000 calli”: [Venezia Unica — Il territorio di Venezia](https://www.veneziaunica.it/it/cosa-fare-a-venezia/il-territorio-di-venezia). | Opening stakes: Bussola's island map needs bridge stitches. |
| `SRC-VEN-BRIDGE-HISTORY-01` | Antes de que los puentes de piedra se extendieran, muchas islitas se unían con tablones de madera al nivel de la orilla. | The City of Venice itinerary says that until the sixteenth century the small islands were linked by simple wooden planks and that Venice gradually replaced wooden bridges with stone during bank and foundation works: [Venezia Unica — Cannaregio, Authenticity, and Traditions](https://www.veneziaunica.it/en/things-to-do-in-venice/itineraries/cannaregio-authenticity-and-traditions). | Historical reveal and first fixed quiz. |
| `SRC-VEN-RIALTO-01` | El puente de Rialto se construyó entre 1588 y 1592; fue el único puente sobre el Gran Canal hasta el siglo XIX. Tiene tiendas y talleres a ambos lados y un pórtico central. | The official Rialto page attributes the 1588–1592 construction to Antonio da Ponte, describes its shops/workshops and central portico, and states that it remained the Grand Canal's sole bridge until the nineteenth century: [Venezia Unica — Rialto Bridge](https://www.veneziaunica.it/en/things-to-do-in-venice/monuments-and-theatres/rialto-bridge). | “Bridge with pockets” dossier and second fixed quiz. |
| `SRC-VEN-PUGNI-01` | Dos puentes llamados Ponte dei Pugni conservan cuatro huellas de pie de piedra en el pavimento. | The City of Venice identifies one bridge in Dorsoduro and another in Cannaregio, each with four Istrian-stone footprints marking the old bridge contests: [Comune di Venezia — Una calle, una storia: Ponte dei Pugni](https://live.comune.venezia.it/it/2025/04/una-calle-una-storia-ponte-dei-pugni). | Optional curiosity card; supports the literal “bridge fingerprint” surprise. |
| `SRC-LANG-PONTE-01` | En italiano, puente se dice `ponte`, con el acento en `pon`. | Treccani marks the word as `pónte`: [Treccani — ponte](https://www.treccani.it/vocabolario/ponte/). | One spoken Italian word and pronunciation note. |

## Factual caveats

- Say **“un centenar de islitas”** or **“alrededor de cien”**, never an exact island count. The official source deliberately gives an approximation and describes the historic city, not every island in the lagoon municipality.
- Say **“más de 400 puentes”**, not `435`, unless a separate current municipal inventory is sourced. The official page supports only the broader figure.
- Rialto was the only bridge **across the Grand Canal** until the nineteenth century, not the only bridge in Venice.
- Use the Venice authority's `1588–1592` range consistently. Other reputable references give `1588–1591`; do not mix the two ranges inside the app.
- The shops/workshops and portico are Rialto-specific. Do not imply that every Venetian bridge has shops.
- The old wooden-plank description is historical. Do not imply that present-day Venice uses unprotected planks as ordinary public crossings.
- There are two bridges called Ponte dei Pugni. The best-known is in Dorsoduro, but the city source also records one in Cannaregio.
- The “huella”, “mapa cosido”, “bolsillos” and Bussola's damaged map are metaphors belonging to **NUESTRA HISTORIA**, not historical claims.
- Do not turn the old bridge fights into a physical game. Their only useful child-facing detail here is the surviving stone footprints.

## Narrative hook

### Recommended title

**La huella del puente**

### Story beat — 86 words

> ¡Alerta en el mapa! Venecia se ha separado en un centenar de islitas y Bussola necesita volver a coserlas. El hilo no sirve: cada unión se abre con la huella de un puente. Todo puente firma con tres pistas: la forma de su camino, el material de su cuerpo y un detalle que se repite. Capturad las tres en el puente que tenéis delante. Cuando encajen, aparecerá un sello único. Y guardad bien los ojos: en Venecia existen puentes que esconden huellas de piedra de verdad.

The hook turns the city layout into a concrete problem, introduces exactly what children will do, and ends with a sourced surprise. It contains no setup lecture, no safety recital, no parent task, and no invitation to invent content.

## Complete authored play sequence

The app selects `Vigía`, `Detective`, and `Guía` from the existing rotation before the first scene and displays only the current action card. Nobody assigns roles. If one child does not want to act, any teammate may tap without opening a parent flow.

### Scene 1 — La silueta

**Narration:** “Primera pista: el camino. Vigía, mira el puente desde donde estáis y toca su silueta.”

Show four large illustrated cards:

1. `steps` — sube y baja con escalones;
2. `flat` — parece casi plano;
3. `ramp` — sube con una rampa suave;
4. `unknown` — no se distingue desde aquí.

This is an observation, not a test. Every selection is accepted and read back: “Camino de escalones guardado”, “Camino casi plano guardado”, and so on. The `unknown` option prevents anyone from moving around to obtain a better view.

### Scene 2 — La piel

**Narration:** “Segunda pista: la piel del puente. Detective, elige el material que más se ve.”

Show illustrated material swatches rather than text-only controls:

1. `stone-brick` — piedra o ladrillo;
2. `wood` — madera;
3. `metal` — metal;
4. `mixed-unknown` — mezcla o no se distingue.

Again, no answer is wrong. Bussola combines the selected silhouette and material into a growing stamp preview.

### Scene 3 — El ritmo secreto

**Narration:** “Última pista: el ritmo. Guía, busca qué forma se repite y toca su tarjeta.”

Show four pattern cards:

1. `steps-repeat` — escalones;
2. `rails-repeat` — barrotes o postes;
3. `blocks-repeat` — bloques, ladrillos o piedras;
4. `other-unknown` — otro patrón o no se distingue.

After the tap, animate the three selected symbols into a single stamp. Use the exact output line:

> “¡Huella completa! Ningún equipo habría creado exactamente este puente.”

Do not ask a parent to confirm the observation. The three taps are the completion evidence for the field portion.

### Scene 4 — El puente antes de los puentes

**Narration:** “Bussola abre un expediente antiguo. Antes de que muchos puentes fueran de piedra, unas simples tablas de madera unían las islitas. ¿Qué material falta en el dibujo?”

Show three visual answer cards:

1. `wood-planks` — tablones de madera — correct;
2. `ice` — bloques de hielo;
3. `train-rails` — raíles de tren.

**Kind retry:** “La pista viene de los árboles y podía colocarse en tablones.”

**Resolve:** “¡Madera! Aquellos pasos sencillos ayudaban a unir las islitas antes de muchos puentes de piedra.”

### Scene 5 — El puente con bolsillos

**Narration:** “Último expediente: Rialto. Se terminó hace más de cuatrocientos años y durante siglos fue el único puente sobre el Gran Canal. Bussola lo llama el puente con bolsillos. ¿Qué guarda a ambos lados?”

Show three visual answer cards:

1. `shops` — tiendas y talleres — correct;
2. `swings` — columpios;
3. `garages` — garajes para coches.

**Kind retry:** “Sus bolsillos tienen puertas y escaparates.”

**Resolve:** “¡Tiendas y talleres! El centro del Rialto pasa bajo un pórtico y sus dos lados llevan pequeños locales.”

All necessary knowledge is narrated before or inside each question. The children never need an adult to know Venice history or decide whether the answer is good enough.

### Optional curiosity card — not another task

After Scene 5, display one swipeable card:

> **Una huella de verdad**  
> Dos puentes llamados *Ponte dei Pugni* conservan cuatro huellas de pie talladas en piedra. Son rastros de antiguos desafíos venecianos.

Use a footprint illustration. Do not ask children to find the bridge, copy the pose, fight, push, or travel there. This is a reward for curiosity, not a route instruction.

### Celebration

**Narration:** “La huella se estampa sobre el mapa. Una isla, otra y otra vuelven a unirse con puntadas de puente. La aguja de Bussola hace clic: Asombro recuperado. Sello Creador de Patrones conseguido.”

**On-screen line:** “Tres pistas. Un puente irrepetible. Venecia vuelve a unirse.”

No parent confirmation, safety recap, factual disclaimer, scoring explanation, or next-step instruction should interrupt this moment.

## Interaction and quiz contract

| Step ID | Interaction | Correctness | Learning/result |
|---|---|---|---|
| `bridge-path` | One illustrated observation choice | All accepted | Notice the bridge profile without needing a prescribed viewpoint. |
| `bridge-material` | One illustrated observation choice | All accepted | Distinguish visible structural materials. |
| `bridge-pattern` | One illustrated observation choice | All accepted | Find repetition and generate the unique stamp. |
| `early-crossing-material` | Single visual quiz | `wood-planks` | Learn that simple wooden planks preceded many stone bridges. |
| `rialto-pockets` | Single visual quiz | `shops` | Remember Rialto's shops/workshops and Grand Canal role. |

Quiz behavior:

- Narrate and caption every prompt exactly.
- Never time a response or subtract points.
- A wrong tap triggers the authored clue, not “incorrect”.
- After two retries, Bussola highlights and explains the answer; ordinary completion remains available.
- Preserve all selections locally so reopening the mission reconstructs the generated bridge stamp.
- The `Ponte dei Pugni` card is informational and never gates completion.

## Contextual safety

This is the only mission-level safety copy needed:

> **Mirad el puente desde el camino; no hace falta buscar otra vista.**

Render it once as a quiet line under the first observation prompt. Do not narrate it. Remove the existing phone, parent, rail, leaning, climbing, running, and blocking list from the child flow. General pedestrian guidance belongs in the Venice chapter shell or Parent Corner, not between story beats.

The `no se distingue` option is the behavioral safeguard: it allows the story to continue without directing anyone to reposition.

## Fixed fallbacks

No fallback asks an adult to invent or choose content.

| Trigger | Exact response |
|---|---|
| No bridge visible / no GPS | “Bussola despliega su puente de práctica. Crearemos la huella con la ilustración.” |
| Closed venue | “Esta misión no necesita entrada. El puente de práctica ya está listo.” |
| Bad weather | “Modo refugio: el puente ilustrado conserva las cinco escenas.” |
| Tired legs | “Modo sentado: Bussola acerca cada detalle a la pantalla.” |

The practice bridge must be a complete authored illustration with stepped profile, stone body, repeated balusters, and a canal beneath. It supplies deterministic answers for the first three observations while preserving the same two fact quizzes. The app offers a single button, **Usar puente ilustrado**, rather than asking the family to select a substitute object.

## Pronunciation notes

| Text | Spanish-friendly cue | Direction |
|---|---|---|
| `Bussola` | **BÚS-so-la** | Warm first-syllable stress; keep the double `s` crisp. |
| `ponte` | **PÓN-te** | Italian for bridge. Treccani marks `pónte`; say the final `e`, never “pont”. |
| `Rialto` | **ri-ÁL-to** | Three clear syllables; no English `rai`. |
| `Ponte dei Pugni` | **PÓN-te dei PÚ-ñi** | `gn` is close to Spanish `ñ`; use only in the curiosity card. |
| `Canal Grande` | **ca-NÁL GRÁN-de** | Keep the final vowels audible. Spanish narration may say **Gran Canal** outside the proper-name card. |

Narration tone: curious and conspiratorial, as if Bussola is opening a miniature case file. Pause briefly after each of the three fingerprint nouns — “forma… material… ritmo”. Do not use an authority voice for retries.

## Narration clip plan

| Clip ID | Content | Target |
|---|---|---|
| `VEN-02-INTRO` | Story beat verbatim | 28–34 s |
| `VEN-02-PATH` | Scene 1 prompt | 7–9 s |
| `VEN-02-MATERIAL` | Scene 2 prompt | 7–9 s |
| `VEN-02-PATTERN` | Scene 3 prompt | 7–9 s |
| `VEN-02-STAMP` | Fingerprint reveal | 4–6 s |
| `VEN-02-WOOD-Q` | Scene 4 fact + question | 12–15 s |
| `VEN-02-WOOD-RETRY` | Scene 4 clue | 4–6 s |
| `VEN-02-WOOD-OK` | Scene 4 resolution | 6–8 s |
| `VEN-02-RIALTO-Q` | Scene 5 fact + question | 14–18 s |
| `VEN-02-RIALTO-RETRY` | Scene 5 clue | 4–6 s |
| `VEN-02-RIALTO-OK` | Scene 5 resolution | 7–9 s |
| `VEN-02-COMPLETE` | Celebration verbatim | 10–13 s |

Captions must match the recorded scripts exactly. Do not generate audio for the contextual safety line, fallback controls, or source notes.

## Concrete runtime rewrite recommendations

- Keep: `id: VEN-02`, `chapterId: venice`, `order: 5`, `reward.stamp: pattern-maker`, `reward.power: wonder`, `offlineCritical: true`, and all dependencies `false`.
- Change the title to **La huella del puente** and target 7–9 minutes.
- Replace the present story beat with the 86-word script above.
- Change the objective to: **“Crear la huella de un puente con tres observaciones y resolver dos expedientes venecianos.”**
- Change the location label to: **“El siguiente puente visible del recorrido, o el puente ilustrado de Bussola.”** Location must not ask an adult to select a bridge and GPS must not gate the mission.
- Preserve the three role IDs only for save/UI compatibility. Replace their visible actions with the exact Scene 1, 2, and 3 prompts. The app deals the cards automatically and does not show an assignment screen.
- Extend the interaction contract beyond the current flat `choices` array: three observation groups accept every option; two quiz groups have authored correct answers. Stable IDs are listed above.
- If the existing schema cannot represent grouped interactions, add a localized `stages` array rather than embedding logic in React. This is a content-contract addition only; it does not require a save-schema version change if completion remains mission-level.
- Add `SRC-VEN-TERRITORY-01`, `SRC-VEN-BRIDGE-HISTORY-01`, and `SRC-VEN-PUGNI-01`; retain and broaden the supported claim for `SRC-VEN-RIALTO-01`. Add all four factual IDs to `sourceIds`.
- Label the damaged map and generated fingerprint as `OUR STORY`; keep historic details under `FACT`.
- Make completion answer-driven after the three accepted observations and two resolved quizzes. Do not use `observation-or-manual` or parent confirmation on the normal child path; retain manual/skip recovery only in Parent Corner.
- Replace all current fallbacks with the four exact authored responses above and include the practice-bridge art in the offline bundle.
- Replace the current safety array with the single contextual line above; render it once and never narrate it.
- Generate the bridge stamp deterministically from the three observation IDs. This creates visible ownership without names, photos, competition, or sibling scores.
- Register all narration clips in `narration.es.json`; captions point to the same Spanish strings rather than duplicate component text.

## Visual direction

- Treat the bridge as a theatre set cut from warm stone-paper, with the canal as layered blue paper strips.
- Each observation stamps one ink layer: silhouette, texture, then repeating motif. The three layers visibly combine into the final seal.
- Use one small animated thread to reconnect paper islands during celebration; honor reduced motion with a static before/after dissolve.
- Rialto's card may show three structural cues from the source: one large stone arch, tiny shopfronts on both sides, and a central covered passage. Do not reproduce a copyrighted photograph.
- The Ponte dei Pugni card needs only four simple footprint marks in a stone surface, not a depiction of fighting.
- The practice bridge should look intentionally like Bussola's tabletop model, so the fallback feels like part of the story rather than an error state.

## Acceptance test

A four-, seven-, or nine-year-old can open `VEN-02`, hear or read why the bridge matters, create a unique three-part fingerprint, answer both history questions after authored clues, view the optional footprint fact, and reach the celebration without an adult inventing, choosing, assigning, validating, or supplying local knowledge. The mission remains complete offline, works with the illustrated bridge, does not require GPS or a specific bridge, and contains only one unobtrusive contextual safety line outside narration.
