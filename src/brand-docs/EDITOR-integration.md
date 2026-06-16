# D1A Editor — Complete Motion Asset Guide

> Tài liệu đầy đủ: từ ý tưởng → Remotion composition → tích hợp editor (timeline + player + control panel + Zod schema)
> Đọc file này TRƯỚC KHI viết bất kỳ motion asset nào.

---

## Triết lý cốt lõi

**Zod và Remotion không xung đột.** Zod chỉ đứng ở cửa vào để validate `item.metadata` — một JSON object. Toàn bộ animation logic (interpolate, easing, timing) vẫn chạy hoàn toàn thuần Remotion, không bị ảnh hưởng.

**Không làm 2 lần.** Viết schema song song với animation ngay từ đầu — tốn ~20 dòng schema cho mỗi asset, tiết kiệm toàn bộ bước refactor về sau.

---

## Workflow 4 bước

```
Bước 1 — Đọc docs
  src/brand-docs/BRAND.md           → color, font, spacing, radii tokens
  src/brand-docs/D1A-motion.md      → motion rules, 12 enhancement recipes
  src/brand-docs/D1A-motion-describe.md → dịch plain language → Remotion code
  src/brand-docs/EDITOR-integration.md  → file này

Bước 2 — Đọc composition gốc (nếu có)
  src/features/editor/player/items/motion-scene.tsx → template tham khảo

Bước 3 — Build motion (schema + composition song song)
  Viết Zod schema trước (~20 dòng)
  Viết animation code đọc từ schema ngay
  Không hardcode string/number nào mà user có thể muốn thay đổi

Bước 4 — Host lên editor
  5 file đăng ký → timeline clip + player preview + control panel có sẵn
```

---

## Cấu trúc file cho mỗi asset

```
src/features/editor/
  player/
    items/
      [name].tsx                     ← Remotion composition
      schemas/
        [name].schema.ts             ← Zod schema + LayerSchema
    sequence-item.tsx                ← đăng ký vào player map
  timeline/
    items/
      [name].ts                      ← Fabric.js clip bar
    timeline.tsx                     ← đăng ký registerItems + sizesMap + itemTypes
  control-item/
    basic-[name].tsx                 ← right-sidebar control panel
    control-item.tsx                 ← đăng ký vào ActiveControlItem map
  mock.ts                            ← initial design data (default metadata)
  utils/
    autosave.ts                      ← autosave helpers (dùng chung, không copy)
```

---

## Step 1 — Zod Schema (viết TRƯỚC)

**File:** `src/features/editor/player/items/schemas/[name].schema.ts`

### LayerSchema — universal cho mọi sub-layer (9 props)

`LayerSchema` là bộ **9 prop** vật lý cốt lõi dùng chung cho mọi sub-layer trong animation.
Không cần thay đổi — chỉ copy paste và đặt tên phù hợp.

```ts
import { z } from 'zod';
// ── Import tất cả primitives từ _shared.ts — KHÔNG tự viết lại ───────────────
import {
  LayerSchema, LayerTextStyleSchema,
  DEFAULT_LAYER, DEFAULT_LAYER_TEXT_STYLE,
  zIdxOf, sanitizeZOrder,
} from './_shared';
import type { LayerConfig, LayerTextStyleConfig } from './_shared';
// DEFAULT_LAYER = LayerSchema.parse({}) — derived tự động, không hardcode
```

### UI slider specs cho LayerConfig props

| Prop | Min | Max | Step | Unit | Ghi chú |
|---|---|---|---|---|---|
| `fromFrame` | 0 | 149 | 1 | f | Frame bắt đầu của layer (relative to clip) |
| `durationFrames` | 1 | 150 | 1 | f | Thời gian hiển thị của layer |
| `x` | -1080 | 2160 | 1 | px | Offset ngang — canvas 1080px wide |
| `y` | -1920 | 3840 | 1 | px | Offset dọc — canvas 1920px tall |
| `scale` | 0.1 | 5 | 0.05 | × | Size multiplier |
| `rotate` | 0 | 360 | 1 | ° | Rotation |
| `opacity` | 0 | 100 | 1 | % | Per-layer visibility |
| `blur` | 0 | 20 | 0.5 | px | CSS blur filter |
| `brightness` | 0 | 200 | 1 | % | CSS brightness filter |

### Layer keys

