// motion-scenes/tool-logo-burst.tsx — kind "tool_logo_burst". Tile logo brand (ảnh) hoặc tile chữ (fallback).
import { z } from "zod";
import { Img, staticFile } from "remotion";
import { type WidgetSpec } from "../schemas/_shared";
import { s4ei, s4eo } from "../../../motion-config";
import type { PanelSection } from "../../../control-item/auto-panel";
import type { MotionSceneModule } from "./types";

const ItemSchema = z.object({ imagePath: z.string().default(""), label: z.string().default(""), appearSec: z.number().default(0), accent: z.boolean().default(false) });
const IW: Record<keyof z.infer<typeof ItemSchema>, WidgetSpec> = { imagePath: { type: "text" }, label: { type: "text" }, appearSec: { type: "number" }, accent: { type: "checkbox" } };
const ContentSchema = z.object({ bgColor: z.string().default("#0A0B0A") });
const CW: Record<keyof z.infer<typeof ContentSchema>, WidgetSpec> = { bgColor: { type: "color" } };
const KEYS = ["item1", "item2", "item3", "item4", "item5", "item6"] as const;
const RawSchema = z.object({
  bgColor: z.string().optional(),
  item1: ItemSchema.partial().optional(), item2: ItemSchema.partial().optional(), item3: ItemSchema.partial().optional(),
  item4: ItemSchema.partial().optional(), item5: ItemSchema.partial().optional(), item6: ItemSchema.partial().optional(),
});
type Item = z.infer<typeof ItemSchema>;
type Meta = { content: z.infer<typeof ContentSchema>; items: Item[] };
function parseMeta(m: unknown): Meta {
  const raw = RawSchema.safeParse(m ?? {});
  const d = (raw.success ? raw.data : {}) as Record<string, unknown>;
  const items = KEYS.filter((k) => d[k] != null).map((k) => ItemSchema.parse(d[k] ?? {})).filter((it) => it.imagePath.trim() || it.label.trim());
  return { content: ContentSchema.parse({ bgColor: d.bgColor }), items };
}
function src(p: string): string { return /^(https?:)?\/\//.test(p) || p.startsWith("/") ? p : staticFile(p); }
function Component({ f, fps, durationInFrames, data }: { f: number; fps: number; durationInFrames: number; data: Meta }) {
  const dur = durationInFrames / fps;
  const outOp = s4eo(f, Math.max(0, dur - 0.4), dur);
  const cols = data.items.length > 4 ? 3 : Math.max(1, Math.min(3, data.items.length));
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: data.content.bgColor,
      display: "flex", alignItems: "center", justifyContent: "center", padding: "0 8%", opacity: outOp }}>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 30, placeItems: "center" }}>
        {data.items.map((it, i) => {
          const pop = s4ei(f, it.appearSec, it.appearSec + 0.3);
          const ring = it.accent ? "#00FF41" : "#2D3D33";
          return (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, opacity: pop, transform: `scale(${0.85 + 0.15 * pop})` }}>
              <div style={{ width: 180, height: 180, borderRadius: 28, border: `3px solid ${ring}`, overflow: "hidden",
                background: it.imagePath ? "#FFFFFF" : "#101211", display: "flex", alignItems: "center", justifyContent: "center", padding: it.imagePath ? 20 : 8 }}>
                {it.imagePath ? <Img src={src(it.imagePath)} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                  : <span style={{ fontFamily: "Geist, system-ui, sans-serif", fontWeight: 800, fontSize: 34, color: it.accent ? "#00FF41" : "#EDEFEC", textAlign: "center" }}>{it.label}</span>}
              </div>
              {it.imagePath && it.label && <span style={{ fontFamily: "Geist, system-ui, sans-serif", fontWeight: 600, fontSize: 28, color: "#9BA39E" }}>{it.label}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
const panelSections: PanelSection[] = [
  { title: "Content", schema: ContentSchema, widgets: CW },
  { title: "Logos", schema: ItemSchema, widgets: IW, tabs: [...KEYS] },
];
export const toolLogoBurstModule: MotionSceneModule = {
  parseMeta, Component, panelSections,
  defaultMeta: { bgColor: "#0A0B0A",
    item1: { imagePath: "", label: "Hermes", appearSec: 0.2 }, item2: { imagePath: "", label: "Codex", appearSec: 0.6, accent: true },
    item3: { imagePath: "", label: "Cursor", appearSec: 1.0 }, item4: { imagePath: "", label: "Bolt", appearSec: 1.4 } },
};
