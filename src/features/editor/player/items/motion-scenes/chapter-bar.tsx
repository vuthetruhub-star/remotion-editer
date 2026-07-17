// motion-scenes/chapter-bar.tsx — kind "chapter_bar". Thanh chương đáy (over video). (Taste: TRÁNH trên Short.)
import { z } from "zod";
import { type WidgetSpec } from "../schemas/_shared";
import { s4ei, s4eo } from "../../../motion-config";
import type { PanelSection } from "../../../control-item/auto-panel";
import type { MotionSceneModule } from "./types";

const ContentSchema = z.object({ bgColor: z.string().default("transparent"), number: z.string().default("01"), title: z.string().default("The setup") });
const CW: Record<keyof z.infer<typeof ContentSchema>, WidgetSpec> = { bgColor: { type: "color" }, number: { type: "text" }, title: { type: "text" } };
const RawSchema = z.object({ bgColor: z.string().optional(), number: z.string().optional(), title: z.string().optional() });
type Meta = { content: z.infer<typeof ContentSchema> };
function parseMeta(m: unknown): Meta {
  const raw = RawSchema.safeParse(m ?? {});
  const d = (raw.success ? raw.data : {}) as z.infer<typeof RawSchema>;
  return { content: ContentSchema.parse({ bgColor: d.bgColor, number: d.number, title: d.title }) };
}
function Component({ f, fps, durationInFrames, data }: { f: number; fps: number; durationInFrames: number; data: Meta }) {
  const dur = durationInFrames / fps;
  const inp = s4ei(f, 0, 0.4);
  const op = Math.min(inp, s4eo(f, Math.max(0, dur - 0.4), dur));
  const c = data.content;
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: c.bgColor }}>
      <div style={{ position: "absolute", left: "5%", right: "5%", bottom: "8%", display: "flex", alignItems: "center", gap: 20,
        background: "#101211", borderRadius: 12, padding: "20px 26px", opacity: op, transform: `translateY(${20 * (1 - inp)}px)` }}>
        <span style={{ background: "#00FF41", color: "#0A0B0A", fontFamily: "Geist, sans-serif", fontWeight: 800, fontSize: 40, padding: "6px 18px", borderRadius: 8 }}>{c.number}</span>
        <span style={{ fontFamily: "Geist, system-ui, sans-serif", fontWeight: 600, fontSize: 44, color: "#EDEFEC" }}>{c.title}</span>
      </div>
    </div>
  );
}
const panelSections: PanelSection[] = [{ title: "Content", schema: ContentSchema, widgets: CW }];
export const chapterBarModule: MotionSceneModule = {
  parseMeta, Component, panelSections,
  defaultMeta: { bgColor: "transparent", number: "01", title: "The setup" },
};
