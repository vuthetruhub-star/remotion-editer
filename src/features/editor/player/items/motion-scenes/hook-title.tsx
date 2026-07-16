// motion-scenes/hook-title.tsx — kind "hook_title".
// Cold-open lockup: kicker nhỏ (accent) + title hero. Chroma-safe (chỉ opacity +
// translate + scale, KHÔNG blur/glow ra ngoài — xem knowledge/repo-constraints.md).
// Timing tính theo ĐỘ DÀI item (không phụ thuộc TIMING 5s cứng) để beat dài/ngắn đều đúng.
import { z } from "zod";
import { TextLayerSchema, TEXT_LAYER_WIDGETS, type WidgetSpec } from "../schemas/_shared";
import { s4ei, s4eo } from "../../../motion-config";
import type { PanelSection } from "../../../control-item/auto-panel";
import type { MotionSceneModule } from "./types";

// Content (chuỗi) — top-level metadata; style (vị trí/màu) — nested qua tabs.
const ContentSchema = z.object({
  bgColor: z.string().default("transparent"), // keyable mặc định
  kicker:  z.string().default("TWO PEOPLE · WITH AI"),
  title:   z.string().default("$400,000,000"),
});
const CONTENT_WIDGETS: Record<keyof z.infer<typeof ContentSchema>, WidgetSpec> = {
  bgColor: { type: "color" },
  kicker:  { type: "text" },
  title:   { type: "text" },
};

const RawSchema = z.object({
  bgColor:     z.string().optional(),
  kicker:      z.string().optional(),
  title:       z.string().optional(),
  kickerStyle: TextLayerSchema.partial().optional(),
  titleStyle:  TextLayerSchema.partial().optional(),
});

type Meta = {
  content:     z.infer<typeof ContentSchema>;
  kickerStyle: z.infer<typeof TextLayerSchema>;
  titleStyle:  z.infer<typeof TextLayerSchema>;
};

function parseMeta(metadata: unknown): Meta {
  const raw = RawSchema.safeParse(metadata ?? {});
  const d = (raw.success ? raw.data : {}) as z.infer<typeof RawSchema>;
  return {
    content:     ContentSchema.parse({ bgColor: d.bgColor, kicker: d.kicker, title: d.title }),
    kickerStyle: TextLayerSchema.parse(d.kickerStyle ?? {}),
    titleStyle:  TextLayerSchema.parse(d.titleStyle ?? {}),
  };
}

// auto-shrink title theo TỪ DÀI NHẤT để fit ~86% khung (repo-constraints/worked-example)
function titleFont(t: string): number {
  const longest = t.split(/\s+/).reduce((a, b) => (b.length > a.length ? b : a), "");
  return Math.min(220, Math.floor((1080 * 0.86 * 1.7) / Math.max(1, longest.length)));
}

function Component({ f, fps, durationInFrames, data }: {
  f: number; fps: number; durationInFrames: number; data: Meta;
}) {
  const dur = durationInFrames / fps; // giây
  const outOp = s4eo(f, Math.max(0, dur - 0.5), dur);
  const kIn = s4ei(f, 0, 0.5);
  const tIn = s4ei(f, 0.18, 0.68);
  const kOp = Math.min(kIn, outOp);
  const tOp = Math.min(tIn, outOp);
  const K = data.kickerStyle, T = data.titleStyle;

  return (
    <div style={{
      position: "absolute", inset: 0, overflow: "hidden", background: data.content.bgColor,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 28,
    }}>
      <span style={{
        fontFamily: "Geist, system-ui, sans-serif", fontWeight: 600, letterSpacing: 6,
        fontSize: 34, color: K.color === "#FFFFFF" ? "#00FF41" : K.color, textTransform: "uppercase",
        transform: `translate(${K.x}px, ${K.y + 18 * (1 - kIn)}px)`, opacity: kOp,
      }}>{data.content.kicker}</span>

      <span style={{
        fontFamily: "Geist, system-ui, sans-serif", fontWeight: 800, lineHeight: 0.95,
        fontSize: titleFont(data.content.title), color: T.color, textAlign: "center", whiteSpace: "pre-line",
        transform: `translate(${T.x}px, ${T.y + 30 * (1 - tIn)}px) scale(${0.96 + 0.04 * tIn})`, opacity: tOp,
      }}>{data.content.title}</span>
    </div>
  );
}

const panelSections: PanelSection[] = [
  { title: "Content", schema: ContentSchema, widgets: CONTENT_WIDGETS },
  { title: "Style",   schema: TextLayerSchema, widgets: TEXT_LAYER_WIDGETS, tabs: ["kickerStyle", "titleStyle"] },
];

export const hookTitleModule: MotionSceneModule = {
  parseMeta,
  Component,
  panelSections,
  defaultMeta: {
    bgColor: "transparent",
    kicker:  "TWO PEOPLE · WITH AI",
    title:   "$400,000,000",
    kickerStyle: { color: "#00FF41" },
    titleStyle:  { color: "#FFFFFF" },
  },
};
