// motion-scenes/keyword_chips.tsx — kind "keyword_chips". Pill tag pop dần. (Taste: KHÔNG hợp Short — chip có nền.)
import { z } from "zod";
import { type WidgetSpec } from "../schemas/_shared";
import { s4ei, s4eo } from "../../../motion-config";
import type { PanelSection } from "../../../control-item/auto-panel";
import type { MotionSceneModule } from "./types";

const ContentSchema = z.object({
  bgColor: z.string().default("#0A0B0A"),
  chips:   z.string().default("Hermes, Codex, Cursor, Bolt, Replit, v0"), // phân tách bởi dấu phẩy
  active:  z.string().default("Codex"), // chip nào tô lime
});
const CW: Record<keyof z.infer<typeof ContentSchema>, WidgetSpec> = {
  bgColor: { type: "color" }, chips: { type: "text" }, active: { type: "text" },
};
const RawSchema = z.object({ bgColor: z.string().optional(), chips: z.string().optional(), active: z.string().optional() });
type Meta = { content: z.infer<typeof ContentSchema> };
function parseMeta(m: unknown): Meta {
  const raw = RawSchema.safeParse(m ?? {});
  const d = (raw.success ? raw.data : {}) as z.infer<typeof RawSchema>;
  return { content: ContentSchema.parse({ bgColor: d.bgColor, chips: d.chips, active: d.active }) };
}
function Component({ f, fps, durationInFrames, data }: { f: number; fps: number; durationInFrames: number; data: Meta }) {
  const dur = durationInFrames / fps;
  const outOp = s4eo(f, Math.max(0, dur - 0.4), dur);
  const chips = data.content.chips.split(",").map((s) => s.trim()).filter(Boolean);
  const active = data.content.active.trim().toLowerCase();
  const per = Math.min(0.16, (dur * 0.6) / Math.max(1, chips.length));
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: data.content.bgColor,
      display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: 22, padding: "0 8%" }}>
      {chips.map((chip, i) => {
        const inAt = i * per; const inp = s4ei(f, inAt, inAt + 0.3);
        const isActive = chip.toLowerCase() === active;
        return (
          <span key={i} style={{ fontFamily: "Geist, system-ui, sans-serif", fontWeight: 600, fontSize: 48,
            padding: "16px 34px", borderRadius: 999, opacity: Math.min(inp, outOp), transform: `scale(${0.9 + 0.1 * inp})`,
            background: isActive ? "#00FF41" : "#161A18", color: isActive ? "#0A0B0A" : "#EDEFEC",
            border: `2px solid ${isActive ? "#00FF41" : "#2D3D33"}` }}>{chip}</span>
        );
      })}
    </div>
  );
}
const panelSections: PanelSection[] = [{ title: "Content", schema: ContentSchema, widgets: CW }];
export const keywordChipsModule: MotionSceneModule = {
  parseMeta, Component, panelSections,
  defaultMeta: { bgColor: "#0A0B0A", chips: "Hermes, Codex, Cursor, Bolt, Replit, v0", active: "Codex" },
};
