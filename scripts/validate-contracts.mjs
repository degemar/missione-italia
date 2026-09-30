import {createHash} from "node:crypto";
import {existsSync, readFileSync, readdirSync, statSync} from "node:fs";
import {dirname, join, relative, resolve} from "node:path";
import {fileURLToPath} from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];
const checks = [];
const fail = (code, message) => failures.push({code, message});
const pass = (message) => checks.push(message);
const bytes = (value) => Buffer.byteLength(JSON.stringify(value), "utf8");
const readJson = (path) => JSON.parse(readFileSync(join(root, path), "utf8"));
const unique = (items) => new Set(items).size === items.length;
const sha256 = (buffer) => createHash("sha256").update(buffer).digest("hex");
const jsonClone = (value) => JSON.parse(JSON.stringify(value));

function filesUnder(path) {
  const absolute = join(root, path);
  return readdirSync(absolute).flatMap((name) => {
    const child = join(absolute, name);
    return statSync(child).isDirectory() ? filesUnder(relative(root, child)) : [relative(root, child).replaceAll("\\", "/")];
  });
}

function visit(value, callback, path = "$") {
  callback(value, path);
  if (Array.isArray(value)) value.forEach((item, index) => visit(item, callback, `${path}[${index}]`));
  else if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) visit(child, callback, `${path}.${key}`);
  }
}

function hasPointer(document, fragment) {
  if (!fragment || fragment === "#") return true;
  if (!fragment.startsWith("#/")) return false;
  let current = document;
  for (const raw of fragment.slice(2).split("/")) {
    const key = raw.replaceAll("~1", "/").replaceAll("~0", "~");
    if (!current || typeof current !== "object" || !(key in current)) return false;
    current = current[key];
  }
  return true;
}

const jsonFiles = [
  ...filesUnder("schemas"),
  ...filesUnder("public/content"),
  ...filesUnder("tests/fixtures"),
  "config/content-validation-policy.json",
  "config/runtime-asset-policy.json"
].filter((path) => path.endsWith(".json") || path.endsWith(".geojson"));
for (const path of jsonFiles) {
  try { readJson(path); } catch (error) { fail("JSON_PARSE", `${path}: ${error.message}`); }
}
if (!failures.length) pass(`${jsonFiles.length} JSON/GeoJSON files parse`);

const schemaPaths = filesUnder("schemas").filter((path) => path.endsWith(".schema.json"));
const schemas = schemaPaths.map((path) => ({path, value: readJson(path)}));
const schemasById = new Map();
for (const schema of schemas) {
  if (schema.value.$schema !== "https://json-schema.org/draft/2020-12/schema") fail("SCHEMA_DRAFT", `${schema.path} is not draft 2020-12`);
  if (!schema.value.$id) fail("SCHEMA_ID", `${schema.path} has no $id`);
  else if (schemasById.has(schema.value.$id)) fail("SCHEMA_ID_DUPLICATE", schema.value.$id);
  else schemasById.set(schema.value.$id, schema);
}
for (const schema of schemas) {
  visit(schema.value, (value) => {
    if (!value || typeof value !== "object" || typeof value.$ref !== "string") return;
    const [base, fragment = ""] = value.$ref.split("#", 2);
    const target = base ? schemasById.get(base) : schema;
    if (!target) fail("SCHEMA_REF", `${schema.path}: unresolved ${value.$ref}`);
    else if (!hasPointer(target.value, fragment ? `#${fragment}` : "#")) fail("SCHEMA_REF", `${schema.path}: missing fragment ${value.$ref}`);
  });
}
if (!failures.some(({code}) => code.startsWith("SCHEMA"))) pass(`${schemas.length} versioned schemas use draft 2020-12 and all $ref targets resolve`);

