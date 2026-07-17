// motion-scenes/dashboard-card.tsx — kind "dashboard_card". Cửa sổ dashboard giả + 4 tile. Chroma-safe.
import { z } from "zod";
import { type WidgetSpec } from "../schemas/_shared";
import { s4ei, s4eo } from "../../../motion-config";
import type { PanelSection } from "../../../control-item/auto-panel";
import type { MotionSceneModule } from "./types";

const TileSchema = z.object({ label: z.string().default(""), value: z.string().default(""), trend: z.string().default("") });
const TW: Record<keyof z.infer<typeof TileSchema>, WidgetSpec> = { label: { type: "text" }, value: { type: "text" }, trend: { type: "text" } };
const ContentSchema = z.object({ bgColor: z.string().default("transparent"), title: z.string().default("AGENT OPS · LIVE") });
const CW: Record<keyof z.infer<typeof ContentSchema>, WidgetSpec> = { bgColor: { type: "color" }, title: { type: "text" } };
const KEYS = ["stat1", "stat2", "stat3", "stat4"] as const;
const RawSchema = z.object({
  bgColor: z.string().optional(), title: z.string().optional(),
  stat1: TileSchema.partial().optional(), stat2: TileSchema.partial().optional(),
  stat3: TileSchema.partial().optional(), stat4: TileSchema.partial().optional(),
});
type Tile = z.infer<typeof TileSchema>;
type Meta = { content: z.infer<typeof ContentSchema>; tiles: Tile[] };
function parseMeta(m: unknown): Meta {
  const raw = RawSchema.safeParse(m ?? {});
  const d = (raw.success ? raw.data : {}) as Record<string, unknown>;
  const tiles = KEYS.map((k) => TileSchema.parse(d[k] ?? {})).filter((t) => t.value.trim().length > 0);
  return { content: ContentSchema.parse({ bgColor: d.bgColor, title: d.title }), tiles };
}
function Component({ f, fps, durationInFrames, data }: { f: number; fps: number; durationInFrames: number; data: Meta }) {
  const dur = durationInFrames / fps;
  const outOp = s4eo(f, Math.max(0, dur - 0.4), dur);
  const inp = s4ei(f, 0, 0.4);
  const live = Math.floor(f / 20) % 2 === 0;
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: data.content.bgColor,
      display: "flex", alignItems: "center", justifyContent: "center", padding: "0 6%" }}>
      <div style={{ width: "100%", background: "#101211", border: "1px solid #1F2A23", borderRadius: 18, overflow: "hidden",
        opacity: Math.min(inp, outOp), transform: `translateY(${24 * (1 - inp)}px)` }}>
        {/* title bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "18px 22px", background: "#161A18", borderBottom: "1px solid #1F2A23" }}>
          <span style={{ width: 14, height: 14, borderRadius: 999, background: "#EF4444" }} />
          <span style={{ width: 14, height: 14, borderRadius: 999, background: "#fcbf03" }} />
          <span style={{ width: 14, height: 14, borderRadius: 999, background: "#00FF41" }} />
          <span style={{ marginLeft: 14, fontFamily: "Geist Mono, monospace", fontSize: 26, color: "#9BA39E" }}>{data.content.title}</span>
          <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, fontFamily: "Geist Mono, monospace", fontSize: 24, color: "#00FF41" }}>
            <span style={{ width: 12, height: 12, borderRadius: 999, background: "#00FF41", opacity: live ? 1 : 0.3 }} />LIVE
          </span>
        </div>
        {/* 2x2 tiles */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, background: "#1F2A23" }}>
          {data.tiles.map((t, i) => {
            const tin = s4ei(f, 0.2 + i * 0.1, 0.2 + i * 0.1 + 0.35);
            return (
              <div key={i} style={{ background: "#101211", padding: "30px 28px", opacity: Math.min(tin, outOp) }}>
                <div style={{ fontFamily: "Geist Mono, monospace", fontSize: 26, color: "#5C6560", textTransform: "uppercase", letterSpacing: 1 }}>{t.label}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 8 }}>
                  <span style={{ fontFamily: "Geist, system-ui, sans-serif", fontWeight: 800, fontSize: 68, color: "#EDEFEC" }}>{t.value}</span>
                  {t.trend && <span style={{ fontFamily: "Geist Mono, monospace", fontSize: 28, color: "#00FF41" }}>{t.trend}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
const panelSections: PanelSection[] = [
  { title: "Content", schema: ContentSchema, widgets: CW },
  { title: "Tiles", schema: TileSchema, widgets: TW, tabs: [...KEYS] },
];
export const dashboardCardModule: MotionSceneModule = {
  parseMeta, Component, panelSections,
  defaultMeta: { bgColor: "transparent", title: "AGENT OPS · LIVE",
    stat1: { label: "Agents", value: "12", trend: "+3" }, stat2: { label: "Uptime", value: "99.9%" },
    stat3: { label: "Tasks/day", value: "480", trend: "+12%" }, stat4: { label: "Cost", value: "$0" } },
};
