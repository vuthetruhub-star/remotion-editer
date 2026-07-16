// motion-scenes/types.ts — hợp đồng chung cho MỘT "kind" motion scene.
//
// Mỗi kind (hook_title, stat_punch, word_pop...) là 1 module tự chứa:
//   - parseMeta : đọc item.metadata (raw) → data đã validate (Zod) cho component
//   - Component : render theo { f (frame), data } — KHÔNG dùng useCurrentFrame bên trong
//   - panelSections : các nhóm field cho panel tự sinh (control-item/auto-panel)
//   - defaultMeta : metadata mặc định khi tạo mới / đổi sang kind này
//
// Dispatcher (player/items/motion-scene.tsx) chọn module theo metadata.kind.
import type { ReactElement } from "react";
import type { PanelSection } from "../../../control-item/auto-panel";

export interface MotionSceneModule {
  parseMeta: (metadata: unknown) => Record<string, unknown>;
  Component: (props: { f: number; fps: number; durationInFrames: number; data: any }) => ReactElement;
  panelSections: PanelSection[];
  defaultMeta: Record<string, unknown>;
}
