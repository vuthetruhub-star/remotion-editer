// motion-scenes/layer-stack.tsx — kind "layer_stack". Slab xếp tầng build từ đáy lên. Chroma-safe.
import { z } from "zod";
import { type WidgetSpec } from "../schemas/_shared";
import { s4ei, s4eo } from "../../../motion-config";
import type { PanelSection } from "../../../control-item/auto-panel";
import type { MotionSceneModule } from "./types";

const LayerSchema = z.object({ label: z.string().default(""), sub: z.string().default(""), appearSec: z.number().default(0), accent: z.boolean().default(false) });
const LW: Record<keyof z.infer<typeof LayerSchema>, WidgetSpec> = { label: { type: "text" }, sub: { type: "text" }, appearSec: { type: "number" }, accent: { type: "checkbox" } };
const ContentSchema = z.object({ bgColor: z.string().default("#0A0B0A"), title: z.string().default("") });
const CW: Record<keyof z.infer<typeof ContentSchema>, WidgetSpec> = { bgColor: { type: "color" }, title: { type: "text" } };
// layer1 = foundation (đáy). Hiển thị đảo: layer cuối lên trên cùng.
const KEYS = ["layer1", "layer2", "layer3", "layer4", "layer5"] as const;
const RawSchema = z.object({
  bgColor: z.string().optional(), title: z.string().optional(),
  layer1: LayerSchema.partial().optional(), layer2: LayerSchema.partial().optional(), layer3: LayerSchema.partial().optional(),
  layer4: LayerSchema.partial().optional(), layer5: LayerSchema.partial().optional(),
});
type Layer = z.infer<typeof LayerSchema>;
type Meta = { content: z.infer<typeof ContentSchema>; layers: Layer[] };
function parseMeta(m: unknown): Meta {
  const raw = RawSchema.safeParse(m ?? {});
  const d = (raw.success ? raw.data : {}) as Record<string, unknown>;
  const layers = KEYS.map((k) => LayerSchema.parse(d[k] ?? {})).filter((l) => l.label.trim().length > 0);
  return { content: ContentSchema.parse({ bgColor: d.bgColor, title: d.title }), layers };
}
function Component({ f, fps, durationInFrames, data }: { f: number; fps: number; durationInFrames: number; data: Meta }) {
  const dur = durationInFrames / fps;
  const outOp = s4eo(f, Math.max(0, dur - 0.4), dur);
  const rev = data.layers.slice().reverse(); // đỉnh (index cao) hiển thị trên
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: data.content.bgColor,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: "0 10%", opacity: outOp }}>
      {data.content.title && <div style={{ fontFamily: "Geist, system-ui, sans-serif", fontWeight: 700, fontSize: 46, color: "#EDEFEC", marginBottom: 26 }}>{data.content.title}</div>}
      {rev.map((l, ri) => {
        const inp = s4ei(f, l.appearSec, l.appearSec + 0.35);
        return (
          <div key={ri} style={{ width: "100%", background: l.accent ? "rgba(0,255,65,0.14)" : "#101211",
            border: `2px solid ${l.accent ? "#00FF41" : "#1F2A23"}`, borderRadius: 14, padding: "26px 30px",
            opacity: inp, transform: `translateY(${-20 * (1 - inp)}px)`, display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontFamily: "Geist, system-ui, sans-serif", fontWeight: 700, fontSize: 44, color: l.accent ? "#00FF41" : "#EDEFEC" }}>{l.label}</span>
            {l.sub && <span style={{ fontFamily: "Geist, system-ui, sans-serif", fontWeight: 400, fontSize: 28, color: "#9BA39E" }}>{l.sub}</span>}
          </div>
        );
      })}
    </div>
  );
}
const panelSections: PanelSection[] = [
  { title: "Content", schema: ContentSchema, widgets: CW },
  { title: "Layers (1=đáy)", schema: LayerSchema, widgets: LW, tabs: [...KEYS] },
];
export const layerStackModule: MotionSceneModule = {
  parseMeta, Component, panelSections,
  defaultMeta: { bgColor: "#0A0B0A", title: "Under the hood",
    layer1: { label: "Model", sub: "Claude", appearSec: 0.2 }, layer2: { label: "Orchestrator", appearSec: 0.9 }, layer3: { label: "Your app", appearSec: 1.6, accent: true } },
};
