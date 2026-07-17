// motion-scenes/kinetic-statement.tsx — kind "kinetic_statement". Câu hiện từng-từ (auto-stagger). Chroma-safe.
import { z } from "zod";
import { type WidgetSpec } from "../schemas/_shared";
import { s4ei, s4eo } from "../../../motion-config";
import type { PanelSection } from "../../../control-item/auto-panel";
import type { MotionSceneModule } from "./types";

const ContentSchema = z.object({
  bgColor:  z.string().default("transparent"),
  text:     z.string().default("The setup was the bottleneck"),
  accentWord: z.string().default("bottleneck"), // từ nào tô lime (khớp không phân biệt hoa/thường)
});
const CW: Record<keyof z.infer<typeof ContentSchema>, WidgetSpec> = {
  bgColor: { type: "color" }, text: { type: "text" }, accentWord: { type: "text" },
};
const RawSchema = z.object({ bgColor: z.string().optional(), text: z.string().optional(), accentWord: z.string().optional() });
type Meta = { content: z.infer<typeof ContentSchema> };
function parseMeta(m: unknown): Meta {
  const raw = RawSchema.safeParse(m ?? {});
  const d = (raw.success ? raw.data : {}) as z.infer<typeof RawSchema>;
  return { content: ContentSchema.parse({ bgColor: d.bgColor, text: d.text, accentWord: d.accentWord }) };
}
function Component({ f, fps, durationInFrames, data }: { f: number; fps: number; durationInFrames: number; data: Meta }) {
  const dur = durationInFrames / fps;
  const outOp = s4eo(f, Math.max(0, dur - 0.4), dur);
  const words = data.content.text.split(/\s+/).filter(Boolean);
  const accent = data.content.accentWord.trim().toLowerCase();
  const per = Math.min(0.14, (dur * 0.6) / Math.max(1, words.length)); // giãn cách xuất hiện
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: data.content.bgColor,
      display: "flex", alignItems: "center", justifyContent: "center", padding: "0 8%", flexWrap: "wrap", gap: "0 20px" }}>
      {words.map((w, i) => {
        const inAt = i * per;
        const wIn = s4ei(f, inAt, inAt + 0.3);
        const isAccent = w.toLowerCase().replace(/[^a-z0-9]/g, "") === accent;
        return (
          <span key={i} style={{ fontFamily: "Geist, system-ui, sans-serif", fontWeight: 800, fontSize: 84, lineHeight: 1.15,
            color: isAccent ? "#00FF41" : "#FFFFFF", opacity: Math.min(wIn, outOp),
            transform: `translateY(${24 * (1 - wIn)}px)`, display: "inline-block",
            WebkitTextStroke: "1.5px rgba(0,0,0,0.4)", paintOrder: "stroke fill" }}>{w}</span>
        );
      })}
    </div>
  );
}
const panelSections: PanelSection[] = [{ title: "Content", schema: ContentSchema, widgets: CW }];
export const kineticStatementModule: MotionSceneModule = {
  parseMeta, Component, panelSections,
  defaultMeta: { bgColor: "transparent", text: "The setup was the bottleneck", accentWord: "bottleneck" },
};
