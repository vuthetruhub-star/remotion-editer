// motion-scenes/horizontal-timeline.tsx — kind "horizontal_timeline". Rail ngang, node pop tuần tự. Chroma-safe.
import { z } from "zod";
import { type WidgetSpec } from "../schemas/_shared";
import { s4ei, s4eo } from "../../../motion-config";
import type { PanelSection } from "../../../control-item/auto-panel";
import type { MotionSceneModule } from "./types";

const StepSchema = z.object({ heading: z.string().default(""), appearSec: z.number().default(0) });
const SW: Record<keyof z.infer<typeof StepSchema>, WidgetSpec> = { heading: { type: "text" }, appearSec: { type: "number" } };
const ContentSchema = z.object({ bgColor: z.string().default("#0A0B0A"), title: z.string().default("") });
const CW: Record<keyof z.infer<typeof ContentSchema>, WidgetSpec> = { bgColor: { type: "color" }, title: { type: "text" } };
const KEYS = ["step1", "step2", "step3", "step4"] as const;
const RawSchema = z.object({
  bgColor: z.string().optional(), title: z.string().optional(),
  step1: StepSchema.partial().optional(), step2: StepSchema.partial().optional(), step3: StepSchema.partial().optional(), step4: StepSchema.partial().optional(),
});
type Step = z.infer<typeof StepSchema>;
type Meta = { content: z.infer<typeof ContentSchema>; steps: Step[] };
function parseMeta(m: unknown): Meta {
  const raw = RawSchema.safeParse(m ?? {});
  const d = (raw.success ? raw.data : {}) as Record<string, unknown>;
  const steps = KEYS.map((k) => StepSchema.parse(d[k] ?? {})).filter((s) => s.heading.trim().length > 0).sort((a, b) => a.appearSec - b.appearSec);
  return { content: ContentSchema.parse({ bgColor: d.bgColor, title: d.title }), steps };
}
function Component({ f, fps, durationInFrames, data }: { f: number; fps: number; durationInFrames: number; data: Meta }) {
  const dur = durationInFrames / fps;
  const outOp = s4eo(f, Math.max(0, dur - 0.4), dur);
  const n = data.steps.length;
  const first = data.steps[0]?.appearSec ?? 0, last = data.steps[n - 1]?.appearSec ?? first;
  const railProg = n <= 1 ? 1 : s4ei(f, first, Math.max(first + 0.3, last));
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: data.content.bgColor,
      display: "flex", flexDirection: "column", justifyContent: "center", gap: 60, padding: "0 8%", opacity: outOp }}>
      {data.content.title && <div style={{ fontFamily: "Geist, system-ui, sans-serif", fontWeight: 700, fontSize: 48, color: "#EDEFEC", textAlign: "center" }}>{data.content.title}</div>}
      <div style={{ position: "relative", height: 220 }}>
        {/* rail ngang: scaleX từ trái */}
        <div style={{ position: "absolute", top: 30, left: "6%", width: "88%", height: 4, background: "#00FF41", transformOrigin: "left", transform: `scaleX(${railProg})`, borderRadius: 2 }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", justifyContent: "space-between", padding: "0 6%" }}>
          {data.steps.map((s, i) => {
            const pop = s4ei(f, s.appearSec, s.appearSec + 0.3);
            return (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, width: `${100 / Math.max(1, n)}%` }}>
                <div style={{ width: 34, height: 34, borderRadius: 999, background: "#00FF41", transform: `scale(${pop})`, opacity: pop }} />
                <div style={{ fontFamily: "Geist, system-ui, sans-serif", fontWeight: 600, fontSize: 34, color: "#EDEFEC", textAlign: "center", opacity: pop }}>{s.heading}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
const panelSections: PanelSection[] = [
  { title: "Content", schema: ContentSchema, widgets: CW },
  { title: "Steps", schema: StepSchema, widgets: SW, tabs: [...KEYS] },
];
export const horizontalTimelineModule: MotionSceneModule = {
  parseMeta, Component, panelSections,
  defaultMeta: { bgColor: "#0A0B0A", title: "Roadmap",
    step1: { heading: "Record", appearSec: 0.3 }, step2: { heading: "Edit", appearSec: 1.2 }, step3: { heading: "Ship", appearSec: 2.1 } },
};
