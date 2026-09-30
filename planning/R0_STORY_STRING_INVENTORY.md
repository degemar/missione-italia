# R0 Story string inventory

**Task:** `ST-R01`  
**Audited:** 30 September 2026  
**Scope:** every string surface that can be seen, heard, or announced in the current app. This is a planning contract only; no runtime copy changes are made here.

## 1. Central UI catalogue

`src/i18n/strings.ts` is the current UI authority: **249 English keys**. Every key in each namespace below must receive an `es` value in R1. Interpolation tokens in braces are immutable.

| Audience/surface | Namespace and complete key coverage | Count |
|---|---|---:|
| App shell, loading, content failure, progress, offline/update | `app.*` (`name`, `tagline`, `label`, `iconAlt`, `loading`, `contentErrorTitle`, `contentErrorBody`, `retry`, `progress`, `offlineReady`, `offlinePreparing`, `offlineFailed`, `update`, `updateBlocked`) | 14 |
| Installation | `install.*` (`summary`, `optional`, `android`, `iphone`) | 4 |
| Shared states/actions | `common.*` (`back`, `close`, `adult`, `continue`, `saving`, `minutesEnergy`, `selected`, `available`, `locked`, `complete`, `manual`, `skipped`, `inProgress`, `yes`, `no`) | 15 |
| Welcome | `welcome.*` (`eyebrow`, `title`, `body`, `begin`, `returning`, `resume`) | 6 |
| Family setup | `setup.*` (`eyebrow`, `title`, `body`, `member`, `nickname`, `ageBand`, `age46`, `age78`, `age911`, `avatar`, `sound`, `note`, `validation`, `save`) | 14 |
| Avatar accessible names | `avatar.*` (`binoculars`, `magnifier`, `compass`) | 3 |
| Opening/tutorial | `opening.*` (`eyebrow`, `title`, `oathTitle`, `step`, `wake`, `next`, `atlas`) | 7 |
| Atlas | `atlas.*` (`eyebrow`, `title`, `body`, `chapterProgress`, `openChapter`, `continueChapter`, `unlock`, `parentUnlockHelp`, `passport`, `epilogue`, `powerAwake`, `powerWaiting`) | 12 |
| Chapter/route choice | `chapter.*` (`eyebrow`, `next`, `openMission`, `mysteryTitle`, `parentLater`, `routeTitle`, `routeBody`, `chooseRoute`, `routeChosen`, `parentRouteHelp`, `parentRouteSelected`) | 11 |
| Mission card | `mission.*` (`eyebrow`, `location`, `rolesTitle`, `hearStory`, `pauseNotice`, `roleAssignment`, `rotateRoles`, `noPair`) | 8 |
| Read-aloud story | `story.*` (`eyebrow`, `title`, `safety`, `lookUp`, `pause`) | 5 |
| Eyes-up interstitial | `lookup.*` (`eyebrow`, `title`, `body`, `ready`) | 4 |
| Roles, quiz and phrase cards | `challenge.*` (`eyebrow`, `title`, `tapRole`, `roleDone`, `showAll`, `answerTitle`, `checkAnswer`, `takeAnotherLook`, `correct`, `teamDone`, `rolesRemaining`, `chooseAnswer`, `retry`, `italianTitle`, `pronunciation`, `gesture`) | 16 |
| Mission alternatives | `fallback.*` (`title`, `body`, `noGps`, `closed`, `weather`, `tired`, `manual`, `skip`) | 8 |
| Celebration | `celebration.*` (`eyebrow`, `completedTitle`, `manualTitle`, `skippedTitle`, `stamp`, `powerAwake`, `powerProgress`, `fact`, `next`, `chapter`, `passport`, `finishStory`) | 12 |
| Passport | `passport.*` (`eyebrow`, `title`, `progress`, `powers`, `stamps`, `discoveries`, `emptyStamps`, `emptyDiscoveries`, `home`, `epilogue`, `stampFrom`, `stampFromManual`, `manualStamp`, `savedMarker`, `savedMission`) | 15 |
| Epilogue | `epilogue.eyebrow` | 1 |
| Save/storage/status announcements | `status.*` (`memoryOnly`, `quota`, `storageError`, `recovered`, `newerSave`, `invalidSave`, `saved`, `saveError`, `chapterUnlocked`, `routeSaved`, `settingsSaved`, `storageChecked`, `diagnosticsReady`, `resetComplete`, `familyDeleted`) | 15 |
| Role names | `role.*` (`spotter`, `detective`, `navigator`, `unassigned`) | 4 |
| Adult labels embedded in child flow | `adult.*` (`unlockChapter`, `routeTitle`, `rotateRoles`, `showAllClues`, `fallbackTitle`) | 5 |
| Parent gate and accessibility | `parentEntry.*` (`label`, `holding`, `progress`, `accessibleLabel`, `confirmTitle`, `confirmBody`, `cancel`, `confirm`) | 8 |
| Parent Corner | `parent.*`: all 58 existing keys, from `title` through `done`, including mission/chapter controls; route; comfort; offline/update; storage/persistence; help/install; diagnostics; local-data actions; reset/delete confirmations | 58 |
| Render recovery | `recovery.*` (`renderTitle`, `renderBody`, `retry`, `openParent`) | 4 |
| **Total** | No uncatalogued key inside this file | **249** |

