// motion-scenes/concept-build.tsx — kind "concept_build". Canvas tự do: element ở x/y + connector nối. Chroma-safe.
import { z } from "zod";
import { type WidgetSpec } from "../schemas/_shared";
import { s4ei, s4eo } from "../../../motion-config";
import type { PanelSection } from "../../../control-item/auto-panel";
import type { MotionSceneModule } from "./types";

const ElSchema = z.object({ label: z.string().default(""), x: z.number().default(0.5), y: z.number().default(0.5), appearSec: z.number().default(0), accent: z.boolean().default(false), connectPrev: z.boolean().default(true) });
const EW: Record<keyof z.infer<typeof ElSchema>, WidgetSpec> = { label: { type: "text" }, x: { type: "slider", min: 0, max: 1, step: 0.01 }, y: { type: "slider", min: 0, max: 1, step: 0.01 }, appearSec: { type: "number" }, accent: { type: "checkbox" }, connectPrev: { type: "checkbox" } };
const ContentSchema = z.object({ bgColor: z.string().default("#0A0B0A"), title: z.string().default("") });
const CW: Record<keyof z.infer<typeof ContentSchema>, WidgetSpec> = { bgColor: { type: "color" }, title: { type: "text" } };
const KEYS = ["el1", "el2", "el3", "el4", "el5"] as const;
const RawSchema = z.object({
  bgColor: z.string().optional(), title: z.string().optional(),
  el1: ElSchema.partial().optional(), el2: ElSchema.partial().optional(), el3: ElSchema.partial().optional(),
  el4: ElSchema.partial().optional(), el5: ElSchema.partial().optional(),
});
type El = z.infer<typeof ElSchema>;
type Meta = { content: z.infer<typeof ContentSchema>; els: El[] };
function parseMeta(m: unknown): Meta {
  const raw = RawSchema.safeParse(m ?? {});
  const d = (raw.success ? raw.data : {}) as Record<string, unknown>;
  const els = KEYS.map((k) => ElSchema.parse(d[k] ?? {})).filter((e) => e.label.trim().length > 0);
  return { content: ContentSchema.parse({ bgColor: d.bgColor, title: d.title }), els };
}
function Component({ f, fps, durationInFrames, data }: { f: number; fps: number; durationInFrames: number; data: Meta }) {
  const dur = durationInFrames / fps;
  const outOp = s4eo(f, Math.max(0, dur - 0.4), dur);
  const W = 1080, H = 1200;
  const P = data.els.map((e) => ({ x: e.x * W, y: e.y * H }));
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: data.content.bgColor,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, opacity: outOp }}>
      {data.content.title && <div style={{ fontFamily: "Geist, system-ui, sans-serif", fontWeight: 700, fontSize: 44, color: "#EDEFEC" }}>{data.content.title}</div>}
      <div style={{ position: "relative", width: "92%" }}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
          {data.els.map((e, i) => {
            if (i === 0 || !e.connectPrev) return null;
            const edge = s4ei(f, e.appearSec - 0.1, e.appearSec + 0.2);
            const a = P[i - 1], b = P[i]; const bx = a.x + (b.x - a.x) * edge, by = a.y + (b.y - a.y) * edge;
            return <line key={`e${i}`} x1={a.x} y1={a.y} x2={bx} y2={by} stroke="#00FF41" strokeWidth={5} strokeDasharray="2 10" strokeLinecap="round" />;
          })}
          {P.map((p, i) => {
            const e = data.els[i]; const pop = s4ei(f, e.appearSec, e.appearSec + 0.3);
            const w = 60 + e.label.length * 22, h = 92;
            return (
              <g key={`n${i}`} opacity={pop} transform={`translate(${p.x - w / 2},${p.y - h / 2})`}>
                <rect width={w} height={h} rx={16} fill={e.accent ? "rgba(0,255,65,0.14)" : "#101211"} stroke={e.accent ? "#00FF41" : "#2D3D33"} strokeWidth={3} />
                <text x={w / 2} y={h / 2 + 12} textAnchor="middle" fontFamily="Geist, sans-serif" fontWeight="600" fontSize="34" fill={e.accent ? "#00FF41" : "#EDEFEC"}>{e.label}</text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
const panelSections: PanelSection[] = [
  { title: "Content", schema: ContentSchema, widgets: CW },
  { title: "Elements", schema: ElSchema, widgets: EW, tabs: [...KEYS] },
];
export const conceptBuildModule: MotionSceneModule = {
  parseMeta, Component, panelSections,
  defaultMeta: { bgColor: "#0A0B0A", title: "How it fits",
    el1: { label: "Input", x: 0.25, y: 0.25, appearSec: 0.2 }, el2: { label: "Agent", x: 0.5, y: 0.5, appearSec: 1.0, accent: true },
    el3: { label: "Output", x: 0.75, y: 0.75, appearSec: 1.8 } },
};
