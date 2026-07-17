// motion-scenes/ratio-dots.tsx — kind "ratio_dots". "X trên Y": lưới dot, X cái đổi màu ở markAt. Chroma-safe.
import { z } from "zod";
import { type WidgetSpec } from "../schemas/_shared";
import { s4ei, s4eo } from "../../../motion-config";
import type { PanelSection } from "../../../control-item/auto-panel";
import type { MotionSceneModule } from "./types";

const ContentSchema = z.object({
  bgColor:  z.string().default("#0A0B0A"),
  total:    z.number().default(12),
  marked:   z.number().default(9),
  polarity: z.enum(["negative", "positive"]).default("negative"),
  markAt:   z.number().default(1.4),
  caption:  z.string().default("ROUTINES"),
});
const CW: Record<keyof z.infer<typeof ContentSchema>, WidgetSpec> = {
  bgColor: { type: "color" }, total: { type: "number" }, marked: { type: "number" },
  polarity: { type: "select", options: ["negative", "positive"] }, markAt: { type: "number" }, caption: { type: "text" },
};
const RawSchema = z.object({ bgColor: z.string().optional(), total: z.number().optional(), marked: z.number().optional(), polarity: z.enum(["negative", "positive"]).optional(), markAt: z.number().optional(), caption: z.string().optional() });
type Meta = { content: z.infer<typeof ContentSchema> };
function parseMeta(m: unknown): Meta {
  const raw = RawSchema.safeParse(m ?? {});
  const d = (raw.success ? raw.data : {}) as z.infer<typeof RawSchema>;
  return { content: ContentSchema.parse({ bgColor: d.bgColor, total: d.total, marked: d.marked, polarity: d.polarity, markAt: d.markAt, caption: d.caption }) };
}
function Component({ f, fps, durationInFrames, data }: { f: number; fps: number; durationInFrames: number; data: Meta }) {
  const dur = durationInFrames / fps;
  const t = f / fps;
  const outOp = s4eo(f, Math.max(0, dur - 0.4), dur);
  const c = data.content;
  const total = Math.max(1, Math.min(100, Math.round(c.total)));
  const marked = Math.max(0, Math.min(total, Math.round(c.marked)));
  const cols = Math.ceil(Math.sqrt(total));
  const neg = c.polarity === "negative";
  const marking = s4ei(f, c.markAt, c.markAt + 0.5);
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: c.bgColor,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 44, padding: "0 10%", opacity: outOp }}>
      {c.caption && <div style={{ fontFamily: "Geist, system-ui, sans-serif", fontWeight: 700, fontSize: 48, letterSpacing: 2, textTransform: "uppercase", color: "#EDEFEC" }}>
        <span style={{ color: "#00FF41" }}>{marked}</span>/{total} {c.caption}</div>}
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 22 }}>
        {Array.from({ length: total }).map((_, i) => {
          const pop = s4ei(f, i * 0.03, i * 0.03 + 0.3);
          const isMarked = i < marked;
          const base = neg ? "#00FF41" : "#2D3D33";
          const after = neg ? "#2D3D33" : "#00FF41";
          const col = isMarked ? (marking > 0.5 ? after : base) : (neg ? base : "#2D3D33");
          return (
            <div key={i} style={{ position: "relative", width: 64, height: 64, borderRadius: 999, background: col, opacity: pop, transform: `scale(${pop})` }}>
              {isMarked && neg && marking > 0.5 && <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#EF4444", fontWeight: 800, fontSize: 40 }}>✕</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
const panelSections: PanelSection[] = [{ title: "Content", schema: ContentSchema, widgets: CW }];
export const ratioDotsModule: MotionSceneModule = {
  parseMeta, Component, panelSections,
  defaultMeta: { bgColor: "#0A0B0A", total: 12, marked: 9, polarity: "negative", markAt: 1.4, caption: "ROUTINES" },
};
