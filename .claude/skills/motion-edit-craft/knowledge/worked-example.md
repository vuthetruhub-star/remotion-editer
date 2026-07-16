# Worked Example — recipe → code thật (khuôn để nhân bản)

> Bắc cầu từ [scene-catalog.md](scene-catalog.md) (trừu tượng) sang code chạy được trong repo. Copy đúng
> khuôn này rồi đổi nội dung cho 48 kind còn lại. Mọi ví dụ đã theo [repo-constraints.md](repo-constraints.md)
> (chroma-safe, nền trong suốt, content field trong RawSchema).

**Cơ chế panel (đã đọc `control-item/basic-motion-scene.tsx`) — nhớ để map đúng:**
- Section **không** `tabs` → AutoPanel đọc/ghi **top-level** `metadata.<field>`.
- Section **có** `tabs: ['a','b']` → đọc/ghi **`metadata.a.<field>`** / `metadata.b.<field>` (mỗi tab một object con).
→ Nên: **scalar dùng chung** (chuỗi content, màu nền) để top-level (no-tabs); **nhóm style/vị trí của từng
layer** hoặc **từng item lặp** để nested qua `tabs`.

**Easing lấy giây:** `normalize(f, s0, s1)` nhân `s0*fps`, nên `s0/s1` là **GIÂY**, `f` là frame. Cắm
`appear_sec` (giây) thẳng vào `s4ei(f, appearSec, appearSec+0.4)`.

---

## VÍ DỤ A — `stat_punch` (text hero đơn giản)

### `src/features/editor/motion-config.ts`
```ts
export const CONFIG = { fps: 30, duration: 2.6, background: 'transparent', width: 1080, height: 1920 };

export const TIMING: Record<string, { start: number; duration: number }> = {
  in:   { start: 0,   duration: 0.5 },
  hold: { start: 0.5, duration: 1.6 },
  out:  { start: 2.1, duration: 0.5 }, // 2.1 + 0.5 = 2.6 = CONFIG.duration
};

export const ACCENT = '#00FF41';
export const FONT   = 'Geist, system-ui, sans-serif';
// ...giữ nguyên normalize / s4ei / s4eo / s4vis / s4eb (KHÔNG sửa)...
```

