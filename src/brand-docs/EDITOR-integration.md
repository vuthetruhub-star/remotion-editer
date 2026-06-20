# Editor — Tích Hợp Motion Asset

> Từ composition → timeline → control panel → editor.
> Đọc file này trước khi tích hợp motion asset mới.

---

## 🔴 LUẬT CỨNG — KHÔNG BỊA, PHẢI HỎI

> **Áp dụng cho mọi AI làm việc trong repo này. Không có ngoại lệ.**

Nếu bất kỳ thông tin nào dưới đây **chưa được user cung cấp rõ ràng**, AI **phải hỏi trước**:

| Thông tin | Ví dụ cần hỏi |
|---|---|
| **TIMING / beats** | "Scene này có bao nhiêu beats? Mỗi beat bắt đầu/kết thúc ở giây nào?" |
| **Nội dung text** | "Text hiển thị là gì? Có fields nào user chỉnh được không?" |
| **Layout / structure** | "Card ở giữa màn hình hay lệch? Có bao nhiêu element?" |
| **Animation style** | "Icon animate theo kiểu gì? Fade? Slide? Scale?" |
| **Màu sắc** | "Màu nền? Màu text? Màu accent?" |
| **Size & spacing** | "Card chiếm bao nhiêu % màn hình? Khoảng cách giữa các element?" |

### Khi nào được tự quyết định:

```
✅ User gửi reference image/video  → copy y hệt từ reference
✅ Thông tin có trong file user gửi → đọc từ file
❌ Không có nguồn nào rõ ràng      → PHẢI HỎI
```

### Hậu quả của việc tự bịa:

- TIMING sai → key không tồn tại trong motion-config.ts → **runtime crash**
- Size sai → card bé xíu trên canvas 1080px → **phải làm lại toàn bộ**
- Fields sai → Zod schema không khớp mock.ts → **editor không load được scene**

---

## 🔴 ĐỌC _shared.ts TRƯỚC KHI VIẾT SCHEMA (BẮT BUỘC)

Trước khi định nghĩa Zod schema, AI **phải đọc**:

```
src/features/editor/player/items/schemas/_shared.ts
```

| Export | Dùng cho |
|---|---|
| `LayerSchema` | Mọi sub-layer (card, icon, image…) |
| `LayerTextStyleSchema` | Mọi text layer |
| `zIdxOf(key, zOrder)` | Tính z-index từ zOrder array |
| `sanitizeZOrder(...)` | Validate zOrder khi parse |

**Không được** tự tạo props như `opacity`, `blur`, `x`, `y` — đã có trong `LayerSchema`.
**Không được** tự tạo props như `color`, `bold`, `textAlign` — đã có trong `LayerTextStyleSchema`.

---

## 🚨 SIZE & LAYOUT — ƯU TIÊN REFERENCE

```
1. Reference image/video user gửi  → ƯU TIÊN TUYỆT ĐỐI — copy y hệt
2. Không có reference              → HỎI USER trước khi quyết định
3. File gốc user upload            → CHỈ đọc logic, KHÔNG copy pixel values
```

**Tại sao không copy từ file user upload?**
File user upload thường viết cho web 360–400px. Canvas là **1080×1920px** — gấp 3×.

### Khi KHÔNG có reference — bảng minimum (chỉ để tham khảo, phải hỏi user):

| Element | Tối thiểu trên 1080×1920 |
|---|---|
| Card width | 780px (~72% canvas) |
| Card height | 900px (~47% canvas) |
| Font heading | 48px |
| Font display/hero | 120px |
| Font body/label | 36px |
| Icon/SVG | 200px |

---

## Triết lý

**Luôn 2 file. Không bao giờ 3.**

```
motion-config.ts   ← CONFIG, TIMING, easing functions
motion-scene.tsx   ← Zod schema + Beat components + MotionScene + editor wrapper
```

Schema nhúng thẳng vào đầu `motion-scene.tsx` — không tạo file riêng.