The generated missing-key message `Interface text unavailable ({key}).` is also parent/error-facing and needs the key `i18n.missing` in R1.

## 2. Story content catalogue

`public/content/trip-manifest.json` contains 975 strings. Identifiers and control values stay unchanged; only the following complete field families are localized:

| Object | Localize | Keep unchanged |
|---|---|---|
| Narrative | `narrative.opening.storyBeat`, `youngestAction`, `familyOath`, every `tutorialSteps[]`; every value under `narrative.states` | object keys |
| Chapters (4) | `title`, `openingBeat`, `closingBeat` | `id`, `order`, dates, `power`, `status`, `missionIds` |
| Excursion selection (3 pairs) | `thursdayShortTrip.recommendation`, `rule`; each pair `label`, `reason` | IDs, status, variant IDs, recommended ID |
| Missions (17) | `title`, `storyBeat`, `objective`, `location.label`; every `roles[].action`; `choices[].label` and `hint`; `facts[].text`; all `completion` display lines; all `fallbacks` values; every `safety[]` | IDs, order, chapter/date/status/energy, role IDs, choice IDs/correct, fact label enum, completion mode/state IDs, reward IDs, source IDs, review dates, dependency flags |
| Mission variants (6) | `title`, `locationLabel`, `storyBeat`, `objective`; every role action, choice label/hint, fact text, completion display line, fallback and safety line | variant/pair IDs and the same control/source fields as missions |
| Italian phrases (5) | add Spanish `es` meaning and Spanish gesture instruction; pronunciation is reviewed, not mechanically translated | exact Italian `it` spelling |
| Rewards | `powers[].label`, `stamps[].label` in `public/content/rewards.json` | power, chapter and stamp IDs |

`facts[].label` remains the stable enum (`FACT`, `TRADITION`, `LEGEND`, `OUR STORY`) and is rendered through localized labels: `HECHO`, `TRADICIÓN`, `LEYENDA`, `NUESTRA HISTORIA`.

No visible copy is expected from `assets.json` or `content-package.json`. Their licences, paths, versions, hashes and status values are operational metadata and must not be translated.

## 3. Visible strings outside the catalogues

These are mandatory migration items for R1; leaving them in place would create mixed-language screens.

| Source | Inventory | Audience |
|---|---|---|
| `src/platform/recovery-catalogue.ts` | Seven titles and seven parent messages: render, content load, IndexedDB, service worker, map tiles, location and cloud | Parent, errors, accessibility |
| `index.html` | `<html lang="en">`; document title and Apple app title (`Missione Italia`, unchanged brand) | Browser/PWA/accessibility |
| `vite.config.ts` | manifest `name`, `short_name`, `description` | PWA/install surfaces |
| `src/main.tsx` | thrown developer error `Application root was not found.` | Developer only; no localization required unless surfaced later |
| Diagnostic preview | diagnostic property/state codes | Parent technical preview; codes remain invariant and are explained by localized surrounding copy |

## 4. Classification rules for R1

- **Child:** story, role, quiz, clue, celebration, Passport and child-visible fallback copy.
- **Parent:** setup, route choice, permissions, storage, updates, diagnostics, install and destructive-action copy.
- **Accessibility:** alt text, accessible names, progress/status announcements, caption text and non-audio equivalents. These are translated even when visually hidden.
- **Errors:** recovery titles/messages and missing-key fallback. Diagnostic codes remain stable.
- **PWA:** browser language, install metadata and platform-specific installation help.
- Stable IDs, gameplay states, source IDs, hashes, dates and interpolation tokens are never translated.
- R1 must fail its content check when any Spanish key/field is missing; English is the runtime fallback, not permission to ship an incomplete Spanish surface.

## Acceptance result

`ST-R01` is complete: all current visible/heard/announced string sources are covered, and every field family is classified as localized or invariant.
