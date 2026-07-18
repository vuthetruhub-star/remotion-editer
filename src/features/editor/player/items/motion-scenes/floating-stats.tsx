// motion-scenes/floating-stats.tsx — kind "floating_stats".
// Nhiều badge số "bay" rải quanh subject (glyph + số), pop so le + trôi nhẹ. Học từ IG reel Daq-5E0jrYw.
// Chroma-safe: pill nền ĐỤC, số viền đặc; trôi bằng transform. Vị trí deterministic theo index → tránh mặt.
import { z } from "zod";
import { type WidgetSpec } from "../schemas/_shared";
import { s4ei } from "../../../motion-config";
import type { PanelSection } from "../../../control-item/auto-panel";
import type { MotionSceneModule } from "./types";

const GLYPH: Record<string, string> = { eye: "◉", chart: "↗", dollar: "$", none: "" };

const StatSchema = z.object({
  value:     z.string().default(""),
  glyph:     z.enum(["eye", "chart", "dollar", "none"]).default("eye"),
  appearSec: z.number().default(0),
});
const STAT_W: Record<keyof z.infer<typeof StatSchema>, WidgetSpec> = {
  value:     { type: "text" },
  glyph:     { type: "select", options: ["eye", "chart", "dollar", "none"] },
  appearSec: { type: "number" },
};

const ContentSchema = z.object({
  bgColor: z.string().default("transparent"),
  accent:  z.string().default("#FFD400"),
});
const CONTENT_W: Record<keyof z.infer<typeof ContentSchema>, WidgetSpec> = {
  bgColor: { type: "color" },
  accent:  { type: "color" },
};

// vị trí deterministic (x%,y%) — tránh vùng mặt giữa
const POS: [number, number][] = [[12, 58], [78, 60], [20, 74], [70, 78], [38, 88], [86, 40]];
const STAT_KEYS = ["stat1", "stat2", "stat3", "stat4", "stat5", "stat6"] as const;

const RawSchema = z.object({
  bgColor: z.string().optional(), accent: z.string().optional(),
  stat1: StatSchema.partial().optional(), stat2: StatSchema.partial().optional(), stat3: StatSchema.partial().optional(),
  stat4: StatSchema.partial().optional(), stat5: StatSchema.partial().optional(), stat6: StatSchema.partial().optional(),
});

type Stat = z.infer<typeof StatSchema>;
type Meta = { content: z.infer<typeof ContentSchema>; stats: Stat[] };

function parseMeta(m: unknown): Meta {
  const raw = RawSchema.safeParse(m ?? {});
  const d = (raw.success ? raw.data : {}) as Record<string, unknown>;
  const stats = STAT_KEYS.map((k) => StatSchema.parse(d[k] ?? {})).filter((s) => s.value.trim().length > 0);
  return { content: ContentSchema.parse({ bgColor: d.bgColor, accent: d.accent }), stats };
}

const FONT = "Geist, system-ui, sans-serif";

function Component({ f, fps, data }: { f: number; fps: number; durationInFrames: number; data: Meta }) {
  const { content, stats } = data;
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: content.bgColor, fontFamily: FONT }}>
      {stats.map((s, i) => {
        const [px, py] = POS[i % POS.length];
        const pop = s4ei(f, s.appearSec, s.appearSec + 0.12);
        const drift = Math.sin((f / fps) * 1.6 + i) * 6; // trôi nhẹ ±6px
        const g = GLYPH[s.glyph] ?? "";
        return (
          <div key={i} style={{
            position: "absolute", left: `${px}%`, top: `${py}%`,
            transform: `translate(-50%,-50%) translateY(${drift}px) scale(${pop})`, opacity: pop,
            display: "flex", alignItems: "center", gap: 8,
            padding: "8px 16px", borderRadius: 14, background: "rgba(18,20,18,0.88)",
            fontSize: 30, fontWeight: 700, color: "#FFFFFF",
            WebkitTextStroke: "0.5px rgba(0,0,0,0.5)", paintOrder: "stroke fill",
          }}>
            {g && <span style={{ color: content.accent }}>{g}</span>}
            <span>{s.value}</span>
          </div>
        );
      })}
    </div>
  );
}

const panelSections: PanelSection[] = [
  { title: "Content", schema: ContentSchema, widgets: CONTENT_W },
  { title: "Stats", schema: StatSchema, widgets: STAT_W, tabs: [...STAT_KEYS] },
];

export const floatingStatsModule: MotionSceneModule = {
  parseMeta, Component, panelSections,
  defaultMeta: {
    bgColor: "transparent", accent: "#FFD400",
    stat1: { value: "9000", glyph: "eye", appearSec: 0.1 },
    stat2: { value: "2200", glyph: "eye", appearSec: 0.3 },
    stat3: { value: "4500", glyph: "eye", appearSec: 0.5 },
    stat4: { value: "6700", glyph: "eye", appearSec: 0.7 },
    stat5: { value: "11.5K", glyph: "eye", appearSec: 0.9 },
  },
};
