// motion-scenes/comparison-grid.tsx — kind "comparison_grid". Bảng so sánh 2-3 cột. Chroma-safe.
import { z } from "zod";
import { type WidgetSpec } from "../schemas/_shared";
import { s4ei, s4eo } from "../../../motion-config";
import type { PanelSection } from "../../../control-item/auto-panel";
import type { MotionSceneModule } from "./types";

const RowSchema = z.object({ feature: z.string().default(""), a: z.string().default(""), b: z.string().default(""), c: z.string().default(""), appearSec: z.number().default(0) });
const RW: Record<keyof z.infer<typeof RowSchema>, WidgetSpec> = { feature: { type: "text" }, a: { type: "text" }, b: { type: "text" }, c: { type: "text" }, appearSec: { type: "number" } };
const ContentSchema = z.object({ bgColor: z.string().default("#0A0B0A"), title: z.string().default(""), colA: z.string().default("Option A"), colB: z.string().default("Option B"), colC: z.string().default(""), winner: z.enum(["none", "a", "b", "c"]).default("b") });
const CW: Record<keyof z.infer<typeof ContentSchema>, WidgetSpec> = { bgColor: { type: "color" }, title: { type: "text" }, colA: { type: "text" }, colB: { type: "text" }, colC: { type: "text" }, winner: { type: "select", options: ["none", "a", "b", "c"] } };
const KEYS = ["row1", "row2", "row3", "row4"] as const;
const RawSchema = z.object({
  bgColor: z.string().optional(), title: z.string().optional(), colA: z.string().optional(), colB: z.string().optional(), colC: z.string().optional(), winner: z.enum(["none", "a", "b", "c"]).optional(),
  row1: RowSchema.partial().optional(), row2: RowSchema.partial().optional(), row3: RowSchema.partial().optional(), row4: RowSchema.partial().optional(),
});
type Row = z.infer<typeof RowSchema>;
type Meta = { content: z.infer<typeof ContentSchema>; rows: Row[] };
function parseMeta(m: unknown): Meta {
  const raw = RawSchema.safeParse(m ?? {});
  const d = (raw.success ? raw.data : {}) as Record<string, unknown>;
  const rows = KEYS.filter((k) => d[k] != null).map((k) => RowSchema.parse(d[k] ?? {})).filter((r) => r.feature.trim());
  return { content: ContentSchema.parse({ bgColor: d.bgColor, title: d.title, colA: d.colA, colB: d.colB, colC: d.colC, winner: d.winner }), rows };
}
function cell(v: string) {
  if (v === "✓" || v.toLowerCase() === "yes" || v === "true") return <span style={{ color: "#00FF41", fontSize: 44 }}>✓</span>;
  if (v === "✗" || v.toLowerCase() === "no" || v === "false") return <span style={{ color: "#EF4444", fontSize: 44 }}>✕</span>;
  return v;
}
function Component({ f, fps, durationInFrames, data }: { f: number; fps: number; durationInFrames: number; data: Meta }) {
  const dur = durationInFrames / fps;
  const outOp = s4eo(f, Math.max(0, dur - 0.4), dur);
  const c = data.content;
  const cols = [c.colA, c.colB, c.colC].filter((x) => x.trim());
  const wIdx = { none: -1, a: 0, b: 1, c: 2 }[c.winner];
  const grid = `2fr repeat(${cols.length}, 1fr)`;
  const hi = (i: number) => (i === wIdx ? "#00FF41" : "#9BA39E");
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: c.bgColor,
      display: "flex", flexDirection: "column", justifyContent: "center", gap: 8, padding: "0 6%", opacity: outOp }}>
      {c.title && <div style={{ fontFamily: "Geist, system-ui, sans-serif", fontWeight: 700, fontSize: 46, color: "#EDEFEC", marginBottom: 20 }}>{c.title}</div>}
      <div style={{ display: "grid", gridTemplateColumns: grid, gap: 12, alignItems: "center", padding: "0 8px", fontFamily: "Geist, system-ui, sans-serif", fontWeight: 700, fontSize: 34 }}>
        <span />{cols.map((col, i) => <span key={i} style={{ color: hi(i), textAlign: "center" }}>{col}</span>)}
      </div>
      {data.rows.map((r, ri) => {
        const inp = s4ei(f, r.appearSec, r.appearSec + 0.3);
        const vals = [r.a, r.b, r.c].slice(0, cols.length);
        return (
          <div key={ri} style={{ display: "grid", gridTemplateColumns: grid, gap: 12, alignItems: "center", background: "#101211", borderRadius: 12, padding: "22px 16px", opacity: inp, transform: `translateY(${14 * (1 - inp)}px)` }}>
            <span style={{ fontFamily: "Geist, system-ui, sans-serif", fontWeight: 500, fontSize: 34, color: "#EDEFEC" }}>{r.feature}</span>
            {vals.map((v, i) => <span key={i} style={{ textAlign: "center", fontFamily: "Geist, system-ui, sans-serif", fontWeight: 600, fontSize: 34, color: i === wIdx ? "#00FF41" : "#EDEFEC" }}>{cell(v)}</span>)}
          </div>
        );
      })}
    </div>
  );
}
const panelSections: PanelSection[] = [
  { title: "Content", schema: ContentSchema, widgets: CW },
  { title: "Rows", schema: RowSchema, widgets: RW, tabs: [...KEYS] },
];
export const comparisonGridModule: MotionSceneModule = {
  parseMeta, Component, panelSections,
  defaultMeta: { bgColor: "#0A0B0A", title: "VA vs AI routine", colA: "VA", colB: "AI routine", colC: "", winner: "b",
    row1: { feature: "Cost", a: "$1,500/mo", b: "$0", appearSec: 0.3 }, row2: { feature: "Setup", a: "4 weeks", b: "40 lines", appearSec: 1.0 }, row3: { feature: "Runs 24/7", a: "✗", b: "✓", appearSec: 1.7 } },
};