const manifest = readJson("public/content/trip-manifest.json");
const sources = readJson("public/content/sources.json");
const rewards = readJson("public/content/rewards.json");
const assets = readJson("public/content/assets.json");
const policy = readJson("config/content-validation-policy.json");
const assetPolicy = readJson("config/runtime-asset-policy.json");
const requiredMission = ["id", "order", "chapterId", "date", "scored", "title", "status", "durationMinutes", "energy", "storyBeat", "objective", "location", "roles", "choices", "facts", "completion", "fallbacks", "safety", "reward", "sourceIds", "fact_checked_on", "review_after", "offlineCritical", "dependencies"];
const prohibited = new Set(policy.prohibitedPersistedKeys.map((key) => key.toLowerCase()));
const validDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
const wordCount = (value) => typeof value === "string" ? value.trim().split(/\s+/).filter(Boolean).length : 0;

function existsWithExactCase(relativePath) {
  let current = root;
  for (const segment of relativePath.replaceAll("\\", "/").split("/")) {
    const names = readdirSync(current);
    if (!names.includes(segment)) return false;
    current = join(current, segment);
  }
  return existsSync(current);
}

function pngDimensions(buffer) {
  if (buffer.length < 24 || buffer.toString("hex", 0, 8) !== "89504e470d0a1a0a") return null;
  return {width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20)};
}

function prohibitedErrors(value, prefix) {
  const result = [];
  visit(value, (node, path) => {
    if (!node || Array.isArray(node) || typeof node !== "object") return;
    for (const key of Object.keys(node)) if (prohibited.has(key.toLowerCase())) result.push({code: `${prefix}_PROHIBITED_FIELD`, message: `${path}.${key}`});
  });
  return result;
}

