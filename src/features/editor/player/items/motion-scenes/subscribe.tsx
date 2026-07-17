// motion-scenes/subscribe.tsx — kind "subscribe". Nút CTA: pill pop → click → morph SUBSCRIBED + con trỏ.
import { z } from "zod";
import { type WidgetSpec } from "../schemas/_shared";
import { s4ei, s4eo } from "../../../motion-config";
import type { PanelSection } from "../../../control-item/auto-panel";
import type { MotionSceneModule } from "./types";

const ContentSchema = z.object({ bgColor: z.string().default("transparent"), vertical: z.number().default(0.8) });
const CW: Record<keyof z.infer<typeof ContentSchema>, WidgetSpec> = { bgColor: { type: "color" }, vertical: { type: "slider", min: 0, max: 1, step: 0.01 } };
const RawSchema = z.object({ bgColor: z.string().optional(), vertical: z.number().optional() });
type Meta = { content: z.infer<typeof ContentSchema> };
function parseMeta(m: unknown): Meta {
  const raw = RawSchema.safeParse(m ?? {});
  const d = (raw.success ? raw.data : {}) as z.infer<typeof RawSchema>;
  return { content: ContentSchema.parse({ bgColor: d.bgColor, vertical: d.vertical }) };
}
function Component({ f, fps, durationInFrames, data }: { f: number; fps: number; durationInFrames: number; data: Meta }) {
  const dur = durationInFrames / fps;
  const t = f / fps;
  const outOp = s4eo(f, Math.max(0, dur - 0.4), dur);
  const pop = s4ei(f, 0, 0.35);
  const clicked = t >= 1.1;
  const cursorX = 60 - 60 * s4ei(f, 0.3, 1.0); // con trỏ trượt vào
  const subscribed = t >= 1.25;
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: data.content.bgColor }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: `${data.content.vertical * 100}%`, transform: "translateY(-50%)",
        display: "flex", justifyContent: "center", opacity: Math.min(pop, outOp) }}>
        <div style={{ position: "relative" }}>
          <div style={{ background: subscribed ? "#1E2434" : "#00FF41", color: subscribed ? "#EDEFEC" : "#0A0B0A",
            fontFamily: "Geist, system-ui, sans-serif", fontWeight: 800, fontSize: 52, padding: "26px 56px", borderRadius: 999,
            transform: `scale(${clicked && t < 1.25 ? 0.94 : 1})`, display: "flex", alignItems: "center", gap: 14 }}>
            {subscribed ? "SUBSCRIBED" : "SUBSCRIBE"}{subscribed && <span style={{ fontSize: 46 }}>🔔</span>}
          </div>
          {/* con trỏ */}
          <div style={{ position: "absolute", right: -30 + cursorX, bottom: -30, fontSize: 56, transform: clicked && t < 1.25 ? "scale(0.85)" : "scale(1)" }}>🖱️</div>
        </div>
      </div>
    </div>
  );
}
const panelSections: PanelSection[] = [{ title: "Content", schema: ContentSchema, widgets: CW }];
export const subscribeModule: MotionSceneModule = {
  parseMeta, Component, panelSections,
  defaultMeta: { bgColor: "transparent", vertical: 0.8 },
};
