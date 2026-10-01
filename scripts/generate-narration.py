from __future__ import annotations

import argparse
import hashlib
import importlib.metadata
import json
import os
import re
import subprocess
from datetime import datetime, timezone
from pathlib import Path

os.environ.setdefault("HF_HUB_DISABLE_SYMLINKS_WARNING", "1")

import imageio_ffmpeg
import soundfile as sf
import torch
from qwen_tts import Qwen3TTSModel

MODEL_ID = "Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice"
VOICE_PRESET = "Serena"
VOICE_INSTRUCTION = (
    "Voz cálida y cinematográfica para niños. Español claro, ritmo natural, "
    "curiosidad suave y pausas breves ante los descubrimientos."
)


def arguments() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--project", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--model-revision", required=True)
    parser.add_argument("--batch-size", type=int, default=4)
    parser.add_argument("--seed", type=int, default=20261001)
    parser.add_argument("--limit", type=int)
    return parser.parse_args()


def resolve_reference(root: object, reference: str) -> str:
    value = root
    for part in reference.split("."):
        if not isinstance(value, dict) or part not in value:
            raise KeyError(reference)
        value = value[part]
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"Narration reference is not text: {reference}")
    return value.strip()


def chapter_for(segment_id: str) -> str:
    if segment_id.startswith(("OPENING-", "RETURN-")):
        return "journey"
    if segment_id.startswith(("ROAD-", "CH-ROAD-")):
        return "road"
    if segment_id.startswith(("VEN-", "CH-VENICE-")):
        return "venice"
    if segment_id.startswith(("ISL-", "CH-LAGOON-")):
        return "lagoon-islands"
    if segment_id.startswith(("VER-", "CH-VERONA-")):
        return "verona"
    raise ValueError(f"No chapter mapping for {segment_id}")


def extract_loudnorm(stderr: str) -> dict[str, str]:
    matches = re.findall(r"\{\s*\"input_i\".*?\}", stderr, flags=re.DOTALL)
    if not matches:
        raise RuntimeError("ffmpeg did not return loudness statistics")
    return json.loads(matches[-1])


def run_ffmpeg(command: list[str]) -> subprocess.CompletedProcess[str]:
    return subprocess.run(command, check=True, capture_output=True, text=True, encoding="utf-8", errors="replace")


def encode_mp3(wav_path: Path, mp3_path: Path) -> tuple[float, float]:
    ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
    first = run_ffmpeg([
        ffmpeg, "-hide_banner", "-nostats", "-i", str(wav_path),
        "-af", "loudnorm=I=-18:TP=-1:LRA=7:print_format=json",
        "-f", "null", "NUL",
    ])
    measured = extract_loudnorm(first.stderr)
    filter_value = (
        "loudnorm=I=-18:TP=-1:LRA=7:linear=true:print_format=json:"
        f"measured_I={measured['input_i']}:measured_LRA={measured['input_lra']}:"
        f"measured_TP={measured['input_tp']}:measured_thresh={measured['input_thresh']}:"
        f"offset={measured['target_offset']}"
    )
    mp3_path.parent.mkdir(parents=True, exist_ok=True)
    second = run_ffmpeg([
        ffmpeg, "-y", "-hide_banner", "-nostats", "-i", str(wav_path),
        "-af", filter_value, "-ac", "1", "-ar", "24000", "-b:a", "48k",
        str(mp3_path),
    ])
    normalized = extract_loudnorm(second.stderr)
    return float(normalized["output_i"]), float(normalized["output_tp"])


