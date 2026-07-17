// motion-scenes/headline-card.tsx — kind "headline_card". Thẻ mẩu tin nửa dưới (nền ĐẶC, chroma-safe).
import { z } from "zod";
import { type WidgetSpec } from "../schemas/_shared";
import { s4ei, s4eo } from "../../../motion-config";
import type { PanelSection } from "../../../control-item/auto-panel";
import type { MotionSceneModule } from "./types";

const ContentSchema = z.object({
  bgColor:  z.string().default("transparent"), // nền comp (giữ trong suốt để thấy video)
  source:   z.string().default("THE GLP-1 BOOM"),
  headline: z.string().default("Weight-loss drugs became a $62B market"),
  dek:      z.string().default(""),
});
const CW: Record<keyof z.infer<typeof ContentSchema>, WidgetSpec> = {
  bgColor: { type: "color" }, source: { type: "text" }, headline: { type: "text" }, dek: { type: "text" },
};
const RawSchema = z.object({ bgColor: z.string().optional(), source: z.string().optional(), headline: z.string().optional(), dek: z.string().optional() });
type Meta = { content: z.infer<typeof ContentSchema> };
function parseMeta(m: unknown): Meta {
  const raw = RawSchema.safeParse(m ?? {});
  const d = (raw.success ? raw.data : {}) as z.infer<typeof RawSchema>;
  return { content: ContentSchema.parse({ bgColor: d.bgColor, source: d.source, headline: d.headline, dek: d.dek }) };
}
function Component({ f, fps, durationInFrames, data }: { f: number; fps: number; durationInFrames: number; data: Meta }) {
  const dur = durationInFrames / fps;
  const inp = s4ei(f, 0, 0.4);
  const op = Math.min(inp, s4eo(f, Math.max(0, dur - 0.4), dur));
  const c = data.content;
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: c.bgColor }}>
      {/* card ĐẶC 100% ở nửa dưới — không backdrop-blur (chroma-safe) */}
      <div style={{ position: "absolute", left: "6%", right: "6%", bottom: "12%", padding: "40px 44px",
        background: "#101211", border: "1px solid #00FF41", borderRadius: 18,
        transform: `translateY(${40 * (1 - inp)}px)`, opacity: op,
        display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ fontFamily: "Geist, system-ui, sans-serif", fontWeight: 700, fontSize: 30, letterSpacing: 3,
          textTransform: "uppercase", color: "#00FF41" }}>{c.source}</div>
        <div style={{ fontFamily: "Geist, system-ui, sans-serif", fontWeight: 700, fontSize: 58, lineHeight: 1.12, color: "#EDEFEC" }}>{c.headline}</div>
        {c.dek && <div style={{ fontFamily: "Geist, system-ui, sans-serif", fontWeight: 500, fontSize: 30, color: "#9BA39E" }}>{c.dek}</div>}
      </div>
    </div>
  );
}
const panelSections: PanelSection[] = [{ title: "Content", schema: ContentSchema, widgets: CW }];
export const headlineCardModule: MotionSceneModule = {
  parseMeta, Component, panelSections,
  defaultMeta: { bgColor: "transparent", source: "THE GLP-1 BOOM", headline: "Weight-loss drugs became a $62B market", dek: "" },
};
