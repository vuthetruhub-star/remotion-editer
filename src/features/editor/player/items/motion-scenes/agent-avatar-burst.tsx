// motion-scenes/agent-avatar-burst.tsx — kind "agent_avatar_burst". Avatar robot pop, dim+X khi bị cull. Chroma-safe.
import { z } from "zod";
import { type WidgetSpec } from "../schemas/_shared";
import { s4ei, s4eo } from "../../../motion-config";
import type { PanelSection } from "../../../control-item/auto-panel";
import type { MotionSceneModule } from "./types";

const ItemSchema = z.object({ label: z.string().default(""), appearSec: z.number().default(0), dimAt: z.number().default(-1), kept: z.boolean().default(false) });
const IW: Record<keyof z.infer<typeof ItemSchema>, WidgetSpec> = { label: { type: "text" }, appearSec: { type: "number" }, dimAt: { type: "number" }, kept: { type: "checkbox" } };
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
  // một avatar cho mỗi slot được khai (label có thể rỗng — robot không tên)
  const items = KEYS.filter((k) => d[k] != null).map((k) => ItemSchema.parse(d[k] ?? {}));
  return { content: ContentSchema.parse({ bgColor: d.bgColor }), items };
}
function Robot({ color }: { color: string }) {
  return (
    <svg width="120" height="120" viewBox="0 0 100 100" fill="none">
      <rect x="22" y="28" width="56" height="46" rx="12" fill="#101211" stroke={color} strokeWidth="4" />
      <circle cx="38" cy="50" r="7" fill={color} /><circle cx="62" cy="50" r="7" fill={color} />
      <rect x="42" y="64" width="16" height="4" rx="2" fill={color} />
      <line x1="50" y1="28" x2="50" y2="16" stroke={color} strokeWidth="4" /><circle cx="50" cy="13" r="5" fill={color} />
    </svg>
  );
}
function Component({ f, fps, durationInFrames, data }: { f: number; fps: number; durationInFrames: number; data: Meta }) {
  const dur = durationInFrames / fps;
  const t = f / fps;
  const outOp = s4eo(f, Math.max(0, dur - 0.4), dur);
  const cols = data.items.length > 4 ? 3 : 2;
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: data.content.bgColor,
      display: "flex", alignItems: "center", justifyContent: "center", padding: "0 8%", opacity: outOp }}>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 40, placeItems: "center" }}>
        {data.items.map((it, i) => {
          const pop = s4ei(f, it.appearSec, it.appearSec + 0.3);
          const dimmed = it.dimAt >= 0 && t >= it.dimAt;
          const color = it.kept ? "#00FF41" : dimmed ? "#EF4444" : "#9BA39E";
          return (
            <div key={i} style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
              opacity: pop * (dimmed ? 0.5 : 1), transform: `scale(${0.85 + 0.15 * pop})` }}>
              <Robot color={color} />
              {dimmed && <span style={{ position: "absolute", top: 20, fontSize: 72, color: "#EF4444", fontWeight: 800 }}>✕</span>}
              {it.label && <span style={{ fontFamily: "Geist, system-ui, sans-serif", fontWeight: 600, fontSize: 30, color: it.kept ? "#00FF41" : "#EDEFEC" }}>{it.label}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
const panelSections: PanelSection[] = [
  { title: "Content", schema: ContentSchema, widgets: CW },
  { title: "Agents", schema: ItemSchema, widgets: IW, tabs: [...KEYS] },
];
export const agentAvatarBurstModule: MotionSceneModule = {
  parseMeta, Component, panelSections,
  defaultMeta: { bgColor: "#0A0B0A",
    item1: { label: "kept", appearSec: 0.2, kept: true }, item2: { label: "", appearSec: 0.5, dimAt: 1.6 },
    item3: { label: "", appearSec: 0.8, dimAt: 1.6 }, item4: { label: "", appearSec: 1.1, dimAt: 1.6 } },
};