---

## Bước 1 — Viết motion-config.ts

Mở file template `src/features/editor/motion-config.ts` và điền vào:

```ts
export const CONFIG = {
  fps:        30,
  duration:   0,   // ← điền tổng giây từ yêu cầu scene
  background: 'transparent',
  width:      1080,
  height:     1920,
};

export const TIMING = {
  // ← đặt tên beats + giá trị từ yêu cầu scene
  // Rule: beat cuối (start + duration) === CONFIG.duration
};
```

**Không có COLORS object. Không có giá trị mặc định nào ngoài ACCENT + FONT.**

---

## Bước 2 — Viết motion-scene.tsx

Mở file template `src/features/editor/player/items/motion-scene.tsx` và điền vào 6 mục `← FILL`:

```
A. ORDERABLE_KEYS  — danh sách layers
B. Schema          — fields + defaults từ reference (KHÔNG tự bịa giá trị)
C. SceneIcon       — SVG icon phù hợp nội dung
D. Background      — màu nền + lighting từ reference
E. Layout          — cách xếp layer theo reference
F. Tên function    — tên mô tả scene
```

**Mọi default trong schema phải có nguồn từ reference hoặc user cung cấp.**

---

## Bước 3 — 5 Điểm Đăng Ký Editor

### #1 — player/items/index.ts
```ts
export { default as MotionScene } from "./motion-scene";
```

### #2 — timeline/items/motion-scene.ts
```ts
import { ResizableItem } from "@designcombo/timeline";
export default class MotionScene extends ResizableItem {
  static type = "MotionScene";
  initialize(options: Record<string, unknown>) {
    super.initialize({ ...options, fill: "#000000", label: "Motion Scene" });
    return this;
  }
}
```

### #3 — timeline/timeline.tsx
```ts
import { MotionScene } from "./items";
CanvasTimeline.registerItems({ ..., MotionScene });
// sizesMap: motionScene: 40
// itemTypes: "motionScene"
```

### #4 — control-item/basic-motion-scene.tsx
```tsx
export default function BasicMotionScene({ trackItem }: { trackItem: ITrackItem }) {
  // Tabs cho từng layer — đọc/ghi qua dispatch EDIT_OBJECT vào metadata
  return <div>{/* inputs cho editable fields */}</div>;
}
```

### #5 — control-item/control-item.tsx
```ts
import BasicMotionScene from "./basic-motion-scene";
motionScene: <BasicMotionScene trackItem={trackItem} />,
```

---

## Bước 4 — mock.ts

```ts
const DURATION_MS = 0; // ← CONFIG.duration * 1000

metadata: {
  // ← điền đúng field names từ schema, đúng giá trị từ reference
  // mọi field phải khớp chính xác với Zod schema đã định nghĩa
  accentColor: '#00FF41',
  zOrder: [/* ← tên layers theo ORDERABLE_KEYS */],
}
```

> **metadata trong mock.ts phải khớp chính xác với Zod schema fields.**

---

## Checklist sau khi viết xong (BẮT BUỘC CHẠY)

```bash
node src/scripts/test-motion-schema.mjs
```

- [ ] **`test-motion-schema.mjs` → 0 FAIL**
- [ ] **`_shared.ts` đã đọc** trước khi viết schema
- [ ] **Không có COLORS object** trong motion-config.ts
- [ ] **Màu, size, spacing** đọc từ schema — không hardcode trong JSX
- [ ] Chỉ có **2 file**: `motion-config.ts` và `motion-scene.tsx`
- [ ] Beat components nhận `{ f, data }` — không có `useCurrentFrame()` bên trong
- [ ] `useCurrentFrame()` CHỈ trong `SceneContent`
- [ ] `mock.ts` metadata khớp đúng với schema fields
- [ ] TypeScript: 0 errors trong `src/`

---

*Editor Integration v5.0 — Reference-first · Schema-driven · No hardcode*
