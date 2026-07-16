// motion-scenes/stat-punch.tsx — kind "stat_punch".
// Một con số hero + caption. Chroma-safe. Auto-shrink theo từ dài nhất.
import { z } from "zod";
import { TextLayerSchema, TEXT_LAYER_WIDGETS, type WidgetSpec } from "../schemas/_shared";
import { s4ei, s4eo } from "../../../motion-config";
import type { PanelSection } from "../../../control-item/auto-panel";
import type { MotionSceneModule } from "./types";

const ContentSchema = z.object({
  bgColor: z.string().default("transparent"),
  value:   z.string().default("$400M"),
  caption: z.string().default("RAISED IN 6 MONTHS"),
});
const CONTENT_WIDGETS: Record<keyof z.infer<typeof ContentSchema>, WidgetSpec> = {
  bgColor: { type: "color" },
  value:   { type: "text" },
  caption: { type: "text" },
};

const RawSchema = z.object({
  bgColor:      z.string().optional(),
  value:        z.string().optional(),
  caption:      z.string().optional(),
  valueStyle:   TextLayerSchema.partial().optional(),
  captionStyle: TextLayerSchema.partial().optional(),
});

type Meta = {
  content:      z.infer<typeof ContentSchema>;
  valueStyle:   z.infer<typeof TextLayerSchema>;
  captionStyle: z.infer<typeof TextLayerSchema>;
};

function parseMeta(metadata: unknown): Meta {
  const raw = RawSchema.safeParse(metadata ?? {});
  const d = (raw.success ? raw.data : {}) as z.infer<typeof RawSchema>;
  return {
    content:      ContentSchema.parse({ bgColor: d.bgColor, value: d.value, caption: d.caption }),
    valueStyle:   TextLayerSchema.parse(d.valueStyle ?? {}),
    captionStyle: TextLayerSchema.parse(d.captionStyle ?? {}),
  };
}

function heroFont(value: string): number {
  const longest = value.split(/\s+/).reduce((a, b) => (b.length > a.length ? b : a), "");
  return Math.min(320, Math.floor((1080 * 0.88 * 1.6) / Math.max(1, longest.length)));
}

function Component({ f, fps, durationInFrames, data }: {
  f: number; fps: number; durationInFrames: number; data: Meta;
}) {
  const dur = durationInFrames / fps;
  const outOp = s4eo(f, Math.max(0, dur - 0.5), dur);
  const vIn = s4ei(f, 0, 0.5);
  const cIn = s4ei(f, 0.15, 0.65);
  const V = data.valueStyle, C = data.captionStyle;

  return (
    <div style={{
      position: "absolute", inset: 0, overflow: "hidden", background: data.content.bgColor,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24,
    }}>
      <span style={{
        fontFamily: "Geist, system-ui, sans-serif", fontWeight: 800, color: V.color,
        fontSize: heroFont(data.content.value), lineHeight: 0.95, textAlign: "center", whiteSpace: "pre-line",
        transform: `translate(${V.x}px, ${V.y + 24 * (1 - vIn)}px) scale(${V.scale})`,
        opacity: Math.min(vIn, outOp),
      }}>{data.content.value}</span>

      <span style={{
        fontFamily: "Geist, system-ui, sans-serif", fontWeight: 600, color: C.color === "#FFFFFF" ? "#00FF41" : C.color,
        fontSize: 40, letterSpacing: 2, textTransform: "uppercase", textAlign: "center",
        transform: `translate(${C.x}px, ${C.y + 16 * (1 - cIn)}px)`,
        opacity: Math.min(cIn, outOp),
      }}>{data.content.caption}</span>
    </div>
  );
}

const panelSections: PanelSection[] = [
  { title: "Content", schema: ContentSchema, widgets: CONTENT_WIDGETS },
  { title: "Style",   schema: TextLayerSchema, widgets: TEXT_LAYER_WIDGETS, tabs: ["valueStyle", "captionStyle"] },
];

export const statPunchModule: MotionSceneModule = {
  parseMeta,
  Component,
  panelSections,
  defaultMeta: {
    bgColor: "transparent",
    value:   "$400M",
    caption: "RAISED IN 6 MONTHS",
    valueStyle:   { color: "#FFFFFF" },
    captionStyle: { color: "#00FF41" },
  },
};
