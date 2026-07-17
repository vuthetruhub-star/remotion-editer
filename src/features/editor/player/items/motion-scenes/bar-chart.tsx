// motion-scenes/bar-chart.tsx — kind "bar_chart". Cột NGANG full-screen (hợp 9:16). Chroma-safe.
import { z } from "zod";
import { type WidgetSpec } from "../schemas/_shared";
import { s4ei, s4eo } from "../../../motion-config";
import type { PanelSection } from "../../../control-item/auto-panel";
import type { MotionSceneModule } from "./types";

const BarSchema = z.object({ label: z.string().default(""), value: z.number().default(0), display: z.string().default(""), highlight: z.boolean().default(false) });
const BW: Record<keyof z.infer<typeof BarSchema>, WidgetSpec> = { label: { type: "text" }, value: { type: "number" }, display: { type: "text" }, highlight: { type: "checkbox" } };
const ContentSchema = z.object({ bgColor: z.string().default("#0A0B0A"), title: z.string().default("") });
const CW: Record<keyof z.infer<typeof ContentSchema>, WidgetSpec> = { bgColor: { type: "color" }, title: { type: "text" } };
const KEYS = ["bar1", "bar2", "bar3", "bar4", "bar5", "bar6"] as const;
const RawSchema = z.object({
  bgColor: z.string().optional(), title: z.string().optional(),
  bar1: BarSchema.partial().optional(), bar2: BarSchema.partial().optional(), bar3: BarSchema.partial().optional(),
  bar4: BarSchema.partial().optional(), bar5: BarSchema.partial().optional(), bar6: BarSchema.partial().optional(),
});
type Bar = z.infer<typeof BarSchema>;
type Meta = { content: z.infer<typeof ContentSchema>; bars: Bar[] };
function parseMeta(m: unknown): Meta {
  const raw = RawSchema.safeParse(m ?? {});
  const d = (raw.success ? raw.data : {}) as Record<string, unknown>;
  const bars = KEYS.map((k) => BarSchema.parse(d[k] ?? {})).filter((b) => b.label.trim().length > 0);
  return { content: ContentSchema.parse({ bgColor: d.bgColor, title: d.title }), bars };
}
function Component({ f, fps, durationInFrames, data }: { f: number; fps: number; durationInFrames: number; data: Meta }) {
  const dur = durationInFrames / fps;
  const outOp = s4eo(f, Math.max(0, dur - 0.4), dur);
  const max = Math.max(1, ...data.bars.map((b) => b.value));
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: data.content.bgColor,
      display: "flex", flexDirection: "column", justifyContent: "center", gap: 30, padding: "0 8%", opacity: outOp }}>
      {data.content.title && <div style={{ fontFamily: "Geist, system-ui, sans-serif", fontWeight: 600, fontSize: 42, color: "#EDEFEC", marginBottom: 12 }}>{data.content.title}</div>}
      {data.bars.map((b, i) => {
        const grow = s4ei(f, i * 0.12, i * 0.12 + 0.6);
        return (
          <div key={i} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "Geist, system-ui, sans-serif", fontSize: 34, color: "#9BA39E" }}>
              <span>{b.label}</span><span style={{ color: b.highlight ? "#00FF41" : "#EDEFEC", fontWeight: 700 }}>{b.display || b.value}</span>
            </div>
            <div style={{ height: 40, background: "#161A18", borderRadius: 8, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(b.value / max) * 100 * grow}%`, background: b.highlight ? "#00FF41" : "#343E5B", borderRadius: 8 }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
const panelSections: PanelSection[] = [
  { title: "Content", schema: ContentSchema, widgets: CW },
  { title: "Bars", schema: BarSchema, widgets: BW, tabs: [...KEYS] },
];
export const barChartModule: MotionSceneModule = {
  parseMeta, Component, panelSections,
  defaultMeta: { bgColor: "#0A0B0A", title: "Cost to run",
    bar1: { label: "Hire a team", value: 100, display: "$100k" }, bar2: { label: "2 people + AI", value: 15, display: "$15k", highlight: true } },
};