```ts
// "background" luôn ở dưới cùng, không nằm trong zOrder
export const ORDERABLE_KEYS = ['layer1', 'layer2', 'layer3'] as const; // đổi theo asset
export const LAYER_KEYS = ['background', ...ORDERABLE_KEYS] as const;
export type LayerKey = (typeof LAYER_KEYS)[number];
export type OrderableKey = (typeof ORDERABLE_KEYS)[number];

export const LAYER_LABELS: Record<LayerKey, string> = {
  background: 'Background',
  layer1: 'Layer 1',
  // ...
};
```

### Main schema

```ts
export const MyAssetSchema = z.object({
  // Props đặc thù của asset:
  headline: z.string().default('Default headline'),
  subline:  z.string().default('Default subline'),

  // Text style riêng cho từng text layer (xem phần dưới)
  textStyle: TextStyleSchema.default({}),

  // Layer configs (luôn có):
  layers: z.object({
    background: LayerSchema.default({}),
    layer1:     LayerSchema.default({}),
    layer2:     LayerSchema.default({}),
    // ...
  }).default({}),

  // zOrder: thứ tự render (index 0 = dưới cùng, index cuối = trên cùng)
  // background không nằm trong zOrder (luôn ở dưới)
  zOrder: z.array(z.string()).default(['layer1', 'layer2', 'layer3']),
});

export type MyAssetMeta = z.infer<typeof MyAssetSchema>;
export type LayersConfig = MyAssetMeta['layers'];

export const parseMyAssetMeta = (metadata: unknown): MyAssetMeta => {
  const result = MyAssetSchema.safeParse(metadata ?? {});
  const data   = result.success ? result.data : MyAssetSchema.parse({});
  // sanitizeZOrder: lọc key lạ từ localStorage corrupt, reset về defaults nếu rỗng
  const clean  = sanitizeZOrder(data.zOrder, ORDERABLE_KEYS, [...ORDERABLE_KEYS]);
  return clean === data.zOrder ? data : { ...data, zOrder: clean };
};
// zIdxOf đã import từ _shared.ts — không khai báo lại
```

**Nguyên tắc:**
- Props user-editable (text, number, config) → vào schema chính
- Transform/timing/visibility/blur/brightness → vào `LayerSchema` (đã có sẵn)
- Visual fx global (blur, brightness toàn item) → `item.details`, xử lý bởi hệ thống standard

---

## Text Style Schema — per-layer (tách biệt hoàn toàn)

**Mỗi text layer (headline, subline…) phải có bộ style riêng, không chia sẻ.**
Nếu dùng chung 1 object → chỉnh headline sẽ ảnh hưởng luôn subline → BUG.

```ts
// Style độc lập cho một text layer
const LayerTextStyleSchema = z.object({
  bold:          z.boolean().default(false),
  underline:     z.boolean().default(false),
  textTransform: z.enum(["none", "uppercase", "lowercase"]).default("none"),
  color:         z.string().default("#C8E6C8"),
  textAlign:     z.enum(["left", "center", "right"]).default("center"),
  strokeWidth:   z.number().min(0).max(10).default(0),
  strokeColor:   z.string().default("#00FF41"),
  maxWidth:      z.number().min(0).max(800).default(0), // 0 = không wrap
});

export type LayerTextStyleConfig = z.infer<typeof LayerTextStyleSchema>;

// Container chứa style độc lập cho mỗi text layer
const TextStyleSchema = z.object({
  headline: LayerTextStyleSchema.default({}),
  subline:  LayerTextStyleSchema.default({ color: "#78A878" }),
  // thêm layer text khác ở đây nếu cần
});

export type TextStyleConfig = z.infer<typeof TextStyleSchema>;

// Single source of truth — derived từ schema, không hardcode
// DEFAULT_LAYER_TEXT_STYLE đã import từ _shared.ts (generic defaults)
// DEFAULT_TEXT_STYLE dùng TextStyleSchema.parse({}) để tự fill per-layer defaults
export const DEFAULT_TEXT_STYLE: TextStyleConfig = TextStyleSchema.parse({});
```

### Sử dụng trong control panel

```ts
// Khi user đang chọn layer "headline" → chỉ cập nhật textStyle.headline
const updateTextStyle = (field: keyof LayerTextStyleConfig, value: unknown) => {
  const layerKey = activeLayer as "headline" | "subline";
  const next = MyAssetSchema.parse({
    ...prev,
    textStyle: {
      ...prev.textStyle,
      [layerKey]: { ...prev.textStyle[layerKey], [field]: value },
    },
  });
  dispatch(EDIT_OBJECT, { payload: { [trackItem.id]: { metadata: next } } });
};
```