function contentErrors(testManifest, testSources, testRewards, testAssets) {
  const result = [...prohibitedErrors(testManifest, "CONTENT")];
  const add = (code, message) => result.push({code, message});
  const missions = testManifest.missions ?? [];
  const chapters = testManifest.chapters ?? [];
  const missionIds = missions.map(({id}) => id);
  const chapterIds = chapters.map(({id}) => id);
  const sourceIds = (testSources.claims ?? []).map(({id}) => id);
  const powerIds = (testRewards.powers ?? []).map(({id}) => id);
  const stampIds = (testRewards.stamps ?? []).map(({id}) => id);
  const assetIds = (testAssets.assets ?? []).map(({id}) => id);
  const pairs = testManifest.excursionSelection?.candidatePairs ?? [];
  const narrative = testManifest.narrative;
  if (!unique(missionIds)) add("CONTENT_DUPLICATE_MISSION_ID", "mission IDs must be unique");
  if (!unique(chapterIds)) add("CONTENT_DUPLICATE_CHAPTER_ID", "chapter IDs must be unique");
  if (!unique(sourceIds)) add("CONTENT_DUPLICATE_SOURCE_ID", "source IDs must be unique");
  if (!unique(powerIds) || !unique(stampIds)) add("CONTENT_DUPLICATE_REWARD_ID", "reward IDs must be unique");
  if (!unique(assetIds)) add("CONTENT_DUPLICATE_ASSET_ID", "asset IDs must be unique");
  if (!unique(pairs.map(({id}) => id))) add("CONTENT_DUPLICATE_PAIR_ID", "pair IDs must be unique");
  if (missions.filter(({scored}) => scored).length !== 16 || missions.filter(({scored}) => !scored).length !== 1) add("CONTENT_MISSION_COUNT", "expected 16 scored missions and one epilogue");
  if (!narrative?.opening || !narrative?.states || narrative.opening.tutorialSteps?.length !== 3) add("CONTENT_NARRATIVE", "opening, state copy, and exactly three tutorial steps are required");
  for (const key of ["interrupted", "resume", "skip", "manual", "retry", "offline", "closedVenue", "tiredLegs", "badWeather", "endingWithSkips", "endingAllObserved", "mondaySilent"]) {
    if (!narrative?.states?.[key]) add("CONTENT_NARRATIVE", `missing state copy:${key}`);
  }
  if (missions.some(({date}) => date === "2026-10-05")) add("CONTENT_MONDAY_SILENT", "Monday must contain no mission");
  if (!unique(missions.map(({order}) => order)) || missions.map(({order}) => order).sort((a, b) => a - b).some((value, i) => value !== i + 1)) add("CONTENT_ORDER", "mission order must be consecutive 1..N");
  const epilogue = missions.find(({id}) => id === testManifest.epilogueMissionId);
  if (!epilogue || epilogue.scored || epilogue.chapterId !== null) add("CONTENT_EPILOGUE", "epilogue reference must resolve to one unscored mission");
  const chapterMissionIds = chapters.flatMap(({missionIds}) => missionIds ?? []);
  if (!unique(chapterMissionIds)) add("CONTENT_CHAPTER_DUPLICATE_MISSION", "chapter mission references must be unique");
  for (const chapter of chapters) {
    if (!powerIds.includes(chapter.power)) add("CONTENT_DANGLING_POWER", `${chapter.id}:${chapter.power}`);
    for (const id of chapter.missionIds ?? []) {
      const mission = missions.find((item) => item.id === id);
      if (!mission || mission.chapterId !== chapter.id) add("CONTENT_DANGLING_MISSION", `${chapter.id}:${id}`);
    }
  }
  for (const mission of missions) {
    for (const key of requiredMission) if (!(key in mission)) add("MISSION_REQUIRED", `${mission.id ?? "unknown"}:${key}`);
    const missionWords = wordCount(mission.storyBeat);
    if (missionWords < 50 || missionWords > 110) add("MISSION_READ_TIME", `${mission.id}:${missionWords} words`);
    if (!validDate(mission.fact_checked_on) || !validDate(mission.review_after) || mission.review_after < mission.fact_checked_on) add("MISSION_FACT_DATES", mission.id);
    const roles = (mission.roles ?? []).map(({role}) => role).sort();
    if (JSON.stringify(roles) !== JSON.stringify(["detective", "navigator", "spotter"])) add("MISSION_ROLES", mission.id);
    const allowed = [...(mission.completion?.allowedStates ?? [])].sort();
    if (JSON.stringify(allowed) !== JSON.stringify(["completed", "manual", "skipped"])) add("MISSION_COMPLETION", mission.id);
    if (["noGps", "closedVenue", "badWeather", "tiredLegs"].some((key) => !mission.fallbacks?.[key])) add("MISSION_FALLBACK", mission.id);
    if (!mission.completion?.retryLine || !mission.completion?.explanation || !mission.completion?.successLine) add("MISSION_RESOLUTION_COPY", mission.id);
    if ((mission.choices ?? []).length && (mission.choices.filter(({correct}) => correct).length !== 1 || mission.choices.some(({hint}) => !hint))) add("MISSION_CHOICES", mission.id);
    if ((mission.phrases ?? []).length > 5 || (mission.phrases ?? []).some(({it, en, pronunciation, gesture}) => !it || !en || !pronunciation || !gesture)) add("MISSION_PHRASES", mission.id);
    if (!mission.offlineCritical || Object.values(mission.dependencies ?? {}).some(Boolean)) add("MISSION_DEPENDENCY", mission.id);
    if (!Array.isArray(mission.safety) || !mission.safety.length) add("MISSION_SAFETY", mission.id);
    if (mission.reward?.stamp !== null && !stampIds.includes(mission.reward?.stamp)) add("CONTENT_DANGLING_STAMP", `${mission.id}:${mission.reward?.stamp}`);
    if (mission.reward?.power !== null && !powerIds.includes(mission.reward?.power)) add("CONTENT_DANGLING_POWER", `${mission.id}:${mission.reward?.power}`);
    for (const id of mission.sourceIds ?? []) if (!sourceIds.includes(id)) add("CONTENT_DANGLING_SOURCE", `${mission.id}:${id}`);
    for (const id of mission.assetIds ?? []) if (!assetIds.includes(id)) add("CONTENT_DANGLING_ASSET", `${mission.id}:${id}`);
    const allFacts = [...(mission.facts ?? []), ...(mission.variants ?? []).flatMap(({facts}) => facts ?? [])];
    for (const fact of allFacts) {
      if (fact.label === "OUR STORY" && fact.sourceId !== null) add("CONTENT_STORY_SOURCE", mission.id);
      if (fact.label !== "OUR STORY" && (!fact.sourceId || !sourceIds.includes(fact.sourceId))) add("CONTENT_DANGLING_SOURCE", `${mission.id}:${fact.sourceId}`);
      if (fact.sourceId && !(mission.sourceIds ?? []).includes(fact.sourceId) && !(mission.variants ?? []).some((variant) => (variant.sourceIds ?? []).includes(fact.sourceId))) add("CONTENT_SOURCE_UNION", `${mission.id}:${fact.sourceId}`);
    }
    for (const variant of mission.variants ?? []) {
      if (!pairs.some(({id}) => id === variant.pairId)) add("CONTENT_DANGLING_PAIR", `${mission.id}:${variant.pairId}`);
      const variantWords = wordCount(variant.storyBeat);
      if (variantWords < 50 || variantWords > 110) add("MISSION_READ_TIME", `${mission.id}/${variant.id}:${variantWords} words`);
      const variantRoles = (variant.roles ?? []).map(({role}) => role).sort();
      if (JSON.stringify(variantRoles) !== JSON.stringify(["detective", "navigator", "spotter"])) add("MISSION_ROLES", `${mission.id}/${variant.id}`);
      const variantAllowed = [...(variant.completion?.allowedStates ?? [])].sort();
      if (JSON.stringify(variantAllowed) !== JSON.stringify(["completed", "manual", "skipped"])) add("MISSION_COMPLETION", `${mission.id}/${variant.id}`);
      if (!variant.completion?.retryLine || !variant.completion?.explanation || !variant.completion?.successLine) add("MISSION_RESOLUTION_COPY", `${mission.id}/${variant.id}`);
      if (["noGps", "closedVenue", "badWeather", "tiredLegs"].some((key) => !variant.fallbacks?.[key])) add("MISSION_FALLBACK", `${mission.id}/${variant.id}`);
      if (!Array.isArray(variant.safety) || !variant.safety.length) add("MISSION_SAFETY", `${mission.id}/${variant.id}`);
      if (!validDate(variant.fact_checked_on) || !validDate(variant.review_after) || variant.review_after < variant.fact_checked_on) add("MISSION_FACT_DATES", `${mission.id}/${variant.id}`);
      if ((variant.choices ?? []).length && (variant.choices.filter(({correct}) => correct).length !== 1 || variant.choices.some(({hint}) => !hint))) add("MISSION_CHOICES", `${mission.id}/${variant.id}`);
      for (const id of variant.sourceIds ?? []) if (!sourceIds.includes(id)) add("CONTENT_DANGLING_SOURCE", `${mission.id}/${variant.id}:${id}`);
      for (const id of variant.assetIds ?? []) if (!assetIds.includes(id)) add("CONTENT_DANGLING_ASSET", `${mission.id}/${variant.id}:${id}`);
    }
  }
  for (const source of testSources.claims ?? []) {
    let url;
    try { url = new URL(source.url); } catch { add("CONTENT_SOURCE_URL", source.id); continue; }
    if (url.protocol !== "https:" || !policy.approvedSourceHosts.includes(url.hostname.toLowerCase())) add("CONTENT_UNAPPROVED_URL", `${source.id}:${url.hostname}`);
    for (const consumer of source.usedBy ?? []) if (consumer !== "planning-only" && !missionIds.includes(consumer)) add("CONTENT_DANGLING_SOURCE_CONSUMER", `${source.id}:${consumer}`);
  }
  for (const asset of testAssets.assets ?? []) {
    const relativePath = `public/${asset.path}`;
    if (!existsWithExactCase(relativePath)) {
      add("CONTENT_MISSING_ASSET_FILE", asset.path);
      continue;
    }
    const buffer = readFileSync(join(root, relativePath));
    if (!asset.license?.trim()) add("CONTENT_ASSET_LICENSE", asset.id);
    if (asset.sha256 !== sha256(buffer)) add("CONTENT_ASSET_HASH", asset.id);
    const declared = assetPolicy.assets.find(({id}) => id === asset.id);
    if (!declared) add("CONTENT_ASSET_DIMENSIONS", `${asset.id}:missing-policy`);
    else {
      const dimensions = asset.mediaType === "image/png" ? pngDimensions(buffer) : null;
      if (!dimensions || dimensions.width !== declared.width || dimensions.height !== declared.height) add("CONTENT_ASSET_DIMENSIONS", asset.id);
      if (buffer.byteLength > declared.maximumBytes) add("CONTENT_ASSET_SIZE", asset.id);
    }
  }
  if (!(testManifest.excludedContent ?? []).includes("gardaland")) add("CONTENT_EXCLUSION", "gardaland must be excluded");
  const playableText = JSON.stringify({chapters, missions, sources: testSources.claims, rewards: testRewards, assets: testAssets}).toLowerCase();
  if (playableText.includes("gardaland")) add("CONTENT_EXCLUSION", "gardaland appears in playable content");
  for (const id of ["VER-01", "VER-02"]) {
    const mission = missions.find((item) => item.id === id);
    if (!mission || mission.status !== "fixed-exterior-complete" || mission.dependencies?.ticket !== false) add("CONTENT_EXTERIOR_FIRST", id);
  }
  for (const pair of pairs) {
    const morning = missions.find(({id}) => id === "VER-04")?.variants?.find(({id}) => id === pair.morningVariantId);
    const afternoon = missions.find(({id}) => id === "VER-05")?.variants?.find(({id}) => id === pair.afternoonVariantId);
    if (!morning || !afternoon || morning.pairId !== pair.id || afternoon.pairId !== pair.id) add("CONTENT_PAIR_VARIANT", pair.id);
  }
  return result;
}

