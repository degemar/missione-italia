# R4 research — VEN-01 · El guardián imposible

**Mission:** `VEN-01` · **Research date:** 1 October 2026 · **Runtime edited:** no

## Recommendation

Turn the current “find the wings, then confirm three roles” exercise into a short mystery that the app tells from beginning to end. Bussola receives three impossible clues — a paw, a feather and a book — and the children must find the creature that joins them. The reveal explains why Venice repeats this animal everywhere; a final illustrated puzzle introduces the wonderfully strange lion *in moeca*, whose spread wings resemble a crab.

The app supplies the riddle, the observation target, all choices, the cultural reveal and the fallback image. Nobody assigns roles, invents a story, selects a safe object or decides how the mission continues.

Use one context cue, once, immediately before the outdoor search: **“La pista se busca desde el camino, lejos del borde del agua.”** No other safety paragraph belongs in this story.

## What is weak in the current mission

- The title gives away the answer before the mystery starts.
- The story is mostly procedure: stop, assign three jobs, confirm readiness and return to the phone.
- `spotter`, `detective` and `navigator` make the family administer the game instead of playing it.
- “El adulto elige cualquier león” leaves the key creative and navigational decision unwritten.
- The eyes-up screen and two safety statements repeat the same interruption in different words.
- The quiz asks only whether the lion has wings, then ends just when the cultural story becomes interesting.
- The current fact is correct but thin. It omits the open book, its message, the many poses of the lion and the child-friendly *in moeca* surprise.
- The copy mixes history and legend without giving either a memorable narrative frame.

## Verified story material

| Story-worthy detail | Evidence status | Child-facing use |
|---|---|---|
| The winged lion represents Saint Mark and became the emblem of the Venetian Republic. | Historical/iconographic fact. Palazzo Ducale identifies the lion as the symbol of Saint Mark and, by extension, the Serenissima. | The creature is not a random fantasy animal: it is Venice’s repeated guardian-sign. |
| Venetian merchants brought Saint Mark’s remains from Alexandria in 828; Mark then became Venice’s patron. | Historical account used by the official Basilica and MUVE. Avoid embellishing the method of transport; it is not needed in this mission. | One sentence in the optional “Para mentes curiosas” card, not in the opening riddle. |
| The lion often holds an open book carrying `Pax tibi Marce, evangelista meus` — “Pace a te, Marco, mio evangelista.” | Documented iconography. The official Basilica and Palazzo Ducale pages both identify the phrase and meaning. | After the lion is found, the book whispers the word **PAX** and Bussola translates it as **PAZ**. |
| The lion can be shown in several poses. The frontal, wing-spread form is called *in moeca* because it resembles a crab with open claws. | Official Comune di Venezia description. | A self-contained illustrated finale: rotate/reveal the frontal lion and choose the animal hidden in its silhouette — crab, octopus or gull. |
| In Carpaccio’s 1516 painting, the lion has rear paws in the lagoon and front paws on land, referring to the Venetian state on sea and land. | Fact about this specific artwork, not every lion. | Optional deep-dive card only. Do not ask children to find this feature on an arbitrary street lion. |
| The lion began to establish itself progressively as a symbol of Venice from 1261; before that it had long been connected with Mark in religious imagery. | MUVE’s “Venice and Egypt” exhibition account. | Editorial guardrail: do not imply that the emblem appeared fully formed in 828. |

## History and legend boundary

The sources distinguish two layers and the app must do the same:

- **History/iconography:** Mark’s remains arrived from Alexandria in 828; he became Venice’s patron; the winged lion became the emblem of the Republic and appears throughout Venice.
- **Ancient tradition/legend:** an angel appeared to Mark while he passed through the lagoon and foretold that his remains would one day rest there. Introduce this only as **“Una antigua leyenda veneciana cuenta que…”** Never narrate it as verified history.
- **Iconographic convention:** official Venetian sources explain the open book as a message of peace and some sword-bearing forms as images of force or war. Not every lion follows that neat book/peace versus sword/war division, so never grade a child’s observed lion against it.
- **Artwork-specific reading:** land-and-water paws belong to the reading of Carpaccio’s 1516 painting. Do not generalize it to every sculpture, flag or relief.

The main story does not need the angel legend. It works better as an optional page unlocked after completion, clearly labelled **LEYENDA** rather than **HECHO**.

## Story direction

### Display title

**El guardián imposible**