### Sử dụng trong composition

```tsx
// Truyền style riêng cho từng text component
<SceneHeadline ts={textStyle.headline} text={headline} />
<SceneSubline  ts={textStyle.subline}  text={subline}  />
```

### localStorage migration warning

> **Khi thay đổi schema** (thêm/xóa/đổi tên field), data cũ trong localStorage sẽ không match.
> `safeParse()` fail → `parseMyAssetMeta()` trả về Zod defaults (không crash, chỉ reset về default).
> **Hành động cần thiết:** nếu user có preset quan trọng → Export JSON trước khi thay đổi schema.

---

## Step 2 — Remotion Composition

**File:** `src/features/editor/player/items/[name].tsx`

### Kiến trúc layer độc lập (quan trọng)

Mỗi layer phải là **sibling**, không phải **nested child** của layer khác.
Nếu text nằm trong div có transform của folder → text bị scale/spin theo folder → không độc lập được.

**Pattern đúng:**
```
scene-root (position: relative, width × height)
  ├── background-wrapper   (AbsoluteFill, zIndex 0)
  ├── layer1-wrapper       (position: absolute, inset: 0, zIndex = zIdxOf('layer1'))
  ├── layer2-wrapper       (position: absolute, inset: 0, zIndex = zIdxOf('layer2'))
  └── text-layer           (position: absolute, fully independent)
```

**Pattern sai (tránh):**
```
scene-root
  └── folder-wrapper (có scale/spin)
      ├── cards (bị ảnh hưởng bởi folder scale) ← SAI
      └── text  (bị ảnh hưởng bởi folder spin)  ← SAI
```

### Helper function

```tsx
// Trả về 1 khi frame nằm trong [fromFrame, fromFrame+durationFrames), 0 nếu không
const layerVis = (l: LayerConfig, frame: number): number =>
  frame >= l.fromFrame && frame < l.fromFrame + l.durationFrames ? 1 : 0;
```

### Template composition đầy đủ

```tsx
import { ITrackItem } from '@designcombo/types';
import { BaseSequence, SequenceItemOptions } from '../base-sequence';
import { useCurrentFrame, interpolate, Easing, AbsoluteFill } from 'remotion';
import { colors, fonts, radii } from '../../../../brand';
import {
  LayerConfig, LayerTextStyleConfig, LayersConfig,
  parseMyAssetMeta, zIdxOf
} from './schemas/[name].schema';

const T = {
  entry:   [0, 18]   as const,
  reveal:  [20, 36]  as const,
  hold:    [60, 120] as const,
  exit:    [130, 150] as const,
};

const MyLayer1: React.FC<{
  layer: LayerConfig;
  ts: LayerTextStyleConfig;
  zIndex: number;
}> = ({ layer, ts, zIndex }) => {
  const frame = useCurrentFrame();
  const vis = layerVis(layer, frame) * (layer.opacity / 100);
  const opacity = interpolate(frame, T.entry, [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  return (
    <div style={{
      position: 'absolute', zIndex,
      transform: `translate(${layer.x}px, ${layer.y}px) scale(${layer.scale}) rotate(${layer.rotate}deg)`,
      opacity: opacity * vis,
      filter: `blur(${layer.blur}px) brightness(${layer.brightness}%)`,
    }}>
      {/* content using ts.color, ts.bold, etc. */}
    </div>
  );
};

const RootScene: React.FC<{
  headline: string; subline: string;
  textStyle: { headline: LayerTextStyleConfig; subline: LayerTextStyleConfig };
  layers: LayersConfig; zOrder: string[];
}> = ({ headline, subline, textStyle, layers, zOrder }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: colors.background }}>
      <AbsoluteFill style={{ zIndex: 0, opacity: layerVis(layers.background, frame) }}>
        {/* background */}
      </AbsoluteFill>
      <div style={{ position: 'relative', width: 400, height: 400 }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: zIdxOf('layer1', zOrder) }}>
          <MyLayer1 layer={layers.layer1} ts={textStyle.headline} zIndex={0} />
        </div>
        {/* thêm layers tại đây — luôn là siblings */}
      </div>
    </AbsoluteFill>
  );
};

export default function MyAsset({ item, options }: {
  item: ITrackItem; options: SequenceItemOptions;
}) {
  const { headline, subline, textStyle, layers, zOrder } = parseMyAssetMeta(item.metadata);
  return BaseSequence({
    item, options,
    children: <RootScene headline={headline} subline={subline} textStyle={textStyle} layers={layers} zOrder={zOrder} />,
  });
}
```

