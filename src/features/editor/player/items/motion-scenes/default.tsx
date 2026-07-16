// motion-scenes/default.tsx — kind "default".
// Chuyển nguyên hành vi scene mặc định cũ (Headline trên background) vào đây,
// giữ 100% backward-compat: item motionScene không có `kind` → render cái này.
import { z } from "zod";
import {
  TextLayerSchema, TEXT_LAYER_WIDGETS,
  AssetLayerSchema, ASSET_LAYER_WIDGETS,
  BackgroundSchema, BACKGROUND_WIDGETS,
} from "../schemas/_shared";
import { TIMING, s4ei, s4eo } from "../../../motion-config";
import type { PanelSection } from "../../../control-item/auto-panel";
import type { MotionSceneModule } from "./types";

const RawSchema = z.object({
  background: BackgroundSchema.partial().optional(),
  headline:   TextLayerSchema.partial().optional(),
  icon:       AssetLayerSchema.partial().optional(),
});

type Meta = {
  background: z.infer<typeof BackgroundSchema>;
  headline:   z.infer<typeof TextLayerSchema>;
  icon:       z.infer<typeof AssetLayerSchema>;
};

function parseMeta(metadata: unknown): Meta {
  const raw = RawSchema.safeParse(metadata ?? {});
  const d = raw.success ? raw.data : {};
  return {
    background: BackgroundSchema.parse(d.background ?? {}),
    headline:   TextLayerSchema.parse(d.headline ?? {}),
    icon:       AssetLayerSchema.parse(d.icon ?? {}),
  };
}

function Headline({ f, data }: { f: number; data: Meta["headline"] }) {
  const { intro, outro } = TIMING;
  const opacity = Math.min(
    s4ei(f, intro.start, intro.start + intro.duration),
    s4eo(f, outro.start, outro.start + outro.duration),
  );
  return (
    <div
      style={{
        position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
        transform: `translate(${data.x}px, ${data.y}px) scale(${data.scale}) rotate(${data.rotate}deg)`,
        opacity,
      }}
    >
      <span
        style={{
          fontFamily: "Geist, system-ui, sans-serif",
          fontWeight: data.bold ? 700 : 500,
          fontStyle: data.italic ? "italic" : "normal",
          textDecoration: data.underline ? "underline" : "none",
          textTransform: data.textTransform,
          textAlign: data.textAlign,
          color: data.color,
          lineHeight: data.lineHeight,
          maxWidth: data.maxWidth || undefined,
          fontSize: 64,
        }}
      >
        Headline
      </span>
    </div>
  );
}

function Component({ f, data }: { f: number; data: Meta }) {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: data.background.color }}>
      <Headline f={f} data={data.headline} />
    </div>
  );
}

const panelSections: PanelSection[] = [
  { title: "Background", schema: BackgroundSchema, widgets: BACKGROUND_WIDGETS },
  { title: "Headline",   schema: TextLayerSchema,  widgets: TEXT_LAYER_WIDGETS },
  { title: "Icon",       schema: AssetLayerSchema, widgets: ASSET_LAYER_WIDGETS },
];

export const defaultModule: MotionSceneModule = {
  parseMeta,
  Component,
  panelSections,
  defaultMeta: { background: { color: "#FFFFFF" }, headline: { color: "#111111" }, icon: {} },
};