Keep `VEN-01`, `venice`, `wonder`, `eagle-eye`, completion states and the stable quiz IDs unchanged.

### Opening narration

> Al entrar en Venecia, Bussola oye tres sonidos que nunca deberían ir juntos: el ras de una garra, el ffff de unas alas y el frufrú de una página de piedra. En su cristal aparecen tres dibujos —una pata, una pluma y un libro— junto a un mensaje: **“Encontrad al guardián que camina, vuela y guarda palabras.”** Está escondido a plena vista. Cuando lo encontréis, la primera chispa de Asombro despertará.

Primary CTA: **Descubrir las tres pistas**

Visual grammar: the three clue symbols stamp themselves onto a folded Venetian map. Do not show the complete lion yet. The audio uses a soft scratch, one paper-wing beat and a page turn; no realistic roar is needed.

## Complete playable sequence

The core path lasts about four minutes and remains fully playable without GPS, a venue, a parent prompt or live data.

### Beat 1 — Memorise the impossible creature

Reveal three large illustrated clues one at a time:

1. **GARRA** — “Tiene fuerza de león.”
2. **ALA** — “Puede volar en la imaginación.”
3. **LIBRO** — “Guarda un mensaje.”

Narration:

> Garra, ala, libro. Tres pistas, una sola criatura. Guardadlas en la memoria: Bussola apagará la pantalla para que la ciudad pueda hablar.

CTA: **Buscar al guardián**

### Beat 2 — Outdoor observation

Show only this single context line before dimming the screen:

> La pista se busca desde el camino, lejos del borde del agua.

Then show a dark, low-distraction state with two actions:

- **Ya lo hemos visto**
- **Abrir la pista ilustrada**

No timer, role checklist, parent confirmation or “adult holds the phone” copy. A lion seen on a carving, flag, sign, column or façade is equally valid.

### Beat 3 — Rebuild the guardian

On return, the three existing stable choices become large illustrated creature cards.

**Prompt:** “¿Qué criatura reúne las pistas de Bussola?”

| Stable choice ID | New Spanish label | Illustration | Result |
|---|---|---|---|
| `wings` | **Un león con alas** | lion, feathered wings and a partly hidden book | correct |
| `fins` | **Un león con aletas** | lion with fish fins and a shell | retry |
| `wheels` | **Un león con ruedas** | lion on two cart wheels | retry |

**Correct response:**

> ¡Garra y ala encajan! Habéis encontrado al león de San Marcos, el símbolo que Venecia repite por toda la ciudad.

**Retry for `fins`:**

> Las aletas resolverían un misterio del mar, pero Bussola oyó plumas. Busca la criatura con alas.

**Retry for `wheels`:**

> Las ruedas sirven en muchas ciudades. Esta pista pertenece a la ciudad de los canales: busca las alas.

### Beat 4 — What did your lion carry?

This is an observation response, not a scored question. Every answer continues the story.

**Prompt:** “Mira vuestra pista: ¿qué guarda el león?”

- **Un libro abierto** — “En muchos leones, el libro lleva un saludo de paz.”
- **Una bandera o una espada** — “El guardián cambia de objeto y de postura en distintas imágenes.”
- **No se distingue** — “También vale. Las alas ya han revelado quién es.”

This branch prevents the app from claiming that every observed lion has the same book and supports distant or weathered carvings without asking a parent to adjudicate.

### Beat 5 — The word inside the stone book

The illustrated book opens. Highlight only `PAX`, then transform the `X` into the Spanish `Z`.

Narration:

> Muchos leones sostienen un libro con una frase en latín: **“Pax tibi Marce, evangelista meus.”** Empieza con **PAX**: paz. El guardián que parecía dispuesto a rugir estaba guardando un saludo: **“Paz a ti, Marco, mi evangelista.”**

CTA: **Abrir el último secreto**

Do not ask children to read or repeat the full Latin sentence. `PAX → PAZ` is the age-inclusive word puzzle.

### Beat 6 — The lion that becomes a crab

The app supplies an original, simplified illustration of a frontal lion with its wings spread. It then reduces the silhouette to a round face and two wing “claws.”

Narration:

> Los venecianos dibujaron este león de muchas maneras. Cuando mira de frente y abre las alas, su silueta puede esconder otro animal.

**Prompt:** “¿Qué animal aparece dentro del león?”

1. **Un cangrejo** — correct
2. **Un pulpo** — retry
3. **Una gaviota** — retry

**Correct response:**