**Rules không được vi phạm:**
- `CSS transitions` và `CSS animations` → FORBIDDEN trong composition
- Animate `top`, `left`, `width`, `height` → FORBIDDEN → dùng `transform` + `opacity`
- `useCurrentFrame()` / `useVideoConfig()` trong plain function → FORBIDDEN → phải là `React.FC`
- Hardcode màu, font, spacing → FORBIDDEN → import từ `../../../../brand`
- Layer A nằm trong transform container của Layer B → FORBIDDEN → phải là siblings

---

## Step 3 — Đăng ký vào Player

**`src/features/editor/player/items/index.ts`**
```ts
export { default as MyAsset } from './[name]';
```

**`src/features/editor/player/sequence-item.tsx`**
```ts
import { MyAsset } from './items';

// trong SequenceItem object:
myAsset: (item, options) => MyAsset({ item, options }),
```

---

## Step 4 — Timeline Fabric.js class

**File:** `src/features/editor/timeline/items/[name].ts`

```ts
import { Resizable, ResizableProps, Control } from '@designcombo/timeline';
import { createResizeControls } from '../controls';

class MyAsset extends Resizable {
  static type = 'MyAsset';

  static createControls(): { controls: Record<string, Control> } {
    return { controls: createResizeControls() };
  }

  constructor(props: ResizableProps) {
    super(props);
    this.id = props.id;
    this.display = props.display;
    this.tScale = props.tScale;
    this.fill = '#0a1a2e';
    this.rx = 4; this.ry = 4;
    this.strokeWidth = 0;
    this.transparentCorners = false;
    this.hasBorders = false;
  }

  public _render(ctx: CanvasRenderingContext2D) {
    super._render(ctx);
    this.drawLabel(ctx);
    this.updateSelected(ctx);
  }

  private drawLabel(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(-this.width / 2 + 10, -this.height / 2 + 14);
    ctx.font = '500 11px ui-monospace, monospace';
    ctx.fillStyle = '#00FF41';
    ctx.fillText('⬡ MyAsset', 0, 0);
    ctx.restore();
  }

  public updateSelected(ctx: CanvasRenderingContext2D) {
    const borderColor = this.isSelected ? 'rgba(0,255,65,0.9)' : 'rgba(0,255,65,0.15)';
    ctx.save();
    ctx.fillStyle = borderColor;
    ctx.beginPath();
    ctx.rect(-this.width / 2, -this.height / 2, this.width, this.height);
    ctx.roundRect(-this.width / 2 + 2, -this.height / 2 + 2, this.width - 4, this.height - 4, 4);
    ctx.fill('evenodd');
    ctx.restore();
  }
}

export default MyAsset;
```

**`src/features/editor/timeline/items/index.ts`**
```ts
export { default as MyAsset } from './[name]';
```

**`src/features/editor/timeline/timeline.tsx`** — 3 chỗ:
```ts
import { MyAsset } from './items';

CanvasTimeline.registerItems({ ..., MyAsset });  // 1
sizesMap: { myAsset: 40, ... }                   // 2 — chiều cao clip bar (px)
itemTypes: [..., 'myAsset']                      // 3
```

---

## Step 5 — Control Panel

**File:** `src/features/editor/control-item/basic-[name].tsx`

Copy từ `basic-motion-scene.tsx` và thay tên. Panel này bao gồm sẵn:

| Feature | Mô tả |
|---|---|
| **Layer Order list** | ▲▼ reorder z-index, click để chọn layer, Ctrl+click multi-select |
| **Layer Inspector** | Timing (from/duration), Position (x/y), Transform (scale/rotate), Appearance (opacity/blur/brightness) |
| **Group Inspector** | Delta sliders khi multi-select: offset x/y/scale/rotate + set opacity/blur/brightness all |
| **Text Style Inspector** | Per-layer: bold, underline, textTransform, color, textAlign, strokeWidth, strokeColor, maxWidth |
| **SliderField** | Slider + number input box (backspace được, commit on blur/Enter) |
| **Ctrl+Z** | Undo từng thay đổi nhỏ (60 bước) |
| **Ctrl+S** | Lưu checkpoint cho layer đang chọn (max 5/layer) |
| **Ctrl+Shift+Z** | Lùi về checkpoint trước / về defaults |
| **Ctrl+Shift+F** | Tiến về checkpoint sau |
| **Save Project** | Download metadata JSON preset |
| **Global visibility** | Opacity / Blur / Brightness (item.details) |

