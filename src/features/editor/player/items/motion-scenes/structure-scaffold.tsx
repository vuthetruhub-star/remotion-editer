// motion-scenes/structure-scaffold.tsx — kind "structure_scaffold".
// "Mục lục" cấu trúc build dần bên phải: mỗi hàng = nhãn + thanh MÀU (hoặc spinner "open loop"),
// hiện ở appearSec rồi TÍCH LUỸ. Optional: thanh progress đáy (Hook→CTA) sáng dần theo tiến trình.
// Học từ IG reel DambEp1igDW. Đa-màu theo VAI TRÒ (bỏ luật 1-lime cho nội dung explainer/cấu trúc).
// Chroma-safe: chỉ màu ĐẶC + transform/opacity; spinner = arc viền đặc xoay bằng transform (không blur).
import { z } from "zod";
import { type WidgetSpec } from "../schemas/_shared";
import { s4ei } from "../../../motion-config";
import type { PanelSection } from "../../../control-item/auto-panel";
import type { MotionSceneModule } from "./types";

const RowSchema = z.object({
  label:     z.string().default(""),
  color:     z.string().default("#00FF41"),
  spinner:   z.boolean().default(false), // true = "open loop" (arc xoay) thay cho thanh
  len:       z.number().default(0.9),     // độ dài thanh, 0..1 theo bề rộng cột
  appearSec: z.number().default(0),
});
const ROW_W: Record<keyof z.infer<typeof RowSchema>, WidgetSpec> = {
  label:     { type: "text" },
  color:     { type: "color" },
  spinner:   { type: "checkbox" },
  len:       { type: "slider", min: 0.1, max: 1, step: 0.01 },
  appearSec: { type: "number" },
};

const ContentSchema = z.object({
  bgColor:    z.string().default("transparent"),
  side:       z.enum(["right", "left"]).default("right"),
  track:      z.string().default(""), // thanh progress đáy: "Hook,Lead,Body 1,Body 2,Body 3,CTA"
  trackColor: z.string().default("#FFFFFF"),
});
const CONTENT_W: Record<keyof z.infer<typeof ContentSchema>, WidgetSpec> = {
  bgColor:    { type: "color" },
  side:       { type: "select", options: ["right", "left"] },
  track:      { type: "text" },
  trackColor: { type: "color" },
};

const ROW_KEYS = ["row1", "row2", "row3", "row4", "row5", "row6", "row7", "row8"] as const;
const RawSchema = z.object({
  bgColor: z.string().optional(), side: z.enum(["right", "left"]).optional(),
  track: z.string().optional(), trackColor: z.string().optional(),
  row1: RowSchema.partial().optional(), row2: RowSchema.partial().optional(),
  row3: RowSchema.partial().optional(), row4: RowSchema.partial().optional(),
  row5: RowSchema.partial().optional(), row6: RowSchema.partial().optional(),
  row7: RowSchema.partial().optional(), row8: RowSchema.partial().optional(),
});

type Row = z.infer<typeof RowSchema>;
type Meta = { content: z.infer<typeof ContentSchema>; rows: Row[] };

function parseMeta(m: unknown): Meta {
  const raw = RawSchema.safeParse(m ?? {});
  const d = (raw.success ? raw.data : {}) as Record<string, unknown>;
  const rows = ROW_KEYS.map((k) => RowSchema.parse(d[k] ?? {})).filter((r) => r.label.trim().length > 0);
  return {
    content: ContentSchema.parse({ bgColor: d.bgColor, side: d.side, track: d.track, trackColor: d.trackColor }),
    rows,
  };
}

const FONT = "Geist, system-ui, sans-serif";
const STROKE = { WebkitTextStroke: "1px rgba(0,0,0,0.5)", paintOrder: "stroke fill" as const };

function Component({ f, fps, durationInFrames, data }: { f: number; fps: number; durationInFrames: number; data: Meta }) {
  const { rows, content } = data;
  const alignRight = content.side === "right";
  const spin = (f / fps) * 360; // spinner xoay liên tục (transform-only, chroma-safe)
  const segs = content.track.split(",").map((s) => s.trim()).filter(Boolean);
  const prog = durationInFrames > 0 ? f / durationInFrames : 0;
  const filled = Math.round(prog * segs.length);

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: content.bgColor, fontFamily: FONT }}>
      {/* outline mục lục — tích luỹ */}
      <div style={{
        position: "absolute", top: "6%", width: "52%",
        right: alignRight ? "6%" : undefined, left: alignRight ? undefined : "6%",
        display: "flex", flexDirection: "column", gap: 20,
      }}>
        {rows.map((r, i) => {
          const inp = s4ei(f, r.appearSec, r.appearSec + 0.35);
          const grow = s4ei(f, r.appearSec + 0.1, r.appearSec + 0.6);
          return (
            <div key={i} style={{ opacity: inp, transform: `translateY(${14 * (1 - inp)}px)`, display: "flex", flexDirection: "column", gap: 8 }}>
              <span style={{ fontWeight: 700, fontSize: 30, color: "#FFFFFF", ...STROKE }}>{r.label}</span>
              {r.spinner ? (
                <div style={{
                  width: 34, height: 34, borderRadius: "50%",
                  border: `4px solid ${r.color}`, borderRightColor: "transparent", borderBottomColor: "transparent",
                  transform: `rotate(${spin}deg)`,
                }} />
              ) : (
                <div style={{ height: 12, background: "rgba(255,255,255,0.14)", borderRadius: 6, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${r.len * 100}%`, background: r.color, borderRadius: 6, transformOrigin: alignRight ? "right" : "left", transform: `scaleX(${grow})` }} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* thanh progress đáy Hook→CTA — sáng dần theo tiến trình beat */}
      {segs.length > 0 && (
        <div style={{ position: "absolute", left: "6%", right: "6%", bottom: "16%", display: "flex", gap: 10 }}>
          {segs.map((s, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div style={{ height: 6, width: "100%", borderRadius: 3, background: i < filled ? content.trackColor : "rgba(255,255,255,0.25)" }} />
              <span style={{ fontSize: 18, color: i < filled ? "#FFFFFF" : "rgba(255,255,255,0.55)", ...STROKE }}>{s}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const panelSections: PanelSection[] = [
  { title: "Content", schema: ContentSchema, widgets: CONTENT_W },
  { title: "Rows", schema: RowSchema, widgets: ROW_W, tabs: [...ROW_KEYS] },
];

export const structureScaffoldModule: MotionSceneModule = {
  parseMeta, Component, panelSections,
  defaultMeta: {
    bgColor: "transparent", side: "right", track: "Hook,Lead,Body 1,Body 2,Body 3,CTA", trackColor: "#FFFFFF",
    row1: { label: "Hook:", color: "#FF3B30", len: 0.95, appearSec: 0.0 },
    row2: { label: "Lead:", color: "#FFCC00", len: 0.9, appearSec: 0.4 },
    row3: { label: "Body 1:", color: "#34AADC", len: 0.85, appearSec: 0.9 },
    row4: { label: "Open loop 1:", color: "#5E5CE6", spinner: true, appearSec: 1.6 },
    row5: { label: "Body 2:", color: "#3B5BDB", len: 0.8, appearSec: 2.2 },
    row6: { label: "Open loop 2:", color: "#5E5CE6", spinner: true, appearSec: 2.9 },
    row7: { label: "Body 3:", color: "#1E3A8A", len: 0.75, appearSec: 3.4 },
    row8: { label: "CTA:", color: "#34C759", len: 1.0, appearSec: 4.0 },
  },
};
