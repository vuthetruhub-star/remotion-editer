// motion-scenes/progress-steps.tsx — kind "progress_steps". Chuỗi bước đánh số, fill lime khi tới. Chroma-safe.
import { z } from "zod";
import { type WidgetSpec } from "../schemas/_shared";
import { s4ei, s4eo } from "../../../motion-config";
import type { PanelSection } from "../../../control-item/auto-panel";
import type { MotionSceneModule } from "./types";

const StepSchema = z.object({ label: z.string().default(""), appearSec: z.number().default(0) });
const SW: Record<keyof z.infer<typeof StepSchema>, WidgetSpec> = { label: { type: "text" }, appearSec: { type: "number" } };
const ContentSchema = z.object({ bgColor: z.string().default("#0A0B0A") });
const CW: Record<keyof z.infer<typeof ContentSchema>, WidgetSpec> = { bgColor: { type: "color" } };
const KEYS = ["step1", "step2", "step3", "step4", "step5"] as const;
const RawSchema = z.object({
  bgColor: z.string().optional(),
  step1: StepSchema.partial().optional(), step2: StepSchema.partial().optional(), step3: StepSchema.partial().optional(),
  step4: StepSchema.partial().optional(), step5: StepSchema.partial().optional(),
});
type Step = z.infer<typeof StepSchema>;
type Meta = { content: z.infer<typeof ContentSchema>; steps: Step[] };
function parseMeta(m: unknown): Meta {
  const raw = RawSchema.safeParse(m ?? {});
  const d = (raw.success ? raw.data : {}) as Record<string, unknown>;
  const steps = KEYS.map((k) => StepSchema.parse(d[k] ?? {})).filter((s) => s.label.trim().length > 0).sort((a, b) => a.appearSec - b.appearSec);
  return { content: ContentSchema.parse({ bgColor: d.bgColor }), steps };
}
function Component({ f, fps, durationInFrames, data }: { f: number; fps: number; durationInFrames: number; data: Meta }) {
  const dur = durationInFrames / fps;
  const outOp = s4eo(f, Math.max(0, dur - 0.4), dur);
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: data.content.bgColor,
      display: "flex", flexDirection: "column", alignItems: "stretch", justifyContent: "center", gap: 22, padding: "0 10%", opacity: outOp }}>
      {data.steps.map((s, i) => {
        const fill = s4ei(f, s.appearSec, s.appearSec + 0.4);
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 24, opacity: 0.4 + 0.6 * fill }}>
            <div style={{ width: 72, height: 72, borderRadius: 16, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
              background: `linear-gradient(90deg, #00FF41 ${fill * 100}%, #161A18 ${fill * 100}%)`,
              fontFamily: "Geist, system-ui, sans-serif", fontWeight: 800, fontSize: 38, color: fill > 0.5 ? "#0A0B0A" : "#EDEFEC" }}>{i + 1}</div>
            <div style={{ fontFamily: "Geist, system-ui, sans-serif", fontWeight: 600, fontSize: 46, color: "#EDEFEC" }}>{s.label}</div>
          </div>
        );
      })}
    </div>
  );
}
const panelSections: PanelSection[] = [
  { title: "Content", schema: ContentSchema, widgets: CW },
  { title: "Steps", schema: StepSchema, widgets: SW, tabs: [...KEYS] },
];
export const progressStepsModule: MotionSceneModule = {
  parseMeta, Component, panelSections,
  defaultMeta: { bgColor: "#0A0B0A", step1: { label: "Record", appearSec: 0.2 }, step2: { label: "Transcribe", appearSec: 1.0 }, step3: { label: "Plan", appearSec: 1.8 }, step4: { label: "Render", appearSec: 2.6 } },
};