**Chỉ cần thay đổi:**
1. Import schema types từ file schema mới
2. Cập nhật `LAYER_KEYS`, `ORDERABLE_KEYS`, `LAYER_LABELS` cho đúng với asset
3. Thêm section Content với các input đặc thù (headline, subline, v.v.)
4. TextStyleInspector nhận `ts={meta.textStyle[activeLayer]}` — chỉ layer đang active

**`src/features/editor/control-item/control-item.tsx`**
```ts
import BasicMyAsset from './basic-[name]';

// trong ActiveControlItem object:
myAsset: <BasicMyAsset trackItem={trackItem} />,
```

---

## Step 6 — Initial Design Data

**File:** `src/features/editor/mock.ts`

```ts
// Trong tracks[]:
{
  id: 'track-my-asset',
  type: 'video',
  name: 'MyAsset',
  accepts: ['myAsset'],
  items: ['my-asset-item-1'],
  magnetic: false,
  static: false,
}

// Trong trackItemsMap:
'my-asset-item-1': {
  id: 'my-asset-item-1',
  name: 'MyAsset Scene 1',
  type: 'myAsset',
  display: { from: 0, to: 5000 },   // ms (5000 = 5s = 150 frames @ 30fps)
  duration: 5000,
  details: {
    width: 1080, height: 1920,
    top: 0, left: 0,
    opacity: 100, blur: 0, brightness: 100,
    transform: 'none', rotate: '0deg',
    flipX: false, flipY: false,
    visibility: 'visible',
    borderRadius: 0, borderWidth: 0, borderColor: 'transparent',
    boxShadow: { color: 'transparent', x: 0, y: 0, blur: 0 },
  },
  animations: {},
  metadata: {
    headline: 'Default headline',
    subline: 'Default subline',
    textStyle: {}, // Zod fills defaults per layer automatically
    zOrder: ['layer1', 'layer2', 'layer3'],
    layers: {},    // Zod fills DEFAULT_LAYER for each key
  },
}
```

**Lưu ý:** `layers: {}` và `textStyle: {}` là đủ — Zod tự fill tất cả defaults.

---

## Export / Quality System

### Quality options (navbar.tsx → DownloadPopover)

```ts
const QUALITY_OPTIONS = [
  { label: "1080p", scale: 1,    note: "Full HD" },
  { label: "1440p", scale: 1.33, note: "2K" },
  { label: "2160p", scale: 2,    note: "4K" },
] as const;
```

### Pipeline truyền `scale` (4 tầng)

```
1. useDownloadState.ts  →  exportScale (Zustand state, default: 1)
   actions.setExportScale(q.scale)        ← user chọn từ dropdown

2. startExport()         →  fetch POST /api/render-local  { scale: exportScale }

3. app/api/render-local/route.ts  →  spawn(node, [script, input, output, renderScale])
   const renderScale = String(typeof scale === "number" && scale > 0 ? scale : 1)

4. src/scripts/remotion-render.mjs  →  renderMedia({ scale: renderScale })
   const [,, inputBase64, outputPath, scaleArg] = process.argv
   const renderScale = scaleArg ? parseFloat(scaleArg) : 1
```

### Output dimensions

| Quality | Scale | Output từ 1080×1920 |
|---|---|---|
| 1080p (Full HD) | 1.0 | 1080 × 1920 px |
| 1440p (2K) | 1.33 | ~1437 × 2554 px |
| 2160p (4K) | 2.0 | 2160 × 3840 px |

### Export type (Format dropdown)

```
MP4  → renderMedia() → binary blob → download
JSON → stateManager.toJSON() → download as .json preset
```

---

## Autosave & localStorage

**File:** `src/features/editor/utils/autosave.ts`

```ts
import { loadSavedDesign, saveDesign, clearSavedDesign } from './utils/autosave';

// Load khi mở editor (editor.tsx)
const saved = loadSavedDesign();
if (saved) dispatch(DESIGN_LOAD, { payload: saved });

// Save mỗi khi design thay đổi (debounced)
saveDesign(currentDesign);

// Clear + reset khi "New Project" (navbar.tsx)
clearSavedDesign();
dispatch(DESIGN_LOAD, { payload: mockDesign });
```

**localStorage key:** `"d1a-editor-autosave"`

