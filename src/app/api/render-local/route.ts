import { NextResponse } from "next/server";
import path from "path";
import os from "os";
import fs from "fs";
import { spawn } from "child_process";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { trackItemIds, trackItemsMap, transitionsMap, fps, size, background, duration, scale } = body;

    const inputProps = { trackItemIds, trackItemsMap, transitionsMap, fps, size, background, duration };
    const inputBase64 = Buffer.from(JSON.stringify(inputProps)).toString("base64");

    // h264/mp4 can't carry an alpha channel — if the project background is
    // transparent, render webm/vp8 with alpha instead so the exported clip
    // stays transparent when reused as an overlay (see remotion-render.mjs).
    const isTransparentBg =
      !background || background.type !== "color" || background.value === "transparent";
    const ext = isTransparentBg ? "webm" : "mp4";
    const contentType = isTransparentBg ? "video/webm" : "video/mp4";

    const outputPath = path.join(os.tmpdir(), `d1a-render-${Date.now()}.${ext}`);
    const renderScale = String(typeof scale === "number" && scale > 0 ? scale : 1);

    const scriptPath = path.join(process.cwd(), "src/scripts/remotion-render.mjs");
    const nodeBin = process.execPath; // same node that runs Next.js

    console.log(
      "[render-local] Spawning child process:",
      nodeBin,
      scriptPath,
      "scale:",
      renderScale,
      "transparent:",
      isTransparentBg,
    );

    const result = await new Promise<string>((resolve, reject) => {
      const child = spawn(
        nodeBin,
        [scriptPath, inputBase64, outputPath, renderScale, isTransparentBg ? "1" : "0"],
        {
          env: { ...process.env, FORCE_COLOR: "0" },
          stdio: ["ignore", "pipe", "pipe"],
        },
      );

      let lastLine = "";
      child.stdout.on("data", (chunk: Buffer) => {
        const lines = chunk.toString().split("\n").filter(Boolean);
        for (const line of lines) {
          console.log("[render-child]", line);
          lastLine = line;
        }
      });
      child.stderr.on("data", (chunk: Buffer) => {
        console.error("[render-child stderr]", chunk.toString().slice(0, 200));
      });

      child.on("close", (code) => {
        if (lastLine.startsWith("DONE:")) {
          resolve(lastLine.slice(5));
        } else if (lastLine.startsWith("ERROR:")) {
          reject(new Error(lastLine.slice(6)));
        } else {
          reject(new Error(`Child exited with code ${code}. Last: ${lastLine}`));
        }
      });
      child.on("error", reject);
    });

    const fileBuffer = fs.readFileSync(result);
    try { fs.unlinkSync(result); } catch {}

    return new Response(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="export.${ext}"`,
        "Content-Length": String(fileBuffer.length),
      },
    });
  } catch (error) {
    console.error("[render-local]", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Render failed" },
      { status: 500 }
    );
  }
}

export const maxDuration = 600;
