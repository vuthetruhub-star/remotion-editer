// motion-scenes/side-panel.tsx — kind "side_panel". Panel bullet dọc một bên (over video). (Taste: TRÁNH trên Short.)
import { z } from "zod";
import { type WidgetSpec } from "../schemas/_shared";
import { s4ei, s4eo } from "../../../motion-config";
import type { PanelSection } from "../../../control-item/auto-panel";
import type { MotionSceneModule } from "./types";

const ItemSchema = z.object({ text: z.string().default(""), appearSec: z.number().default(0) });
const IW: Record<keyof z.infer<typeof ItemSchema>, WidgetSpec> = { text: { type: "text" }, appearSec: { type: "number" } };
const ContentSchema = z.object({ bgColor: z.string().default("transparent"), title: z.string().default(""), anchor: z.enum(["right", "left"]).default("right") });
const CW: Record<keyof z.infer<typeof ContentSchema>, WidgetSpec> = { bgColor: { type: "color" }, title: { type: "text" }, anchor: { type: "select", options: ["right", "left"] } };
const KEYS = ["item1", "item2", "item3", "item4", "item5"] as const;
const RawSchema = z.object({
  bgColor: z.string().optional(), title: z.string().optional(), anchor: z.enum(["right", "left"]).optional(),
  item1: ItemSchema.partial().optional(), item2: ItemSchema.partial().optional(), item3: ItemSchema.partial().optional(),
  item4: ItemSchema.partial().optional(), item5: ItemSchema.partial().optional(),
});
type Item = z.infer<typeof ItemSchema>;
type Meta = { content: z.infer<typeof ContentSchema>; items: Item[] };
function parseMeta(m: unknown): Meta {
  const raw = RawSchema.safeParse(m ?? {});
  const d = (raw.success ? raw.data : {}) as Record<string, unknown>;
  const items = KEYS.filter((k) => d[k] != null).map((k) => ItemSchema.parse(d[k] ?? {})).filter((x) => x.text.trim());
  return { content: ContentSchema.parse({ bgColor: d.bgColor, title: d.title, anchor: d.anchor }), items };
}
function Component({ f, fps, durationInFrames, data }: { f: number; fps: number; durationInFrames: number; data: Meta }) {
  const dur = durationInFrames / fps;
  const inp = s4ei(f, 0, 0.4);
  const op = Math.min(inp, s4eo(f, Math.max(0, dur - 0.4), dur));
  const c = data.content;
  const right = c.anchor === "right";
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: c.bgColor }}>
      <div style={{ position: "absolute", top: "10%", bottom: "10%", width: "44%", [right ? "right" : "left"]: 0,
        background: "#101211", [right ? "borderLeft" : "borderRight"]: "5px solid #00FF41",
        padding: "40px 36px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 26,
        opacity: op, transform: `translateX(${(right ? 40 : -40) * (1 - inp)}px)` }}>
        {c.title && <div style={{ fontFamily: "Geist, system-ui, sans-serif", fontWeight: 800, fontSize: 42, color: "#00FF41", marginBottom: 8 }}>{c.title}</div>}
        {data.items.map((it, i) => {
          const iin = s4ei(f, it.appearSec, it.appearSec + 0.3);
          return (
            <div key={i} style={{ display: "flex", gap: 14, opacity: iin, transform: `translateX(${12 * (1 - iin)}px)`,
              fontFamily: "Geist, system-ui, sans-serif", fontWeight: 500, fontSize: 38, color: "#EDEFEC" }}>
              <span style={{ color: "#00FF41" }}>›</span>{it.text}
            </div>
          );
        })}
      </div>
    </div>
  );
}
const panelSections: PanelSection[] = [
  { title: "Content", schema: ContentSchema, widgets: CW },
  { title: "Items", schema: ItemSchema, widgets: IW, tabs: [...KEYS] },
];
export const sidePanelModule: MotionSceneModule = {
  parseMeta, Component, panelSections,
  defaultMeta: { bgColor: "transparent", title: "Why it works", anchor: "right",
    item1: { text: "Smaller surface", appearSec: 0.3 }, item2: { text: "Direct feedback", appearSec: 1.0 }, item3: { text: "No legacy", appearSec: 1.7 } },
};
