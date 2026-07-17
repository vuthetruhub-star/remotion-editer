// motion-scenes/org-diagram.tsx — kind "org_diagram". Parent + lưới con; con có thể dim + X đỏ, hoặc kept lime.
import { z } from "zod";
import { type WidgetSpec } from "../schemas/_shared";
import { s4ei, s4eo } from "../../../motion-config";
import type { PanelSection } from "../../../control-item/auto-panel";
import type { MotionSceneModule } from "./types";

const NodeSchema = z.object({ label: z.string().default(""), appearSec: z.number().default(0), dimAt: z.number().default(-1), kept: z.boolean().default(false) });
const NW: Record<keyof z.infer<typeof NodeSchema>, WidgetSpec> = { label: { type: "text" }, appearSec: { type: "number" }, dimAt: { type: "number" }, kept: { type: "checkbox" } };
const ContentSchema = z.object({ bgColor: z.string().default("#0A0B0A"), parent: z.string().default("AI TEAM") });
const CW: Record<keyof z.infer<typeof ContentSchema>, WidgetSpec> = { bgColor: { type: "color" }, parent: { type: "text" } };
const KEYS = ["node1", "node2", "node3", "node4", "node5", "node6", "node7", "node8", "node9"] as const;
const RawSchema = z.object({
  bgColor: z.string().optional(), parent: z.string().optional(),
  node1: NodeSchema.partial().optional(), node2: NodeSchema.partial().optional(), node3: NodeSchema.partial().optional(),
  node4: NodeSchema.partial().optional(), node5: NodeSchema.partial().optional(), node6: NodeSchema.partial().optional(),
  node7: NodeSchema.partial().optional(), node8: NodeSchema.partial().optional(), node9: NodeSchema.partial().optional(),
});
type Node = z.infer<typeof NodeSchema>;
type Meta = { content: z.infer<typeof ContentSchema>; nodes: Node[] };
function parseMeta(m: unknown): Meta {
  const raw = RawSchema.safeParse(m ?? {});
  const d = (raw.success ? raw.data : {}) as Record<string, unknown>;
  const nodes = KEYS.map((k) => NodeSchema.parse(d[k] ?? {})).filter((n) => n.label.trim().length > 0);
  return { content: ContentSchema.parse({ bgColor: d.bgColor, parent: d.parent }), nodes };
}
function Component({ f, fps, durationInFrames, data }: { f: number; fps: number; durationInFrames: number; data: Meta }) {
  const dur = durationInFrames / fps;
  const t = f / fps;
  const outOp = s4eo(f, Math.max(0, dur - 0.4), dur);
  const pIn = s4ei(f, 0, 0.4);
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: data.content.bgColor,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 40, padding: "0 7%", opacity: outOp }}>
      <div style={{ background: "#00FF41", color: "#0A0B0A", fontFamily: "Geist, system-ui, sans-serif", fontWeight: 800, fontSize: 44,
        padding: "22px 44px", borderRadius: 14, opacity: pIn, transform: `scale(${0.9 + 0.1 * pIn})` }}>{data.content.parent}</div>
      <div style={{ width: 4, height: 40, background: "#2D3D33" }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, width: "100%" }}>
        {data.nodes.map((nd, i) => {
          const pop = s4ei(f, nd.appearSec, nd.appearSec + 0.3);
          const dimmed = nd.dimAt >= 0 && t >= nd.dimAt;
          const border = nd.kept ? "#00FF41" : dimmed ? "#EF4444" : "#1F2A23";
          return (
            <div key={i} style={{ position: "relative", background: "#101211", border: `2px solid ${border}`, borderRadius: 12, padding: "24px 12px",
              textAlign: "center", opacity: pop * (dimmed ? 0.45 : 1), transform: `scale(${0.9 + 0.1 * pop})`,
              fontFamily: "Geist, system-ui, sans-serif", fontWeight: 600, fontSize: 30, color: nd.kept ? "#00FF41" : "#EDEFEC" }}>
              {nd.label}
              {dimmed && <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 64, color: "#EF4444", fontWeight: 800 }}>✕</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
const panelSections: PanelSection[] = [
  { title: "Content", schema: ContentSchema, widgets: CW },
  { title: "Nodes", schema: NodeSchema, widgets: NW, tabs: [...KEYS] },
];
export const orgDiagramModule: MotionSceneModule = {
  parseMeta, Component, panelSections,
  defaultMeta: { bgColor: "#0A0B0A", parent: "AI TEAM",
    node1: { label: "Sales", appearSec: 0.3, kept: true }, node2: { label: "Research", appearSec: 0.5, dimAt: 2.0 },
    node3: { label: "Design", appearSec: 0.7, dimAt: 2.0 }, node4: { label: "PM", appearSec: 0.9, dimAt: 2.0 },
    node5: { label: "Legal", appearSec: 1.1, dimAt: 2.0 }, node6: { label: "Ops", appearSec: 1.3, dimAt: 2.0 } },
};