for (const error of contentErrors(manifest, sources, rewards, assets)) fail(error.code, error.message);
if (!contentErrors(manifest, sources, rewards, assets).length) pass("current manifest, sources, rewards, assets, IDs, references, exclusions, and exterior-first rules validate");

const canonicalMission = readJson("public/content/examples/mission.example.json");
const canonicalBundle = jsonClone(manifest);
canonicalBundle.missions = [canonicalMission, ...manifest.missions.filter(({id}) => id !== canonicalMission.id)];
if (contentErrors(canonicalBundle, sources, rewards, assets).length) fail("CANONICAL_MISSION", "canonical mission example does not satisfy content invariants");
else pass("canonical mission example validates in the current bundle");

const mutations = readJson("tests/fixtures/content/invalid/mutation-cases.json");
for (const fixture of mutations) {
  const testManifest = jsonClone(manifest);
  const testSources = jsonClone(sources);
  const testAssets = jsonClone(assets);
  if (fixture.mutation === "duplicateMission") testManifest.missions.push(jsonClone(testManifest.missions[0]));
  if (fixture.mutation === "danglingSource") testManifest.missions[0].sourceIds.push("SRC-MISSING-01");
  if (fixture.mutation === "missingAsset") testManifest.missions[0].assetIds = ["asset-missing"];
  if (fixture.mutation === "unapprovedUrl") testSources.claims[0].url = "https://unapproved.example/fact";
  if (fixture.mutation === "prohibitedField") testManifest.fullName = "Not allowed";
  if (fixture.mutation === "missingRole") testManifest.missions[0].roles.pop();
  if (fixture.mutation === "assetCaseMismatch") testAssets.assets[0].path = testAssets.assets[0].path.replace("assets", "Assets");
  const codes = contentErrors(testManifest, testSources, rewards, testAssets).map(({code}) => code);
  if (!codes.includes(fixture.expectedCode)) fail("INVALID_FIXTURE_ACCEPTED", `${fixture.id} did not produce ${fixture.expectedCode}`);
}
if (!failures.some(({code}) => code === "INVALID_FIXTURE_ACCEPTED")) pass(`${mutations.length} content mutation fixtures fail with their expected diagnostics`);

