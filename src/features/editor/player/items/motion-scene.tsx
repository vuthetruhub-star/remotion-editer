// motion-scene.tsx
// ═══════════════════════════════════════════════════════════════════════════════
// File này mô tả một scene cụ thể. Mỗi scene là một file mới, độc lập.
// Cấu trúc scene (bao nhiêu layer, tên gì, layout ra sao) hoàn toàn do
// reference hoặc yêu cầu quyết định — không lấy từ file này.
//
// HƯỚNG DẪN VIẾT SCENE MỚI — đọc hết trước khi code:
//
// BƯỚC 1 — Xác định layers từ reference
//   Nhìn vào reference, liệt kê những gì xuất hiện trên màn hình.
//   Mỗi thứ = 1 layer. Đặt tên mô tả nội dung, không đặt tên theo loại kỹ thuật.
//   Ví dụ: nếu reference có tiêu đề lớn + số liệu + logo → layers: ['headline', 'stat', 'logo']
//
// BƯỚC 2 — Đọc _shared.ts trước khi viết schema
//   Path: src/features/editor/player/items/schemas/_shared.ts
//   LayerSchema        → base cho mọi layer (đã có: x, y, scale, rotate, opacity, blur...)
//   LayerTextStyleSchema → base cho text layer (đã có: color, bold, textAlign, fontSize...)
//   Không tự thêm các prop đã có trong _shared.ts.
//
// BƯỚC 3 — Định nghĩa schema cho từng layer
//   Chỉ thêm field đặc thù của layer đó (màu nền, kích thước, nội dung text...).
//   Default của mọi field phải lấy từ reference — không tự đặt giá trị.
//
// BƯỚC 4 — Viết scene component
//   Đọc toàn bộ giá trị từ data.<layer>.<field> — không hardcode trong JSX.
//   Animation chỉ dùng transform + opacity.
//   Easing chỉ dùng s4ei, s4eo, s4vis, s4eb từ motion-config.
//
// QUY TẮC BẤT BIẾN — vi phạm là scene sẽ không render đúng:
//   ✅ useCurrentFrame() CHỈ trong SceneContent ở cuối file
//   ✅ Beat/scene component nhận { f, data } — không gọi hook bên trong
//   ✅ Timing tính bằng giây, tham chiếu qua TIMING.<beat>.start / .duration
//   ✅ Mọi giá trị visual là Zod schema field, đọc từ data
//   ❌ interpolate() từ Remotion — không dùng
//   ❌ Animate width, height, top, left — chỉ transform + opacity
//   ❌ Tạo file schema riêng — schema nhúng thẳng vào file này
// ═══════════════════════════════════════════════════════════════════════════════

import React from 'react';
import { useCurrentFrame } from 'remotion';
import { z } from 'zod';
import { ITrackItem } from '@designcombo/types';
import { LayerSchema, LayerTextStyleSchema, zIdxOf, sanitizeZOrder } from './schemas/_shared';
import { ACCENT, FONT, TIMING, s4eo, s4ei, s4vis, s4eb } from '../../motion-config';
import { BaseSequence, SequenceItemOptions } from '../base-sequence';

// ── 1. LAYERS ─────────────────────────────────────────────────────────────────
// Liệt kê tên layers dựa trên những gì có trong reference.
// Thứ tự = z-index mặc định (phần tử sau đè lên trước).

const ORDERABLE_KEYS = [
  // ← điền tên layers từ reference
] as const;

// ── 2. ZOD SCHEMA ─────────────────────────────────────────────────────────────
// Một schema cho mỗi layer.
//
// Visual layer (hình ảnh, card, nền, icon...):
//   const XxxSchema = LayerSchema.extend({ <fields đặc thù> });
//
// Text layer (tiêu đề, mô tả, số liệu...):
//   const XxxSchema = LayerSchema.merge(LayerTextStyleSchema).extend({ <fields đặc thù> });
//
// Field nào không có trong LayerSchema/_shared.ts thì mới thêm vào đây.
// Default của mọi field lấy từ reference, không tự đặt.

// ← viết schema từng layer ở đây


// ── 3. TYPES & META ───────────────────────────────────────────────────────────

export type MotionSceneMeta = {
  // ← khai báo type từng layer đã định nghĩa
  // ví dụ: headline: z.infer<typeof HeadlineSchema>;
  accentColor: string;
  zOrder:      string[];
};

const RawSchema = z.object({
  // ← thêm từng layer schema với .optional()
  accentColor: z.string().optional(),
  zOrder:      z.array(z.string()).optional(),
});

// ── 4. PARSE — không sửa pattern ─────────────────────────────────────────────

const parseMotionSceneMeta = (metadata: unknown): MotionSceneMeta => {
  const raw = RawSchema.safeParse(metadata ?? {});
  const d: Partial<z.infer<typeof RawSchema>> = raw.success ? raw.data : {};
  return {
    // ← parse từng layer: XxxSchema.parse(d.xxx ?? {})
    accentColor: d.accentColor ?? ACCENT,
    zOrder:      sanitizeZOrder(d.zOrder ?? [], [...ORDERABLE_KEYS], [...ORDERABLE_KEYS]),
  };
};

// ── 5. SCENE COMPONENT ────────────────────────────────────────────────────────
// Tên function = tên scene, mô tả nội dung (ví dụ: RevenueStats, ProductLaunch).
// Cấu trúc JSX phản ánh layout của reference — không có cấu trúc mặc định nào.
//
// staticOp — pattern bắt buộc khi scene cần "hiện ngay, chỉ fade lúc thoát":
//   const exit = TIMING.<tênBeatCuối>;
//   const staticOp = s4eo(f, exit.start, exit.start + exit.duration);
//   → gán staticOp vào opacity của wrapper background và mọi layer

interface SceneProps { f: number; data: MotionSceneMeta }

export function [SceneName]({ f, data }: SceneProps) {
  const { accentColor, zOrder } = data;

  // ← tính staticOp và các animation variable từ TIMING + easing
  // ← destructure các layer từ data

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {/* ← render scene theo layout của reference */}
      {/* Đọc giá trị từ data.<layer>.<field> — không hardcode */}
      {/* zIndex: zIdxOf('<layerName>', zOrder) */}
      {/* opacity: staticOp * (layer.opacity / 100) */}
    </div>
  );
}

// ── 6. EDITOR ENTRY — không sửa khối này, chỉ cập nhật tên function ──────────

function SceneContent({ data }: { data: MotionSceneMeta }) {
  const f = useCurrentFrame();
  return <[SceneName] f={f} data={data} />;
}

export default function MotionSceneItem({
  item,
  options,
}: {
  item: ITrackItem;
  options: SequenceItemOptions;
}) {
  const data = parseMotionSceneMeta(item.metadata);
  return (
    <BaseSequence item={item} options={options}>
      <SceneContent data={data} />
    </BaseSequence>
  );
}
