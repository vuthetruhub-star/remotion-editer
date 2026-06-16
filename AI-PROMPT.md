# AI-PROMPT.md — Prompt mẫu để làm việc với D1A Motion Editor

> Copy toàn bộ đoạn trong khung bên dưới và paste vào AI (Claude, Cursor, ChatGPT…)
> khi bắt đầu một phiên làm việc mới với repo này.

---

## Prompt mẫu — Setup project (dùng khi clone mới)

```
Tôi có một repo Next.js + Remotion tại: https://github.com/vuthetruhub-star/remotion-editer

Hãy setup project cho tôi theo đúng thứ tự sau:
1. Clone repo (nếu chưa có)
2. pnpm install
3. Tạo symlink: motion-config.ts ở thư mục gốc trỏ vào src/features/editor/motion-config.ts
   - Windows: New-Item -ItemType SymbolicLink -Path "motion-config.ts" -Target "src\features\editor\motion-config.ts"
   - Mac/Linux: ln -s src/features/editor/motion-config.ts motion-config.ts
4. Chạy 62 Zod tests để kiểm tra: node src/scripts/test-zod-schema.mjs && node src/scripts/test-zod-reuse.mjs
5. Khởi động editor: pnpm dev

Sau đó đọc CLAUDE.md để hiểu cách repo này hoạt động trước khi làm bất cứ điều gì.
```

---

## Prompt mẫu — Làm motion mới

```
Trước khi làm bất cứ điều gì, hãy đọc lần lượt các file sau:

1. CLAUDE.md                                         — quy tắc và kiến trúc repo
2. src/brand.ts                                      — màu, font, spacing, motion tokens
3. src/brand-docs/BRAND.md                           — design system D1A đầy đủ
4. src/brand-docs/D1A-motion.md                      — 12 motion recipe sẵn có
5. src/brand-docs/D1A-motion-describe.md             — cách dịch ý tưởng → Remotion code
6. src/features/editor/player/items/motion-scene.tsx — code animation hiện tại làm reference
7. motion-config.ts                                  — cấu trúc layer hiện tại

Sau khi đọc xong, tôi muốn làm motion mới với mô tả sau:
[MÔ TẢ MOTION CỦA BẠN Ở ĐÂY]

Ví dụ:
- 1 background tối
- 1 logo ở giữa (asset)
- 1 dòng tiêu đề phía dưới logo (text)
- 1 dòng mô tả nhỏ hơn (text)

Hãy trả về ĐÚNG 2 FILE, không thêm không bớt:

### FILE 1 — motion-config.ts
Chỉ phần LAYER_CONFIG và TEXT_DEFAULTS. Không thay đổi phần còn lại của file.
Không tạo mock.ts, không tạo schema — các file đó tự cập nhật theo config.

### FILE 2 — src/features/editor/player/items/motion-scene.tsx
File animation hoàn chỉnh, có thể paste vào repo và chạy ngay.
Yêu cầu bắt buộc:
- Import layerKey từ motion-config, KHÔNG hardcode tên layer
- Dùng token từ src/brand.ts (colors.*, fonts.*, radii.*) — KHÔNG hardcode màu/font
- KHÔNG dùng CSS transition hay CSS animation — dùng useCurrentFrame() + interpolate()
- Lấy fps từ useVideoConfig() — không hardcode 30
- Tất cả layer là sibling (cùng cấp), KHÔNG nest layer trong layer khác
- Export default function MotionScene với đúng signature:
  ({ item, options }: { item: ITrackItem; options: SequenceItemOptions })
- Dùng parseMotionSceneMeta(item.metadata) để lấy data
- Wrap bằng BaseSequence như file gốc

Sau khi tôi paste 2 file vào repo:
- Chạy: node src/scripts/test-zod-schema.mjs && node src/scripts/test-zod-reuse.mjs
- Báo cáo kết quả pass/fail
```

---

## Cách repo này tư duy (đọc để hiểu trước khi làm)

### 1. Single config file
Toàn bộ cấu trúc layer của 1 motion được khai báo trong **1 file duy nhất**:
```
motion-config.ts  (hoặc src/features/editor/motion-config.ts — cùng 1 file)
```
Sửa file này → Zod schema, control panel, mock data tự cập nhật. Không sửa file nào khác.

### 2. Ba loại layer
| Loại | Dùng cho | Zod props tự có |
|---|---|---|
| `"background"` | Nền, luôn z=0, không reorder | LayerSchema (9 props) |
| `"asset"` | Hình, icon, card, trang trí | LayerSchema (9 props) |
| `"text"` | Mọi dòng chữ | LayerSchema + TextStyleSchema (17 props) |

Props không gắn theo tên layer — gắn theo **loại**. Layer tên `folder` hay `logo` hay `card1` đều như nhau nếu cùng type `"asset"`.

### 3. LayerSchema — 9 props cho mọi layer
```
x, y, scale, rotate, opacity, fromFrame, durationFrames, blur, brightness
```

### 4. TextStyleSchema — 8 props thêm vào cho text layer
```
bold, underline, textTransform, color, textAlign, strokeWidth, strokeColor, maxWidth
```

### 5. Quy tắc animation (KHÔNG được phá vỡ)
- **KHÔNG dùng CSS transition / CSS animation** — không render được khi export
- **PHẢI dùng** `useCurrentFrame()` + `interpolate()` cho mọi animation
- Lấy `fps` từ `useVideoConfig()` — không hardcode 30
- Dùng `<Sequence from={} durationInFrames={}>` để timing
- Dùng `staticFile()` cho asset trong `public/`
- Dùng `<Img>`, `<Video>`, `<Audio>` từ remotion — không dùng HTML tag thường

### 6. Kiến trúc layer — SIBLING, không NEST
```
scene-root
  ├── background  (AbsoluteFill, zIndex 0)
  ├── layer1      (position: absolute, zIndex từ zIdxOf())
  ├── layer2      (position: absolute, zIndex từ zIdxOf())
  └── text        (position: absolute, fully independent)
```
Layer KHÔNG được nằm trong transform div của layer khác.

### 7. Workflow đổi motion mới
1. Sửa `motion-config.ts` — khai báo layers mới
2. Nhờ AI viết animation trong `motion-scene.tsx`
3. Bấm **New Project** trong editor (icon FilePlus, góc trên trái) để xóa localStorage
4. Reload → thấy motion mới

### 8. File quan trọng
```
motion-config.ts                                    ← CHỈ SỬA FILE NÀY khi đổi motion
src/features/editor/player/items/motion-scene.tsx   ← Animation code (AI viết)
src/features/editor/player/items/schemas/
  ├── _shared.ts               ← LayerSchema + TextStyleSchema (không sửa)
  └── motion-scene.schema.ts   ← Tự derive từ motion-config.ts (không sửa)
src/features/editor/control-item/basic-motion-scene.tsx  ← Control panel (không sửa)
src/features/editor/mock.ts                         ← Mock data (không sửa)
```

---

## Kiểm tra sức khoẻ codebase

```bash
node src/scripts/test-zod-schema.mjs   # 32 unit tests
node src/scripts/test-zod-reuse.mjs    # 30 reuse tests
```

Kết quả đúng: `TOTAL: 32 | PASS: 32 | FAIL: 0` và `TOTAL: 30 | PASS: 30 | FAIL: 0`
