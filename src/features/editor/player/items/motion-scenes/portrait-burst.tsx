// motion-scenes/portrait_burst.tsx — kind "portrait_burst". Ảnh chân dung tròn + vòng lime + tên.
import { z } from "zod";
import { Img, staticFile } from "remotion";
import { type WidgetSpec } from "../schemas/_shared";
import { s4ei, s4eo } from "../../../motion-config";
import type { PanelSection } from "../../../control-item/auto-panel";
import type { MotionSceneModule } from "./types";

const ItemSchema = z.object({ imagePath: z.string().default(""), label: z.string().default(""), appearSec: z.number().default(0) });
const IW: Record<keyof z.infer<typeof ItemSchema>, WidgetSpec> = { imagePath: { type: "text" }, label: { type: "text" }, appearSec: { type: "number" } };
const ContentSchema = z.object({ bgColor: z.string().default("#0A0B0A") });
const CW: Record<keyof z.infer<typeof ContentSchema>, WidgetSpec> = { bgColor: { type: "color" } };
const KEYS = ["item1", "item2", "item3"] as const;
const RawSchema = z.object({
  bgColor: z.string().optional(),
  item1: ItemSchema.partial().optional(), item2: ItemSchema.partial().optional(), item3: ItemSchema.partial().optional(),
});
type Item = z.infer<typeof ItemSchema>;
type Meta = { content: z.infer<typeof ContentSchema>; items: Item[] };
function parseMeta(m: unknown): Meta {
  const raw = RawSchema.safeParse(m ?? {});
  const d = (raw.success ? raw.data : {}) as Record<string, unknown>;
  const items = KEYS.filter((k) => d[k] != null).map((k) => ItemSchema.parse(d[k] ?? {}));
  return { content: ContentSchema.parse({ bgColor: d.bgColor }), items };
}
function src(p: string): string { return /^(https?:)?\/\//.test(p) || p.startsWith("/") ? p : staticFile(p); }
function Component({ f, fps, durationInFrames, data }: { f: number; fps: number; durationInFrames: number; data: Meta }) {
  const dur = durationInFrames / fps;
  const outOp = s4eo(f, Math.max(0, dur - 0.4), dur);
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: data.content.bgColor,
      display: "flex", alignItems: "center", justifyContent: "center", gap: 50, padding: "0 6%", opacity: outOp }}>
      {data.items.map((it, i) => {
        const pop = s4ei(f, it.appearSec, it.appearSec + 0.3);
        return (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, opacity: pop, transform: `scale(${0.85 + 0.15 * pop})` }}>
            <div style={{ width: 260, height: 260, borderRadius: 999, border: "5px solid #00FF41", overflow: "hidden", background: "#101211", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {it.imagePath ? <Img src={src(it.imagePath)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <span style={{ fontFamily: "Geist Mono, monospace", fontSize: 26, color: "#5C6560", textAlign: "center", padding: 10 }}>imagePath</span>}
            </div>
            {it.label && <span style={{ fontFamily: "Geist, system-ui, sans-serif", fontWeight: 700, fontSize: 40, color: "#EDEFEC" }}>{it.label}</span>}
          </div>
        );
      })}
    </div>
  );
}
const panelSections: PanelSection[] = [
  { title: "Content", schema: ContentSchema, widgets: CW },
  { title: "People", schema: ItemSchema, widgets: IW, tabs: [...KEYS] },
];
export const portraitBurstModule: MotionSceneModule = {
  parseMeta, Component, panelSections,
  defaultMeta: { bgColor: "#0A0B0A", item1: { imagePath: "", label: "Sam Altman", appearSec: 0.2 }, item2: { imagePath: "", label: "Dario Amodei", appearSec: 0.9 } },
};
