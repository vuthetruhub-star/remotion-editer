// motion-scene.tsx — TEMPLATE
// ═══════════════════════════════════════════════════════════════════════════════
// File này chứa: Zod schema (editable fields) + component render + editor entry.
// Đây là 1 trong 2 file duy nhất cần sửa khi tạo motion mới (cùng với
// motion-config.ts). Không tạo file schema riêng, không tạo file panel riêng —
// panel tự sinh từ PANEL_SECTIONS export ở cuối file này
// (xem control-item/basic-motion-scene.tsx — file đó KHÔNG cần sửa).
//
// TRƯỚC KHI VIẾT — đọc:
//   src/brand-docs/D1A-motion.md            (easing, motion pattern, beat-based rules)
//   src/brand-docs/D1A-motion-describe.md   (cách mô tả motion bằng ngôn ngữ thường)
//   src/brand-docs/EDITOR-integration.md    (chi tiết cách hoạt động của panel tự sinh)
//
// LUẬT ƯU TIÊN KHI VIẾT MOTION (xem CLAUDE.md):
//   1. Có reference (ảnh/video) → copy y hệt, không bịa giá trị visual.
//   2. Không có reference → PHẢI hỏi user (màu nền, màu text, kích thước,
//      khoảng cách, bố cục) trước khi implement.
//
// 🔴 QUY TẮC CHROMA-KEY-SAFE — bắt buộc đọc trước khi viết style:
// Composition này render trên nền chroma-key để user key ra ở app ngoài
// (CapCut...). BẤT KỲ hiệu ứng mờ/bán trong suốt nào (box-shadow có
// blur-radius > 0, filter: blur/drop-shadow, gradient có alpha < 1) mà vẽ RA
// NGOÀI cạnh của phần tử NGOÀI CÙNG của cả composition đều sẽ đè lên nền
// chroma và bị dính màu khi key. Quy tắc:
//   ✅ Glow/shadow có blur CHỈ an toàn khi nằm HOÀN TOÀN bên trong 1 phần tử
//      cha có nền ĐỤC 100% khác (không chạm ra tới nền chroma ngoài cùng).
//   ✅ Cạnh NGOÀI CÙNG của cả composition chỉ được dùng box-shadow KHÔNG blur
//      (dạng `0 0 0 Npx color`) hoặc không dùng gì cả.
//   ❌ Không đặt box-shadow có blur-radius > 0 hoặc filter:blur/drop-shadow
//      trên phần tử ngoài cùng bao trọn cả scene.
// ═══════════════════════════════════════════════════════════════════════════════

import { useCurrentFrame } from 'remotion';
import { z } from 'zod';
import { ITrackItem } from '@designcombo/types';
import {
  TextLayerSchema, TEXT_LAYER_WIDGETS,
  AssetLayerSchema, ASSET_LAYER_WIDGETS,
  BackgroundSchema, BACKGROUND_WIDGETS,
} from './schemas/_shared';
import { TIMING, s4ei, s4eo } from '../../motion-config';
import { BaseSequence, SequenceItemOptions } from '../base-sequence';
import type { PanelSection } from '../../control-item/auto-panel';

// ── 1. ZOD SCHEMA ─────────────────────────────────────────────────────────────
// ← FILL: mỗi asset trong motion phải khớp 1 trong 3 nhóm chuẩn
// (TextLayerSchema / AssetLayerSchema / BackgroundSchema) — xem
// src/features/editor/player/items/schemas/_shared.ts. Không tự bịa field khi
// đã có sẵn trong 3 nhóm này.

const RawSchema = z.object({
  background: BackgroundSchema.partial().optional(),
  headline:   TextLayerSchema.partial().optional(),
  icon:       AssetLayerSchema.partial().optional(),
});

export type MotionSceneMeta = {
  background: z.infer<typeof BackgroundSchema>;
  headline:   z.infer<typeof TextLayerSchema>;
  icon:       z.infer<typeof AssetLayerSchema>;
};

const parseMotionSceneMeta = (metadata: unknown): MotionSceneMeta => {
  const raw = RawSchema.safeParse(metadata ?? {});
  const d: Partial<z.infer<typeof RawSchema>> = raw.success ? raw.data : {};
  return {
    background: BackgroundSchema.parse(d.background ?? {}),
    headline:   TextLayerSchema.parse(d.headline ?? {}),
    icon:       AssetLayerSchema.parse(d.icon ?? {}),
  };
};

// ── 2. BEAT COMPONENTS ────────────────────────────────────────────────────────
// ← FILL: viết các component con nhận { f, data } qua props — KHÔNG dùng
// useCurrentFrame() bên trong. Timing lấy từ TIMING (giây), easing từ
// motion-config (s4ei/s4eo/s4vis/s4eb).

interface HeadlineProps { f: number; data: MotionSceneMeta['headline'] }

function Headline({ f, data }: HeadlineProps) {
  const { intro, outro } = TIMING;
  const opacity = Math.min(s4ei(f, intro.start, intro.start + intro.duration), s4eo(f, outro.start, outro.start + outro.duration));

  return (
    <div
      style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        transform: `translate(${data.x}px, ${data.y}px) scale(${data.scale}) rotate(${data.rotate}deg)`,
        opacity,
      }}
    >
      <span
        style={{
          fontFamily: 'Geist, system-ui, sans-serif',
          fontWeight: data.bold ? 700 : 500,
          fontStyle: data.italic ? 'italic' : 'normal',
          textDecoration: data.underline ? 'underline' : 'none',
          textTransform: data.textTransform,
          textAlign: data.textAlign,
          color: data.color,
          lineHeight: data.lineHeight,
          maxWidth: data.maxWidth || undefined,
          fontSize: 64,
        }}
      >
        {/* ← FILL: nội dung text — hoặc truyền qua field riêng trong schema nếu cần đổi qua panel */}
        Headline
      </span>
    </div>
  );
}

// ── 3. SCENE COMPONENT ────────────────────────────────────────────────────────

interface SceneProps { f: number; data: MotionSceneMeta }

export function MotionSceneComponent({ f, data }: SceneProps) {
  return (
    <div
      style={{
        position: 'absolute', inset: 0, overflow: 'hidden',
        background: data.background.color,
      }}
    >
      <Headline f={f} data={data.headline} />
    </div>
  );
}

// ── 4. EDITOR PANEL SECTIONS ──────────────────────────────────────────────────
// ← FILL: khai báo các nhóm field sẽ hiện trên panel chỉnh sửa. Panel tự sinh
// (control-item/basic-motion-scene.tsx) đọc mảng này — KHÔNG viết panel tay.
// `tabs` dùng khi 1 field lặp lại theo danh sách key (vd nhiều icon); bỏ `tabs`
// nếu section chỉ có 1 bộ field phẳng (vd background, 1 dòng text).

export const PANEL_SECTIONS: PanelSection[] = [
  { title: 'Background', schema: BackgroundSchema, widgets: BACKGROUND_WIDGETS },
  { title: 'Headline',   schema: TextLayerSchema,  widgets: TEXT_LAYER_WIDGETS },
  { title: 'Icon',       schema: AssetLayerSchema, widgets: ASSET_LAYER_WIDGETS },
];

// ── 5. EDITOR ENTRY — không sửa khối này ──────────────────────────────────────

function SceneContent({ data }: { data: MotionSceneMeta }) {
  const f = useCurrentFrame();
  return <MotionSceneComponent f={f} data={data} />;
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
