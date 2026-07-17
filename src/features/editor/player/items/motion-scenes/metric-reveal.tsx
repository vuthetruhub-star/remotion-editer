// motion-scenes/metric-reveal.tsx — kind "metric_reveal". Số đếm lên 0→target. Chroma-safe.
import { z } from "zod";
import { type WidgetSpec } from "../schemas/_shared";
import { s4ei, s4eo } from "../../../motion-config";
import type { PanelSection } from "../../../control-item/auto-panel";
import type { MotionSceneModule } from "./types";

const ContentSchema = z.object({
  bgColor:  z.string().default("transparent"),
  preLabel: z.string().default(""),
  prefix:   z.string().default("$"),
  target:   z.number().default(400),
  suffix:   z.string().default("M"),
  caption:  z.string().default("RAISED"),
  decimals: z.number().default(0),
});
const CONTENT_WIDGETS: Record<keyof z.infer<typeof ContentSchema>, WidgetSpec> = {
  bgColor: { type: "color" }, preLabel: { type: "text" }, prefix: { type: "text" },
  target: { type: "number" }, suffix: { type: "text" }, caption: { type: "text" }, decimals: { type: "number" },
};
const RawSchema = z.object({
  bgColor: z.string().optional(), preLabel: z.string().optional(), prefix: z.string().optional(),
  target: z.number().optional(), suffix: z.string().optional(), caption: z.string().optional(), decimals: z.number().optional(),
});
type Meta = { content: z.infer<typeof ContentSchema> };
function parseMeta(m: unknown): Meta {
  const raw = RawSchema.safeParse(m ?? {});
  const d = (raw.success ? raw.data : {}) as z.infer<typeof RawSchema>;
  return { content: ContentSchema.parse({ bgColor: d.bgColor, preLabel: d.preLabel, prefix: d.prefix,
    target: d.target, suffix: d.suffix, caption: d.caption, decimals: d.decimals }) };
}
function Component({ f, fps, durationInFrames, data }: { f: number; fps: number; durationInFrames: number; data: Meta }) {
  const dur = durationInFrames / fps;
  const outOp = s4eo(f, Math.max(0, dur - 0.4), dur);
  const p = s4ei(f, 0.1, Math.min(dur - 0.5, 1.4)); // đếm trong ~1.3s
  const c = data.content;
  const val = (c.target * p).toFixed(Math.max(0, Math.min(4, c.decimals)));
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: c.bgColor,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18, opacity: outOp }}>
      {c.preLabel && <div style={{ fontFamily: "Geist, system-ui, sans-serif", fontWeight: 600, fontSize: 34,
        letterSpacing: 2, textTransform: "uppercase", color: "#00FF41" }}>{c.preLabel}</div>}
      <div style={{ fontFamily: "Geist, system-ui, sans-serif", fontWeight: 800, fontSize: 180, color: "#FFFFFF",
        lineHeight: 0.95, WebkitTextStroke: "1px rgba(0,0,0,0.35)", paintOrder: "stroke fill" }}>
        {c.prefix}{val}{c.suffix}
      </div>
      {c.caption && <div style={{ fontFamily: "Geist, system-ui, sans-serif", fontWeight: 600, fontSize: 38,
        letterSpacing: 2, textTransform: "uppercase", color: "#9BA39E" }}>{c.caption}</div>}
    </div>
  );
}
const panelSections: PanelSection[] = [{ title: "Content", schema: ContentSchema, widgets: CONTENT_WIDGETS }];
export const metricRevealModule: MotionSceneModule = {
  parseMeta, Component, panelSections,
  defaultMeta: { bgColor: "transparent", preLabel: "", prefix: "$", target: 400, suffix: "M", caption: "RAISED", decimals: 0 },
};
