#!/usr/bin/env python3
"""
transcribe.py — word-level transcript, OFFLINE & self-contained (no external service).

Uses faster-whisper (local Whisper). Setup once:
    pip install faster-whisper
(first run downloads the model into a local cache; after that it runs fully offline).

Usage:
    python transcribe.py <video_or_audio> [out.json] [--model base] [--lang en]
      <video_or_audio>  local file (mp4/mov/wav/…); faster-whisper decodes it directly
      out.json          default: <video>.words.json
      --model           tiny | base | small | medium | large-v3 (default base; bigger = slower, better)
      --lang            force a language (e.g. en, vi); omit = auto-detect

Writes words.json: [{ "word": "...", "start": 1.23, "end": 1.55 }, ...]  (seconds).
Feed this to the align step (workflow.md step 3).

Alternative (if you'd rather not install anything): OpenAI Whisper API is a one-call
option and also returns word timestamps — but that IS an external service. This script
is the offline path on purpose.
"""
from __future__ import annotations
import sys, json
from pathlib import Path


def _flag(name: str, default):
    av = sys.argv[1:]
    if name in av:
        i = av.index(name)
        if i + 1 < len(av) and not av[i + 1].startswith("--"):
            return av[i + 1]
    return default


def main() -> int:
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    if not args:
        print("usage: transcribe.py <video> [out.json] [--model base] [--lang en]", file=sys.stderr)
        return 2

    src = Path(args[0]).expanduser()
    if not src.exists():
        print(f"ERROR: not found: {src}", file=sys.stderr)
        return 1
    out = Path(args[1]).expanduser() if len(args) > 1 else src.with_suffix(".words.json")
    model_name = _flag("--model", "base")
    lang = _flag("--lang", None)

    try:
        from faster_whisper import WhisperModel
    except ImportError:
        print("ERROR: faster-whisper not installed. Run: pip install faster-whisper", file=sys.stderr)
        return 3

    print(f"[transcribe] model={model_name} lang={lang or 'auto'} ...")
    model = WhisperModel(model_name, device="cpu", compute_type="int8")
    segments, info = model.transcribe(str(src), language=lang, word_timestamps=True)

    words = []
    for seg in segments:
        for w in (seg.words or []):
            words.append({"word": w.word.strip(), "start": round(w.start, 3), "end": round(w.end, 3)})

    out.write_text(json.dumps(words, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"[transcribe] lang={info.language} · {len(words)} words -> {out}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
