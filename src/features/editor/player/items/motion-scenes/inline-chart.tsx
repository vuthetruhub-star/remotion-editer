// motion-scenes/inline-chart.tsx — kind "inline_chart". Line-graph vẽ dần (lower-mid, video vẫn thấy).
import { z } from "zod";
import { type WidgetSpec } from "../schemas/_shared";
import { s4ei, s4eo } from "../../../motion-config";
import type { PanelSection } from "../../../control-item/auto-panel";
import type { MotionSceneModule } from "./types";

const ContentSchema = z.object({
  bgColor: z.string().default("transparent"),
  title:   z.string().default(""),
  data:    z.string().default("40,45,52,60,70,88"), // số phân tách bởi dấu phẩy
  vertical: z.number().default(0.6),
  drawSec: z.number().default(1.2),
});
const CW: Record<keyof z.infer<typeof ContentSchema>, WidgetSpec> = {
  bgColor: { type: "color" }, title: { type: "text" }, data: { type: "text" }, vertical: { type: "slider", min: 0, max: 1, step: 0.01 }, drawSec: { type: "number" },
};
const RawSchema = z.object({ bgColor: z.string().optional(), title: z.string().optional(), data: z.string().optional(), vertical: z.number().optional(), drawSec: z.number().optional() });
type Meta = { content: z.infer<typeof ContentSchema> };
function parseMeta(m: unknown): Meta {
  const raw = RawSchema.safeParse(m ?? {});
  const d = (raw.success ? raw.data : {}) as z.infer<typeof RawSchema>;
  return { content: ContentSchema.parse({ bgColor: d.bgColor, title: d.title, data: d.data, vertical: d.vertical, drawSec: d.drawSec }) };
}
function Component({ f, fps, durationInFrames, data }: { f: number; fps: number; durationInFrames: number; data: Meta }) {
  const dur = durationInFrames / fps;
  const outOp = s4eo(f, Math.max(0, dur - 0.4), dur);
  const nums = data.content.data.split(",").map((s) => parseFloat(s.trim())).filter((n) => !isNaN(n));
  const W = 900, H = 360, PAD = 20;
  const max = Math.max(...nums, 1), min = Math.min(...nums, 0);
  const pts = nums.map((v, i) => {
    const x = PAD + (i / Math.max(1, nums.length - 1)) * (W - 2 * PAD);
    const y = H - PAD - ((v - min) / Math.max(1e-6, max - min)) * (H - 2 * PAD);
    return [x, y] as const;
  });
  const p = s4ei(f, 0.1, 0.1 + Math.max(0.3, data.content.drawSec));
  const clipW = PAD + p * (W - 2 * PAD);
  // dot dẫn đầu tại x hiện tại
  const cx = PAD + p * (W - 2 * PAD);
  let cy = pts.length ? pts[pts.length - 1][1] : H / 2;
  for (let i = 0; i < pts.length - 1; i++) { if (cx >= pts[i][0] && cx <= pts[i + 1][0]) {
    const t = (cx - pts[i][0]) / Math.max(1e-6, pts[i + 1][0] - pts[i][0]); cy = pts[i][1] + t * (pts[i + 1][1] - pts[i][1]); break; } }
  const poly = pts.map((pt) => pt.join(",")).join(" ");
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: data.content.bgColor }}>
      <div style={{ position: "absolute", left: "8%", right: "8%", top: `${data.content.vertical * 100}%`, transform: "translateY(-50%)", opacity: outOp,
        background: "rgba(16,18,17,0.9)", border: "1px solid #1F2A23", borderRadius: 16, padding: "28px 30px" }}>
        {data.content.title && <div style={{ fontFamily: "Geist, system-ui, sans-serif", fontWeight: 600, fontSize: 32, color: "#EDEFEC", marginBottom: 14 }}>{data.content.title}</div>}
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
          <clipPath id="ic-clip"><rect x="0" y="0" width={clipW} height={H} /></clipPath>
          <polyline points={poly} fill="none" stroke="#00FF41" strokeWidth={6} strokeLinejoin="round" strokeLinecap="round" clipPath="url(#ic-clip)" />
          <circle cx={cx} cy={cy} r={10} fill="#00FF41" />
        </svg>
      </div>
    </div>
  );
}
const panelSections: PanelSection[] = [{ title: "Content", schema: ContentSchema, widgets: CW }];
export const inlineChartModule: MotionSceneModule = {
  parseMeta, Component, panelSections,
  defaultMeta: { bgColor: "transparent", title: "Tokens re-read per message", data: "40,45,52,60,70,88", vertical: 0.6, drawSec: 1.2 },
};
