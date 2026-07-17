// motion-scenes/image-card.tsx — kind "image_card". Ảnh trong card nửa dưới (nền ĐẶC, chroma-safe). Video vẫn thấy trên.
import { z } from "zod";
import { Img, staticFile } from "remotion";
import { type WidgetSpec } from "../schemas/_shared";
import { s4ei, s4eo } from "../../../motion-config";
import type { PanelSection } from "../../../control-item/auto-panel";
import type { MotionSceneModule } from "./types";

const ContentSchema = z.object({ bgColor: z.string().default("transparent"), imagePath: z.string().default(""), caption: z.string().default("") });
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
  const inp = s4ei(f, 0, 0.4);
  const op = Math.min(inp, s4eo(f, Math.max(0, dur - 0.4), dur));
  const kb = 1.04 + 0.05 * s4ei(f, 0, dur); // ken burns nhẹ
  const c = data.content;
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: c.bgColor }}>
      <div style={{ position: "absolute", left: "5%", right: "5%", bottom: "8%", height: "46%", borderRadius: 20, overflow: "hidden",
        background: "#101211", border: "2px solid #00FF41", opacity: op, transform: `translateY(${40 * (1 - inp)}px)`, display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, overflow: "hidden" }}>
          {c.imagePath ? <Img src={src(c.imagePath)} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${kb})` }} />
            : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#5C6560", fontFamily: "Geist Mono, monospace", fontSize: 30 }}>imagePath ↦ /public/…</div>}
        </div>
        {c.caption && <div style={{ padding: "20px 26px", background: "#0A0B0A", fontFamily: "Geist, system-ui, sans-serif", fontWeight: 600, fontSize: 34, color: "#EDEFEC" }}>{c.caption}</div>}
      </div>
    </div>
  );
}
const panelSections: PanelSection[] = [{ title: "Content", schema: ContentSchema, widgets: CW }];
export const imageCardModule: MotionSceneModule = {
  parseMeta, Component, panelSections,
  defaultMeta: { bgColor: "transparent", imagePath: "", caption: "The dashboard" },
};
