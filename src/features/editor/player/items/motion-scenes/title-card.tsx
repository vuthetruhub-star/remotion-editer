// motion-scenes/title-card.tsx — kind "title_card". Số lime lớn + title + subtitle. Chroma-safe.
import { z } from "zod";
import { type WidgetSpec } from "../schemas/_shared";
import { s4ei, s4eo } from "../../../motion-config";
import type { PanelSection } from "../../../control-item/auto-panel";
import type { MotionSceneModule } from "./types";

const ContentSchema = z.object({
  bgColor:  z.string().default("#0A0B0A"),
  number:   z.string().default("01"),
  title:    z.string().default("The setup"),
  subtitle: z.string().default(""),
});
const CONTENT_WIDGETS: Record<keyof z.infer<typeof ContentSchema>, WidgetSpec> = {
  bgColor: { type: "color" }, number: { type: "text" }, title: { type: "text" }, subtitle: { type: "text" },
};
const RawSchema = z.object({
  bgColor: z.string().optional(), number: z.string().optional(),
  title: z.string().optional(), subtitle: z.string().optional(),
});
type Meta = { content: z.infer<typeof ContentSchema> };
function parseMeta(m: unknown): Meta {
  const raw = RawSchema.safeParse(m ?? {});
  const d = (raw.success ? raw.data : {}) as z.infer<typeof RawSchema>;
  return { content: ContentSchema.parse({ bgColor: d.bgColor, number: d.number, title: d.title, subtitle: d.subtitle }) };
}
function Component({ f, fps, durationInFrames, data }: { f: number; fps: number; durationInFrames: number; data: Meta }) {
  const dur = durationInFrames / fps;
  const outOp = s4eo(f, Math.max(0, dur - 0.4), dur);
  const nIn = s4ei(f, 0, 0.4), tIn = s4ei(f, 0.15, 0.6), sIn = s4ei(f, 0.3, 0.75);
  const c = data.content;
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: c.bgColor,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
      <div style={{ fontFamily: "Geist, system-ui, sans-serif", fontWeight: 800, fontSize: 180, color: "#00FF41",
        transform: `translateY(${30 * (1 - nIn)}px)`, opacity: Math.min(nIn, outOp), lineHeight: 1 }}>{c.number}</div>
      <div style={{ fontFamily: "Geist, system-ui, sans-serif", fontWeight: 700, fontSize: 72, color: "#FFFFFF",
        transform: `translateY(${20 * (1 - tIn)}px)`, opacity: Math.min(tIn, outOp), textAlign: "center" }}>{c.title}</div>
      {c.subtitle && <div style={{ fontFamily: "Geist, system-ui, sans-serif", fontWeight: 500, fontSize: 34,
        color: "#9BA39E", transform: `translateY(${16 * (1 - sIn)}px)`, opacity: Math.min(sIn, outOp), textAlign: "center" }}>{c.subtitle}</div>}
    </div>
  );
}
const panelSections: PanelSection[] = [{ title: "Content", schema: ContentSchema, widgets: CONTENT_WIDGETS }];
export const titleCardModule: MotionSceneModule = {
  parseMeta, Component, panelSections,
  defaultMeta: { bgColor: "#0A0B0A", number: "01", title: "The setup", subtitle: "" },
};
