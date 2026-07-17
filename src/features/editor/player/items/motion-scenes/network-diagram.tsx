// motion-scenes/network-diagram.tsx — kind "network_diagram". Node ở x/y + cạnh nối tuần tự. Chroma-safe.
import { z } from "zod";
import { type WidgetSpec } from "../schemas/_shared";
import { s4ei, s4eo } from "../../../motion-config";
import type { PanelSection } from "../../../control-item/auto-panel";
import type { MotionSceneModule } from "./types";

const NodeSchema = z.object({ label: z.string().default(""), x: z.number().default(0.5), y: z.number().default(0.5), highlight: z.boolean().default(false), appearSec: z.number().default(0) });
const NW: Record<keyof z.infer<typeof NodeSchema>, WidgetSpec> = { label: { type: "text" }, x: { type: "slider", min: 0, max: 1, step: 0.01 }, y: { type: "slider", min: 0, max: 1, step: 0.01 }, highlight: { type: "checkbox" }, appearSec: { type: "number" } };
const ContentSchema = z.object({ bgColor: z.string().default("#0A0B0A"), title: z.string().default("") });
const CW: Record<keyof z.infer<typeof ContentSchema>, WidgetSpec> = { bgColor: { type: "color" }, title: { type: "text" } };
const KEYS = ["node1", "node2", "node3", "node4", "node5", "node6"] as const;
const RawSchema = z.object({
  bgColor: z.string().optional(), title: z.string().optional(),
  node1: NodeSchema.partial().optional(), node2: NodeSchema.partial().optional(), node3: NodeSchema.partial().optional(),
  node4: NodeSchema.partial().optional(), node5: NodeSchema.partial().optional(), node6: NodeSchema.partial().optional(),
});
type Node = z.infer<typeof NodeSchema>;
type Meta = { content: z.infer<typeof ContentSchema>; nodes: Node[] };
function parseMeta(m: unknown): Meta {
  const raw = RawSchema.safeParse(m ?? {});
  const d = (raw.success ? raw.data : {}) as Record<string, unknown>;
  const nodes = KEYS.map((k) => NodeSchema.parse(d[k] ?? {})).filter((n) => n.label.trim().length > 0);
  return { content: ContentSchema.parse({ bgColor: d.bgColor, title: d.title }), nodes };
}
function Component({ f, fps, durationInFrames, data }: { f: number; fps: number; durationInFrames: number; data: Meta }) {
  const dur = durationInFrames / fps;
  const outOp = s4eo(f, Math.max(0, dur - 0.4), dur);
  const W = 1080, H = 1200;
  const pts = data.nodes.map((n) => ({ x: n.x * W, y: n.y * H }));
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: data.content.bgColor,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, opacity: outOp }}>
      {data.content.title && <div style={{ fontFamily: "Geist, system-ui, sans-serif", fontWeight: 700, fontSize: 46, color: "#EDEFEC" }}>{data.content.title}</div>}
      <svg viewBox={`0 0 ${W} ${H}`} width="90%" style={{ display: "block" }}>
        {pts.slice(1).map((p, i) => {
          const edge = s4ei(f, data.nodes[i + 1].appearSec - 0.1, data.nodes[i + 1].appearSec + 0.2);
          const a = pts[i]; const bx = a.x + (p.x - a.x) * edge, by = a.y + (p.y - a.y) * edge;
          return <line key={`e${i}`} x1={a.x} y1={a.y} x2={bx} y2={by} stroke="#2D3D33" strokeWidth={5} />;
        })}
        {pts.map((p, i) => {
          const nd = data.nodes[i]; const pop = s4ei(f, nd.appearSec, nd.appearSec + 0.3);
          return (
            <g key={`n${i}`} opacity={pop} transform={`translate(${p.x},${p.y})`}>
              <circle r={78} fill={nd.highlight ? "#00FF41" : "#101211"} stroke={nd.highlight ? "#00FF41" : "#2D3D33"} strokeWidth={4} />
              <text textAnchor="middle" dy="10" fontFamily="Geist, sans-serif" fontWeight="600" fontSize="30" fill={nd.highlight ? "#0A0B0A" : "#EDEFEC"}>{nd.label}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
const panelSections: PanelSection[] = [
  { title: "Content", schema: ContentSchema, widgets: CW },
  { title: "Nodes", schema: NodeSchema, widgets: NW, tabs: [...KEYS] },
];
export const networkDiagramModule: MotionSceneModule = {
  parseMeta, Component, panelSections,
  defaultMeta: { bgColor: "#0A0B0A", title: "How it connects",
    node1: { label: "User", x: 0.2, y: 0.2, appearSec: 0.2 }, node2: { label: "API", x: 0.5, y: 0.5, appearSec: 0.9 },
    node3: { label: "Model", x: 0.8, y: 0.35, appearSec: 1.5, highlight: true }, node4: { label: "DB", x: 0.35, y: 0.8, appearSec: 2.1 } },
};
