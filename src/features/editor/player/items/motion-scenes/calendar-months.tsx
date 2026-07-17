// motion-scenes/calendar-months.tsx — kind "calendar_months". Lưới N tháng fill lime dần. Chroma-safe.
// (Bản stylized: mỗi ô = 1 tháng, tô lime tuần tự — không vẽ lịch thật để gọn.)
import { z } from "zod";
import { type WidgetSpec } from "../schemas/_shared";
import { s4ei, s4eo } from "../../../motion-config";
import type { PanelSection } from "../../../control-item/auto-panel";
import type { MotionSceneModule } from "./types";

const ContentSchema = z.object({
  bgColor: z.string().default("#0A0B0A"),
  count:   z.number().default(9),
  title:   z.string().default(""),
  caption: z.string().default("MONTHS"),
});
const CW: Record<keyof z.infer<typeof ContentSchema>, WidgetSpec> = {
  bgColor: { type: "color" }, count: { type: "number" }, title: { type: "text" }, caption: { type: "text" },
};
const RawSchema = z.object({ bgColor: z.string().optional(), count: z.number().optional(), title: z.string().optional(), caption: z.string().optional() });
type Meta = { content: z.infer<typeof ContentSchema> };
function parseMeta(m: unknown): Meta {
  const raw = RawSchema.safeParse(m ?? {});
  const d = (raw.success ? raw.data : {}) as z.infer<typeof RawSchema>;
  return { content: ContentSchema.parse({ bgColor: d.bgColor, count: d.count, title: d.title, caption: d.caption }) };
}
function Component({ f, fps, durationInFrames, data }: { f: number; fps: number; durationInFrames: number; data: Meta }) {
  const dur = durationInFrames / fps;
  const outOp = s4eo(f, Math.max(0, dur - 0.4), dur);
  const n = Math.max(1, Math.min(24, Math.round(data.content.count)));
  const cols = n <= 4 ? 2 : n <= 9 ? 3 : 4;
  const fillP = s4ei(f, 0.2, Math.min(dur - 0.5, 1.6));
  const filled = Math.round(fillP * n);
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: data.content.bgColor,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 40, padding: "0 8%", opacity: outOp }}>
      {data.content.title && <div style={{ fontFamily: "Geist, system-ui, sans-serif", fontWeight: 600, fontSize: 40, color: "#9BA39E" }}>{data.content.title}</div>}
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 18, width: "100%" }}>
        {Array.from({ length: n }).map((_, i) => (
          <div key={i} style={{ aspectRatio: "1 / 1", borderRadius: 12, border: "2px solid #1F2A23",
            background: i < filled ? "#00FF41" : "#101211", transition: "none",
            display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 4, padding: 10 }}>
            {Array.from({ length: 12 }).map((__, j) => (
              <span key={j} style={{ borderRadius: 2, background: i < filled ? "rgba(10,11,10,0.35)" : "#1F2A23" }} />
            ))}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
        <span style={{ fontFamily: "Geist, system-ui, sans-serif", fontWeight: 800, fontSize: 120, color: "#EDEFEC", lineHeight: 1 }}>{filled}</span>
        {data.content.caption && <span style={{ fontFamily: "Geist, system-ui, sans-serif", fontWeight: 600, fontSize: 40, letterSpacing: 2, color: "#00FF41" }}>{data.content.caption}</span>}
      </div>
    </div>
  );
}
const panelSections: PanelSection[] = [{ title: "Content", schema: ContentSchema, widgets: CW }];
export const calendarMonthsModule: MotionSceneModule = {
  parseMeta, Component, panelSections,
  defaultMeta: { bgColor: "#0A0B0A", count: 9, title: "Shipped every month", caption: "MONTHS" },
};
