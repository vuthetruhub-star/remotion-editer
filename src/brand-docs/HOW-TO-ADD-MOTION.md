# Cách thêm 1 KIND motion mới — mô hình dispatcher / module (đọc trước khi viết code)

> **Đã đổi (2026-07):** trước đây project chỉ có 1 motion tại một thời điểm (ghi đè 2 file). Giờ là
> **dispatcher**: `motion-scene.tsx` đọc `metadata.kind` rồi render module tương ứng trong
> `player/items/motion-scenes/`. Nhiều kind khác nhau cùng tồn tại trên timeline. **Thêm một kind =
> tạo 1 file module + thêm 1 dòng registry.** Không đụng file đăng ký editor nào khác.

```
src/features/editor/player/items/motion-scenes/
├── types.ts        ← interface MotionSceneModule (KHÔNG sửa)
├── index.ts        ← registry: kind → module  (thêm 1 dòng khi có kind mới)
├── default.tsx     ← kind "default" (fallback)
└── <kind>.tsx      ← MỖI kind một file (hook-title.tsx, stat-punch.tsx, …) — đây là thứ bạn viết
```

Đã có sẵn **49 kind** — dùng làm mẫu. `motion-config.ts` (easing `s4ei/s4eo/s4vis/s4eb` + fps) vẫn dùng chung.

---

## Hợp đồng một module (`MotionSceneModule` trong `types.ts`)

Mỗi file `<kind>.tsx` export một object gồm 4 phần:

```ts
export const <kind>Module: MotionSceneModule = {
  parseMeta,       // (metadata: unknown) => data đã validate (Zod)
  Component,        // ({ f, fps, durationInFrames, data }) => JSX  — KHÔNG dùng useCurrentFrame bên trong
  panelSections,    // PanelSection[] — panel tự sinh
  defaultMeta,      // metadata mặc định khi tạo mới / đổi sang kind này
};
```

- `f` = frame hiện tại (đã tương đối so với đầu beat). `durationInFrames`/`fps` = độ dài beat → tự canh
  entrance/exit theo độ dài (KHÔNG phụ thuộc TIMING 5s cứng).
- **Chỉ animate `transform` + `opacity`.** KHÔNG `width/height/top/left`, KHÔNG CSS transition/animation,
  KHÔNG `interpolate()` của Remotion — dùng `s4ei/s4eo/s4vis` từ `../../../motion-config`.

---

## Bước 1 — Copy một kind gần giống làm mẫu

- Text/số đơn giản → chép `stat-punch.tsx` hoặc `hook-title.tsx`.
- Đa-item (danh sách/nhiều node) → chép `vertical-timeline.tsx` hoặc `bar-chart.tsx` (dùng `item1..N` + tabs).
- Có ảnh → chép `image-card.tsx` / `tool-logo-burst.tsx` (dùng `Img` + `staticFile`).
- Sơ đồ SVG → chép `flow-diagram.tsx` / `network-spread.tsx`.

Đổi tên file `motion-scenes/<kind>.tsx` (dùng dấu gạch nối, vd `my-kind.tsx`).

## Bước 2 — Viết schema + parseMeta

- **Content/scalar dùng chung** (chuỗi, màu nền) → để **top-level** (section panel không `tabs`).
- **Nhóm item lặp** (`item1..N` / `step1..N` / `bar1..N`) → mỗi cái một object con, section panel **có `tabs`**.
- Style/vị trí của một text layer → dùng `TextLayerSchema` (từ `../schemas/_shared`) qua `tabs`.
- `appearSec` (giây tương đối đầu beat) cho mỗi item cần xuất hiện so le.
- Widget cho panel: `{type:"text"|"number"|"color"|"checkbox"|"select"|"slider"}` (xem `_shared.ts` `WidgetSpec`).

## Bước 3 — Viết Component

`function Component({ f, fps, durationInFrames, data })`. Entrance mềm (fade + rise + settle, KHÔNG bounce
trừ khi cố ý). Nền: `bgColor:"transparent"` nếu overlay lên video (mặc định), hoặc `#0A0B0A` nếu là hero độc lập.

## Bước 4 — Đăng ký (1 dòng)

Trong `motion-scenes/index.ts`:
```ts
import { myKindModule } from "./my-kind";
// …trong MOTION_SCENE_COMPONENTS:
  my_kind: myKindModule,
```
Xong. Panel + dispatcher tự nhận. **Không sửa** `basic-motion-scene.tsx`, `motion-scene.tsx`, `timeline.tsx`…

## Bước 5 — Kiểm tra

```bash
npx tsc --noEmit         # phải 0 lỗi (symlink gốc đã exclude trong tsconfig)
```
Test render một beat: viết design.json nhỏ (`{kind:"my_kind", …}`) rồi
`node scripts/render-design.mjs test.json test.mp4 --scale 0.5`, trích frame giữa beat để soi
(`ffmpeg -ss <giây> -i test.mp4 -frames:v 1 f.png`). Hoặc mở `pnpm dev`, đổi Kind trên panel.

---

## 🔴 CHROMA-KEY-SAFE (bắt buộc, mọi kind)

Composition render trên nền chroma để key ra ngoài. **KHÔNG** `box-shadow` blur>0, `filter: blur/drop-shadow`,
hay gradient alpha < 1 trên phần tử **ngoài cùng**. Cần chữ dễ đọc trên nền trong suốt → dùng
`WebkitTextStroke: "2px rgba(0,0,0,.5)"` + `paintOrder:"stroke fill"` (viền đặc, không toả). Blur/glow chỉ an
toàn khi nằm TRONG một card nền đục 100% không chạm cạnh comp.

## Luật reference-first (khi không có mẫu)

Không có ảnh/video mẫu → **hỏi user** màu/size/bố cục trước khi bịa. Có mẫu → copy y hệt. Giá trị brand mặc
định: accent `#00FF41`, font Geist, nền `#0A0B0A` (xem `src/brand.ts`).

## File KHÔNG BAO GIỜ sửa khi thêm kind
`motion-scene.tsx` (dispatcher), `basic-motion-scene.tsx`, `control-item.tsx`, `sequence-item.tsx`,
`timeline.tsx`, `timeline/items/motion-scene.ts`, `player/items/index.ts`, `schemas/_shared.ts`, `types.ts`.
Chỉ thêm 1 file `<kind>.tsx` + 1 dòng trong `motion-scenes/index.ts`.
