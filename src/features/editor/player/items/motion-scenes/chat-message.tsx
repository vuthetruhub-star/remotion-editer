// motion-scenes/chat-message.tsx — kind "chat_message". Bong bóng chat pop dần. Chroma-safe.
import { z } from "zod";
import { type WidgetSpec } from "../schemas/_shared";
import { s4ei, s4eo } from "../../../motion-config";
import type { PanelSection } from "../../../control-item/auto-panel";
import type { MotionSceneModule } from "./types";

const MsgSchema = z.object({ role: z.enum(["user", "agent", "other"]).default("other"), text: z.string().default(""), appearSec: z.number().default(0) });
const MW: Record<keyof z.infer<typeof MsgSchema>, WidgetSpec> = { role: { type: "select", options: ["user", "agent", "other"] }, text: { type: "text" }, appearSec: { type: "number" } };
const ContentSchema = z.object({ bgColor: z.string().default("#0A0B0A") });
const CW: Record<keyof z.infer<typeof ContentSchema>, WidgetSpec> = { bgColor: { type: "color" } };
const KEYS = ["msg1", "msg2", "msg3", "msg4", "msg5"] as const;
const RawSchema = z.object({
  bgColor: z.string().optional(),
  msg1: MsgSchema.partial().optional(), msg2: MsgSchema.partial().optional(), msg3: MsgSchema.partial().optional(),
  msg4: MsgSchema.partial().optional(), msg5: MsgSchema.partial().optional(),
});
type Msg = z.infer<typeof MsgSchema>;
type Meta = { content: z.infer<typeof ContentSchema>; msgs: Msg[] };
function parseMeta(m: unknown): Meta {
  const raw = RawSchema.safeParse(m ?? {});
  const d = (raw.success ? raw.data : {}) as Record<string, unknown>;
  const msgs = KEYS.filter((k) => d[k] != null).map((k) => MsgSchema.parse(d[k] ?? {})).filter((x) => x.text.trim());
  return { content: ContentSchema.parse({ bgColor: d.bgColor }), msgs };
}
function Component({ f, fps, durationInFrames, data }: { f: number; fps: number; durationInFrames: number; data: Meta }) {
  const dur = durationInFrames / fps;
  const outOp = s4eo(f, Math.max(0, dur - 0.4), dur);
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: data.content.bgColor,
      display: "flex", flexDirection: "column", justifyContent: "center", gap: 22, padding: "0 7%", opacity: outOp }}>
      {data.msgs.map((msg, i) => {
        const inp = s4ei(f, msg.appearSec, msg.appearSec + 0.3);
        const right = msg.role === "user";
        const bg = msg.role === "user" ? "#1E2434" : msg.role === "agent" ? "#00FF41" : "#343E5B";
        const col = msg.role === "agent" ? "#0A0B0A" : "#EDEFEC";
        return (
          <div key={i} style={{ display: "flex", justifyContent: right ? "flex-end" : "flex-start", opacity: inp, transform: `translateY(${16 * (1 - inp)}px)` }}>
            <div style={{ maxWidth: "78%", background: bg, color: col, borderRadius: 26, padding: "24px 30px",
              fontFamily: "Geist, system-ui, sans-serif", fontWeight: 500, fontSize: 40, lineHeight: 1.25,
              borderBottomRightRadius: right ? 6 : 26, borderBottomLeftRadius: right ? 26 : 6 }}>{msg.text}</div>
          </div>
        );
      })}
    </div>
  );
}
const panelSections: PanelSection[] = [
  { title: "Content", schema: ContentSchema, widgets: CW },
  { title: "Messages", schema: MsgSchema, widgets: MW, tabs: [...KEYS] },
];
export const chatMessageModule: MotionSceneModule = {
  parseMeta, Component, panelSections,
  defaultMeta: { bgColor: "#0A0B0A",
    msg1: { role: "other", text: "Can you ship this by Friday?", appearSec: 0.2 },
    msg2: { role: "agent", text: "Done. PR is up.", appearSec: 1.1 } },
};
