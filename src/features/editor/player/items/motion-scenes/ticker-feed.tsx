// motion-scenes/ticker-feed.tsx — kind "ticker_feed". Feed activity, item land dần từ trên. Chroma-safe.
import { z } from "zod";
import { type WidgetSpec } from "../schemas/_shared";
import { s4ei, s4eo } from "../../../motion-config";
import type { PanelSection } from "../../../control-item/auto-panel";
import type { MotionSceneModule } from "./types";

const ItemSchema = z.object({ text: z.string().default(""), time: z.string().default(""), appearSec: z.number().default(0) });
const IW: Record<keyof z.infer<typeof ItemSchema>, WidgetSpec> = { text: { type: "text" }, time: { type: "text" }, appearSec: { type: "number" } };
const ContentSchema = z.object({ bgColor: z.string().default("#0A0B0A"), title: z.string().default("ACTIVITY") });
const CW: Record<keyof z.infer<typeof ContentSchema>, WidgetSpec> = { bgColor: { type: "color" }, title: { type: "text" } };
const KEYS = ["item1", "item2", "item3", "item4", "item5", "item6"] as const;
const RawSchema = z.object({
  bgColor: z.string().optional(), title: z.string().optional(),
  item1: ItemSchema.partial().optional(), item2: ItemSchema.partial().optional(), item3: ItemSchema.partial().optional(),
  item4: ItemSchema.partial().optional(), item5: ItemSchema.partial().optional(), item6: ItemSchema.partial().optional(),
});
type Item = z.infer<typeof ItemSchema>;
type Meta = { content: z.infer<typeof ContentSchema>; items: Item[] };
function parseMeta(m: unknown): Meta {
  const raw = RawSchema.safeParse(m ?? {});
  const d = (raw.success ? raw.data : {}) as Record<string, unknown>;
  const items = KEYS.map((k) => ItemSchema.parse(d[k] ?? {})).filter((it) => it.text.trim().length > 0).sort((a, b) => a.appearSec - b.appearSec);
  return { content: ContentSchema.parse({ bgColor: d.bgColor, title: d.title }), items };
}
function Component({ f, fps, durationInFrames, data }: { f: number; fps: number; durationInFrames: number; data: Meta }) {
  const dur = durationInFrames / fps;
  const outOp = s4eo(f, Math.max(0, dur - 0.4), dur);
  const t = f / fps;
  // newest on top: show items already-appeared, most-recent first
  const shown = data.items.filter((it) => t >= it.appearSec).slice().reverse();
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: data.content.bgColor,
      display: "flex", flexDirection: "column", justifyContent: "center", gap: 18, padding: "0 8%", opacity: outOp }}>
      <div style={{ fontFamily: "Geist Mono, monospace", fontSize: 30, letterSpacing: 3, color: "#5C6560", marginBottom: 10 }}>{data.content.title}</div>
      {shown.map((it) => {
        const inp = s4ei(f, it.appearSec, it.appearSec + 0.3);
        return (
          <div key={it.text} style={{ display: "flex", alignItems: "center", gap: 18, background: "#101211", border: "1px solid #1F2A23",
            borderRadius: 12, padding: "22px 26px", opacity: inp, transform: `translateY(${-18 * (1 - inp)}px)` }}>
            <span style={{ width: 12, height: 12, borderRadius: 999, background: "#00FF41", flexShrink: 0 }} />
            <span style={{ fontFamily: "Geist, system-ui, sans-serif", fontWeight: 500, fontSize: 38, color: "#EDEFEC", flex: 1 }}>{it.text}</span>
            {it.time && <span style={{ fontFamily: "Geist Mono, monospace", fontSize: 26, color: "#5C6560" }}>{it.time}</span>}
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
export const tickerFeedModule: MotionSceneModule = {
  parseMeta, Component, panelSections,
  defaultMeta: { bgColor: "#0A0B0A", title: "ACTIVITY",
    item1: { text: "Agent shipped a PR", time: "09:02", appearSec: 0.2 },
    item2: { text: "Tests passed", time: "09:05", appearSec: 1.2 },
    item3: { text: "Deployed to prod", time: "09:07", appearSec: 2.2 } },
};
