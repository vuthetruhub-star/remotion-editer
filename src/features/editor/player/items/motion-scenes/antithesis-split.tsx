// motion-scenes/antithesis-split.tsx — kind "antithesis_split".
// Hai vế đối lập hai bên một GẠCH ĐỨT DỌC (+ tuỳ chọn 2 vòng tròn "tension"). Học từ IG reel Daei0qakSON.
// Chroma-safe: màu ĐẶC, chỉ transform/opacity; divider vẽ bằng scaleY. Đặt nửa dưới, tránh đè caption giữa.
import { z } from "zod";
import { type WidgetSpec } from "../schemas/_shared";
import { s4ei } from "../../../motion-config";
import type { PanelSection } from "../../../control-item/auto-panel";
import type { MotionSceneModule } from "./types";

const SideSchema = z.object({ text: z.string().default(""), appearSec: z.number().default(0) });
const SIDE_W: Record<keyof z.infer<typeof SideSchema>, WidgetSpec> = { text: { type: "text" }, appearSec: { type: "number" } };

const ContentSchema = z.object({
  bgColor:      z.string().default("transparent"),
  dividerColor: z.string().default("#FFD400"),
  dashed:       z.boolean().default(true),
  vertical:     z.number().default(0.78), // tâm khối split
  showCircles:  z.boolean().default(false),
});
const CONTENT_W: Record<keyof z.infer<typeof ContentSchema>, WidgetSpec> = {
  bgColor:      { type: "color" },
  dividerColor: { type: "color" },
  dashed:       { type: "checkbox" },
  vertical:     { type: "slider", min: 0, max: 1, step: 0.01 },
  showCircles:  { type: "checkbox" },
};

const RawSchema = z.object({
  bgColor: z.string().optional(), dividerColor: z.string().optional(), dashed: z.boolean().optional(),
  vertical: z.number().optional(), showCircles: z.boolean().optional(),
  left: SideSchema.partial().optional(), right: SideSchema.partial().optional(),
});

type Side = z.infer<typeof SideSchema>;
type Meta = { content: z.infer<typeof ContentSchema>; left: Side; right: Side };

function parseMeta(m: unknown): Meta {
  const raw = RawSchema.safeParse(m ?? {});
  const d = (raw.success ? raw.data : {}) as Record<string, unknown>;
  return {
    content: ContentSchema.parse({ bgColor: d.bgColor, dividerColor: d.dividerColor, dashed: d.dashed, vertical: d.vertical, showCircles: d.showCircles }),
    left: SideSchema.parse(d.left ?? {}),
    right: SideSchema.parse(d.right ?? {}),
  };
}

const FONT = "Geist, system-ui, sans-serif";
const STROKE = { WebkitTextStroke: "1px rgba(0,0,0,0.5)", paintOrder: "stroke fill" as const };

function Component({ f, data }: { f: number; fps: number; durationInFrames: number; data: Meta }) {
  const { content, left, right } = data;
  const vc = content.vertical * 100;
  const li = s4ei(f, left.appearSec, left.appearSec + 0.35);
  const ri = s4ei(f, right.appearSec, right.appearSec + 0.35);
  const dh = s4ei(f, Math.min(left.appearSec, right.appearSec), Math.min(left.appearSec, right.appearSec) + 0.3);

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: content.bgColor, fontFamily: FONT }}>
      {/* vòng tròn tension (tuỳ chọn) */}
      {content.showCircles && (
        <>
          <div style={{ position: "absolute", left: "40%", top: `${vc}%`, width: 120, height: 120, marginLeft: -130, marginTop: -60, borderRadius: "50%", background: content.dividerColor, transform: `scale(${li})` }} />
          <div style={{ position: "absolute", left: "60%", top: `${vc}%`, width: 120, height: 120, marginLeft: 10, marginTop: -60, borderRadius: "50%", border: `4px solid #FFFFFF`, transform: `scale(${ri})` }} />
        </>
      )}
      {/* divider dọc gạch đứt — vẽ bằng scaleY */}
      <div style={{
        position: "absolute", left: "50%", top: `${vc - 7}%`, height: "14%", width: 0,
        borderLeft: `3px ${content.dashed ? "dashed" : "solid"} ${content.dividerColor}`,
        transformOrigin: "top", transform: `translateX(-50%) scaleY(${dh})`,
      }} />
      {/* vế trái (căn phải) */}
      <div style={{
        position: "absolute", left: "6%", width: "40%", top: `${vc}%`, transform: "translateY(-50%)",
        textAlign: "right", fontFamily: FONT, fontWeight: 600, fontSize: 34, lineHeight: 1.2, color: "#FFFFFF",
        opacity: li, ...STROKE,
      }}>{left.text}</div>
      {/* vế phải (căn trái) */}
      <div style={{
        position: "absolute", left: "54%", width: "40%", top: `${vc}%`, transform: "translateY(-50%)",
        textAlign: "left", fontFamily: FONT, fontWeight: 600, fontSize: 34, lineHeight: 1.2, color: "#FFFFFF",
        opacity: ri, ...STROKE,
      }}>{right.text}</div>
    </div>
  );
}

const panelSections: PanelSection[] = [
  { title: "Content", schema: ContentSchema, widgets: CONTENT_W },
  { title: "Left",    schema: SideSchema,    widgets: SIDE_W, tabs: ["left"] },
  { title: "Right",   schema: SideSchema,    widgets: SIDE_W, tabs: ["right"] },
];

export const antithesisSplitModule: MotionSceneModule = {
  parseMeta, Component, panelSections,
  defaultMeta: {
    bgColor: "transparent", dividerColor: "#FFD400", dashed: true, vertical: 0.78, showCircles: true,
    left: { text: "terrible for your health", appearSec: 0.2 },
    right: { text: "sharpening your knives", appearSec: 0.5 },
  },
};
