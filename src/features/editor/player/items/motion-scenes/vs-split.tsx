// motion-scenes/vs-split.tsx — kind "vs_split". Panel trên/dưới tương phản. (Taste: TRÁNH trên Short.)
import { z } from "zod";
import { type WidgetSpec } from "../schemas/_shared";
import { s4ei, s4eo } from "../../../motion-config";
import type { PanelSection } from "../../../control-item/auto-panel";
import type { MotionSceneModule } from "./types";

const ContentSchema = z.object({
  bgColor: z.string().default("#0A0B0A"),
  topLabel: z.string().default("OLD WAY"), topItems: z.string().default("Hire a VA, Train 4 weeks, Manage daily"),
  bottomLabel: z.string().default("NEW WAY"), bottomItems: z.string().default("One AI routine, 40 lines, Runs forever"),
  winner: z.enum(["none", "top", "bottom"]).default("bottom"),
});
const CW: Record<keyof z.infer<typeof ContentSchema>, WidgetSpec> = {
  bgColor: { type: "color" }, topLabel: { type: "text" }, topItems: { type: "text" }, bottomLabel: { type: "text" }, bottomItems: { type: "text" }, winner: { type: "select", options: ["none", "top", "bottom"] },
};
const RawSchema = z.object({ bgColor: z.string().optional(), topLabel: z.string().optional(), topItems: z.string().optional(), bottomLabel: z.string().optional(), bottomItems: z.string().optional(), winner: z.enum(["none", "top", "bottom"]).optional() });
type Meta = { content: z.infer<typeof ContentSchema> };
function parseMeta(m: unknown): Meta {
  const raw = RawSchema.safeParse(m ?? {});
  const d = (raw.success ? raw.data : {}) as z.infer<typeof RawSchema>;
  return { content: ContentSchema.parse({ bgColor: d.bgColor, topLabel: d.topLabel, topItems: d.topItems, bottomLabel: d.bottomLabel, bottomItems: d.bottomItems, winner: d.winner }) };
}
function Panel({ label, items, win, inp, dark }: { label: string; items: string[]; win: boolean; inp: number; dark: boolean }) {
  return (
    <div style={{ flex: 1, background: dark ? "#101211" : "#0A0B0A", borderTop: win ? "4px solid #00FF41" : "4px solid transparent",
      display: "flex", flexDirection: "column", justifyContent: "center", gap: 18, padding: "0 9%", opacity: inp }}>
      <div style={{ fontFamily: "Geist, system-ui, sans-serif", fontWeight: 800, fontSize: 52, letterSpacing: 2, color: win ? "#00FF41" : "#9BA39E" }}>{label}</div>
      {items.map((it, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, fontFamily: "Geist, system-ui, sans-serif", fontWeight: 500, fontSize: 40, color: "#EDEFEC" }}>
          <span style={{ color: win ? "#00FF41" : "#5C6560" }}>{win ? "✓" : "•"}</span>{it}
        </div>
      ))}
    </div>
  );
}
function Component({ f, fps, durationInFrames, data }: { f: number; fps: number; durationInFrames: number; data: Meta }) {
  const dur = durationInFrames / fps;
  const outOp = s4eo(f, Math.max(0, dur - 0.4), dur);
  const topIn = s4ei(f, 0, 0.4), botIn = s4ei(f, 0.25, 0.65);
  const c = data.content;
  const top = c.topItems.split(",").map((s) => s.trim()).filter(Boolean);
  const bot = c.bottomItems.split(",").map((s) => s.trim()).filter(Boolean);
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: c.bgColor, display: "flex", flexDirection: "column", opacity: outOp }}>
      <Panel label={c.topLabel} items={top} win={c.winner === "top"} inp={topIn} dark={false} />
      <div style={{ height: 4, background: "#1F2A23" }} />
      <Panel label={c.bottomLabel} items={bot} win={c.winner === "bottom"} inp={botIn} dark />
    </div>
  );
}
const panelSections: PanelSection[] = [{ title: "Content", schema: ContentSchema, widgets: CW }];
export const vsSplitModule: MotionSceneModule = {
  parseMeta, Component, panelSections,
  defaultMeta: { bgColor: "#0A0B0A", topLabel: "OLD WAY", topItems: "Hire a VA, Train 4 weeks, Manage daily", bottomLabel: "NEW WAY", bottomItems: "One AI routine, 40 lines, Runs forever", winner: "bottom" },
};