### `src/features/editor/player/items/motion-scene.tsx`
```tsx
import { useCurrentFrame } from 'remotion';
import { z } from 'zod';
import { ITrackItem } from '@designcombo/types';
import {
  TextLayerSchema, TEXT_LAYER_WIDGETS,
  type WidgetSpec,
} from './schemas/_shared';
import { TIMING, s4ei, s4eo } from '../../motion-config';
import { BaseSequence, SequenceItemOptions } from '../base-sequence';
import type { PanelSection } from '../../control-item/auto-panel';

// ── 1. SCHEMA — content (top-level scalars) + style layers (nested qua tabs) ──
// Content: chuỗi + màu nền, để top-level (no-tabs section ghi top-level).
const ContentSchema = z.object({
  bgColor: z.string().default('transparent'),   // keyable: 'transparent' (repo-constraints §1)
  value:   z.string().default('$400M'),
  caption: z.string().default('RAISED IN 6 MONTHS'),
});
const CONTENT_WIDGETS: Record<keyof z.infer<typeof ContentSchema>, WidgetSpec> = {
  bgColor: { type: 'color' },
  value:   { type: 'text' },
  caption: { type: 'text' },
};

const RawSchema = z.object({
  bgColor:      z.string().optional(),
  value:        z.string().optional(),
  caption:      z.string().optional(),
  valueStyle:   TextLayerSchema.partial().optional(),   // vị trí/style của số hero
  captionStyle: TextLayerSchema.partial().optional(),   // vị trí/style của caption
});

export type MotionSceneMeta = {
  content:      z.infer<typeof ContentSchema>;
  valueStyle:   z.infer<typeof TextLayerSchema>;
  captionStyle: z.infer<typeof TextLayerSchema>;
};

const parseMotionSceneMeta = (metadata: unknown): MotionSceneMeta => {
  const raw = RawSchema.safeParse(metadata ?? {});
  const d = (raw.success ? raw.data : {}) as z.infer<typeof RawSchema>;
  return {
    content:      ContentSchema.parse({ bgColor: d.bgColor, value: d.value, caption: d.caption }),
    valueStyle:   TextLayerSchema.parse(d.valueStyle ?? {}),
    captionStyle: TextLayerSchema.parse(d.captionStyle ?? {}),
  };
};

// auto-shrink hero theo TỪ DÀI NHẤT để fit ~88% của 1080 (scene-catalog: stat_punch)
function heroFont(value: string): number {
  const longest = value.split(/\s+/).reduce((a, b) => (b.length > a.length ? b : a), '');
  return Math.min(300, Math.floor((1080 * 0.88 * 1.6) / Math.max(1, longest.length)));
}

// ── 2 + 3. SCENE (một component, hai span) — chroma-safe: CHỈ opacity + translate ──
export function MotionSceneComponent({ f, data }: { f: number; data: MotionSceneMeta }) {
  const { in: i, out } = TIMING;
  const vIn = s4ei(f, i.start, i.start + i.duration);
  const vOp = Math.min(vIn, s4eo(f, out.start, out.start + out.duration));
  const cIn = s4ei(f, i.start + 0.15, i.start + 0.15 + i.duration);
  const cOp = Math.min(cIn, s4eo(f, out.start, out.start + out.duration));
  const V = data.valueStyle, C = data.captionStyle;

  return (
    <div style={{
      position: 'absolute', inset: 0, overflow: 'hidden',
      background: data.content.bgColor,                 // 'transparent' = keyable
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24,
    }}>
      <span style={{
        fontFamily: 'Geist, system-ui, sans-serif', fontWeight: 800, color: V.color,
        fontSize: heroFont(data.content.value), lineHeight: 0.95, textAlign: V.textAlign,
        whiteSpace: 'pre-line',
        transform: `translate(${V.x}px, ${V.y + 24 * (1 - vIn)}px) scale(${V.scale})`, opacity: vOp,
      }}>{data.content.value}</span>

      <span style={{
        fontFamily: 'Geist, system-ui, sans-serif', fontWeight: 600, color: C.color,
        fontSize: 40, letterSpacing: 2, textTransform: C.textTransform, textAlign: C.textAlign,
        transform: `translate(${C.x}px, ${C.y + 16 * (1 - cIn)}px) scale(${C.scale})`, opacity: cOp,
      }}>{data.content.caption}</span>
    </div>
  );
}

// ── 4. PANEL — content top-level (no tabs); style layers nested (tabs) ──
export const PANEL_SECTIONS: PanelSection[] = [
  { title: 'Content', schema: ContentSchema,   widgets: CONTENT_WIDGETS },                                   // → metadata.{bgColor,value,caption}
  { title: 'Style',   schema: TextLayerSchema,  widgets: TEXT_LAYER_WIDGETS, tabs: ['valueStyle', 'captionStyle'] }, // → metadata.valueStyle.* / metadata.captionStyle.*
];

// ── 5. ENTRY — KHÔNG sửa ──
function SceneContent({ data }: { data: MotionSceneMeta }) {
  const f = useCurrentFrame();
  return <MotionSceneComponent f={f} data={data} />;
}
export default function MotionSceneItem({ item, options }: { item: ITrackItem; options: SequenceItemOptions }) {
  const data = parseMotionSceneMeta(item.metadata);
  return (
    <BaseSequence item={item} options={options}>
      <SceneContent data={data} />
    </BaseSequence>
  );
}
```

