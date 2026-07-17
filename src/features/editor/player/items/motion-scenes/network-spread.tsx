// motion-scenes/network-spread.tsx — kind "network_spread". Hub trung tâm + vòng node, cạnh vẽ ra. Chroma-safe.
import { z } from "zod";
import { type WidgetSpec } from "../schemas/_shared";
import { s4ei, s4eo } from "../../../motion-config";
import type { PanelSection } from "../../../control-item/auto-panel";
import type { MotionSceneModule } from "./types";

const NodeSchema = z.object({ label: z.string().default("") });
const NW: Record<keyof z.infer<typeof NodeSchema>, WidgetSpec> = { label: { type: "text" } };
const ContentSchema = z.object({ bgColor: z.string().default("#0A0B0A"), centerLabel: z.string().default("AI"), title: z.string().default("") });
const CW: Record<keyof z.infer<typeof ContentSchema>, WidgetSpec> = { bgColor: { type: "color" }, centerLabel: { type: "text" }, title: { type: "text" } };
const KEYS = ["node1", "node2", "node3", "node4", "node5", "node6"] as const;
const RawSchema = z.object({
  bgColor: z.string().optional(), centerLabel: z.string().optional(), title: z.string().optional(),
  node1: NodeSchema.partial().optional(), node2: NodeSchema.partial().optional(), node3: NodeSchema.partial().optional(),
  node4: NodeSchema.partial().optional(), node5: NodeSchema.partial().optional(), node6: NodeSchema.partial().optional(),
});
type Node = z.infer<typeof NodeSchema>;
type Meta = { content: z.infer<typeof ContentSchema>; nodes: Node[] };
function parseMeta(m: unknown): Meta {
  const raw = RawSchema.safeParse(m ?? {});
  const d = (raw.success ? raw.data : {}) as Record<string, unknown>;
  const nodes = KEYS.map((k) => NodeSchema.parse(d[k] ?? {})).filter((n) => n.label.trim().length > 0);
  return { content: ContentSchema.parse({ bgColor: d.bgColor, centerLabel: d.centerLabel, title: d.title }), nodes };
}
function Component({ f, fps, durationInFrames, data }: { f: number; fps: number; durationInFrames: number; data: Meta }) {
  const dur = durationInFrames / fps;
  const outOp = s4eo(f, Math.max(0, dur - 0.4), dur);
  const W = 1080, H = 1080, cx = W / 2, cy = H / 2, R = 380;
  const n = data.nodes.length;
  const pos = data.nodes.map((_, i) => {
    const a = -Math.PI / 2 + (i / Math.max(1, n)) * Math.PI * 2;
    return { x: cx + R * Math.cos(a), y: cy + R * Math.sin(a) };
  });
  const hub = s4ei(f, 0, 0.4);
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: data.content.bgColor,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, opacity: outOp }}>
      {data.content.title && <div style={{ fontFamily: "Geist, system-ui, sans-serif", fontWeight: 700, fontSize: 46, color: "#EDEFEC" }}>{data.content.title}</div>}
      <svg viewBox={`0 0 ${W} ${H}`} width="86%" style={{ display: "block" }}>
        {pos.map((p, i) => {
          const edge = s4ei(f, 0.3 + i * 0.1, 0.3 + i * 0.1 + 0.4);
          const ex = cx + (p.x - cx) * edge, ey = cy + (p.y - cy) * edge;
          return <line key={`e${i}`} x1={cx} y1={cy} x2={ex} y2={ey} stroke="#2D3D33" strokeWidth={5} />;
        })}
        {pos.map((p, i) => {
          const pop = s4ei(f, 0.4 + i * 0.1, 0.4 + i * 0.1 + 0.3);
          return (
            <g key={`n${i}`} opacity={pop} transform={`translate(${p.x},${p.y})`}>
              <circle r={70} fill="#101211" stroke="#00FF41" strokeWidth={4} />
              <text textAnchor="middle" dy="10" fontFamily="Geist, sans-serif" fontWeight="600" fontSize="30" fill="#EDEFEC">{data.nodes[i].label}</text>
            </g>
          );
        })}
        <g transform={`translate(${cx},${cy}) scale(${0.7 + 0.3 * hub})`} opacity={hub}>
          <circle r={100} fill="#00FF41" />
          <text textAnchor="middle" dy="14" fontFamily="Geist, sans-serif" fontWeight="800" fontSize="44" fill="#0A0B0A">{data.content.centerLabel}</text>
        </g>
      </svg>
    </div>
  );
}
const panelSections: PanelSection[] = [
  { title: "Content", schema: ContentSchema, widgets: CW },
  { title: "Nodes", schema: NodeSchema, widgets: NW, tabs: [...KEYS] },
];
export const networkSpreadModule: MotionSceneModule = {
  parseMeta, Component, panelSections,
  defaultMeta: { bgColor: "#0A0B0A", centerLabel: "AI", title: "One brain, many hands",
    node1: { label: "Sales" }, node2: { label: "Support" }, node3: { label: "Ops" }, node4: { label: "Content" }, node5: { label: "QA" } },
};