def main() -> None:
    args = arguments()
    project = args.project.resolve()
    output = args.output.resolve()
    localized = json.loads((project / "public/content/locales/trip-manifest.es.json").read_text(encoding="utf-8"))
    narration = json.loads((project / "public/content/locales/narration.es.json").read_text(encoding="utf-8"))
    manifest_path = output / "manifest.json"
    source_manifest_path = project / "public/audio/narration/v1/manifest.json"
    manifest = json.loads((manifest_path if manifest_path.exists() else source_manifest_path).read_text(encoding="utf-8"))

    segments = []
    for segment in narration["segments"]:
        if segment["scriptRef"] != segment["captionRef"]:
            raise ValueError(f"Caption drift: {segment['id']}")
        segments.append((segment, resolve_reference(localized, segment["scriptRef"])))

    torch.manual_seed(args.seed)
    torch.cuda.manual_seed_all(args.seed)
    model = Qwen3TTSModel.from_pretrained(
        MODEL_ID,
        revision=args.model_revision,
        device_map="cuda:0",
        dtype=torch.bfloat16,
        attn_implementation="flash_attention_2",
    )

    generated_at = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")
    entries: dict[str, list[dict[str, object]]] = {
        chapter["chapterId"]: list(chapter["entries"]) for chapter in manifest["chapters"]
    }
    completed_ids = {entry["segmentId"] for chapter_entries in entries.values() for entry in chapter_entries}
    segments = [(segment, text) for segment, text in segments if segment["id"] not in completed_ids]
    if args.limit is not None:
        segments = segments[:args.limit]
    wav_root = output / "wav"
    public_root = output / "public"

    for start in range(0, len(segments), args.batch_size):
        batch = segments[start:start + args.batch_size]
        texts = [text for _, text in batch]
        wavs, sample_rate = model.generate_custom_voice(
            text=texts,
            language=["Spanish"] * len(batch),
            speaker=[VOICE_PRESET] * len(batch),
            instruct=[VOICE_INSTRUCTION] * len(batch),
        )
        for (segment, _), waveform in zip(batch, wavs, strict=True):
            segment_id = segment["id"]
            chapter_id = chapter_for(segment_id)
            stem = segment_id.lower()
            wav_path = wav_root / chapter_id / f"{stem}.wav"
            mp3_path = public_root / "audio" / "narration" / "v1" / chapter_id / f"{stem}.mp3"
            wav_path.parent.mkdir(parents=True, exist_ok=True)
            sf.write(wav_path, waveform, sample_rate)
            lufs, true_peak = encode_mp3(wav_path, mp3_path)
            info = sf.info(mp3_path)
            payload = mp3_path.read_bytes()
            entries[chapter_id].append({
                "segmentId": segment_id,
                "scriptRef": segment["scriptRef"],
                "captionRef": segment["captionRef"],
                "url": f"audio/narration/v1/{chapter_id}/{stem}.mp3",
                "chapterId": chapter_id,
                "bytes": len(payload),
                "durationMs": round(info.duration * 1000),
                "sha256": hashlib.sha256(payload).hexdigest(),
                "lufs": round(lufs, 1),
                "truePeakDbtp": round(true_peak, 1),
                "generator": f"qwen-tts {importlib.metadata.version('qwen-tts')}",
                "model": MODEL_ID,
                "modelRevision": args.model_revision,
                "voicePreset": VOICE_PRESET,
                "generatedAt": generated_at,
            })
            manifest["status"] = "awaiting-audio-production"
            for chapter in manifest["chapters"]:
                chapter["entries"] = entries[chapter["chapterId"]]
            manifest_path.parent.mkdir(parents=True, exist_ok=True)
            manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
            print(f"generated {segment_id}: {info.duration:.1f}s, {len(payload)} bytes", flush=True)

    expected_ids = {segment["id"] for segment in narration["segments"]}
    completed_ids = {entry["segmentId"] for chapter_entries in entries.values() for entry in chapter_entries}
    manifest["status"] = "production-ready" if completed_ids == expected_ids else "awaiting-audio-production"
    for chapter in manifest["chapters"]:
        chapter["entries"] = entries[chapter["chapterId"]]
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"manifest {manifest_path}", flush=True)


if __name__ == "__main__":
    main()
