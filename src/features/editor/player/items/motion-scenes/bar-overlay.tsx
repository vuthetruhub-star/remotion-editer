// motion-scenes/bar-overlay.tsx — kind "bar_overlay". Cột nhỏ lower-third, nền trong suốt (video vẫn thấy).
import { z } from "zod";
import { type WidgetSpec } from "../schemas/_shared";
import { s4ei, s4eo } from "../../../motion-config";
import type { PanelSection } from "../../../control-item/auto-panel";
import type { MotionSceneModule } from "./types";

const BarSchema = z.object({ label: z.string().default(""), value: z.number().default(0), display: z.string().default(""), highlight: z.boolean().default(false) });
const BW: Record<keyof z.infer<typeof BarSchema>, WidgetSpec> = { label: { type: "text" }, value: { type: "number" }, display: { type: "text" }, highlight: { type: "checkbox" } };
const ContentSchema = z.object({ bgColor: z.string().default("transparent"), title: z.string().default(""), vertical: z.number().default(0.62) });
const CW: Record<keyof z.infer<typeof ContentSchema>, WidgetSpec> = { bgColor: { type: "color" }, title: { type: "text" }, vertical: { type: "slider", min: 0, max: 1, step: 0.01 } };
const KEYS = ["bar1", "bar2", "bar3", "bar4"] as const;
const RawSchema = z.object({
  bgColor: z.string().optional(), title: z.string().optional(), vertical: z.number().optional(),
  bar1: BarSchema.partial().optional(), bar2: BarSchema.partial().optional(), bar3: BarSchema.partial().optional(), bar4: BarSchema.partial().optional(),
});
type Bar = z.infer<typeof BarSchema>;
type Meta = { content: z.infer<typeof ContentSchema>; bars: Bar[] };
function parseMeta(m: unknown): Meta {
  const raw = RawSchema.safeParse(m ?? {});
  const d = (raw.success ? raw.data : {}) as Record<string, unknown>;
  const bars = KEYS.map((k) => BarSchema.parse(d[k] ?? {})).filter((b) => b.label.trim().length > 0);
  return { content: ContentSchema.parse({ bgColor: d.bgColor, title: d.title, vertical: d.vertical }), bars };
}
function Component({ f, fps, durationInFrames, data }: { f: number; fps: number; durationInFrames: number; data: Meta }) {
  const dur = durationInFrames / fps;
  const outOp = s4eo(f, Math.max(0, dur - 0.4), dur);
  const inp = s4ei(f, 0, 0.4);
  const max = Math.max(1, ...data.bars.map((b) => b.value));
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: data.content.bgColor }}>
      <div style={{ position: "absolute", left: "8%", right: "8%", top: `${data.content.vertical * 100}%`,
        transform: `translateY(-50%) translateY(${20 * (1 - inp)}px)`, opacity: Math.min(inp, outOp),
        display: "flex", flexDirection: "column", gap: 16 }}>
        {data.content.title && <div style={{ fontFamily: "Geist, system-ui, sans-serif", fontWeight: 700, fontSize: 34, color: "#FFFFFF", WebkitTextStroke: "1px rgba(0,0,0,0.5)", paintOrder: "stroke fill" }}>{data.content.title}</div>}
        {data.bars.map((b, i) => {
          const grow = s4ei(f, 0.2 + i * 0.12, 0.2 + i * 0.12 + 0.5);
          return (
            <div key={i} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "Geist, system-ui, sans-serif", fontSize: 28, color: "#EDEFEC", WebkitTextStroke: "0.5px rgba(0,0,0,0.5)", paintOrder: "stroke fill" }}>
                <span>{b.label}</span><span style={{ color: b.highlight ? "#00FF41" : "#EDEFEC", fontWeight: 700 }}>{b.display || b.value}</span>
              </div>
              <div style={{ height: 28, background: "rgba(22,26,24,0.85)", borderRadius: 6, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${(b.value / max) * 100 * grow}%`, background: b.highlight ? "#00FF41" : "#5C6560", borderRadius: 6 }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
const panelSections: PanelSection[] = [
  { title: "Content", schema: ContentSchema, widgets: CW },
  { title: "Bars", schema: BarSchema, widgets: BW, tabs: [...KEYS] },
];
export const barOverlayModule: MotionSceneModule = {
  parseMeta, Component, panelSections,
  defaultMeta: { bgColor: "transparent", title: "Cost to run", vertical: 0.62,
    bar1: { label: "Hire a team", value: 100, display: "$100k" }, bar2: { label: "2 people + AI", value: 15, display: "$15k", highlight: true } },
};
