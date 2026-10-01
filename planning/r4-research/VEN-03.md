# R4 research — `VEN-03` El archivo secreto de los barcos

**Reviewed:** 1 October 2026  
**Runtime edited:** no  
**Recommendation:** replace the open-ended real-world boat comparison with a complete three-scene narrated mystery. The app supplies the story, clues, role order, answers, retries, and resolution; no adult invents or assigns anything.

## Existing-copy audit

The current Spanish mission reads like operating instructions. It asks the family to find two real boats, invent the relevant clues, distribute three jobs, classify unseen offline cards, confirm that the observation happened, and repeatedly acknowledge transport and waterside rules. The factual layer is only an unsourced generic statement that boats can carry people, parcels, supplies, or workers.

That structure has four problems for R4:

- the story stops while setup and safety prose is read;
- success depends on whichever boats happen to pass;
- shape and colour are unreliable ways to infer a vessel's job;
- the adult must create and validate most of the experience.

Keep the stable mission ID, Venice chapter slot, reward, power, offline behavior, and automatic three-role rotation. Replace the title, story, objective, roles, facts, completion, retries, and fallbacks. The rewritten mission is playable anywhere and treats a real canal view as atmosphere, never as required evidence.

## Verified fact bank

| Proposed source ID | Child-sized fact | Primary evidence | Use |
|---|---|---|---|
| `SRC-VEN-ACTV-HISTORY-01` | En 1881 empezó en Venecia un servicio regular de línea con propulsión mecánica. El primer vaporetto se llamaba **Regina Margherita**. | ACTV gives the year, service, vessel type, name, and Grand Canal appearance in its official history: [ACTV — La storia](https://actv.avmspa.it/it/content/home-actv). | Scene 1 name mystery. |
| `SRC-VEN-ACTV-FLEET-01` | La flota acuática pública no está formada por un único tipo de barco: incluye vaporetti, motoscafi, motobattelli, motonavi y ferry-boats. | ACTV lists these vessel categories and says motonavi transport large numbers of passengers: [ACTV — La flotta navale](https://actv.avmspa.it/it/content/home-actv). | Reveal card; supports the central idea that boats have different designs and jobs. |
| `SRC-VEN-ACTV-FERRY-01` | Los ferry-boats de ACTV transportan vehículos y pasajeros. | The operator states this directly: [ACTV — Ferry-Boat](https://actv.avmspa.it/en/content/ferry-boat-4). | Scene 2 job badge. |
| `SRC-VEN-WASTE-BOAT-01` | En el centro histórico y varias islas, parte de la recogida separada de residuos utiliza barcas de Veritas en puntos de recogida. | The City of Venice describes residents taking the day's separated and residual waste to moored Veritas boats, with door-to-door collection as the alternative: [Comune di Venezia — Raccolta rifiuti in centro storico e isole](https://www.comune.venezia.it/it/content/raccolta-rifiuti-centro-storico-e-isole). | Scene 3 clean-city badge. |
| `SRC-VEN-GONDOLA-FELZE-01` | Ca' Rezzonico conserva una góndola del siglo XIX con un **felze**, una cabina desmontable que daba intimidad y comodidad a los pasajeros. | MUVE states this in Spanish on the museum's official history page: [Ca' Rezzonico — La sede y la historia](https://carezzonico.visitmuve.it/es/sede-y-la-historia/). | Optional post-mission “archivo extra”; it is not needed to solve the three scenes. |

## Factual caveats

- Do not call every public water vessel a **vaporetto**. ACTV's own fleet has several distinct vessel categories.
- Do not say modern vaporetti are steam-powered. The word retains its historical name, but the mission does not establish a modern propulsion type.
- Ferry-boats carry passengers as well as vehicles. Frame the car/vehicle as the ferry's **distinctive clue**, not its only cargo.
- Do not infer a real vessel's job from hull shape, colour, uniform, or logo. The quiz uses labelled story cards whose jobs are supplied by the narration.
- The municipal waste page describes a resident collection system. It is a fact card, not an instruction for visiting children to approach, touch, or bring anything to a collection boat.
- Do not embed collection hours, landing points, ferry route numbers, fares, schedules, or service availability. Those details can change and are irrelevant to the story.
- “Los canales son las calles de Venecia” is a useful metaphor but an incomplete description: Venice also has calli, campi, bridges, and other pedestrian spaces. Prefer **“el agua también hace trabajos de ciudad.”**
- The nineteenth-century gondola and its felze are historical. Do not imply every gondola had one or that present-day gondolas still use one.
- Avoid ACTV and Veritas logos in artwork. Generic people, vehicle, and separated-waste symbols communicate the sourced facts without unnecessary brand treatment.

## Narrative hook

### Recommended title

**El archivo secreto de los barcos**

### Story beat — 70 words

> En nuestro cuento, una ola de tinta ha entrado en el Archivo de Agua de Bussola. Ha borrado un nombre de 1881, el cargamento de un ferry y el oficio de una barca que ayuda a limpiar la ciudad. Tres páginas flotan fuera de lugar y el canal de papel se ha quedado inmóvil. Recuperad el nombre, las ruedas y el emblema verde. Cuando brillen las tres estelas, Venecia volverá a moverse.

The fiction is explicitly framed as **our story**. Each following scene introduces one verified fact before asking the child to use it.

## Complete authored play sequence

The existing rotation assigns the three child roles before the first scene. The app speaks the named role and the exact action. No adult chooses a boat, invents a clue, allocates a child, judges an observation, or confirms an answer. Any team member may tap if the named player wants help.

### Scene 1 — La página de 1881

**Narration:** “Primera página. En 1881 empezó en Venecia un servicio regular con barcos de propulsión mecánica. El primer vaporetto se llamaba Regina Margherita. Vigía, encuentra su placa.”

Show three large illustrated nameplates with distinct icons:

1. `Regina Margherita` + small crown — correct;
2. `Leone Volante` + fictional winged paw — distractor clearly belonging to the story world;
3. `Bussola Blu` + blue compass — distractor clearly belonging to the story world.

The label is read aloud when tapped. No reading fluency is required.

**Kind retry:** “La ola dejó dos palabras en mi memoria: Regina Margherita. Busca la placa de la corona.”

**Resolve:** “¡Nombre recuperado! La primera estela regresa a 1881.”

### Scene 2 — La página de las ruedas

**Narration:** “Segunda página. Los barcos públicos no hacen todos el mismo trabajo. El ferry tiene una pista especial: puede transportar vehículos y pasajeros. Detective, devuelve al ferry su emblema.”

Show three icon cards:

1. car + two passenger dots — correct;
2. envelope + feather — fictional message card;
3. bell + moon — fictional night-sound card.

**Kind retry:** “Busca la pista que puede rodar y también llevar personas: el coche con dos pasajeros.”

**Resolve:** “¡Ruedas a bordo! La segunda estela ya cruza el archivo.”

### Scene 3 — La página de la ciudad limpia

**Narration:** “Última página. En el centro histórico y en varias islas, la recogida separada también usa barcas de Veritas. Guía, encuentra el cargamento que pertenece a la ciudad limpia.”

Show three illustrated cargo cards:

1. flattened cardboard + bottle + can + closed residual bag — correct;
2. stone lion + bridge brick — fictional monument cargo;
3. suitcase + gelato + sunhat — fictional holiday cargo.

Use neutral material icons rather than bin colours, which vary by system. Nothing should look touchable or ask the child to handle waste.

**Kind retry:** “La barca de limpieza busca materiales separados: cartón, botella, lata y bolsa cerrada.”

**Resolve:** “¡Oficio recuperado! La tercera estela deja el canal de papel reluciente.”

### Final reveal and celebration

Animate the three monochrome pages locking into Bussola's brass archive. Each restored wake adds one colour: blue for memory, coral for movement, green for care.

**Narration:** “El Archivo de Agua vuelve a respirar. Una estela recuerda, otra transporta y otra cuida la ciudad. En Venecia, el agua también hace trabajos de ciudad. Asombro encendido. ¡Sello Detective de Historias conseguido!”

**On-screen line:** “Tres barcos. Tres secretos. Una ciudad en movimiento.”

Do not insert a supervision reminder, scoring explanation, manual confirmation, or transport disclaimer between the reveal and the reward.

### Optional archive card — La cabina fantasma

After celebration, offer a non-blocking collectible card:

> “Ca' Rezzonico guarda una góndola del siglo XIX con un **felze**: una cabina que podía desmontarse y daba intimidad a sus pasajeros.”

Illustrate a clearly historical gondola cross-section with the removable cabin highlighted. Label it **Del archivo real**. The card does not suggest a museum visit and is excluded from mission completion.

## Quiz contract

| Step ID | Interaction | Correct answer | Learning result |
|---|---|---|---|
| `first-vaporetto-name` | One large narrated card choice | `Regina Margherita` | Recall the name tied to Venice's 1881 regular mechanical line service. |
| `ferry-job-badge` | One icon choice | vehicle + passengers | Recognise the ferry's distinctive vehicle-carrying role without saying it carries only vehicles. |
| `waste-boat-cargo` | One icon choice | separated materials + closed residual bag | Recognise that boats take part in Venice's urban waste system. |

Every answer is stated by Bussola before it is tested. A retry repeats the clue instead of saying “incorrecto.” After two retries, Bussola highlights the correct card, completes the page with the same celebration, and continues. The story never stalls and no adult validation is required.

## Contextual safety

This mission needs only one quiet, non-narrated context badge:

> **Pausa de canal · equipo quieto**

Show it once above the first scene when the mission is opened outdoors. Do not read it aloud, repeat it per scene, or place rules inside story, objective, retries, completion, or celebration. Any detailed waterside boundary remains in Parent Corner, outside the children's story flow.

## Pronunciation notes

| Text | Spanish-friendly cue | Direction |
|---|---|---|
| `Bussola` | **BÚS-so-la** | Stress the first syllable; keep the double `s` crisp. |
| `vaporetto` | **va-po-RÉ-to** | Stress `ré`; make the double `t` clean, not exaggerated. |
| `vaporetti` | **va-po-RÉ-ti** | Plural only in the optional fleet fact card. |
| `Regina Margherita` | **re-YÍ-na mar-gue-RÍ-ta** | Preserve the Italian name; do not translate it to “Reina Margarita.” |
| `Veritas` | **VÉ-ri-tas** | Company name; use once in the sourced fact, never as a brand slogan. |
| `Ca' Rezzonico` | **ca re-TSÓ-ni-co** | Optional archive card only. The apostrophe marks the shortened `Casa`. |
| `felze` | **FÉL-tse** | Explain immediately as “cabina desmontable.” |

Avoid reading `ACTV` in the child narration. Say **“los barcos públicos”**; retain the operator name on the source-backed fact card and credits.

## Exact runtime rewrite guidance

- Keep `id: VEN-03`, `chapterId: venice`, `order: 6`, `reward.stamp: story-sleuth`, `reward.power: wonder`, `offlineCritical: true`, and all optional dependencies `false`.
- Change title to **El archivo secreto de los barcos** and target 5–6 minutes.
- Replace `location.mode: parent-selected` with the contract's app-contained/offline mode. Coordinates remain `null`; GPS and live data remain unused.
- Replace the current `storyBeat` with the 70-word hook above.
- Replace the empty `choices` array with the three stable quiz steps and stable option IDs. Use tap selection, not drag, typing, camera, microphone, timer, or real-world proof.
- Replace the three open observation roles with the three exact scene actions. The existing rotation decides which child is Vigía, Detective, and Guía; Parent Corner may still change names outside the mission.
- Add the first four source IDs to `public/content/sources.json`, `docs/source-register.md`, and the mission's `sourceIds`. Register the fifth only if the optional archive card ships.
- Keep the fiction in `storyBeat` and mark the archive as **NUESTRA HISTORIA**. Keep verified claims in `facts` as **HECHO**.
- Remove the current generic `OUR STORY` fact, real-boat observation objective, manual team confirmation, and both safety sentences from the child flow.
- Replace all four location/weather/energy fallbacks with one authored recovery: “El Archivo de Agua vive dentro de Bussola; las tres páginas funcionan igual sin señal, sin ubicación y bajo techo.” Do not narrate this unless the app actually enters recovery state.
- Completion becomes answer-driven after the third page. Preserve skip/manual recovery only in Parent Corner; do not present it between scenes.
- Add narrator segments for intro, three prompts, three retries, three resolves, final reveal, and optional archive card. Captions must match the spoken script exactly.
- Audio never autoplay starts on navigation. The visible text remains complete, and solving never depends on hearing.
- Art direction: paper-cut canal theatre; three page-boats, three coloured wakes, oversized semantic icons, no third-party logos, no photorealistic vessels, and no silhouette presented as a real-world identification guide.

## Acceptance test

A child can open `VEN-03` with sound on or captions only, receive every necessary fact from Bussola, complete all three scenes, recover after mistakes, and reach the reward without an adult inventing, selecting, assigning, reading, confirming, or supplying a real-world boat. The same path works indoors and offline. It never asks for GPS, camera, microphone, transport choice, service data, canal-edge observation, waste handling, or venue entry.
