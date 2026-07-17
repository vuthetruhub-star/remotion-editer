// motion-scenes/split-reveal.tsx — kind "split_reveal". Before/after wipe + divider lime. Chroma-safe.
import { z } from "zod";
import { Img, staticFile } from "remotion";
import { type WidgetSpec } from "../schemas/_shared";
import { s4ei, s4eo } from "../../../motion-config";
import type { PanelSection } from "../../../control-item/auto-panel";
import type { MotionSceneModule } from "./types";

const ContentSchema = z.object({
  bgColor: z.string().default("#0A0B0A"),
  beforeImage: z.string().default(""), afterImage: z.string().default(""),
  beforeLabel: z.string().default("BEFORE"), afterLabel: z.string().default("AFTER"),
  wipeStart: z.number().default(0.6), wipeDur: z.number().default(1.0),
});
const CW: Record<keyof z.infer<typeof ContentSchema>, WidgetSpec> = {
  bgColor: { type: "color" }, beforeImage: { type: "text" }, afterImage: { type: "text" },
  beforeLabel: { type: "text" }, afterLabel: { type: "text" }, wipeStart: { type: "number" }, wipeDur: { type: "number" },
};
const RawSchema = z.object({ bgColor: z.string().optional(), beforeImage: z.string().optional(), afterImage: z.string().optional(), beforeLabel: z.string().optional(), afterLabel: z.string().optional(), wipeStart: z.number().optional(), wipeDur: z.number().optional() });
type Meta = { content: z.infer<typeof ContentSchema> };
function parseMeta(m: unknown): Meta {
  const raw = RawSchema.safeParse(m ?? {});
  const d = (raw.success ? raw.data : {}) as z.infer<typeof RawSchema>;
  return { content: ContentSchema.parse({ bgColor: d.bgColor, beforeImage: d.beforeImage, afterImage: d.afterImage, beforeLabel: d.beforeLabel, afterLabel: d.afterLabel, wipeStart: d.wipeStart, wipeDur: d.wipeDur }) };
}
function src(p: string): string { return /^(https?:)?\/\//.test(p) || p.startsWith("/") ? p : staticFile(p); }
function Img2({ p, label }: { p: string; label: string }) {
  return (
    <>
      {p ? <Img src={src(p)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#101211", color: "#5C6560", fontFamily: "Geist Mono, monospace", fontSize: 30 }}>{label}</div>}
    </>
  );
}
function Component({ f, fps, durationInFrames, data }: { f: number; fps: number; durationInFrames: number; data: Meta }) {
  const dur = durationInFrames / fps;
  const op = s4eo(f, Math.max(0, dur - 0.4), dur);
  const c = data.content;
  const wipe = s4ei(f, c.wipeStart, c.wipeStart + Math.max(0.3, c.wipeDur)); // 0→1 (after lộ ra từ trái)
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: c.bgColor, opacity: op }}>
      {/* before nền */}
      <div style={{ position: "absolute", inset: 0 }}><Img2 p={c.beforeImage} label="beforeImage" /></div>
      {/* after phủ, cắt theo wipe */}
      <div style={{ position: "absolute", inset: 0, clipPath: `inset(0 ${(1 - wipe) * 100}% 0 0)` }}><Img2 p={c.afterImage} label="afterImage" /></div>
      {/* divider lime */}
      <div style={{ position: "absolute", top: 0, bottom: 0, left: `${wipe * 100}%`, width: 6, background: "#00FF41", transform: "translateX(-50%)" }} />
      {/* labels */}
      <span style={{ position: "absolute", top: "6%", left: "6%", fontFamily: "Geist, sans-serif", fontWeight: 800, fontSize: 40, color: "#FFFFFF", background: "rgba(10,11,10,0.7)", padding: "8px 18px", borderRadius: 8 }}>{c.beforeLabel}</span>
      <span style={{ position: "absolute", top: "6%", right: "6%", fontFamily: "Geist, sans-serif", fontWeight: 800, fontSize: 40, color: "#0A0B0A", background: "#00FF41", padding: "8px 18px", borderRadius: 8, opacity: wipe }}>{c.afterLabel}</span>
    </div>
  );
}
const panelSections: PanelSection[] = [{ title: "Content", schema: ContentSchema, widgets: CW }];
export const splitRevealModule: MotionSceneModule = {
  parseMeta, Component, panelSections,
  defaultMeta: { bgColor: "#0A0B0A", beforeImage: "", afterImage: "", beforeLabel: "BEFORE", afterLabel: "AFTER", wipeStart: 0.6, wipeDur: 1.0 },
};
