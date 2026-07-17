// motion-scenes/cinematic-title.tsx — kind "cinematic_title". Chương lớn: kicker → số slam → divider → title.
import { z } from "zod";
import { type WidgetSpec } from "../schemas/_shared";
import { s4ei, s4eo } from "../../../motion-config";
import type { PanelSection } from "../../../control-item/auto-panel";
import type { MotionSceneModule } from "./types";

const ContentSchema = z.object({
  bgColor: z.string().default("#0A0B0A"),
  kicker:  z.string().default("CHAPTER"),
  chapter: z.string().default("02"),
  title:   z.string().default("The setup"),
  subtitle: z.string().default(""),
});
const CW: Record<keyof z.infer<typeof ContentSchema>, WidgetSpec> = {
  bgColor: { type: "color" }, kicker: { type: "text" }, chapter: { type: "text" }, title: { type: "text" }, subtitle: { type: "text" },
};
const RawSchema = z.object({ bgColor: z.string().optional(), kicker: z.string().optional(), chapter: z.string().optional(), title: z.string().optional(), subtitle: z.string().optional() });
type Meta = { content: z.infer<typeof ContentSchema> };
function parseMeta(m: unknown): Meta {
  const raw = RawSchema.safeParse(m ?? {});
  const d = (raw.success ? raw.data : {}) as z.infer<typeof RawSchema>;
  return { content: ContentSchema.parse({ bgColor: d.bgColor, kicker: d.kicker, chapter: d.chapter, title: d.title, subtitle: d.subtitle }) };
}
function Component({ f, fps, durationInFrames, data }: { f: number; fps: number; durationInFrames: number; data: Meta }) {
  const dur = durationInFrames / fps;
  const outOp = s4eo(f, Math.max(0, dur - 0.4), dur);
  const kIn = s4ei(f, 0, 0.35), nIn = s4ei(f, 0.15, 0.5), dIn = s4ei(f, 0.4, 0.7), tIn = s4ei(f, 0.55, 0.9);
  const c = data.content;
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: c.bgColor,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
      <div style={{ fontFamily: "Geist, system-ui, sans-serif", fontWeight: 600, fontSize: 30, letterSpacing: 8,
        textTransform: "uppercase", color: "#00FF41", opacity: Math.min(kIn, outOp) }}>{c.kicker}</div>
      <div style={{ fontFamily: "Geist, system-ui, sans-serif", fontWeight: 800, fontSize: 200, color: "#FFFFFF",
        lineHeight: 1, transform: `scale(${1.25 - 0.25 * nIn})`, opacity: Math.min(nIn, outOp) }}>{c.chapter}</div>
      <div style={{ width: `${44 * dIn}%`, height: 4, background: "#00FF41", opacity: outOp, borderRadius: 2 }} />
      <div style={{ fontFamily: "Geist, system-ui, sans-serif", fontWeight: 700, fontSize: 64, color: "#FFFFFF",
        transform: `translateY(${20 * (1 - tIn)}px)`, opacity: Math.min(tIn, outOp), textAlign: "center" }}>{c.title}</div>
      {c.subtitle && <div style={{ fontFamily: "Geist, system-ui, sans-serif", fontWeight: 500, fontSize: 32,
        color: "#9BA39E", opacity: Math.min(tIn, outOp) }}>{c.subtitle}</div>}
    </div>
  );
}
const panelSections: PanelSection[] = [{ title: "Content", schema: ContentSchema, widgets: CW }];
export const cinematicTitleModule: MotionSceneModule = {
  parseMeta, Component, panelSections,
  defaultMeta: { bgColor: "#0A0B0A", kicker: "CHAPTER", chapter: "02", title: "The setup", subtitle: "" },
};
