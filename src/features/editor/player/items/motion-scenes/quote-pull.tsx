// motion-scenes/quote-pull.tsx — kind "quote_pull". Trích dẫn typewriter + attribution. Chroma-safe.
import { z } from "zod";
import { type WidgetSpec } from "../schemas/_shared";
import { s4ei, s4eo } from "../../../motion-config";
import type { PanelSection } from "../../../control-item/auto-panel";
import type { MotionSceneModule } from "./types";

const ContentSchema = z.object({
  bgColor: z.string().default("transparent"),
  quote:   z.string().default("The plan was never the bottleneck. The setup was."),
  attribution: z.string().default(""),
  cps:     z.number().default(22), // chars per second gõ
});
const CONTENT_WIDGETS: Record<keyof z.infer<typeof ContentSchema>, WidgetSpec> = {
  bgColor: { type: "color" }, quote: { type: "text" }, attribution: { type: "text" }, cps: { type: "number" },
};
const RawSchema = z.object({
  bgColor: z.string().optional(), quote: z.string().optional(),
  attribution: z.string().optional(), cps: z.number().optional(),
});
type Meta = { content: z.infer<typeof ContentSchema> };
function parseMeta(m: unknown): Meta {
  const raw = RawSchema.safeParse(m ?? {});
  const d = (raw.success ? raw.data : {}) as z.infer<typeof RawSchema>;
  return { content: ContentSchema.parse({ bgColor: d.bgColor, quote: d.quote, attribution: d.attribution, cps: d.cps }) };
}
function Component({ f, fps, durationInFrames, data }: { f: number; fps: number; durationInFrames: number; data: Meta }) {
  const dur = durationInFrames / fps;
  const t = f / fps; // giây
  const shown = Math.min(data.content.quote.length, Math.floor(t * data.content.cps));
  const text = data.content.quote.slice(0, shown);
  const typing = shown < data.content.quote.length;
  const op = s4eo(f, Math.max(0, dur - 0.5), dur);
  const attrOp = Math.min(s4ei(f, (data.content.quote.length / data.content.cps) + 0.2, (data.content.quote.length / data.content.cps) + 0.7), op);
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: data.content.bgColor,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 9%", opacity: op }}>
      <div style={{ fontFamily: "Geist, system-ui, sans-serif", fontWeight: 700, fontSize: 68, lineHeight: 1.2,
        color: "#FFFFFF", textAlign: "center", WebkitTextStroke: "1.5px rgba(0,0,0,0.4)", paintOrder: "stroke fill" }}>
        &ldquo;{text}{typing && <span style={{ color: "#00FF41" }}>|</span>}&rdquo;
      </div>
      {data.content.attribution && (
        <div style={{ marginTop: 28, opacity: attrOp, color: "#00FF41", fontFamily: "Geist, system-ui, sans-serif",
          fontWeight: 600, fontSize: 34, letterSpacing: 2, textTransform: "uppercase" }}>
          — {data.content.attribution}
        </div>
      )}
    </div>
  );
}
const panelSections: PanelSection[] = [{ title: "Content", schema: ContentSchema, widgets: CONTENT_WIDGETS }];
export const quotePullModule: MotionSceneModule = {
  parseMeta, Component, panelSections,
  defaultMeta: { bgColor: "transparent", quote: "The plan was never the bottleneck. The setup was.", attribution: "", cps: 22 },
};
