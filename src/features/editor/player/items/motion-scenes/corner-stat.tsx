// motion-scenes/corner-stat.tsx — kind "corner_stat". Card số nhỏ ở góc (over video). (Taste: TRÁNH trên Short.)
import { z } from "zod";
import type { CSSProperties } from "react";
import { type WidgetSpec } from "../schemas/_shared";
import { s4ei, s4eo } from "../../../motion-config";
import type { PanelSection } from "../../../control-item/auto-panel";
import type { MotionSceneModule } from "./types";

const ContentSchema = z.object({
  bgColor: z.string().default("transparent"), preLabel: z.string().default(""), value: z.string().default("$18K"), caption: z.string().default("MRR"), delta: z.string().default("+12%"),
  anchor: z.enum(["top-right", "top-left", "bottom-right", "bottom-left"]).default("top-right"),
});
const CW: Record<keyof z.infer<typeof ContentSchema>, WidgetSpec> = {
  bgColor: { type: "color" }, preLabel: { type: "text" }, value: { type: "text" }, caption: { type: "text" }, delta: { type: "text" },
  anchor: { type: "select", options: ["top-right", "top-left", "bottom-right", "bottom-left"] },
};
const RawSchema = z.object({ bgColor: z.string().optional(), preLabel: z.string().optional(), value: z.string().optional(), caption: z.string().optional(), delta: z.string().optional(), anchor: z.enum(["top-right", "top-left", "bottom-right", "bottom-left"]).optional() });
type Meta = { content: z.infer<typeof ContentSchema> };
function parseMeta(m: unknown): Meta {
  const raw = RawSchema.safeParse(m ?? {});
  const d = (raw.success ? raw.data : {}) as z.infer<typeof RawSchema>;
  return { content: ContentSchema.parse({ bgColor: d.bgColor, preLabel: d.preLabel, value: d.value, caption: d.caption, delta: d.delta, anchor: d.anchor }) };
}
function Component({ f, fps, durationInFrames, data }: { f: number; fps: number; durationInFrames: number; data: Meta }) {
  const dur = durationInFrames / fps;
  const inp = s4ei(f, 0, 0.4);
  const op = Math.min(inp, s4eo(f, Math.max(0, dur - 0.4), dur));
  const c = data.content;
  const top = c.anchor.startsWith("top"), left = c.anchor.endsWith("left");
  const pos: CSSProperties = { position: "absolute", opacity: op, transform: `scale(${0.9 + 0.1 * inp})`, transformOrigin: `${top ? "top" : "bottom"} ${left ? "left" : "right"}` };
  pos[top ? "top" : "bottom"] = "8%"; pos[left ? "left" : "right"] = "6%";
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: c.bgColor }}>
      <div style={{ ...pos, background: "#101211", border: "1px solid #1F2A23", borderRadius: 16, padding: "26px 30px", display: "flex", flexDirection: "column", gap: 6, minWidth: 260 }}>
        {c.preLabel && <span style={{ fontFamily: "Geist Mono, monospace", fontSize: 24, letterSpacing: 1, color: "#5C6560", textTransform: "uppercase" }}>{c.preLabel}</span>}
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <span style={{ fontFamily: "Geist, system-ui, sans-serif", fontWeight: 800, fontSize: 72, color: "#EDEFEC", lineHeight: 1 }}>{c.value}</span>
          {c.delta && <span style={{ fontFamily: "Geist Mono, monospace", fontSize: 30, color: "#00FF41" }}>{c.delta}</span>}
        </div>
        {c.caption && <span style={{ fontFamily: "Geist, system-ui, sans-serif", fontWeight: 500, fontSize: 30, color: "#9BA39E" }}>{c.caption}</span>}
      </div>
    </div>
  );
}
const panelSections: PanelSection[] = [{ title: "Content", schema: ContentSchema, widgets: CW }];
export const cornerStatModule: MotionSceneModule = {
  parseMeta, Component, panelSections,
  defaultMeta: { bgColor: "transparent", preLabel: "", value: "$18K", caption: "MRR", delta: "+12%", anchor: "top-right" },
};