### localStorage migration khi đổi schema

Khi Zod schema thay đổi (thêm/xóa/đổi tên field):
- Data cũ trong localStorage sẽ fail `safeParse()`
- `parseMyAssetMeta()` dùng `safeParse().success ? data : defaults` → reset về defaults
- **Không crash** nhưng mất dữ liệu user cũ
- **Phòng tránh:** trước khi deploy schema change → hướng dẫn user export JSON preset trước

---

## Preset Export / Load lại

Control panel có nút **↓ Save Project Preset** — download `metadata` hiện tại thành JSON.

**Load lại:**
1. Mở file JSON → copy object trong `"metadata": { ... }`
2. Mở `mock.ts` → tìm `metadata:` của item → paste vào
3. Lưu file → Remotion tự render lại (không cần restart)

**Giới hạn:** Timing constants (`T` object) và màu hardcode trong composition không nằm trong preset. Chỉnh trực tiếp trong `[name].tsx` nếu cần.

---

## Checklist đầy đủ

```
Schema
  [ ] schemas/[name].schema.ts
        LayerSchema (9 props: x, y, scale, rotate, opacity, fromFrame, durationFrames, blur, brightness)
        LayerTextStyleSchema + TextStyleSchema (per text layer — không share)
        LAYER_KEYS + ORDERABLE_KEYS + LAYER_LABELS
        parseMyAssetMeta + zIdxOf
        DEFAULT_LAYER + DEFAULT_LAYER_TEXT_STYLE + DEFAULT_TEXT_STYLE

Composition
  [ ] player/items/[name].tsx — timing map T{} + layerVis() + sibling layer architecture
  [ ] player/items/index.ts — export added
  [ ] player/sequence-item.tsx — registered in map

Timeline
  [ ] timeline/items/[name].ts — Fabric.js class
  [ ] timeline/items/index.ts — export added
  [ ] timeline/timeline.tsx — registerItems + sizesMap + itemTypes

Control Panel
  [ ] control-item/basic-[name].tsx — copied from basic-motion-scene.tsx, schema + text style updated
  [ ] control-item/control-item.tsx — registered in ActiveControlItem map

Data
  [ ] mock.ts — track + trackItemsMap entry với metadata defaults
        textStyle: {} (Zod auto-fill)
        layers: {}    (Zod auto-fill)
```

---

## Reference: MotionScene template

Asset đầy đủ nhất để tham khảo code pattern:

| File | Ghi chú |
|---|---|
| `player/items/motion-scene.tsx` | Ví dụ sibling layer architecture, shared spin context, layerVis(), per-layer text style |
| `player/items/schemas/motion-scene.schema.ts` | Ví dụ LayerSchema 9 props + LayerTextStyleSchema + TextStyleSchema |
| `control-item/basic-motion-scene.tsx` | Full control panel: Layer Order, Inspector, Group, TextStyleInspector, save stack |
| `timeline/items/motion-scene.ts` | Fabric.js class mẫu |
| `utils/autosave.ts` | Autosave helpers (dùng chung) |
| `store/use-download-state.ts` | Export pipeline: exportScale → scale param → renderMedia |

---

## Quyết định kiến trúc đã xác nhận

| Quyết định | Lý do |
|---|---|
| Viết schema song song với animation (không refactor sau) | Tiết kiệm token, không làm 2 lần |
| Zod không làm giảm chất lượng Remotion | Zod chỉ validate JSON metadata, không chạm animation engine |
| Sibling layer architecture | Cho phép layer.scale/x/y độc lập — nested child bị ảnh hưởng bởi parent transform |
| background không nằm trong zOrder | Background luôn ở dưới cùng, không cần reorder |
| Per-layer text style (không share) | Chọn subline chỉnh màu → không ảnh hưởng headline |
| LayerSchema có blur + brightness (9 props) | Per-layer visual fx; item.details chứa global fx |
| Save stack 5 mốc/layer, báo lỗi khi đầy | Đủ cho workflow chỉnh sửa, rõ ràng hơn FIFO |
| Export preset JSON | An toàn, không sửa source code runtime, load lại qua mock.ts |
| renderMedia({ scale }) cho 2K/4K | Nhân kích thước output mà không thay đổi composition size |
| `ssr: false` cho Editor component | Tránh Remotion SSR crash (globalThis conflict với Next.js) |
| Autosave dùng localStorage key `d1a-editor-autosave` | Persist giữa sessions, clear khi New Project |
