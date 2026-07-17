// motion-scenes/ai-image-on-grid.tsx — kind "ai_image_on_grid". Ảnh full-bleed + caption. (16:9/takeover; trên 9:16 cân nhắc image_card.)
import { z } from "zod";
import { Img, staticFile } from "remotion";
import { type WidgetSpec } from "../schemas/_shared";
import { s4ei, s4eo } from "../../../motion-config";
import type { PanelSection } from "../../../control-item/auto-panel";
import type { MotionSceneModule } from "./types";

const ContentSchema = z.object({ bgColor: z.string().default("#0A0B0A"), imagePath: z.string().default(""), caption: z.string().default("") });
const CW: Record<keyof z.infer<typeof ContentSchema>, WidgetSpec> = { bgColor: { type: "color" }, imagePath: { type: "text" }, caption: { type: "text" } };
const RawSchema = z.object({ bgColor: z.string().optional(), imagePath: z.string().optional(), caption: z.string().optional() });
type Meta = { content: z.infer<typeof ContentSchema> };
function parseMeta(m: unknown): Meta {
  const raw = RawSchema.safeParse(m ?? {});
  const d = (raw.success ? raw.data : {}) as z.infer<typeof RawSchema>;
  return { content: ContentSchema.parse({ bgColor: d.bgColor, imagePath: d.imagePath, caption: d.caption }) };
}
function src(p: string): string { return /^(https?:)?\/\//.test(p) || p.startsWith("/") ? p : staticFile(p); }
function Component({ f, fps, durationInFrames, data }: { f: number; fps: number; durationInFrames: number; data: Meta }) {
  const dur = durationInFrames / fps;
  const inp = s4ei(f, 0, 0.5);
  const op = Math.min(inp, s4eo(f, Math.max(0, dur - 0.4), dur));
  const kb = 1.0 + 0.06 * s4ei(f, 0, dur);
  const c = data.content;
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: c.bgColor, opacity: op }}>
      {c.imagePath ? <Img src={src(c.imagePath)} style={{ width: "100%", height: "100%", objectFit: "contain", transform: `scale(${kb})` }} />
        : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#5C6560", fontFamily: "Geist Mono, monospace", fontSize: 34 }}>imagePath ↦ /public/…</div>}
      {c.caption && <div style={{ position: "absolute", left: 0, right: 0, bottom: "6%", textAlign: "center",
        fontFamily: "Geist, system-ui, sans-serif", fontWeight: 700, fontSize: 44, color: "#FFFFFF", WebkitTextStroke: "1.5px rgba(0,0,0,0.6)", paintOrder: "stroke fill" }}>{c.caption}</div>}
    </div>
  );
}
const panelSections: PanelSection[] = [{ title: "Content", schema: ContentSchema, widgets: CW }];
export const aiImageOnGridModule: MotionSceneModule = {
  parseMeta, Component, panelSections,
  defaultMeta: { bgColor: "#0A0B0A", imagePath: "", caption: "" },
};
