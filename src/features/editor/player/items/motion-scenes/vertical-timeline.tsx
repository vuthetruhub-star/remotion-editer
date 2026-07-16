// motion-scenes/vertical-timeline.tsx — kind "vertical_timeline".
// Rail dọc vẽ dần (scaleY, KHÔNG animate height/top), dot pop ở appearSec, heading fade.
// Chroma-safe. Vị trí layout tĩnh; chỉ transform + opacity animate.
import { z } from "zod";
import { type WidgetSpec } from "../schemas/_shared";
import { s4ei } from "../../../motion-config";
import type { PanelSection } from "../../../control-item/auto-panel";
import type { MotionSceneModule } from "./types";

const StepSchema = z.object({
  heading:   z.string().default(""),
  appearSec: z.number().default(0),
});
const STEP_WIDGETS: Record<keyof z.infer<typeof StepSchema>, WidgetSpec> = {
  heading:   { type: "text" },
  appearSec: { type: "number" },
};

const ContentSchema = z.object({
  bgColor: z.string().default("transparent"),
});
const CONTENT_WIDGETS: Record<keyof z.infer<typeof ContentSchema>, WidgetSpec> = {
  bgColor: { type: "color" },
};

const STEP_KEYS = ["step1", "step2", "step3", "step4"] as const;

const RawSchema = z.object({
  bgColor: z.string().optional(),
  step1: StepSchema.partial().optional(),
  step2: StepSchema.partial().optional(),
  step3: StepSchema.partial().optional(),
  step4: StepSchema.partial().optional(),
});

type Step = z.infer<typeof StepSchema>;
type Meta = { content: z.infer<typeof ContentSchema>; steps: Step[] };

function parseMeta(metadata: unknown): Meta {
  const raw = RawSchema.safeParse(metadata ?? {});
  const d = (raw.success ? raw.data : {}) as Record<string, unknown>;
  const steps = STEP_KEYS
    .map((k) => StepSchema.parse(d[k] ?? {}))
    .filter((s) => s.heading.trim().length > 0)
    .sort((a, b) => a.appearSec - b.appearSec);
  return { content: ContentSchema.parse({ bgColor: d.bgColor }), steps };
}

const yFrac = (i: number, n: number) => (n <= 1 ? 0.5 : 0.28 + i * (0.44 / (n - 1)));

function Component({ f, fps, data }: { f: number; fps: number; durationInFrames: number; data: Meta }) {
  const { steps } = data;
  const n = steps.length;
  const railTop = yFrac(0, n);
  const railBottom = yFrac(n - 1, n);
  const first = steps[0]?.appearSec ?? 0;
  const last = steps[n - 1]?.appearSec ?? first;
  const railProg = n <= 1 ? 1 : s4ei(f, first, Math.max(first + 0.3, last));

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: data.content.bgColor }}>
      {/* rail — chiều cao TĨNH, chỉ scaleY animate (transform-origin top) */}
      {n > 1 && (
        <div style={{
          position: "absolute", left: "27%", top: `${railTop * 100}%`,
          width: 4, height: `${(railBottom - railTop) * 100}%`, background: "#00FF41",
          transformOrigin: "top", transform: `scaleY(${railProg})`, borderRadius: 2,
        }} />
      )}
      {steps.map((s, i) => {
        const pop = s4ei(f, s.appearSec, s.appearSec + 0.3);
        const textIn = s4ei(f, s.appearSec + 0.05, s.appearSec + 0.4);
        return (
          <div key={i}>
            <div style={{
              position: "absolute", left: "27%", top: `${yFrac(i, n) * 100}%`,
              width: 26, height: 26, marginLeft: -13, marginTop: -13, borderRadius: "50%",
              background: "#00FF41", transform: `scale(${pop})`, opacity: pop,
            }} />
            <div style={{
              position: "absolute", left: "34%", top: `${yFrac(i, n) * 100}%`, maxWidth: "58%",
              transform: `translate(${18 * (1 - textIn)}px, -50%)`, opacity: textIn,
              fontFamily: "Geist, system-ui, sans-serif", fontWeight: 600, fontSize: 48, color: "#FFFFFF",
              textShadow: "0 2px 14px rgba(0,0,0,0.5)",
            }}>{s.heading}</div>
          </div>
        );
      })}
    </div>
  );
}

const panelSections: PanelSection[] = [
  { title: "Content", schema: ContentSchema, widgets: CONTENT_WIDGETS },
  { title: "Steps",   schema: StepSchema,    widgets: STEP_WIDGETS, tabs: [...STEP_KEYS] },
];

export const verticalTimelineModule: MotionSceneModule = {
  parseMeta,
  Component,
  panelSections,
  defaultMeta: {
    bgColor: "#0A0B0A",
    step1: { heading: "Model routing", appearSec: 0.3 },
    step2: { heading: "/compact at 60%", appearSec: 1.2 },
    step3: { heading: "CLAUDE.md < 1k tokens", appearSec: 2.1 },
    step4: { heading: "2-hour timer", appearSec: 3.0 },
  },
};
