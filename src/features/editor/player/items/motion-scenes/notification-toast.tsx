// motion-scenes/notification-toast.tsx — kind "notification_toast". Thẻ push notification (over video). (Taste: TRÁNH trên Short.)
import { z } from "zod";
import type { CSSProperties } from "react";
import { type WidgetSpec } from "../schemas/_shared";
import { s4ei, s4eo } from "../../../motion-config";
import type { PanelSection } from "../../../control-item/auto-panel";
import type { MotionSceneModule } from "./types";

const ContentSchema = z.object({
  bgColor: z.string().default("transparent"), appName: z.string().default("Slack"), title: z.string().default("New message"),
  body: z.string().default("A customer just signed up 🎉"), time: z.string().default("now"),
  anchor: z.enum(["top-right", "top-center", "top-left"]).default("top-center"),
});
const CW: Record<keyof z.infer<typeof ContentSchema>, WidgetSpec> = {
  bgColor: { type: "color" }, appName: { type: "text" }, title: { type: "text" }, body: { type: "text" }, time: { type: "text" },
  anchor: { type: "select", options: ["top-right", "top-center", "top-left"] },
};
const RawSchema = z.object({ bgColor: z.string().optional(), appName: z.string().optional(), title: z.string().optional(), body: z.string().optional(), time: z.string().optional(), anchor: z.enum(["top-right", "top-center", "top-left"]).optional() });
type Meta = { content: z.infer<typeof ContentSchema> };
function parseMeta(m: unknown): Meta {
  const raw = RawSchema.safeParse(m ?? {});
  const d = (raw.success ? raw.data : {}) as z.infer<typeof RawSchema>;
  return { content: ContentSchema.parse({ bgColor: d.bgColor, appName: d.appName, title: d.title, body: d.body, time: d.time, anchor: d.anchor }) };
}
function Component({ f, fps, durationInFrames, data }: { f: number; fps: number; durationInFrames: number; data: Meta }) {
  const dur = durationInFrames / fps;
  const inp = s4ei(f, 0, 0.4);
  const op = Math.min(inp, s4eo(f, Math.max(0, dur - 0.4), dur));
  const c = data.content;
  const pos: CSSProperties = { position: "absolute", top: "9%", opacity: op, transform: `translateY(${-24 * (1 - inp)}px)`, width: "62%" };
  if (c.anchor === "top-center") { pos.left = "50%"; pos.transform += " translateX(-50%)"; }
  else if (c.anchor === "top-left") pos.left = "6%"; else pos.right = "6%";
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: c.bgColor }}>
      <div style={{ ...pos, background: "#161A18", border: "1px solid #2D3D33", borderRadius: 22, padding: "24px 26px", display: "flex", gap: 18, boxShadow: "0 0 0 1px rgba(0,0,0,0.4)" }}>
        <div style={{ width: 68, height: 68, borderRadius: 16, background: "#00FF41", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "Geist, sans-serif", fontWeight: 800, fontSize: 34, color: "#0A0B0A" }}>{c.appName.slice(0, 1).toUpperCase()}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "Geist Mono, monospace", fontSize: 24, color: "#5C6560" }}>
            <span>{c.appName.toUpperCase()}</span><span>{c.time}</span>
          </div>
          <div style={{ fontFamily: "Geist, system-ui, sans-serif", fontWeight: 700, fontSize: 36, color: "#EDEFEC", marginTop: 4 }}>{c.title}</div>
          <div style={{ fontFamily: "Geist, system-ui, sans-serif", fontWeight: 400, fontSize: 32, color: "#9BA39E", marginTop: 2 }}>{c.body}</div>
        </div>
      </div>
    </div>
  );
}
const panelSections: PanelSection[] = [{ title: "Content", schema: ContentSchema, widgets: CW }];
export const notificationToastModule: MotionSceneModule = {
  parseMeta, Component, panelSections,
  defaultMeta: { bgColor: "transparent", appName: "Slack", title: "New message", body: "A customer just signed up 🎉", time: "now", anchor: "top-center" },
};
