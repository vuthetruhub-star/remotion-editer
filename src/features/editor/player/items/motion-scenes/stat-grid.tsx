// motion-scenes/stat-grid.tsx — kind "stat_grid". Lưới 2×2 mini-stat. Chroma-safe.
import { z } from "zod";
import { type WidgetSpec } from "../schemas/_shared";
import { s4ei, s4eo } from "../../../motion-config";
import type { PanelSection } from "../../../control-item/auto-panel";
import type { MotionSceneModule } from "./types";

const StatSchema = z.object({ value: z.string().default(""), label: z.string().default(""), accent: z.boolean().default(false) });
const SW: Record<keyof z.infer<typeof StatSchema>, WidgetSpec> = { value: { type: "text" }, label: { type: "text" }, accent: { type: "checkbox" } };
const ContentSchema = z.object({ bgColor: z.string().default("#0A0B0A"), title: z.string().default("") });
const CW: Record<keyof z.infer<typeof ContentSchema>, WidgetSpec> = { bgColor: { type: "color" }, title: { type: "text" } };
const KEYS = ["stat1", "stat2", "stat3", "stat4"] as const;
const RawSchema = z.object({
  bgColor: z.string().optional(), title: z.string().optional(),
  stat1: StatSchema.partial().optional(), stat2: StatSchema.partial().optional(),
  stat3: StatSchema.partial().optional(), stat4: StatSchema.partial().optional(),
});
type Stat = z.infer<typeof StatSchema>;
type Meta = { content: z.infer<typeof ContentSchema>; stats: Stat[] };
function parseMeta(m: unknown): Meta {
  const raw = RawSchema.safeParse(m ?? {});
  const d = (raw.success ? raw.data : {}) as Record<string, unknown>;
  const stats = KEYS.map((k) => StatSchema.parse(d[k] ?? {})).filter((s) => s.value.trim().length > 0);
  return { content: ContentSchema.parse({ bgColor: d.bgColor, title: d.title }), stats };
}
function Component({ f, fps, durationInFrames, data }: { f: number; fps: number; durationInFrames: number; data: Meta }) {
  const dur = durationInFrames / fps;
  const outOp = s4eo(f, Math.max(0, dur - 0.4), dur);
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: data.content.bgColor,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 40, padding: "0 8%" }}>
      {data.content.title && <div style={{ fontFamily: "Geist, system-ui, sans-serif", fontWeight: 600, fontSize: 40,
        color: "#9BA39E", opacity: outOp }}>{data.content.title}</div>}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, width: "100%" }}>
        {data.stats.map((s, i) => {
          const inp = s4ei(f, i * 0.12, i * 0.12 + 0.35);
          return (
            <div key={i} style={{ background: "#101211", border: "1px solid #1F2A23", borderRadius: 16, padding: "34px 30px",
              opacity: Math.min(inp, outOp), transform: `translateY(${20 * (1 - inp)}px)` }}>
              <div style={{ fontFamily: "Geist, system-ui, sans-serif", fontWeight: 800, fontSize: 84,
                color: s.accent ? "#00FF41" : "#EDEFEC", lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontFamily: "Geist, system-ui, sans-serif", fontWeight: 500, fontSize: 30, color: "#9BA39E", marginTop: 8 }}>{s.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
const panelSections: PanelSection[] = [
  { title: "Content", schema: ContentSchema, widgets: CW },
  { title: "Stats", schema: StatSchema, widgets: SW, tabs: [...KEYS] },
];
export const statGridModule: MotionSceneModule = {
  parseMeta, Component, panelSections,
  defaultMeta: { bgColor: "#0A0B0A", title: "By the numbers",
    stat1: { value: "12", label: "agents" }, stat2: { value: "3", label: "kept", accent: true },
    stat3: { value: "40min", label: "saved/day" }, stat4: { value: "$0", label: "extra cost" } },
};