### `src/features/editor/mock.ts` — metadata KHỚP CHÍNH XÁC schema
```ts
const MOTION_SCENE_DURATION_MS = 2_600; // CONFIG.duration * 1000
// ...
metadata: {
  bgColor: 'transparent',
  value:   '$400M',
  caption: 'RAISED IN 6 MONTHS',
  valueStyle:   { color: '#FFFFFF', textAlign: 'center' },
  captionStyle: { color: '#00FF41', textAlign: 'center', textTransform: 'uppercase' },
},
// nhớ: DESIGN_SCHEMA_VERSION++ khi đổi shape metadata
```

---

## VÍ DỤ B — `vertical_timeline` (đa-item + `appear_sec`, khuôn cho MỌI kind nhiều item)

Điểm khác cốt lõi: **N item lặp** → mỗi item là một object con, chỉnh qua `tabs`; mỗi item tự reveal ở
`appearSec` riêng (so le theo lời — taste-rules §8, motion-taste §6).

```tsx
// SCHEMA cho một bước
const StepSchema = z.object({
  heading:   z.string().default(''),
  appearSec: z.number().default(0),   // GIÂY tuyệt đối trong scene
});
const STEP_WIDGETS: Record<keyof z.infer<typeof StepSchema>, WidgetSpec> = {
  heading:   { type: 'text' },
  appearSec: { type: 'number' },
};

// metadata: { title, step1:{heading,appearSec}, step2:{...}, step3:{...} }
const RawSchema = z.object({
  title: z.string().optional(),
  step1: StepSchema.partial().optional(),
  step2: StepSchema.partial().optional(),
  step3: StepSchema.partial().optional(),
});

// RENDER: mỗi bước fade+rise ở appearSec riêng (chroma-safe: opacity + translateY)
function Step({ f, data }: { f: number; data: z.infer<typeof StepSchema> }) {
  const appear = s4ei(f, data.appearSec, data.appearSec + 0.4);   // giây → dùng trực tiếp
  return (
    <div style={{
      transform: `translateY(${20 * (1 - appear)}px)`, opacity: appear,
      color: '#FFFFFF', fontFamily: 'Geist, system-ui, sans-serif', fontSize: 44, fontWeight: 600,
    }}>{data.heading}</div>
  );
}

// PANEL: một section tabs, mỗi tab một bước
export const PANEL_SECTIONS: PanelSection[] = [
  { title: 'Steps', schema: StepSchema, widgets: STEP_WIDGETS, tabs: ['step1', 'step2', 'step3'] },
];
```

- Muốn "rail dẫn dot" (scene-catalog): cho một `<div>` rail cao dần theo `s4ei(f, firstAppear, lastAppear)`
  và mỗi dot pop ở `appearSec` của nó — nhưng KHÔNG dùng animate `height` (luật repo). Thay bằng `scaleY`
  trên rail có `transform-origin: top`.
- Số item tuỳ scene: thêm `step4`, `step5`… vào RawSchema + `tabs`. (Repo edit một scene tại một thời điểm,
  nên số bước cố định theo scene là chấp nhận được.)

---

## Checklist nhân bản cho một kind bất kỳ trong catalog

1. Đọc recipe kind đó trong [scene-catalog.md](scene-catalog.md): shape, content fields, TIMING gợi ý.
2. `motion-config.ts`: đặt `CONFIG.duration` + `TIMING` beats (in/hold/out hoặc theo `appear_sec` item).
3. `motion-scene.tsx`:
   - Khai **content fields** (chuỗi/số/nhóm item) vào `RawSchema` — KHÔNG có sẵn trong 3 layer schema.
   - Style/vị trí layer → `TextLayerSchema`/`AssetLayerSchema`.
   - Beat component `{ f, data }`, easing `s4ei/s4eo/s4vis`, chroma-safe (chỉ `transform`+`opacity`, KHÔNG blur ngoài).
   - `PANEL_SECTIONS`: scalar dùng chung → no-tabs (top-level); nhóm layer/item lặp → `tabs`.
4. `mock.ts`: metadata khớp field + defaults; `DESIGN_SCHEMA_VERSION++`.
5. `node src/scripts/test-motion-schema.mjs` = 0 FAIL; `npx tsc --noEmit` sạch.
