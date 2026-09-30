import {readFileSync} from 'node:fs';
import {join} from 'node:path';

import {describe, expect, it} from 'vitest';

import {beginMission, resolveMission, type SaveEnvelopeV1} from '../../src/contracts/save-contract.js';
import {canonicalJson, sha256Hex, utf8Bytes} from '../../src/storage/canonical-json.js';
import {MAX_IMPORT_BYTES, SAVE_EXPORT_FORMAT, SAVE_EXPORT_VERSION, SaveTransferError} from '../../src/storage/save-transfer.js';
import {catalog, createHarness, freshSave, readFixture} from './helpers.js';

const tripKey = catalog.tripKey;

const replacePayload = async (raw: string, mutate: (payload: Record<string, unknown>) => void): Promise<string> => {
  const envelope = JSON.parse(raw) as Record<string, unknown>;
  const payload = structuredClone(envelope.payload) as Record<string, unknown>;
  mutate(payload);
  envelope.payload = payload;
  envelope.payloadBytes = utf8Bytes(payload);
  envelope.checksum = {algorithm: 'SHA-256', value: await sha256Hex(payload)};
  if (typeof payload.contentVersion === 'string') envelope.contentVersion = payload.contentVersion;
  if (typeof payload.tripKey === 'string') envelope.tripKey = payload.tripKey;
  return canonicalJson(envelope);
};

describe('save export and import', () => {
  it('exports only the validated save and previews before replacement', async () => {
    const source = await createHarness();
    await source.repository.update(tripKey, freshSave, (save) => resolveMission(save, 'ROAD-01', 'manual', catalog.missionIds));
    const exported = await source.repository.exportTrip(tripKey);
    expect(exported).toContain('Missione Italia family save');
    expect(exported).not.toMatch(/email|authToken|gpsHistory|photo|base64/i);
    const target = await createHarness();
    await target.repository.update(tripKey, freshSave, (save) => beginMission(save, 'ROAD-02', catalog.missionIds));
    const preview = await target.repository.previewImport(exported);
    expect(preview.summary).toMatchObject({resolvedMissionCount: 1, unknownMissionCount: 0});
    expect((await target.repository.load(tripKey)).save?.missionProgress).toHaveProperty('ROAD-02');
    await target.repository.replaceFromImport(preview);
    const imported = await target.repository.load(tripKey);
    expect(imported.save?.missionProgress['ROAD-01']?.state).toBe('manual');
    expect(imported.save?.missionProgress).not.toHaveProperty('ROAD-02');
    expect(await target.engine.transaction('readonly', (transaction) => transaction.getRecoveries(tripKey))).toHaveLength(1);
    source.repository.close();
    target.repository.close();
  });

  it('rejects corrupt JSON, checksum tampering, wrong trip, incompatible content, and oversize input', async () => {
    const harness = await createHarness();
    await harness.repository.update(tripKey, freshSave, (save) => beginMission(save, 'ROAD-01', catalog.missionIds));
    const exported = await harness.repository.exportTrip(tripKey);
    const corrupt = readFileSync(join(process.cwd(), 'tests/fixtures/save/migration/corrupt-json.txt'), 'utf8');
    await expect(harness.repository.previewImport(corrupt)).rejects.toMatchObject({code: 'invalid-json'});
    const tampered = exported.replace('"in-progress"', '"in-progresx"');
    await expect(harness.repository.previewImport(tampered)).rejects.toMatchObject({code: 'checksum'});
    const wrongTrip = await replacePayload(exported, (payload) => { payload.tripKey = 'another-trip'; });
    await expect(harness.repository.previewImport(wrongTrip)).rejects.toMatchObject({code: 'trip-mismatch'});
    const incompatible = await replacePayload(exported, (payload) => { payload.contentVersion = 'trip-2025.12-v1'; });
    await expect(harness.repository.previewImport(incompatible)).rejects.toThrow();
    await expect(harness.repository.previewImport(' '.repeat(MAX_IMPORT_BYTES + 1))).rejects.toMatchObject({code: 'import-size'});
    harness.repository.close();
  });

  it('migrates a checksummed schema-0 import during preview', async () => {
    const legacy = readFixture<Record<string, unknown>>('tests/fixtures/save/migration/v0.json');
    const envelope = {
      format: SAVE_EXPORT_FORMAT,
      exportVersion: SAVE_EXPORT_VERSION,
      label: 'Missione Italia family save',
      exportedAt: '2026-09-29T12:00:00.000Z',
      tripKey,
      contentVersion: legacy.contentVersion,
      storageSchemaVersion: 0,
      payloadBytes: utf8Bytes(legacy),
      checksum: {algorithm: 'SHA-256', value: await sha256Hex(legacy)},
      payload: legacy,
    };
    const harness = await createHarness();
    const preview = await harness.repository.previewImport(canonicalJson(envelope));
    expect(preview).toMatchObject({migrated: true, sourceSchemaVersion: 0});
    expect(preview.candidate.schemaVersion).toBe(1);
    harness.repository.close();
  });

  it('rejects a preview changed after validation', async () => {
    const harness = await createHarness();
    await harness.repository.update(tripKey, freshSave, (save) => beginMission(save, 'ROAD-01', catalog.missionIds));
    const preview = await harness.repository.previewImport(await harness.repository.exportTrip(tripKey));
    preview.candidate.settings.sound = true;
    await expect(harness.repository.replaceFromImport(preview)).rejects.toBeInstanceOf(SaveTransferError);
    harness.repository.close();
  });

  it('preserves unknown IDs through export/import while excluding them from preview progress', async () => {
    const unknown = readFixture<SaveEnvelopeV1>('tests/fixtures/save/valid/unknown-id-recovery.json');
    const source = await createHarness();
    await source.repository.update(tripKey, freshSave, () => ({...unknown, localRevision: 1}));
    const preview = await source.repository.previewImport(await source.repository.exportTrip(tripKey));
    expect(preview.summary.unknownMissionCount).toBe(1);
    expect(preview.summary.resolvedMissionCount).toBe(1);
    expect(preview.candidate.missionProgress).toHaveProperty('ARCHIVE-99');
    source.repository.close();
  });
});
