# R4 research — `ROAD-01` El pasaporte de los dos países

**Reviewed:** 1 October 2026  
**Runtime edited:** no  
**Recommendation:** replace the adult-authored observation exercise with a complete, narrated three-scene mystery inside the app.

## Existing-copy audit

The current Spanish mission is a procedure, not a story. Its opening waits for an adult to choose and announce a flag, language, or sign; every role then depends on that improvised clue. It contains no sourced country fact, no quiz choices, and no authored dramatic turn. Its safety and fallback copy repeat setup responsibilities that should live once in the road-chapter shell.

Keep the stable mission ID, reward, power, offline behavior, and three cooperative roles. Replace the title, story, objective, role actions, facts, resolution, retries, and narrated lines.

## Verified fact bank

| Proposed source ID | Child-sized fact | Evidence | Use |
|---|---|---|---|
| `SRC-CH-FLAG-01` | La bandera suiza es un cuadrado rojo con una cruz blanca. | The Swiss FDFA describes the white cross in a red square as the national flag and identifies the square form as distinctive: [Swiss flag](https://www.aboutswitzerland.eda.admin.ch/en/swiss-flag). | Scene 1 visual identification. |
| `SRC-CH-LANG-01` | Suiza tiene cuatro lenguas nacionales: alemán, francés, italiano y romanche. | The Swiss FDFA lists German, French, Italian, and Romansh: [Language](https://www.aboutswitzerland.eda.admin.ch/en/language). | Scene 3 country–language match. |
| `SRC-IT-FLAG-01` | La bandera italiana tiene tres franjas verticales iguales: verde, blanca y roja. | The Presidency of the Italian Council of Ministers quotes Article 12 and shows the official tricolour: [La Bandiera](https://presidenza.governo.it/ufficio_cerimoniale/cerimoniale/bandiera.html). | Scene 2 colour-order puzzle. |
| `SRC-IT-LANG-01` | La lengua oficial de la República Italiana es el italiano. | Article 1 of Law 482/1999 states this directly: [Gazzetta Ufficiale — Legge 15 dicembre 1999, n. 482](https://www.gazzettaufficiale.it/atto/serie_generale/caricaDettaglioAtto/originario?atto.codiceRedazionale=099G0557&atto.dataPubblicazioneGazzetta=1999-12-20). | Scene 3 country–language match. |
| `SRC-IT-ROAD-01` | En Italia, el verde identifica las señales de dirección de autopista. | Automobile Club d'Italia: [Segnaletica stradale](https://www.aci.it/fileadmin/documenti/viaggia_con_noi/pdf/ita/Segnaletica_stradale__limiti_di_velocita_e_uso_delle_luci.pdf). | Caveat only; do not turn green signs into an Italy detector. |
| `SRC-CH-ROAD-01` | Suiza también usa letras blancas sobre fondo verde en señales de autopista. | Swiss Federal Roads Office/FEDRO: [Roads and Traffic 2012](https://www.astra.admin.ch/dam/astra/en/dokumente/abteilung_direktionsgeschaefteallgemein/strassen-verkehr/astra_strassen_undverkehr2012-zahlenundfakten.pdf.download.pdf/fedro_roads_and_traffic2012-factsandfigures.pdf). | Caveat only; the same colour can occur in both countries. |

## Factual caveats

- Say **“cuatro lenguas nacionales”** for Switzerland. Do not imply that every Swiss person speaks all four or that all four have identical official use in every canton.
- Say Italian is Italy's official language. Do not imply it is the only language spoken; Italy protects historical linguistic minorities.
- Do not use a green motorway sign as proof that the family has entered Italy: both countries use green motorway direction signs.
- A flag glimpsed on a building or product does not prove the family's current country. The mission should teach the official designs with app cards, not infer location.
- Do not name a border crossing, tunnel, motorway, or arrival time. The exact Basel–Italy route can change.
- The Swiss flag is normally square, but the official Swiss source notes a rectangular form can occur at sea. Do not phrase the square rule as an exceptionless test for every reproduction.

## Narrative hook

### Recommended title

**El pasaporte de los dos países**

### Story beat — 64 words

> Una ráfaga ha arrancado dos páginas del Pasaporte de Bussola. Una lleva una cruz blanca en un cuadrado rojo; la otra, tres franjas verticales: verde, blanca y roja. Pero las palabras también se han mezclado. Recuperad primero la tarjeta de Suiza, después la de Italia y decidid qué idioma abre la última puerta. Tres pruebas. Un sello. La Curiosidad vuelve a señalar el camino.

This gives Bussola a concrete problem, supplies every clue needed to play, and makes the real journey emotionally relevant without pretending the app knows the vehicle's location.

## Complete authored play sequence

The app assigns the current rotating roles and speaks each action. No adult selects a clue, invents a story, assigns a child, names the country, or validates an answer. Any team member may still tap if the named role needs help.

### Scene 1 — La página cuadrada

**Narration:** “Primera página. Bussola recuerda una forma imposible de confundir: un cuadrado rojo con una cruz blanca. Vigía, toca el emblema de Suiza.”

Show three large illustrated cards:

1. red square + centred white cross — correct;
2. vertical green/white/red rectangle — reserved for Scene 2;
3. fictional navy circle + gold compass star — harmless distractor.

**Kind retry:** “Casi. La página suiza no tiene franjas ni estrella: busca el cuadrado rojo con la cruz blanca.”

**Resolve:** “¡Página suiza recuperada! Su forma cuadrada ya encaja en el pasaporte.”

### Scene 2 — El tricolor desordenado

**Narration:** “Segunda página. El viento separó el tricolor italiano. Detective, coloca las tres franjas verticales de izquierda a derecha: verde, blanca y roja.”

Use three tap-to-place colour strips; tapping is preferable to precise drag-and-drop for the four-year-old. Read each colour aloud when selected. Permit undo. Never time the puzzle.

**Kind retry:** “Las tres están aquí. Empieza por el verde, deja el blanco en el centro y termina con el rojo.”

**Resolve:** “¡Italia vuelve a tener sus tres franjas!”

### Scene 3 — La puerta de las palabras

**Narration:** “Queda el candado de palabras. Suiza guarda cuatro lenguas nacionales. Italia tiene el italiano como lengua oficial. Guía, une cada tarjeta con su país.”

Show two country cards and two narrated fact cards:

- `Suiza` ↔ `4 lenguas nacionales` with four speech-bubble icons;
- `Italia` ↔ `italiano, lengua oficial` with one open-book icon and the word `italiano`.

**Kind retry:** “Escucha el número: cuatro pertenece a Suiza. La tarjeta que dice italiano pertenece a Italia.”

**Resolve:** “¡Candado abierto! Dos países distintos pueden compartir montañas, carreteras y hasta una lengua.”

The final line is supported: Italian is one of Switzerland's four national languages and Italy's official language.

### Celebration

**Narration:** “Las dos páginas vuelven a girar dentro del Pasaporte. La aguja de Bussola hace clic. Curiosidad encendida. Sello Ojo de Águila conseguido.”

**On-screen line:** “Dos banderas. Cinco pistas. Una Curiosidad despierta.”

No generic supervision, scoring lecture, or parent confirmation should interrupt the celebration.

## Quiz contract

| Step | Interaction | Correct answer | Learning result |
|---|---|---|---|
| `flag-ch` | Single visual choice | red square + white cross | Recognise the Swiss national flag. |
| `flag-it-order` | Three tap-to-place strips | green, white, red | Reconstruct the Italian tricolour. |
| `language-match` | Two-card match | Switzerland ↔ four national languages; Italy ↔ Italian | Distinguish the language facts without suggesting Switzerland is monolingual. |

All facts are introduced by narration before they are tested. A retry restates the clue rather than saying “wrong.” After two retries, Bussola demonstrates the move and still awards normal completion; the family story must not stall.

## Contextual safety

This is the only safety copy the mission needs:

> **Modo viaje · juega desde tu asiento**

Render it once as a quiet road-chapter badge, never as storyteller audio and never between quiz scenes. Keep any driver/device rule once in parent setup or Parent Corner, outside the children's narrative. Remove the current two safety sentences from the story flow and do not repeat them in objective, fallback, retry, or completion copy.

## Pronunciation notes

| Text | Spanish-friendly cue | Note |
|---|---|---|
| `Bussola` | **BÚS-so-la** | Stress the first syllable; make the double `s` crisp. Treccani gives `/ˈbusːola/`: [bùssola](https://www.treccani.it/vocabolario/bussola2/). |
| `Italia` | **i-TA-lia** | Keep three clear syllables; do not turn `lia` into English “lee-ah.” |
| `Svizzera` | **SVÍT-tse-ra** | Optional Easter egg only; Spanish narration should say **Suiza**. |

Do not add Italian words merely as decoration here; `ROAD-03` owns the Italian phrase-learning layer.

## Concrete runtime rewrite recommendations

- Keep: `id: ROAD-01`, `chapterId: road`, `order: 1`, `reward.stamp: eagle-eye`, `reward.power: curiosity`, `offlineCritical: true`, and all dependencies `false`.
- Change title to **El pasaporte de los dos países** and reduce `durationMinutes` from 8 to 4–5.
- Replace `location.mode: parent-selected` with the existing non-location/offline mode supported by the content contract; the whole mission is app-contained.
- Replace the empty `choices` array with the three quiz steps above and stable choice IDs.
- Replace the single `OUR STORY` fact with the four sourced facts. Keep the fictional passport clearly inside `storyBeat`, not in `facts`.
- Replace open-ended role actions with the exact three stage actions. Let the existing rotation choose who receives each role; never ask the adult to assign them.
- Make completion answer-driven. Do not use `team-confirm` or a parent confirmation for the normal path; retain manual/skip recovery only in Parent Corner.
- Remove all four current parent-dependent fallback sentences. One universal recovery is enough: “Bussola abre las tarjetas de práctica; la misión funciona igual sin señal ni ubicación.”
- Add optional narrator segments for intro, three prompts, three retries, three resolves, and celebration. Captions must match narration exactly.
- Keep road safety outside narration as the single badge above.

## Acceptance test

A child can start `ROAD-01` with sound on or captions on, understand every fact, complete all three interactions, recover from mistakes, and reach the celebration without an adult inventing, choosing, reading, assigning, confirming, or supplying real-world information. The mission remains complete offline and does not inspect GPS, route, border, camera, microphone, or live data.
