/**
 * Standalone render script — runs in its own process so it never shares
 * globalThis with the Next.js server (avoids "multiple Remotion versions" clash).
 *
 * Usage: node src/scripts/remotion-render.mjs <inputPropsBase64> <outputPath>
 *
 * Writes progress lines to stdout: "PROGRESS:<0-100>"
 * Writes "DONE:<outputPath>" on success, "ERROR:<message>" on failure.
 */

import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition, ensureBrowser } from "@remotion/renderer";
import { createRequire } from "module";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import os from "os";

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, "..", "..");

const [,, inputBase64, outputPath, scaleArg, transparentArg] = process.argv;
const renderScale = scaleArg ? parseFloat(scaleArg) : 1;
const isTransparent = transparentArg === "1";

if (!inputBase64 || !outputPath) {
  process.stdout.write("ERROR:Missing arguments\n");
  process.exit(1);
}

let inputProps;
try {
  inputProps = JSON.parse(Buffer.from(inputBase64, "base64").toString("utf8"));
} catch (e) {
  process.stdout.write(`ERROR:Invalid input JSON: ${e.message}\n`);
  process.exit(1);
}

async function run() {
  try {
    await ensureBrowser();

    const entryPoint = join(projectRoot, "src/remotion/index.tsx");
    const outDir = join(os.tmpdir(), "d1a-remotion-bundle");

    const remotionDir = dirname(require.resolve("remotion/package.json"));
    const reactDir = dirname(require.resolve("react/package.json"));
    const reactDomDir = dirname(require.resolve("react-dom/package.json"));

    process.stdout.write("PROGRESS:2\n");

    const serveUrl = await bundle({
      entryPoint,
      outDir,
      enableCaching: true,
      publicDir: join(projectRoot, "public"),
      webpackOverride: (config) => {
        config.resolve = config.resolve ?? {};
        config.resolve.alias = {
          ...(config.resolve.alias ?? {}),
          remotion: remotionDir,
          react: reactDir,
          "react-dom": reactDomDir,
        };
        return config;
      },
    });

    process.stdout.write("PROGRESS:10\n");

    const composition = await selectComposition({
      serveUrl,
      id: "MainComposition",
      inputProps,
    });

    process.stdout.write("PROGRESS:15\n");

    const totalFrames = composition.durationInFrames;

    // h264/mp4 can never store an alpha channel — a "transparent" composition
    // always bakes to an opaque background with that codec. When the project
    // background is transparent, render to webm/vp9 with an alpha pixel format
    // instead, which Remotion's OffthreadVideo can decode with alpha both in
    // Player preview and in a later render. vp9 (not vp8) because third-party
    // NLEs (CapCut, DaVinci Resolve) support WebM-alpha decode for vp9 far
    // more reliably than for vp8, even though both work fine in Chrome/Firefox.
    await renderMedia({
      composition,
      serveUrl,
      codec: isTransparent ? "vp9" : "h264",
      // Alpha pixel format requires PNG intermediate frames (JPEG has no alpha
      // channel to carry) — without this, renderMedia rejects yuva420p outright.
      // colorSpace must NOT be the "bt709" default when rendering alpha: Remotion
      // inserts a `zscale` ffmpeg filter for bt709 color correction, and zscale
      // silently drops the alpha plane (no error — the output just quietly loses
      // transparency). "default" skips that filter entirely.
      ...(isTransparent
        ? { pixelFormat: "yuva420p", imageFormat: "png", colorSpace: "default" }
        : {}),
      outputLocation: outputPath,
      inputProps,
      scale: renderScale,
      onProgress: ({ renderedFrames }) => {
        const pct = totalFrames ? Math.round(15 + (renderedFrames / totalFrames) * 80) : 15;
        process.stdout.write(`PROGRESS:${pct}\n`);
      },
    });

    process.stdout.write(`DONE:${outputPath}\n`);
    process.exit(0);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    process.stdout.write(`ERROR:${msg.replace(/\n/g, " ")}\n`);
    process.exit(1);
  }
}

run();
