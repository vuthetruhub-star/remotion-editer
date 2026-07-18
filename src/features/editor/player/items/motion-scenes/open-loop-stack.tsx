// motion-scenes/open-loop-stack.tsx — kind "open_loop_stack".
// Các dòng "nhử" (teaser) TÍCH LUỸ trong khung bo góc — mỗi dòng hiện ở appearSec rồi GIỮ lại,
// dồn nén tò mò (retention device). Học từ IG reel DambEp1igDW (đoạn "Yet that's not the craziest part…").
// Chroma-safe: viền đặc + màu đặc, chỉ transform/opacity; khung KHÔNG phải phần tử ngoài cùng.
import { z } from "zod";
import { type WidgetSpec } from "../schemas/_shared";
import { s4ei } from "../../../motion-config";
import type { PanelSection } from "../../../control-item/auto-panel";
import type { MotionSceneModule } from "./types";

const LineSchema = z.object({ text: z.string().default(""), appearSec: z.number().default(0) });
const LINE_W: Record<keyof z.infer<typeof LineSchema>, WidgetSpec> = { text: { type: "text" }, appearSec: { type: "number" } };

const ContentSchema = z.object({
  bgColor:  z.string().default("transparent"),
  vertical: z.number().default(0.08), // vị trí đỉnh khung
  boxed:    z.boolean().default(true),
  color:    z.string().default("#FFFFFF"),
});
const CONTENT_W: Record<keyof z.infer<typeof ContentSchema>, WidgetSpec> = {
  bgColor:  { type: "color" },
  vertical: { type: "slider", min: 0, max: 1, step: 0.01 },
  boxed:    { type: "checkbox" },
  color:    { type: "color" },
};

const LINE_KEYS = ["line1", "line2", "line3", "line4"] as const;
const RawSchema = z.object({
  bgColor: z.string().optional(), vertical: z.number().optional(), boxed: z.boolean().optional(), color: z.string().optional(),
  line1: LineSchema.partial().optional(), line2: LineSchema.partial().optional(),
  line3: LineSchema.partial().optional(), line4: LineSchema.partial().optional(),
});

type Line = z.infer<typeof LineSchema>;
type Meta = { content: z.infer<typeof ContentSchema>; lines: Line[] };

function parseMeta(m: unknown): Meta {
  const raw = RawSchema.safeParse(m ?? {});
  const d = (raw.success ? raw.data : {}) as Record<string, unknown>;
  const lines = LINE_KEYS
    .map((k) => LineSchema.parse(d[k] ?? {}))
    .filter((l) => l.text.trim().length > 0)
    .sort((a, b) => a.appearSec - b.appearSec);
  return { content: ContentSchema.parse({ bgColor: d.bgColor, vertical: d.vertical, boxed: d.boxed, color: d.color }), lines };
}

const FONT = "Geist, system-ui, sans-serif";

function Component({ f, data }: { f: number; fps: number; durationInFrames: number; data: Meta }) {
  const { lines, content } = data;
  const first = lines[0]?.appearSec ?? 0;
  const boxIn = s4ei(f, first, first + 0.4);
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: content.bgColor, fontFamily: FONT }}>
      <div style={{
        position: "absolute", left: "6%", right: "6%", top: `${content.vertical * 100}%`,
        padding: content.boxed ? "26px 28px" : 0,
        border: content.boxed ? "2px solid rgba(255,255,255,0.5)" : "none",
        borderRadius: content.boxed ? 22 : 0,
        opacity: content.boxed ? boxIn : 1,
        display: "flex", flexDirection: "column", gap: 16,
      }}>
        {lines.map((l, i) => {
          const inp = s4ei(f, l.appearSec, l.appearSec + 0.4);
          return (
            <div key={i} style={{
              opacity: inp, transform: `translateY(${12 * (1 - inp)}px)`,
              fontWeight: 600, fontSize: 40, lineHeight: 1.2, color: content.color,
              WebkitTextStroke: "1px rgba(0,0,0,0.5)", paintOrder: "stroke fill",
            }}>{l.text}</div>
          );
        })}
      </div>
    </div>
  );
}

const panelSections: PanelSection[] = [
  { title: "Content", schema: ContentSchema, widgets: CONTENT_W },
  { title: "Lines", schema: LineSchema, widgets: LINE_W, tabs: [...LINE_KEYS] },
];

export const openLoopStackModule: MotionSceneModule = {
  parseMeta, Component, panelSections,
  defaultMeta: {
    bgColor: "transparent", vertical: 0.08, boxed: true, color: "#FFFFFF",
    line1: { text: "Yet that's not the craziest part…", appearSec: 0.2 },
    line2: { text: "And funnily enough in 1893 Richard Feynman…", appearSec: 1.6 },
    line3: { text: "But we couldn't have expected it got this bad…", appearSec: 3.0 },
  },
};