> ¡Un cangrejo! Esta forma se llama **león in moeca** porque sus alas abiertas recuerdan las pinzas de un cangrejo. Venecia ha escondido dos animales en uno.

**Retry:**

> Mira las alas como si fueran dos pinzas abiertas a los lados de una cara redonda.

This finale is solvable from the app’s own artwork. It does not depend on which lion the family found outside.

## Completion and reward

### Reveal narration

> El león baja una garra sobre el mapa. La pata se convierte en sello, las alas abren una ventana de papel y del libro sale una palabra luminosa: **PAZ**. Bussola comprende la primera regla de Venecia: aquí, una imagen puede contar una historia entera sin decirla en voz alta. La primera chispa de Asombro ya está despierta.

**Success line:** “Garra, ala, libro: el guardián ha despertado el Asombro.”

**Stamp:** Keep `eagle-eye`, redesigned as a small winged paw-print around an open book.

**Discovery fact:** “El león alado representa a San Marcos y fue el emblema de la República de Venecia.”

**Optional curiosity card:**

> **PARA MENTES CURIOSAS** · En un cuadro de 1516 pintado por Vittore Carpaccio, el león apoya las patas traseras en la laguna y las delanteras en tierra. Ese detalle representaba el poder de Venecia en el mar y en tierra firme.

## Storyteller script and timing

| Segment | Approx. length | Spoken caption | Audio/visual beat |
|---|---:|---|---|
| `VEN-01-S01` | 13 s | “Al entrar en Venecia, Bussola oye tres sonidos que nunca deberían ir juntos: el ras de una garra, el ffff de unas alas y el frufrú de una página de piedra.” | Scratch, paper wing, page turn; three empty seals appear. |
| `VEN-01-S02` | 12 s | “En su cristal aparecen una pata, una pluma y un libro. Encontrad al guardián que camina, vuela y guarda palabras.” | Each clue stamps once; no lion silhouette yet. |
| `VEN-01-Q01` | 7 s | “¡Garra y ala encajan! Habéis encontrado al león de San Marcos.” | Correct creature assembles from the three pieces. |
| `VEN-01-R01` | 14 s | “Muchos leones sostienen un libro que empieza con PAX: paz. El guardián que parecía dispuesto a rugir estaba guardando un saludo.” | Stone book opens; `PAX` becomes `PAZ`. |
| `VEN-01-R02` | 12 s | “De frente y con las alas abiertas, otro animal se esconde en su silueta. Los venecianos lo llamaron león in moeca.” | Lion rotates to front; wings become crab-claw shapes. |
| `VEN-01-C01` | 12 s | “La garra se vuelve sello, las alas abren una ventana y del libro sale PAZ. La primera chispa de Asombro ya está despierta.” | Stamp lands once; Wonder point lights. |

Narration should be warm, conspiratorial and unhurried, as if sharing a secret discovered in the stonework. Captions must match the spoken Spanish exactly. Sound effects support the three clues but never carry information on their own.

## Fallbacks that preserve the story

- **No lion found / rain / tired legs:** **Abrir la pista ilustrada** reveals the same three-choice creature puzzle, then continues through the book and *in moeca* scenes. No “manual completion” prose is needed.
- **No GPS:** irrelevant; this mission never checks location.
- **Closed venue:** irrelevant; no entry or ticket is required.
- **Offline:** cache the three creature cards, book transformation, *in moeca* illustration, narration and captions in the app shell.
- **Reduced motion:** reveal clue stamps and state changes with short cross-fades; do not rotate the lion. Show the frontal silhouette beside the profile instead.

The fallback is an authored branch, not a request for parents to create an alternative.

## Pronunciation notes

| Text | Language | Spanish-readable aid | Editorial rule |
|---|---|---|---|
| `leone alato` | Italian | le-**Ó**-ne a-**LÁ**-to | Optional label meaning “león alado.” Use an Italian voice clip if spoken. |
| `leone di San Marco` | Italian | le-**Ó**-ne di san **MÁR**-ko | Optional discovery label. Spanish narration may continue to say “león de San Marcos.” |
| `in moeca` | Venetian expression | in mo-**É**-ka | Treat as a local name, not as a pronunciation exercise; narrator models it once. |
| `Pax tibi Marce, evangelista meus` | Latin | — | Do not display a pseudo-Italian spelling. Narrator may say it once; children only decode `PAX → PAZ`. |

The app must never score pronunciation or require a child to repeat these terms.

## Exact content-model rewrite recommendations

