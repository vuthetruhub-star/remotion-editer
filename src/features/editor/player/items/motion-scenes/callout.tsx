// motion-scenes/callout.tsx — kind "callout". Câu + một cụm highlight lime. Chroma-safe.
import { z } from "zod";
import { type WidgetSpec } from "../schemas/_shared";
import { s4ei, s4eo } from "../../../motion-config";
import type { PanelSection } from "../../../control-item/auto-panel";
import type { MotionSceneModule } from "./types";

const ContentSchema = z.object({
  bgColor: z.string().default("transparent"),
  prefix:  z.string().default("It's never the model."),
  highlight: z.string().default("It's the math."),
  suffix:  z.string().default(""),
});
const CONTENT_WIDGETS: Record<keyof z.infer<typeof ContentSchema>, WidgetSpec> = {
  bgColor: { type: "color" }, prefix: { type: "text" }, highlight: { type: "text" }, suffix: { type: "text" },
};
const RawSchema = z.object({
  bgColor: z.string().optional(), prefix: z.string().optional(),
  highlight: z.string().optional(), suffix: z.string().optional(),
});
type Meta = { content: z.infer<typeof ContentSchema> };
function parseMeta(m: unknown): Meta {
  const raw = RawSchema.safeParse(m ?? {});
  const d = (raw.success ? raw.data : {}) as z.infer<typeof RawSchema>;
  return { content: ContentSchema.parse({ bgColor: d.bgColor, prefix: d.prefix, highlight: d.highlight, suffix: d.suffix }) };
}
function Component({ f, fps, durationInFrames, data }: { f: number; fps: number; durationInFrames: number; data: Meta }) {
  const dur = durationInFrames / fps;
  const op = Math.min(s4ei(f, 0, 0.4), s4eo(f, Math.max(0, dur - 0.4), dur));
  const rise = 24 * (1 - s4ei(f, 0, 0.4));
  const c = data.content;
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: c.bgColor,
      display: "flex", alignItems: "center", justifyContent: "center", padding: "0 8%" }}>
      <div style={{ transform: `translateY(${rise}px)`, opacity: op, textAlign: "center",
        fontFamily: "Geist, system-ui, sans-serif", fontWeight: 800, fontSize: 76, lineHeight: 1.1, color: "#FFFFFF",
        WebkitTextStroke: "1.5px rgba(0,0,0,0.4)", paintOrder: "stroke fill" }}>
        {c.prefix} {c.highlight && <span style={{ color: "#00FF41", borderBottom: "6px solid #00FF41" }}>{c.highlight}</span>} {c.suffix}
      </div>
    </div>
  );
}
const panelSections: PanelSection[] = [{ title: "Content", schema: ContentSchema, widgets: CONTENT_WIDGETS }];
export const calloutModule: MotionSceneModule = {
  parseMeta, Component, panelSections,
  defaultMeta: { bgColor: "transparent", prefix: "It's never the model.", highlight: "It's the math.", suffix: "" },
};
