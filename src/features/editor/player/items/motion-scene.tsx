// motion-scene.tsx — DISPATCHER.
// ═══════════════════════════════════════════════════════════════════════════════
// Không còn chứa 1 thiết kế cứng. File này chọn "kind" theo item.metadata.kind rồi
// render module tương ứng trong ./motion-scenes/ (registry: ./motion-scenes/index.ts).
//   - Thiếu kind / kind lạ  → module "default" (giữ 100% hành vi scene cũ).
//   - Thêm kind mới         → tạo ./motion-scenes/<kind>.tsx + 1 dòng trong index.ts.
//
// Mỗi kind tự chứa: Zod schema (content + style), Component { f, fps, durationInFrames,
// data }, panelSections (panel tự sinh đọc qua control-item/basic-motion-scene.tsx),
// và defaultMeta. Xem knowledge/repo-constraints.md (chroma-safe) + worked-example.md.
//
// 🔴 CHROMA-KEY-SAFE vẫn áp dụng: composition render trên nền chroma để key ra ngoài.
// KHÔNG box-shadow blur>0 / filter:blur / gradient alpha<1 trên phần tử ngoài cùng.
// ═══════════════════════════════════════════════════════════════════════════════
import { useCurrentFrame } from "remotion";
import { ITrackItem } from "@designcombo/types";
import { BaseSequence, SequenceItemOptions } from "../base-sequence";
import { getMotionSceneModule } from "./motion-scenes";

function SceneContent({
  kind, fps, durationInFrames, data,
}: {
  kind: unknown; fps: number; durationInFrames: number; data: Record<string, unknown>;
}) {
  const f = useCurrentFrame();
  const { Component } = getMotionSceneModule(kind);
  return <Component f={f} fps={fps} durationInFrames={durationInFrames} data={data} />;
}

export default function MotionSceneItem({
  item, options,
}: {
  item: ITrackItem;
  options: SequenceItemOptions;
}) {
  const metadata = item.metadata as Record<string, unknown> | undefined;
  const kind = metadata?.kind;
  const mod = getMotionSceneModule(kind);
  const data = mod.parseMeta(metadata);

  const fps = options.fps;
  const durationInFrames = Math.max(1, Math.round(((item.display.to - item.display.from) / 1000) * fps));

  return (
    <BaseSequence item={item} options={options}>
      <SceneContent kind={kind} fps={fps} durationInFrames={durationInFrames} data={data} />
    </BaseSequence>
  );
}