function walkErrors(walk) {
  const result = [];
  const add = (code, message) => result.push({code, message});
  if (walk.type !== "FeatureCollection" || !Array.isArray(walk.features)) add("WALK_SHAPE", "FeatureCollection required");
  const checkpoints = (walk.features ?? []).filter((feature) => feature.properties?.kind === "checkpoint");
  const routes = (walk.features ?? []).filter((feature) => feature.properties?.kind === "route");
  const ids = (walk.features ?? []).map(({id}) => id);
  if (!unique(ids)) add("WALK_DUPLICATE_ID", "feature IDs must be unique");
  const orders = checkpoints.map((feature) => feature.properties.order).sort((a, b) => a - b);
  if (orders.some((value, i) => value !== i + 1)) add("WALK_ORDER", "checkpoint order must be consecutive");
  for (const feature of walk.features ?? []) {
    const positions = feature.geometry?.type === "Point" ? [feature.geometry.coordinates] : feature.geometry?.coordinates ?? [];
    for (const position of positions) if (!Array.isArray(position) || position.length !== 2 || position[0] < -180 || position[0] > 180 || position[1] < -90 || position[1] > 90) add("WALK_COORDINATE", feature.id);
  }
  for (const checkpoint of checkpoints) for (const id of checkpoint.properties.missionIds ?? []) if (!manifest.missions.some((mission) => mission.id === id)) add("WALK_DANGLING_MISSION", `${checkpoint.id}:${id}`);
  for (const route of routes) for (const id of route.properties.checkpointIds ?? []) if (!checkpoints.some((checkpoint) => checkpoint.id === id)) add("WALK_DANGLING_PLACE", `${route.id}:${id}`);
  if (!manifest.chapters.some(({id}) => id === walk.properties?.chapterId)) add("WALK_DANGLING_CHAPTER", walk.properties?.chapterId);
  const destinationBounds = {
    road: [7.0, 44.9, 13.7, 48.1],
    venice: [12.1, 45.2, 12.7, 45.7],
    "lagoon-islands": [12.1, 45.2, 12.7, 45.7],
    verona: [10.4, 45.1, 11.5, 46.0],
  };
  const bounds = destinationBounds[walk.properties?.chapterId];
  if (bounds) {
    for (const feature of walk.features ?? []) {
      const positions = feature.geometry?.type === "Point" ? [feature.geometry.coordinates] : feature.geometry?.coordinates ?? [];
      for (const position of positions) {
        if (Array.isArray(position) && position.length === 2 && position[0] >= -180 && position[0] <= 180 && position[1] >= -90 && position[1] <= 90 &&
          (position[0] < bounds[0] || position[0] > bounds[2] || position[1] < bounds[1] || position[1] > bounds[3])) add("WALK_DESTINATION_BOUNDS", feature.id);
      }
    }
  }
  return result;
}
const validWalk = readJson("tests/fixtures/content/valid/walk.example.geojson");
const invalidWalk = readJson("tests/fixtures/content/invalid/walk.invalid.geojson");
if (walkErrors(validWalk).length) fail("WALK_VALID", "valid walk fixture failed");
else pass("valid GeoJSON walk passes coordinate, order, mission, place, and chapter checks");
const invalidWalkCodes = new Set(walkErrors(invalidWalk).map(({code}) => code));
for (const code of ["WALK_COORDINATE", "WALK_DESTINATION_BOUNDS", "WALK_ORDER", "WALK_DANGLING_MISSION", "WALK_DANGLING_PLACE"]) if (!invalidWalkCodes.has(code)) fail("WALK_INVALID_ACCEPTED", `missing ${code}`);
if (!failures.some(({code}) => code === "WALK_INVALID_ACCEPTED")) pass("invalid GeoJSON fixture is rejected for range, order, mission, and place defects");

