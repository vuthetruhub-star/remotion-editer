// motion-scenes/doodle-scribble.tsx — kind "doodle_scribble".
// Nét vẽ tay (squiggle/circle/arrow/underline) vẽ dần đè lên ảnh/từ/subject. Học từ IG reel Daf3iwtk7Wi.
// Chroma-safe: stroke màu ĐẶC, draw-on bằng strokeDashoffset TÍNH THEO FRAME (không CSS transition).
import { z } from "zod";
import { type WidgetSpec } from "../schemas/_shared";
import { s4ei } from "../../../motion-config";
import type { PanelSection } from "../../../control-item/auto-panel";
import type { MotionSceneModule } from "./types";

const PATHS: Record<string, string> = {
  squiggle:  "M5,55 q10,-32 20,-4 t20,-2 t20,-2 t20,0 t10,-4",
  circle:    "M50,12 C22,12 14,46 30,70 C46,92 86,84 88,54 C90,30 74,14 48,16",
  arrow:     "M8,82 C38,42 60,60 86,24 M86,24 l-15,3 M86,24 l-2,15",
  underline: "M6,60 q13,16 26,2 t26,0 t26,2",
};

const ContentSchema = z.object({
  color:   z.string().default("#FFD400"),
  variant: z.enum(["squiggle", "circle", "arrow", "underline"]).default("squiggle"),
  x:       z.number().default(0.6),   // tâm, fraction khung
  y:       z.number().default(0.2),
  scale:   z.number().default(1),
  drawSec: z.number().default(0.4),
});
const CONTENT_W: Record<keyof z.infer<typeof ContentSchema>, WidgetSpec> = {
  color:   { type: "color" },
  variant: { type: "select", options: ["squiggle", "circle", "arrow", "underline"] },
  x:       { type: "slider", min: 0, max: 1, step: 0.01 },
  y:       { type: "slider", min: 0, max: 1, step: 0.01 },
  scale:   { type: "slider", min: 0.3, max: 3, step: 0.05 },
  drawSec: { type: "number" },
};

const RawSchema = ContentSchema.partial();
type Meta = { content: z.infer<typeof ContentSchema> };

function parseMeta(m: unknown): Meta {
  const raw = RawSchema.safeParse(m ?? {});
  const d = (raw.success ? raw.data : {}) as Record<string, unknown>;
  return { content: ContentSchema.parse(d) };
}

function Component({ f, data }: { f: number; fps: number; durationInFrames: number; data: Meta }) {
  const { color, variant, x, y, scale, drawSec } = data.content;
  const draw = s4ei(f, 0, Math.max(0.05, drawSec)); // 0→1 vẽ dần
  const size = 260 * scale;
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: `${x * 100}%`, top: `${y * 100}%`, width: size, height: size, transform: "translate(-50%,-50%)" }}>
        <svg viewBox="0 0 100 100" width={size} height={size} style={{ overflow: "visible" }}>
          <path
            d={PATHS[variant] ?? PATHS.squiggle}
            fill="none" stroke={color} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round"
            pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw}
          />
        </svg>
      </div>
    </div>
  );
}

const panelSections: PanelSection[] = [
  { title: "Content", schema: ContentSchema, widgets: CONTENT_W },
];

export const doodleScribbleModule: MotionSceneModule = {
  parseMeta, Component, panelSections,
  defaultMeta: { color: "#FFD400", variant: "squiggle", x: 0.62, y: 0.2, scale: 1, drawSec: 0.4 },
};
