// motion-scenes/bulleted-list.tsx — kind "bulleted_list". Checklist dọc có glyph. Chroma-safe.
import { z } from "zod";
import { type WidgetSpec } from "../schemas/_shared";
import { s4ei, s4eo } from "../../../motion-config";
import type { PanelSection } from "../../../control-item/auto-panel";
import type { MotionSceneModule } from "./types";

const ItemSchema = z.object({ text: z.string().default(""), glyph: z.string().default("check"), appearSec: z.number().default(0) });
const IW: Record<keyof z.infer<typeof ItemSchema>, WidgetSpec> = { text: { type: "text" }, glyph: { type: "select", options: ["check", "cross", "dot", "arrow", "warn"] }, appearSec: { type: "number" } };
const ContentSchema = z.object({ bgColor: z.string().default("#0A0B0A"), title: z.string().default("") });
const CW: Record<keyof z.infer<typeof ContentSchema>, WidgetSpec> = { bgColor: { type: "color" }, title: { type: "text" } };
const KEYS = ["item1", "item2", "item3", "item4", "item5"] as const;
const GLYPH: Record<string, string> = { check: "✓", cross: "✕", dot: "•", arrow: "→", warn: "⚠" };
const RawSchema = z.object({
  bgColor: z.string().optional(), title: z.string().optional(),
  item1: ItemSchema.partial().optional(), item2: ItemSchema.partial().optional(), item3: ItemSchema.partial().optional(),
  item4: ItemSchema.partial().optional(), item5: ItemSchema.partial().optional(),
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
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: data.content.bgColor,
      display: "flex", flexDirection: "column", justifyContent: "center", gap: 30, padding: "0 9%", opacity: outOp }}>
      {data.content.title && <div style={{ fontFamily: "Geist, system-ui, sans-serif", fontWeight: 700, fontSize: 50, color: "#EDEFEC", marginBottom: 8 }}>{data.content.title}</div>}
      {data.items.map((it, i) => {
        const inp = s4ei(f, it.appearSec, it.appearSec + 0.35);
        return (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 22, opacity: inp, transform: `translateX(${18 * (1 - inp)}px)` }}>
            <span style={{ width: 56, height: 56, borderRadius: 12, flexShrink: 0, background: "#161A18", color: "#00FF41",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34, fontWeight: 700 }}>{GLYPH[it.glyph] ?? "•"}</span>
            <span style={{ fontFamily: "Geist, system-ui, sans-serif", fontWeight: 500, fontSize: 46, color: "#EDEFEC", lineHeight: 1.25 }}>{it.text}</span>
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
export const bulletedListModule: MotionSceneModule = {
  parseMeta, Component, panelSections,
  defaultMeta: { bgColor: "#0A0B0A", title: "The checklist",
    item1: { text: "A human gave the AI prod creds", glyph: "cross", appearSec: 0.2 },
    item2: { text: "It ran exactly what it was told", glyph: "dot", appearSec: 1.1 },
    item3: { text: "Fix the workflow, not the model", glyph: "check", appearSec: 2.0 } },
};