const saveRequired = ["schemaVersion", "tripKey", "contentVersion", "journeyState", "localRevision", "family", "route", "missionProgress", "excursionSelection", "settings", "backup"];
const journeyStates = ["fresh", "in-progress", "completed", "reset"];
const missionStates = ["in-progress", "completed", "manual", "skipped"];
const resolvedStates = new Set(["completed", "manual", "skipped"]);
function saveErrors(save) {
  const result = [...prohibitedErrors(save, "SAVE")];
  const add = (code, message) => result.push({code, message});
  for (const key of saveRequired) if (!(key in save)) add("SAVE_REQUIRED", key);
  if (save.schemaVersion !== 1 || !journeyStates.includes(save.journeyState)) add("SAVE_VERSION_OR_STATE", "unsupported schema or journey state");
  if (!Number.isInteger(save.localRevision) || save.localRevision < 0) add("SAVE_REVISION", save.localRevision);
  if (!save.missionProgress || Array.isArray(save.missionProgress)) add("SAVE_PROGRESS", "object required");
  for (const [id, progress] of Object.entries(save.missionProgress ?? {})) {
    if (!/^[A-Z]+(?:-[A-Z0-9]+)+$/.test(id) || !missionStates.includes(progress.state)) add("SAVE_MISSION_STATE", id);
    if (progress.resolvedVariantId !== null && typeof progress.resolvedVariantId !== "string") add("SAVE_VARIANT", id);
  }
  if (["fresh", "reset"].includes(save.journeyState) && Object.keys(save.missionProgress ?? {}).length) add("SAVE_LIFECYCLE", "fresh/reset must have no mission progress");
  if (save.journeyState === "in-progress" && !Object.keys(save.missionProgress ?? {}).length) add("SAVE_LIFECYCLE", "in-progress needs progress");
  if (save.journeyState === "completed") {
    for (const mission of manifest.missions.filter(({scored}) => scored)) if (!resolvedStates.has(save.missionProgress?.[mission.id]?.state)) add("SAVE_INCOMPLETE", mission.id);
  }
  if ((save.family?.members ?? []).length > 3 || !unique((save.family?.members ?? []).map(({id}) => id))) add("SAVE_FAMILY", "invalid member count or IDs");
  if (save.backup?.lastSuccessfulRevision !== null && save.backup?.lastSuccessfulRevision > save.localRevision) add("SAVE_BACKUP_REVISION", "cloud revision exceeds local revision");
  const encoded = JSON.stringify(save);
  if (/data:(?:image|audio)\//i.test(encoded) || /;base64,/i.test(encoded)) add("SAVE_BINARY_MEDIA", "binary/base64 media is prohibited");
  if (bytes(save) > policy.saveHardLimitBytes) add("SAVE_SIZE", `${bytes(save)} bytes`);
  return result;
}

const validSavePaths = filesUnder("tests/fixtures/save/valid").filter((path) => path.endsWith(".json"));
for (const path of validSavePaths) for (const error of saveErrors(readJson(path))) fail(error.code, `${path}:${error.message}`);
if (!validSavePaths.some((path) => path.endsWith("fresh.json")) || !validSavePaths.some((path) => path.endsWith("completed.json"))) fail("SAVE_FIXTURE_SET", "fresh/completed fixtures required");
const unknownSave = readJson("tests/fixtures/save/valid/unknown-id-recovery.json");
const knownIds = new Set(manifest.missions.map(({id}) => id));
const activeResolved = Object.entries(unknownSave.missionProgress).filter(([id, progress]) => knownIds.has(id) && resolvedStates.has(progress.state));
const unknownResolved = Object.entries(unknownSave.missionProgress).filter(([id]) => !knownIds.has(id));
if (activeResolved.length !== 1 || unknownResolved.length !== 1) fail("SAVE_UNKNOWN_RECOVERY", "unknown IDs must be preserved but inactive");
if (!failures.some(({code}) => code.startsWith("SAVE"))) pass(`${validSavePaths.length} save fixtures validate; unknown IDs remain preserved but inactive`);

const invalidSavePaths = filesUnder("tests/fixtures/save/invalid").filter((path) => path.endsWith(".json"));
for (const path of invalidSavePaths) if (!saveErrors(readJson(path)).length) fail("SAVE_INVALID_ACCEPTED", path);
const oversized = jsonClone(readJson("tests/fixtures/save/valid/fresh.json"));
oversized.missionProgress = Object.fromEntries(Array.from({length: 6000}, (_, i) => [`ARCHIVE-${i + 1}`, {state: "completed", resolvedVariantId: null}]));
if (!saveErrors(oversized).some(({code}) => code === "SAVE_SIZE")) fail("SAVE_SIZE_TEST", "synthetic oversize save was accepted");
if (!failures.some(({code}) => ["SAVE_INVALID_ACCEPTED", "SAVE_SIZE_TEST"].includes(code))) pass(`${invalidSavePaths.length} invalid saves and a synthetic >256 KiB save are rejected`);

const typeScript = readFileSync(join(root, "src/contracts/save-contract.ts"), "utf8");
for (const state of [...journeyStates, ...missionStates]) if (!typeScript.includes(`"${state}"`)) fail("TS_SCHEMA_DRIFT", `missing ${state}`);
for (const key of saveRequired) if (!new RegExp(`\\b${key}\\b`).test(typeScript)) fail("TS_SCHEMA_DRIFT", `missing field ${key}`);
if (!typeScript.includes("SAVE_SCHEMA_VERSION = 1") || !typeScript.includes("SAVE_HARD_LIMIT_BYTES = 262_144")) fail("TS_SCHEMA_DRIFT", "version/size constants differ");
if (!failures.some(({code}) => code === "TS_SCHEMA_DRIFT")) pass("TypeScript save contract matches schema version, states, fields, and 256 KiB limit");

const packagePath = "public/content/content-package.json";
if (existsSync(join(root, packagePath))) {
  const contentPackage = readJson(packagePath);
  const records = [];
  for (const file of contentPackage.files ?? []) {
    const relativePath = `public/content/${file.path}`;
    const path = join(root, relativePath);
    if (!existsWithExactCase(relativePath)) { fail("PACKAGE_FILE", file.path); continue; }
    const buffer = readFileSync(path);
    if (sha256(buffer) !== file.sha256 || buffer.length !== file.bytes) fail("PACKAGE_HASH", file.path);
    records.push(`${file.path}:${file.sha256}:${file.bytes}`);
  }
  const packageHash = sha256(Buffer.from(records.sort().join("\n"), "utf8"));
  if (packageHash !== contentPackage.packageHash || contentPackage.contentVersion !== manifest.contentVersion) fail("PACKAGE_HASH", "package hash/version mismatch");
  if (!failures.some(({code}) => code.startsWith("PACKAGE"))) pass("content package file hashes and deterministic package hash validate");
} else fail("PACKAGE_FILE", packagePath);

if (failures.length) {
  for (const {code, message} of failures) console.error(`FAIL ${code}: ${message}`);
  console.error(`\n${failures.length} failure(s); ${checks.length} check group(s) passed.`);
  process.exit(1);
}
for (const check of checks) console.log(`PASS ${check}`);
console.log(`\nAll ${checks.length} contract check groups passed.`);