1. Change the Spanish display title from `Encuentra el león alado` to `El guardián imposible`.
2. Replace `storyBeat` with the opening narration above.
3. Replace the objective with: `Resolver tres pistas, encontrar el símbolo alado de Venecia y descubrir el animal escondido en su silueta.`
4. Replace `locationLabel` with: `En la ruta por Venecia o con la pista ilustrada de Bussola`.
5. Stop rendering the three `roles` for this mission. If the current schema requires them, retain the keys only as hidden compatibility data until the schema is revised; do not expose role assignment in R4.
6. Keep the stable choice IDs `wings`, `fins` and `wheels`, but replace their Spanish labels, hints and artwork with the Beat 3 table.
7. Add a non-scored `observation` branch with `book`, `flag-or-sword` and `not-visible`; every branch must converge without affecting completion.
8. Add a self-contained illustrated `bonusQuiz` for *in moeca* with stable new IDs `crab`, `octopus` and `seagull`.
9. Replace the generic completion block with the reveal narration and success line above.
10. Replace the two-item `safety` array with one visible context cue: `La pista se busca desde el camino, lejos del borde del agua.` Render it only before the outdoor observation, never again in story, quiz or celebration.
11. Replace all four generic fallbacks with one authored action, `Abrir la pista ilustrada`, which resumes at Beat 3.
12. Preserve `reward.stamp = eagle-eye`, `reward.power = wonder`, scoring, save states and offline-critical status.
13. Add source-backed facts with distinct labels: `HECHO` for Mark/lion/book iconography and `LEYENDA` only for the optional angel tradition.
14. Do not use the simplified claim “open book means peace; sword means war” as a quiz rule. It is a source-described convention, not a reliable classifier for every surviving lion.

## Source-register recommendations

- Keep `SRC-VEN-LION-01`, but update its claim to the stronger official-museum wording: `The winged lion is the symbol of Saint Mark and, by extension, of the Venetian Republic.`
- Add `SRC-VEN-LION-BOOK-02` for the open book and `Pax tibi Marce, evangelista meus`.
- Add `SRC-VEN-LION-POSES-03` for the poses and the *in moeca* crab comparison.
- Add `SRC-VEN-LION-HISTORY-04` for the 828 arrival, patronage and later emblem history.
- Add `SRC-VEN-LION-CARPACCIO-05` only if the optional 1516 painting card ships.
- Mark the angel account as `legend`, not `fact`, even though official cultural institutions document the tradition.

## Authoritative sources

- [Comune di Venezia — Il leone di San Marco](https://live.comune.venezia.it/it/node/132935) — official explanation of the book, halo and sword; the `andante`, `rampante`, `in moeca`, `in gazzetta` and `vessillifero` poses; and the crab comparison for *in moeca*.
- [Basilica di San Marco — San Marco Evangelista](https://www.basilicasanmarco.it/storia/san-marco-evangelista/) — official Basilica account of the 828 arrival, Mark as patron, the winged lion with book and the phrase `Pax tibi Marce Evangelista Meus`.
- [Palazzo Ducale / Fondazione Musei Civici di Venezia — Sala del Magistrato alle Leggi](https://palazzoducale.visitmuve.it/percorsi-e-collezioni/la-quadreria/sala-del-magistrato-alle-leggi/) — official museum interpretation of Carpaccio’s 1516 *Lion of Saint Mark*, the land/sea paws and the word `pax` in the book.
- [Palazzo Ducale / MUVE — VENETIA 1600: Births and rebirths](https://palazzoducale.visitmuve.it/fr/exposition/exhibition-venetia-1600/) — official civic-museum account of the 828 arrival, Mark becoming patron, the winged lion becoming the Republic’s emblem and the angel episode explicitly within the saint’s legend.
- [Palazzo Ducale / MUVE archive — Venice and Egypt](https://archivio-palazzoducale.visitmuve.it/en/mostre-en/archivio-mostre-en/venice-and-egypt/2011/09/3060/the-exhibition/) — official exhibition history describing the progressive establishment of the lion as Venice’s national symbol from 1261.
- [Venezia Unica / City of Venice — Castello, Naval Art and Traditions](https://www.veneziaunica.it/en/things-to-do-in-venice/itineraries/castello-naval-art-and-traditions) — official tourism confirmation that the winged lion above the Arsenale gate is the symbol of the city.

These claims are historically stable. Recheck only if source URLs move or the shipped story adds new dates, artworks or interpretations.
