#!/usr/bin/env node
// render-design.mjs — render a design.json straight to a video file, no editor UI.
//
// Usage:
//   node scripts/render-design.mjs <design.json> [output] [--scale 1]
//
// Reuses the same render pipeline the editor's Export uses (src/scripts/remotion-render.mjs):
// builds inputProps from the design, computes duration, picks webm (transparent bg) or mp4
// (solid color bg), and writes the output. Mirrors src/app/api/render-local/route.ts.
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

const argv = process.argv.slice(2);
const positional = argv.filter((a) => !a.startsWith("--"));
const scaleArg = (() => {
  const i = argv.indexOf("--scale");
  return i !== -1 && argv[i + 1] ? Number(argv[i + 1]) : 1;
})();

const designPath = positional[0];
if (!designPath) {
  console.error("usage: node scripts/render-design.mjs <design.json> [output] [--scale 1]");
  process.exit(2);
}

const design = JSON.parse(fs.readFileSync(designPath, "utf8"));
const { trackItemIds, trackItemsMap, transitionsMap = {}, fps = 30, size, background } = design;
if (!trackItemsMap || !trackItemIds) {
  console.error("Invalid design: missing trackItemsMap / trackItemIds");
  process.exit(1);
}

const duration = Object.values(trackItemsMap).reduce(
  (max, it) => Math.max(max, it?.display?.to ?? 0),
  0,
);

// Default = opaque MP4 (the main use case: source video + overlays baked into a
// finished video). Pass --transparent for a keyable WebM/vp9-alpha overlay export
// (overlay-only designs meant to be composited over footage in CapCut/Resolve).
const transparent = argv.includes("--transparent");
const ext = transparent ? "webm" : "mp4";

const output = positional[1]
  ? path.resolve(positional[1])
  : path.resolve(`${designPath.replace(/\.json$/i, "")}.${ext}`);

const inputProps = { trackItemIds, trackItemsMap, transitionsMap, fps, size, background, duration };
const inputBase64 = Buffer.from(JSON.stringify(inputProps)).toString("base64");
const scriptPath = path.join(repoRoot, "src/scripts/remotion-render.mjs");

console.log(`[render-design] ${designPath} -> ${output}  (${(duration / 1000).toFixed(1)}s, ${ext}, scale ${scaleArg})`);

const child = spawn(
  process.execPath,
  [scriptPath, inputBase64, output, String(scaleArg), transparent ? "1" : "0"],
  { cwd: repoRoot, env: { ...process.env, FORCE_COLOR: "0" }, stdio: ["ignore", "pipe", "inherit"] },
);

let lastLine = "";
child.stdout.on("data", (chunk) => {
  for (const line of chunk.toString().split("\n").filter(Boolean)) {
    lastLine = line;
    if (line.startsWith("PROGRESS:")) process.stdout.write(`\r  ${line}   `);
    else console.log("  " + line);
  }
});
child.on("close", (code) => {
  if (lastLine.startsWith("DONE:")) {
    console.log(`\n[render-design] OK -> ${lastLine.slice(5)}`);
    process.exit(0);
  }
  console.error(`\n[render-design] FAILED (code ${code}). Last: ${lastLine}`);
  process.exit(code || 1);
});
child.on("error", (e) => { console.error(e); process.exit(1); });
