// motion-scenes/caption-word.tsx — kind "caption_word".
// Một dòng caption ngắn (từ/cụm) hiện GIỮA màn theo cửa sổ thời gian của item — dùng để bake phụ đề
// word-by-word (mỗi item = 1 cụm, display = [start,end] của cụm). Fade nhanh, không flicker layout.
// Chroma-safe: chữ đặc + viền đặc, chỉ transform/opacity.
import { z } from "zod";
import { type WidgetSpec } from "../schemas/_shared";
import { s4ei } from "../../../motion-config";
import type { PanelSection } from "../../../control-item/auto-panel";
import type { MotionSceneModule } from "./types";

const ContentSchema = z.object({
  text:        z.string().default(""),
  vertical:    z.number().default(0.58),
  size:        z.number().default(64),
  color:       z.string().default("#FFFFFF"),
  accent:      z.boolean().default(false),
  accentColor: z.string().default("#00FF41"),
});
const CONTENT_W: Record<keyof z.infer<typeof ContentSchema>, WidgetSpec> = {
  text:        { type: "text" },
  vertical:    { type: "slider", min: 0, max: 1, step: 0.01 },
  size:        { type: "slider", min: 20, max: 160 },
  color:       { type: "color" },
  accent:      { type: "checkbox" },
  accentColor: { type: "color" },
};

const RawSchema = ContentSchema.partial();
type Meta = { content: z.infer<typeof ContentSchema> };

function parseMeta(m: unknown): Meta {
  const raw = RawSchema.safeParse(m ?? {});
  return { content: ContentSchema.parse((raw.success ? raw.data : {}) as Record<string, unknown>) };
}

function Component({ f, data }: { f: number; fps: number; durationInFrames: number; data: Meta }) {
  const c = data.content;
  const inp = s4ei(f, 0, 0.1); // fade+rise vào nhanh (~3 frame)
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <div style={{
        position: "absolute", left: "8%", right: "8%", top: `${c.vertical * 100}%`,
        transform: `translateY(-50%) translateY(${8 * (1 - inp)}px)`, opacity: inp,
        textAlign: "center", fontFamily: "Geist, system-ui, sans-serif", fontWeight: 800,
        fontSize: c.size, lineHeight: 1.15, color: c.accent ? c.accentColor : c.color,
        WebkitTextStroke: "1.5px rgba(0,0,0,0.55)", paintOrder: "stroke fill",
      }}>{c.text}</div>
    </div>
  );
}

const panelSections: PanelSection[] = [{ title: "Content", schema: ContentSchema, widgets: CONTENT_W }];

export const captionWordModule: MotionSceneModule = {
  parseMeta, Component, panelSections,
  defaultMeta: { text: "caption", vertical: 0.58, size: 64, color: "#FFFFFF", accent: false, accentColor: "#00FF41" },
};
