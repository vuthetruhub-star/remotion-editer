// motion-scenes/lower-third.tsx — kind "lower_third". Banner chyron (nền đặc, over video). (Taste: TRÁNH trên Short.)
import { z } from "zod";
import { type WidgetSpec } from "../schemas/_shared";
import { s4ei, s4eo } from "../../../motion-config";
import type { PanelSection } from "../../../control-item/auto-panel";
import type { MotionSceneModule } from "./types";

const ContentSchema = z.object({ bgColor: z.string().default("transparent"), kicker: z.string().default(""), prefix: z.string().default("This is"), highlight: z.string().default("the category"), suffix: z.string().default(""), vertical: z.number().default(0.8) });
const CW: Record<keyof z.infer<typeof ContentSchema>, WidgetSpec> = { bgColor: { type: "color" }, kicker: { type: "text" }, prefix: { type: "text" }, highlight: { type: "text" }, suffix: { type: "text" }, vertical: { type: "slider", min: 0, max: 1, step: 0.01 } };
const RawSchema = z.object({ bgColor: z.string().optional(), kicker: z.string().optional(), prefix: z.string().optional(), highlight: z.string().optional(), suffix: z.string().optional(), vertical: z.number().optional() });
type Meta = { content: z.infer<typeof ContentSchema> };
function parseMeta(m: unknown): Meta {
  const raw = RawSchema.safeParse(m ?? {});
  const d = (raw.success ? raw.data : {}) as z.infer<typeof RawSchema>;
  return { content: ContentSchema.parse({ bgColor: d.bgColor, kicker: d.kicker, prefix: d.prefix, highlight: d.highlight, suffix: d.suffix, vertical: d.vertical }) };
}
function Component({ f, fps, durationInFrames, data }: { f: number; fps: number; durationInFrames: number; data: Meta }) {
  const dur = durationInFrames / fps;
  const inp = s4ei(f, 0, 0.4);
  const op = Math.min(inp, s4eo(f, Math.max(0, dur - 0.4), dur));
  const c = data.content;
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: c.bgColor }}>
      <div style={{ position: "absolute", left: "5%", top: `${c.vertical * 100}%`, transform: `translateY(-50%) translateX(${-30 * (1 - inp)}px)`, opacity: op }}>
        {c.kicker && <div style={{ fontFamily: "Geist Mono, monospace", fontSize: 28, letterSpacing: 3, color: "#00FF41", marginBottom: 10 }}>{c.kicker}</div>}
        <div style={{ background: "#101211", borderLeft: "6px solid #00FF41", borderRadius: 8, padding: "22px 30px",
          fontFamily: "Geist, system-ui, sans-serif", fontWeight: 700, fontSize: 52, color: "#EDEFEC" }}>
          {c.prefix} <span style={{ background: "#00FF41", color: "#0A0B0A", padding: "2px 12px", borderRadius: 6 }}>{c.highlight}</span> {c.suffix}
        </div>
      </div>
    </div>
  );
}
const panelSections: PanelSection[] = [{ title: "Content", schema: ContentSchema, widgets: CW }];
export const lowerThirdModule: MotionSceneModule = {
  parseMeta, Component, panelSections,
  defaultMeta: { bgColor: "transparent", kicker: "", prefix: "This is", highlight: "the category", suffix: "", vertical: 0.8 },
};
