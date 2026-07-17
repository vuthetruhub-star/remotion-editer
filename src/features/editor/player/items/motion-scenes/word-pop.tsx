// motion-scenes/word-pop.tsx — kind "word_pop".
// Chữ pop cardless, hiện từng phrase một theo appearSec (giây tuyệt đối trong scene).
// Chroma-safe (chỉ opacity + translate + scale). Lower-third mặc định (vertical 0.72).
import { z } from "zod";
import { type WidgetSpec } from "../schemas/_shared";
import { s4ei, s4eo, s4vis } from "../../../motion-config";
import type { PanelSection } from "../../../control-item/auto-panel";
import type { MotionSceneModule } from "./types";

const ItemSchema = z.object({
  text:      z.string().default(""),
  appearSec: z.number().default(0),
  accent:    z.boolean().default(false),
});
const ITEM_WIDGETS: Record<keyof z.infer<typeof ItemSchema>, WidgetSpec> = {
  text:      { type: "text" },
  appearSec: { type: "number" },
  accent:    { type: "checkbox" },
};

const ContentSchema = z.object({
  bgColor:  z.string().default("transparent"),
  vertical: z.number().default(0.72),
});
const CONTENT_WIDGETS: Record<keyof z.infer<typeof ContentSchema>, WidgetSpec> = {
  bgColor:  { type: "color" },
  vertical: { type: "slider", min: 0, max: 1, step: 0.01 },
};

const ITEM_KEYS = ["item1", "item2", "item3", "item4"] as const;

const RawSchema = z.object({
  bgColor:  z.string().optional(),
  vertical: z.number().optional(),
  item1: ItemSchema.partial().optional(),
  item2: ItemSchema.partial().optional(),
  item3: ItemSchema.partial().optional(),
  item4: ItemSchema.partial().optional(),
});

type Item = z.infer<typeof ItemSchema>;
type Meta = { content: z.infer<typeof ContentSchema>; items: Item[] };

function parseMeta(metadata: unknown): Meta {
  const raw = RawSchema.safeParse(metadata ?? {});
  const d = (raw.success ? raw.data : {}) as Record<string, unknown>;
  const items = ITEM_KEYS
    .map((k) => ItemSchema.parse(d[k] ?? {}))
    .filter((it) => it.text.trim().length > 0)
    .sort((a, b) => a.appearSec - b.appearSec);
  return {
    content: ContentSchema.parse({ bgColor: d.bgColor, vertical: d.vertical }),
    items,
  };
}

function Component({ f, fps, durationInFrames, data }: {
  f: number; fps: number; durationInFrames: number; data: Meta;
}) {
  const dur = durationInFrames / fps;
  const { items } = data;
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: data.content.bgColor }}>
      {items.map((it, i) => {
        const next = items[i + 1]?.appearSec ?? dur;
        const inEnd = it.appearSec + 0.2;
        const outStart = Math.max(inEnd, next - 0.15);
        const op = s4vis(f, it.appearSec, inEnd, outStart, next);
        const pop = s4ei(f, it.appearSec, inEnd);
        return (
          <span
            key={i}
            style={{
              position: "absolute", left: "50%", top: `${data.content.vertical * 100}%`,
              transform: `translate(-50%, -50%) scale(${0.92 + 0.08 * pop})`,
              opacity: op,
              fontFamily: "Geist, system-ui, sans-serif", fontWeight: 800, fontSize: 92,
              lineHeight: 1.0, textAlign: "center", whiteSpace: "pre-line", maxWidth: "88%",
              color: it.accent ? "#00FF41" : "#FFFFFF",
              // chroma-safe: viền ĐẶC (không blur) cho dễ đọc, không toả ra nền chroma
              WebkitTextStroke: "2px rgba(0,0,0,0.55)",
              paintOrder: "stroke fill",
            }}
          >
            {it.text}
          </span>
        );
      })}
    </div>
  );
}

const panelSections: PanelSection[] = [
  { title: "Content", schema: ContentSchema, widgets: CONTENT_WIDGETS },
  { title: "Items",   schema: ItemSchema,    widgets: ITEM_WIDGETS, tabs: [...ITEM_KEYS] },
];

export const wordPopModule: MotionSceneModule = {
  parseMeta,
  Component,
  panelSections,
  defaultMeta: {
    bgColor: "transparent",
    vertical: 0.72,
    item1: { text: "ChatGPT", appearSec: 0.2 },
    item2: { text: "Claude", appearSec: 1.0, accent: true },
    item3: { text: "Grok", appearSec: 1.8 },
    item4: { text: "", appearSec: 2.6 },
  },
};
