// motion-scenes/annotated-screenshot.tsx — kind "annotated_screenshot". Ảnh + bracket lime highlight vùng UI.
import { z } from "zod";
import { Img, staticFile } from "remotion";
import { type WidgetSpec } from "../schemas/_shared";
import { s4ei, s4eo } from "../../../motion-config";
import type { PanelSection } from "../../../control-item/auto-panel";
import type { MotionSceneModule } from "./types";

const HlSchema = z.object({ x: z.number().default(0.1), y: z.number().default(0.1), w: z.number().default(0.3), h: z.number().default(0.12), label: z.string().default(""), appearSec: z.number().default(0) });
const HW: Record<keyof z.infer<typeof HlSchema>, WidgetSpec> = { x: { type: "slider", min: 0, max: 1, step: 0.01 }, y: { type: "slider", min: 0, max: 1, step: 0.01 }, w: { type: "slider", min: 0, max: 1, step: 0.01 }, h: { type: "slider", min: 0, max: 1, step: 0.01 }, label: { type: "text" }, appearSec: { type: "number" } };
const ContentSchema = z.object({ bgColor: z.string().default("#0A0B0A"), imagePath: z.string().default("") });
const CW: Record<keyof z.infer<typeof ContentSchema>, WidgetSpec> = { bgColor: { type: "color" }, imagePath: { type: "text" } };
const KEYS = ["hl1", "hl2", "hl3"] as const;
const RawSchema = z.object({
  bgColor: z.string().optional(), imagePath: z.string().optional(),
  hl1: HlSchema.partial().optional(), hl2: HlSchema.partial().optional(), hl3: HlSchema.partial().optional(),
});
type Hl = z.infer<typeof HlSchema>;
type Meta = { content: z.infer<typeof ContentSchema>; hls: Hl[] };
function parseMeta(m: unknown): Meta {
  const raw = RawSchema.safeParse(m ?? {});
  const d = (raw.success ? raw.data : {}) as Record<string, unknown>;
  const hls = KEYS.map((k) => (d[k] ? HlSchema.parse(d[k]) : null)).filter((x): x is Hl => x !== null);
  return { content: ContentSchema.parse({ bgColor: d.bgColor, imagePath: d.imagePath }), hls };
}
function src(p: string): string { return /^(https?:)?\/\//.test(p) || p.startsWith("/") ? p : staticFile(p); }
function Component({ f, fps, durationInFrames, data }: { f: number; fps: number; durationInFrames: number; data: Meta }) {
  const dur = durationInFrames / fps;
  const outOp = s4eo(f, Math.max(0, dur - 0.4), dur);
  const imgIn = s4ei(f, 0, 0.4);
  const c = data.content;
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: c.bgColor,
      display: "flex", alignItems: "center", justifyContent: "center", opacity: outOp }}>
      <div style={{ position: "relative", width: "88%", opacity: imgIn }}>
        {c.imagePath ? (
          <Img src={src(c.imagePath)} style={{ width: "100%", display: "block", borderRadius: 16, border: "1px solid #1F2A23" }} />
        ) : (
          <div style={{ width: "100%", aspectRatio: "16/10", borderRadius: 16, border: "2px dashed #2D3D33", display: "flex", alignItems: "center", justifyContent: "center", color: "#5C6560", fontFamily: "Geist Mono, monospace", fontSize: 30 }}>imagePath ↦ /public/…</div>
        )}
        {data.hls.map((hl, i) => {
          const pop = s4ei(f, hl.appearSec, hl.appearSec + 0.3);
          return (
            <div key={i} style={{ position: "absolute", left: `${hl.x * 100}%`, top: `${hl.y * 100}%`, width: `${hl.w * 100}%`, height: `${hl.h * 100}%`,
              border: "4px solid #00FF41", borderRadius: 8, opacity: pop, boxSizing: "border-box" }}>
              {hl.label && <span style={{ position: "absolute", top: -46, left: 0, background: "#00FF41", color: "#0A0B0A", fontFamily: "Geist, sans-serif", fontWeight: 700, fontSize: 26, padding: "4px 12px", borderRadius: 6, whiteSpace: "nowrap" }}>{hl.label}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
const panelSections: PanelSection[] = [
  { title: "Content", schema: ContentSchema, widgets: CW },
  { title: "Highlights", schema: HlSchema, widgets: HW, tabs: [...KEYS] },
];
export const annotatedScreenshotModule: MotionSceneModule = {
  parseMeta, Component, panelSections,
  defaultMeta: { bgColor: "#0A0B0A", imagePath: "", hl1: { x: 0.08, y: 0.12, w: 0.4, h: 0.14, label: "This part", appearSec: 0.4 } },
};
