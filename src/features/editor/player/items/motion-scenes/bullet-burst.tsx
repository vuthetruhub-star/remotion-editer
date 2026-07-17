// motion-scenes/bullet-burst.tsx — kind "bullet_burst". Bullet scrapbook cardless, tích luỹ. Chroma-safe.
import { z } from "zod";
import { type WidgetSpec } from "../schemas/_shared";
import { s4ei, s4eo } from "../../../motion-config";
import type { PanelSection } from "../../../control-item/auto-panel";
import type { MotionSceneModule } from "./types";

const ItemSchema = z.object({ text: z.string().default(""), accent: z.boolean().default(false) });
const IW: Record<keyof z.infer<typeof ItemSchema>, WidgetSpec> = { text: { type: "text" }, accent: { type: "checkbox" } };
const ContentSchema = z.object({ bgColor: z.string().default("transparent") });
const CW: Record<keyof z.infer<typeof ContentSchema>, WidgetSpec> = { bgColor: { type: "color" } };
const KEYS = ["item1", "item2", "item3", "item4"] as const;

// slot scatter tất định (top%, align, xoay nhẹ)
const SLOTS = [
  { top: 0.24, align: "flex-start" as const, rot: -2, padL: "10%" },
  { top: 0.42, align: "flex-end" as const, rot: 2, padR: "10%" },
  { top: 0.60, align: "center" as const, rot: -1, padL: "0" },
  { top: 0.78, align: "flex-start" as const, rot: 1.5, padL: "14%" },
];

const RawSchema = z.object({
  bgColor: z.string().optional(),
  item1: ItemSchema.partial().optional(), item2: ItemSchema.partial().optional(),
  item3: ItemSchema.partial().optional(), item4: ItemSchema.partial().optional(),
});
type Item = z.infer<typeof ItemSchema>;
type Meta = { content: z.infer<typeof ContentSchema>; items: Item[] };
function parseMeta(m: unknown): Meta {
  const raw = RawSchema.safeParse(m ?? {});
  const d = (raw.success ? raw.data : {}) as Record<string, unknown>;
  const items = KEYS.map((k) => ItemSchema.parse(d[k] ?? {})).filter((it) => it.text.trim().length > 0);
  return { content: ContentSchema.parse({ bgColor: d.bgColor }), items };
}
function Component({ f, fps, durationInFrames, data }: { f: number; fps: number; durationInFrames: number; data: Meta }) {
  const dur = durationInFrames / fps;
  const outOp = s4eo(f, Math.max(0, dur - 0.4), dur);
  const per = Math.min(0.5, (dur * 0.6) / Math.max(1, data.items.length));
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: data.content.bgColor }}>
      {data.items.map((it, i) => {
        const s = SLOTS[i % SLOTS.length];
        const inAt = i * per; const inp = s4ei(f, inAt, inAt + 0.3);
        return (
          <div key={i} style={{ position: "absolute", top: `${s.top * 100}%`, left: 0, right: 0,
            display: "flex", justifyContent: s.align, paddingLeft: (s as { padL?: string }).padL, paddingRight: (s as { padR?: string }).padR }}>
            <span style={{ fontFamily: "Geist, system-ui, sans-serif", fontWeight: 800, fontSize: 68,
              color: it.accent ? "#00FF41" : "#FFFFFF", opacity: Math.min(inp, outOp),
              transform: `scale(${0.86 + 0.14 * inp}) rotate(${s.rot}deg)`,
              WebkitTextStroke: "2px rgba(0,0,0,0.5)", paintOrder: "stroke fill" }}>{it.text}</span>
          </div>
        );
      })}
    </div>
  );
}
const panelSections: PanelSection[] = [
  { title: "Content", schema: ContentSchema, widgets: CW },
  { title: "Items", schema: ItemSchema, widgets: IW, tabs: [...KEYS] },
];
export const bulletBurstModule: MotionSceneModule = {
  parseMeta, Component, panelSections,
  defaultMeta: { bgColor: "transparent", item1: { text: "3 sellers per niche" }, item2: { text: "same playbook" },
    item3: { text: "same cold email" }, item4: { text: "3x a day", accent: true } },
};
