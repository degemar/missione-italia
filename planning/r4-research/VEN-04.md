# R4 research — `VEN-04` El mapa que se escucha

**Reviewed:** 1 October 2026  
**Runtime edited:** no  
**Recommendation:** replace the open-ended sound hunt with a complete three-scene mystery about Venice's invisible sound codes. Bussola supplies the story, facts, role order, choices, retries, and resolution. Real-world listening becomes an optional atmospheric moment, never evidence that an adult must judge.

## Existing-copy audit

The current Spanish mission is mostly procedure: stop, hand control to an adult, distribute three roles, keep time, invent or notice three clues, compare them, and confirm success. The repeated safety and accessibility explanations interrupt Bussola just when the story should begin. It also gives the adult responsibility for deciding what counts as a sound, a visual equivalent, or a completed mission.

Keep the stable mission ID, Venice chapter slot, reward, power, offline behavior, and automatic three-role rotation. Replace the title, story, objective, role actions, fact card, completion, retries, and fallbacks. The new mission uses verified Venetian sound systems rather than generic listening advice, works with captions and shapes alone, and contains no parent-authored story or assignment.

## Verified fact bank

| Proposed source ID | Child-sized fact | Primary evidence | Use |
|---|---|---|---|
| `SRC-VEN-WATER-ARTERIES-01` | Los canales y la red de pequeños **rii** forman las arterias de una ciudad construida sobre el agua. | UNESCO describes the canals, including the Giudecca, St Mark's and Grand canals, plus the network of small `rii`, as the arteries of the city on water: [UNESCO World Heritage Centre — Venice and its Lagoon](https://whc.unesco.org/en/list/394). | Scene 1 map mystery. |
| `SRC-VEN-WATER-MOBILITY-01` | En Venecia se puede avanzar a pie o por el agua; el transporte público acuático recorre vías como el Canal Grande y el Canal de la Giudecca. | The official city tourism service describes movement on foot or by water and the waterborne public routes: [Venezia Unica — Public transport](https://www.veneziaunica.it/en/things-to-do-in-venice/public-transport). | Optional reveal card; supports the living-water-map image without route advice. |
| `SRC-VEN-BOAT-SIGNAL-01` | Las señales acústicas de las embarcaciones no son música al azar: la normativa municipal las reserva para peligro, cruces, maniobras, niebla o poca visibilidad. | Article 2.23 of the municipal water-traffic regulation lists those situations. The City identifies the regulation as governing urban `rii` and canals: [Comune di Venezia — Circolazione acquea, normativa](https://www.comune.venezia.it/it/node/2073) and [official regulation PDF, p. 6](https://www.comune.venezia.it/sites/default/files/flex/files/f/a/4/D.c442a6c2ee4f14450b01/Regolamento_circolazione_acquea_marzo_2016.pdf). | Scene 2 message mystery. |
| `SRC-VEN-ACQUA-ALTA-01` | La misma marea no aparece igual en toda Venecia porque el suelo está a alturas distintas. En Piazza San Marco empieza a notarse por encima de 82 cm; otras zonas necesitan niveles mayores. | The City explains the different pavement elevations and gives the San Marco, Rialto, and station-area examples: [Comune di Venezia — Venezia e l'acqua alta](https://www.comune.venezia.it/it/content/venezia-e-lacqua-alta). | Post-quiz fact reveal; prevents the false idea that the whole city floods uniformly. |
| `SRC-VEN-TIDE-SOUND-01` | El aviso municipal de marea usa un sonido de atención y después un código: una nota prolongada para +110 cm; dos tonos ascendentes para +120; tres para +130; cuatro para +140 o más. | The municipal page defines all four patterns and says that counting the sounds identifies the expected level: [Comune di Venezia — Sirene allertamento acqua alta](https://www.comune.venezia.it/en/node/5741). | Scene 3 visual counting code. |

## Factual caveats

- Do not call `acqua alta` a rainstorm or a permanent flood. The City describes it as a natural, ordinarily short-lived tidal phenomenon.
- Do not imply that one tide level affects every part of Venice at the same moment. Pavement heights differ significantly.
- A warning signal precedes the expected rise; it does not mean the child's current spot is already underwater.
- Never reproduce, imitate, or sample the real municipal warning sounds in the app. Scene 3 uses paper bars and spoken counting only, so nobody confuses a game sound with a real alert.
- The level code is educational, not operational guidance. The app has no live tide feed. Do not show a current level, make a route decision, or tell the family how to respond to a real alert.
- The official sound-pattern page was last updated in 2020, while City records show continued maintenance of the warning system in 2026. Recheck the pattern immediately before production freeze and keep the source date visible in editorial metadata.
- Do not say every boat horn means the same thing. The municipal regulation lists several limited contexts; the mission asks only which illustrated situation is a legitimate message.
- Do not ask children to identify the purpose of a real boat from its sound. Engines, wakes, bells, voices, and construction noise are variable and ambiguous.
- `Rii` is the Venetian plural used for small canals. Explain it once; do not translate it as ordinary rivers.
- Omit fleet counts, route numbers, fares, timetables, live tide values, and walkway availability. They are changeable and unnecessary for this story.
- The UNESCO “arteries” description is an illuminating metaphor, not a claim that Venice has no pedestrian routes.

## Narrative hook

### Recommended title

**El mapa que se escucha**

### Story beat — 86 words

> Bussola despliega un mapa de Venecia, pero sus líneas azules han desaparecido. Una ráfaga las convirtió en tres ondas invisibles y las escondió dentro de caracolas de papel. La primera recuerda por dónde late la ciudad. La segunda guarda un mensaje entre barcos. La tercera conoce un código que cuenta la marea. Abrid las tres caracolas y devolved cada onda a su lugar. Cuando agua, aviso y marea vuelvan a unirse, aparecerá el mapa que no se mira con los ojos: el mapa que se escucha.

The opening contains only story and destination context. It does not mention handing over a phone, allocating jobs, validating an observation, or inventing dialogue.

## Complete authored play sequence

The existing rotation assigns Vigía, Detective, and Guía before the first scene. Bussola announces the name and exact action. The assignment is a deterministic app behavior, never a parent prompt. Any team member may tap for a sibling without changing the story.

### Scene 1 — La arteria azul

**Narration:** “Primera caracola. Venecia nació entre pequeñas islas. Sus canales y sus pequeños *rii* forman las arterias de una ciudad sobre el agua. Vigía, despierta la ruta azul.”

Show one paper city cutaway with three large tappable paths:

1. blue canal with a tiny wave — correct;
2. terracotta roofline with a chimney — distractor;
3. pale cloud trail above the skyline — distractor.

**Kind retry:** “Busca la línea por donde puede viajar el agua: la ruta azul con una ola.”

**Resolve:** “¡Arteria encontrada! La primera línea vuelve al mapa.”

#### Optional listening window — La ventana del canal

After the resolve, offer **Abrir la ventana** or **Seguir el misterio**. If opened, a seven-second paper ripple expands while the screen remains unchanged. Then show five equal, narrated icons: water, boat, footsteps, voices, and quiet/visual waves. Every choice is valid and adds only a decorative texture to the restored canal.

Caption: “¿Qué llegó hasta vuestra ventana?”

The app records no sound, requests no microphone, and never checks the answer. Selecting **quiet/visual waves** produces the same progress and celebration as any sound icon. The window is optional atmosphere, not a completion gate.

### Scene 2 — El mensaje en la niebla

**Narration:** “Segunda caracola. En los canales, una señal acústica no es una canción de saludo. Puede avisar de un peligro, un cruce, una maniobra o de que la niebla esconde el camino. Detective, encuentra la escena que necesita un mensaje.”

Show three illustrated story cards:

1. two boats approaching a narrow bend behind translucent fog — correct;
2. three pigeons eating drawn crumbs in an empty square — distractor;
3. Bussola wearing a paper party hat — fictional distractor.

No horn sound is played. Selecting a card triggers a soft paper fold, not an acoustic imitation.

**Kind retry:** “La señal ayuda cuando dos rutas no se ven bien. Busca las barcas junto a la curva con niebla.”

**Resolve:** “¡Mensaje entendido! La segunda onda ya sabe dónde ir.”

### Scene 3 — La marea que cuenta

**Narration:** “Tercera caracola. Cuando se espera *acqua alta*, la ciudad usa un aviso y después cuenta el nivel con sonidos. Una nota larga indica ciento diez centímetros; dos tonos ascendentes, ciento veinte; tres, ciento treinta; cuatro, ciento cuarenta o más. Guía, Bussola busca ciento treinta. Elige su código.”

Show four oversized paper cards simultaneously:

1. one horizontal bar labelled `110`;
2. two ascending bars labelled `120`;
3. three ascending bars labelled `130` — correct;
4. four ascending bars labelled `140+`.

Each card has dots and numerals so the age-four path is counting, not reading. Narration reads the label when a card receives focus. Do not animate the bars like an audio meter and do not play ascending tones.

**Kind retry:** “Ciento treinta viaja en tres pasos. Busca tres barras que suben: una, dos, tres.”

**Resolve:** “¡Código reconstruido! La tercera onda enciende el mapa.”

### Fact reveal — Una marea, muchas alturas

Reveal a layered paper profile of Piazza San Marco, Rialto, and the station area at three different heights.

> “Venecia no tiene un suelo completamente plano. Por eso una misma marea aparece de forma distinta según la altura de cada lugar. El agua puede empezar a notarse en Piazza San Marco antes que en zonas más altas.”

Keep the 82, 105, and 135 cm examples behind an optional **Ver las alturas** fold-out. They are sourced context, never route advice.

### Final reveal and celebration

The blue canal line pulses once, the fog card folds into a silver speech-wave, and the three tide bars become the teeth of Bussola's compass. The three paths join into a glowing map.

**Narration:** “Agua, aviso y marea: las tres ondas vuelven a su sitio. Venecia no sólo se mira; también se descifra. Brújula despierta: brilla el Asombro. ¡Sello Cazador de sonidos conseguido!”

**On-screen line:** “Tres ondas. Un mapa invisible. Venecia vuelve a latir.”

Do not place a supervision notice, privacy explanation, manual confirmation, or role reassignment between the reveal and the stamp.

## Quiz contract

| Step ID | Interaction | Correct answer | Learning result |
|---|---|---|---|
| `water-artery` | One illustrated route choice | blue canal / `rii` | Recognise canals as structural routes in Venice's water-city system. |
| `boat-message` | One illustrated situation choice | boats at a foggy narrow bend | Understand that acoustic signals carry purposeful navigation messages rather than random celebration. |
| `tide-code-130` | One counted pattern choice | three rising bars | Decode the municipal +130 cm pattern without hearing or replaying a real warning. |

Every answer is taught by Bussola before it is tested. A retry repeats the decisive clue instead of saying “incorrecto.” After two retries, Bussola highlights the correct card, completes the scene, and continues. The story never stalls and no adult validates an observation.

## Contextual safety

This mission needs one silent context badge above the opening scene:

> **Pausa de canal · juntos y lejos del borde**

Show it once when the mission is opened outdoors. Do not narrate it, expand it into a lecture, or repeat it in the story, roles, retries, fact reveal, or celebration. Detailed waterside and real-alert guidance belongs in Parent Corner. If the family is indoors, show **Misterio de papel · listo en cualquier lugar** instead.

## Pronunciation notes

| Text | Spanish-friendly cue | Direction |
|---|---|---|
| `Bussola` | **BÚS-so-la** | Stress the first syllable; keep the double `s` crisp. |
| `rii` | **RÍ-i** | Two clear vowel beats. Explain once as “pequeños canales venecianos.” Italian-language review remains required before recording. |
| `acqua alta` | **ÁK-kua ÁL-ta** | Keep the doubled `c` clean; never translate the on-screen Italian label as a place name. Follow immediately with “marea alta” in Spanish. |
| `Canal Grande` | **ca-NÁL GRÁN-de** | Optional map label only; do not anglicise `Canal`. |
| `Venezia` | **ve-NÉT-tsia** | Use only on the illustrated Italian map seal; narration says **Venecia**. |
| `vaporetto` | **va-po-RÉT-to** | Optional mobility fold-out only. Preserve the double `t`; do not describe every vessel this way. |

The pronunciation cues are editorial aids, not literal captions. A native Italian review is required before audio production.

## Exact runtime rewrite guidance

- Keep `id: VEN-04`, `chapterId: venice`, `order: 7`, `reward.stamp: sound-scout`, `reward.power: wonder`, `offlineCritical: true`, and all optional dependencies `false`.
- Change the title to **El mapa que se escucha**, keep quiet energy, and target 5–6 minutes.
- Replace the current `storyBeat` with the 86-word hook above.
- Set the objective to: **“Reconstruir las tres ondas del mapa invisible: agua, aviso y marea.”**
- Make the mission app-contained. Coordinates remain `null`; GPS, live data, camera, microphone, recording, and actual environmental sound remain unnecessary.
- Replace the current role prose with the three exact scene actions: Vigía restores the blue canal, Detective finds the fog-message card, and Guía selects the three-bar tide code. Existing automatic rotation chooses names before the story; no parent selects or assigns a child.
- Add three typed story scenes or an equivalent ordered interaction structure. The current flat `choices` array can represent only one question and should not be overloaded with nine unrelated options. Each scene needs stable option IDs, one correct answer, one retry, one resolve, and its narrator segment.
- Register the five source claims above in `public/content/sources.json` and the source register. `SRC-VEN-WATER-MOBILITY-01` is optional if the mobility fold-out does not ship.
- Mark the water-artery, boat-signal, variable-height, and tide-code cards **HECHO**. The escaped waves, paper shells, silent map, and glowing compass are **NUESTRA HISTORIA**.
- Replace the current generic `OUR STORY` line, observation-count completion, adult validation, timer ownership, and repeated “hearing is optional” explanation. Accessibility is expressed through equivalent bars, dots, captions, and quiet-wave choices rather than narrated policy.
- Replace all four fallbacks with one authored recovery: **“El mapa invisible vive dentro de Bussola; las tres caracolas funcionan igual bajo techo, sin ubicación, sin conexión y con el volumen apagado.”** Show it only when the app actually enters a recovery state.
- Completion is answer-driven after the third scene. Preserve skip/manual recovery in Parent Corner, outside the narrated sequence.
- Add narration segments for intro, three prompts, three retries, three resolves, the variable-height fact reveal, final reveal, and optional listening window prompt. Captions match spoken words exactly.
- Do not include official siren audio, an imitation, synthesized rising tones, a current tide value, or links that children must open. Scene 3 is visual and narrator-counted.
- Audio never autoplays on navigation. Visible text and semantic icons contain every clue, and completion never depends on hearing.
- Art direction: layered paper canal map, translucent vellum fog, folded wave-lines, three shell envelopes, brass compass details, and tide bars cut like theatre scenery. No brand marks, real alarm graphics, photorealistic floods, distressed faces, or disaster imagery.
- Set `fact_checked_on: 2026-10-01`. Recheck the municipal tide-code source no later than `2026-10-03`; stable UNESCO history can follow the normal annual review after the trip.

## Acceptance test

A child can open `VEN-04` with narration, captions only, or volume muted; receive every needed fact from Bussola; complete all three scenes; recover after mistakes; and reach the stamp without an adult inventing, assigning, timing, interpreting, or confirming anything. The same path works indoors and offline. The optional listening window accepts any sound or quiet/visual waves, stores no recording, and cannot block progress. The mission never uses a real warning sound, live tide data, microphone, GPS, canal-edge proof, or operational travel guidance.
