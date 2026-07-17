// motion-scenes/flow-diagram.tsx — kind "flow_diagram". Chuỗi box A→B→C dọc, mũi tên nối. Chroma-safe.
import { z } from "zod";
import { type WidgetSpec } from "../schemas/_shared";
import { s4ei, s4eo } from "../../../motion-config";
import type { PanelSection } from "../../../control-item/auto-panel";
import type { MotionSceneModule } from "./types";

const NodeSchema = z.object({ label: z.string().default(""), appearSec: z.number().default(0), highlight: z.boolean().default(false) });
const NW: Record<keyof z.infer<typeof NodeSchema>, WidgetSpec> = { label: { type: "text" }, appearSec: { type: "number" }, highlight: { type: "checkbox" } };
const ContentSchema = z.object({ bgColor: z.string().default("#0A0B0A"), title: z.string().default("") });
const CW: Record<keyof z.infer<typeof ContentSchema>, WidgetSpec> = { bgColor: { type: "color" }, title: { type: "text" } };
const KEYS = ["node1", "node2", "node3", "node4", "node5"] as const;
const RawSchema = z.object({
  bgColor: z.string().optional(), title: z.string().optional(),
  node1: NodeSchema.partial().optional(), node2: NodeSchema.partial().optional(), node3: NodeSchema.partial().optional(),
  node4: NodeSchema.partial().optional(), node5: NodeSchema.partial().optional(),
});
type Node = z.infer<typeof NodeSchema>;
type Meta = { content: z.infer<typeof ContentSchema>; nodes: Node[] };
function parseMeta(m: unknown): Meta {
  const raw = RawSchema.safeParse(m ?? {});
  const d = (raw.success ? raw.data : {}) as Record<string, unknown>;
  const nodes = KEYS.map((k) => NodeSchema.parse(d[k] ?? {})).filter((n) => n.label.trim().length > 0).sort((a, b) => a.appearSec - b.appearSec);
  return { content: ContentSchema.parse({ bgColor: d.bgColor, title: d.title }), nodes };
}
function Component({ f, fps, durationInFrames, data }: { f: number; fps: number; durationInFrames: number; data: Meta }) {
  const dur = durationInFrames / fps;
  const outOp = s4eo(f, Math.max(0, dur - 0.4), dur);
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: data.content.bgColor,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 0, padding: "0 12%", opacity: outOp }}>
      {data.content.title && <div style={{ fontFamily: "Geist, system-ui, sans-serif", fontWeight: 700, fontSize: 46, color: "#EDEFEC", marginBottom: 36 }}>{data.content.title}</div>}
      {data.nodes.map((n, i) => {
        const inp = s4ei(f, n.appearSec, n.appearSec + 0.3);
        const arrowIn = i > 0 ? s4ei(f, n.appearSec - 0.15, n.appearSec + 0.15) : 0;
        return (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
            {i > 0 && <div style={{ width: 4, height: 46, background: "#00FF41", transformOrigin: "top", transform: `scaleY(${arrowIn})`, opacity: arrowIn }} />}
            <div style={{ width: "100%", background: n.highlight ? "rgba(0,255,65,0.12)" : "#101211", border: `2px solid ${n.highlight ? "#00FF41" : "#1F2A23"}`,
              borderRadius: 16, padding: "30px 28px", textAlign: "center", opacity: inp, transform: `translateY(${16 * (1 - inp)}px)`,
              fontFamily: "Geist, system-ui, sans-serif", fontWeight: 600, fontSize: 46, color: n.highlight ? "#00FF41" : "#EDEFEC" }}>{n.label}</div>
          </div>
        );
      })}
    </div>
  );
}
const panelSections: PanelSection[] = [
  { title: "Content", schema: ContentSchema, widgets: CW },
  { title: "Nodes", schema: NodeSchema, widgets: NW, tabs: [...KEYS] },
];
export const flowDiagramModule: MotionSceneModule = {
  parseMeta, Component, panelSections,
  defaultMeta: { bgColor: "#0A0B0A", title: "The pipeline",
    node1: { label: "Record", appearSec: 0.2 }, node2: { label: "Transcribe", appearSec: 1.0 }, node3: { label: "Render", appearSec: 1.8, highlight: true } },
};
