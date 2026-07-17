// motion-scenes/command-deck.tsx — kind "command_deck". Control panel: tile boot dần. Chroma-safe.
import { z } from "zod";
import { type WidgetSpec } from "../schemas/_shared";
import { s4ei, s4eo } from "../../../motion-config";
import type { PanelSection } from "../../../control-item/auto-panel";
import type { MotionSceneModule } from "./types";

const TileSchema = z.object({ label: z.string().default(""), appearSec: z.number().default(0) });
const TW: Record<keyof z.infer<typeof TileSchema>, WidgetSpec> = { label: { type: "text" }, appearSec: { type: "number" } };
const ContentSchema = z.object({ bgColor: z.string().default("#0A0B0A"), title: z.string().default("AI OS · BOOTING") });
const CW: Record<keyof z.infer<typeof ContentSchema>, WidgetSpec> = { bgColor: { type: "color" }, title: { type: "text" } };
const KEYS = ["tile1", "tile2", "tile3", "tile4", "tile5", "tile6"] as const;
const RawSchema = z.object({
  bgColor: z.string().optional(), title: z.string().optional(),
  tile1: TileSchema.partial().optional(), tile2: TileSchema.partial().optional(), tile3: TileSchema.partial().optional(),
  tile4: TileSchema.partial().optional(), tile5: TileSchema.partial().optional(), tile6: TileSchema.partial().optional(),
});
type Tile = z.infer<typeof TileSchema>;
type Meta = { content: z.infer<typeof ContentSchema>; tiles: Tile[] };
function parseMeta(m: unknown): Meta {
  const raw = RawSchema.safeParse(m ?? {});
  const d = (raw.success ? raw.data : {}) as Record<string, unknown>;
  const tiles = KEYS.map((k) => TileSchema.parse(d[k] ?? {})).filter((t) => t.label.trim().length > 0);
  return { content: ContentSchema.parse({ bgColor: d.bgColor, title: d.title }), tiles };
}
function Component({ f, fps, durationInFrames, data }: { f: number; fps: number; durationInFrames: number; data: Meta }) {
  const dur = durationInFrames / fps;
  const outOp = s4eo(f, Math.max(0, dur - 0.4), dur);
  const t = f / fps;
  const cols = data.tiles.length > 4 ? 3 : 2;
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: data.content.bgColor,
      display: "flex", flexDirection: "column", justifyContent: "center", gap: 40, padding: "0 7%", opacity: outOp }}>
      <div style={{ fontFamily: "Geist Mono, monospace", fontSize: 34, letterSpacing: 3, color: "#00FF41", textAlign: "center" }}>{data.content.title}</div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 20 }}>
        {data.tiles.map((tile, i) => {
          const inp = s4ei(f, tile.appearSec, tile.appearSec + 0.3);
          const active = t >= tile.appearSec + 0.5;
          return (
            <div key={i} style={{ background: "#101211", border: `1px solid ${active ? "#00FF41" : "#1F2A23"}`, borderRadius: 14, padding: "28px 22px",
              opacity: inp, transform: `scale(${0.92 + 0.08 * inp})`, display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ fontFamily: "Geist, system-ui, sans-serif", fontWeight: 700, fontSize: 38, color: "#EDEFEC" }}>{tile.label}</div>
              <div style={{ fontFamily: "Geist Mono, monospace", fontSize: 24, color: active ? "#00FF41" : "#5C6560" }}>{active ? "● ACTIVE" : "booting…"}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
const panelSections: PanelSection[] = [
  { title: "Content", schema: ContentSchema, widgets: CW },
  { title: "Tiles", schema: TileSchema, widgets: TW, tabs: [...KEYS] },
];
export const commandDeckModule: MotionSceneModule = {
  parseMeta, Component, panelSections,
  defaultMeta: { bgColor: "#0A0B0A", title: "AI OS · BOOTING",
    tile1: { label: "Sales", appearSec: 0.2 }, tile2: { label: "Support", appearSec: 0.7 }, tile3: { label: "Ops", appearSec: 1.2 }, tile4: { label: "Content", appearSec: 1.7 } },
};
