#!/usr/bin/env python3
"""
extract_frames.py — sample frames from a local video so the AI can "see" what's
on screen (talking head / screenshot / empty space) when planning overlays & zoom.

Usage:
  python extract_frames.py <video> <out_dir> [--fps 1] [--width 512]

- --fps   frames per second to sample (default 1 = one frame/second).
- --width scale down long edge for cheap reading (default 512px; keeps aspect).

Writes <out_dir>/frame_00001.jpg ... and prints a small index (time -> file) so
the AI can map a frame to a timeline second. Requires ffmpeg on PATH.
"""
from __future__ import annotations
import subprocess, sys, shutil
from pathlib import Path


def main() -> int:
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    flags = {a.split("=")[0]: (a.split("=")[1] if "=" in a else None) for a in sys.argv[1:] if a.startswith("--")}
    if len(args) < 2:
        print("usage: extract_frames.py <video> <out_dir> [--fps 1] [--width 512]", file=sys.stderr)
        return 2
    if not shutil.which("ffmpeg"):
        print("ERROR: ffmpeg not found on PATH.", file=sys.stderr)
        return 3

    video, out = Path(args[0]).expanduser(), Path(args[1]).expanduser()
    if not video.exists():
        print(f"ERROR: video not found: {video}", file=sys.stderr)
        return 1

    # flags may arrive as "--fps" "1" (separate) — merge trailing positionals
    def flag(name: str, default: str) -> str:
        if flags.get(name):
            return flags[name]
        # support "--fps 1" style: find the token after --fps in argv
        av = sys.argv[1:]
        if name in av:
            i = av.index(name)
            if i + 1 < len(av) and not av[i + 1].startswith("--"):
                return av[i + 1]
        return default

    fps = flag("--fps", "1")
    width = flag("--width", "512")
    out.mkdir(parents=True, exist_ok=True)

    cmd = [
        "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
        "-i", str(video),
        "-vf", f"fps={fps},scale={width}:-2",
        str(out / "frame_%05d.jpg"),
    ]
    r = subprocess.run(cmd)
    if r.returncode != 0:
        print("ffmpeg failed", file=sys.stderr)
        return r.returncode

    frames = sorted(out.glob("frame_*.jpg"))
    step = 1.0 / float(fps)
    print(f"extracted {len(frames)} frames -> {out}  (~{fps} fps)")
    for i, fp in enumerate(frames):
        print(f"  t={i*step:6.1f}s  {fp.name}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
