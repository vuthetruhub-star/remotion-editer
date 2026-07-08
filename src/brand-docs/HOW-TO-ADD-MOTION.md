# Cách viết 1 motion mới — mô hình 2 file (đọc trước khi viết code)

Dự án này dùng đúng **2 file nội dung** cho MỌI motion, không hơn:

```
src/features/editor/motion-config.ts               ← CONFIG, TIMING, easing
src/features/editor/player/items/motion-scene.tsx   ← Zod schema + component + PANEL_SECTIONS
```

Không có registry, không có file panel riêng, không có file timeline riêng cho
từng ý tưởng motion. Toàn bộ phần "đăng ký" (`sequence-item.tsx`,
`control-item.tsx`, `timeline/timeline.tsx`, `timeline/items/motion-scene.ts`,
`control-item/basic-motion-scene.tsx`) đã CỐ ĐỊNH sẵn — **không bao giờ sửa
các file đó khi đổi ý tưởng motion.**

**Đánh đổi đã được user xác nhận chấp nhận:** tại 1 thời điểm, project chỉ có
1 motion (1 loại track-item duy nhất, tên cố định `motionScene`). Làm motion
mới = GHI ĐÈ nội dung 2 file trên, không phải thêm 1 loại mới song song. Điều
này KHÔNG giới hạn số lượng asset (text/icon/card/background...) bên trong 1
motion — chỉ giới hạn không có 2 motion khác ý tưởng tồn tại song song.

## Bước 0 — Có reference chưa?

- **Có ảnh/video mẫu** → copy y hệt: màu, kích thước, khoảng cách, bố cục.
  Không áp giá trị mặc định lên.
- **Không có reference** → PHẢI hỏi user trước khi viết code: màu nền, màu
  text, kích thước card/icon/text, khoảng cách giữa asset, bố cục. Không tự
  bịa bất kỳ giá trị visual nào.

## Bước 1 — Phân loại từng asset vào đúng 1 trong 3 nhóm chuẩn

Xem `src/features/editor/player/items/schemas/_shared.ts`:

| Nhóm | Dùng cho | Field |
|---|---|---|
| `TextLayerSchema` | headline / text / title / subtitle | x, y, scale, rotate, bold, underline, italic, textTransform, color, lineHeight, maxWidth, textAlign |
| `AssetLayerSchema` | card / hình khối / icon / ảnh (đa số asset) | x, y, rotate, color, scale, effectDuration (tốc độ vào/ra) |
| `BackgroundSchema` | nền cả composition | color |

**Không tự bịa field riêng nếu đã có sẵn trong 3 nhóm này** — dùng thẳng, đảm
bảo panel tự sinh đúng và đồng nhất giữa mọi motion. Chỉ khai schema ad-hoc khi
field thực sự đặc thù cho scene (vd 1 enum riêng như "icon nào đang được nhấn
mạnh") — khai ngay trong `motion-scene.tsx`, không tạo file `.schema.ts` riêng.

## Bước 2 — Viết `motion-config.ts`

Điền `CONFIG.duration` (giây) và `TIMING` (chia scene thành các beat theo
giây, vd intro/hold/outro). Không sửa các easing function (`s4ei`, `s4eo`,
`s4vis`, `s4eb`) — dùng chung mãi mãi.

## Bước 3 — Viết `motion-scene.tsx`

1. Import schema chuẩn từ `./schemas/_shared` (Bước 1) + `TIMING`/easing từ
   `../../motion-config`.
2. Viết component con nhận `{ f, data }` qua props — **KHÔNG** dùng
   `useCurrentFrame()` bên trong. `useCurrentFrame()` chỉ xuất hiện đúng 1
   chỗ: trong `SceneContent` (wrapper entry point), không sửa khối này.
3. Không animate `width`/`height`/`top`/`left` — chỉ `transform` + `opacity`.
4. Export `PANEL_SECTIONS: PanelSection[]` — mỗi section là 1 group field sẽ
   hiện trên panel. Dùng `tabs` khi 1 field lặp lại theo danh sách (vd nhiều
   icon cùng schema); bỏ `tabs` nếu section chỉ có 1 bộ field phẳng.

Panel chỉnh sửa (`control-item/basic-motion-scene.tsx`) tự đọc
`PANEL_SECTIONS` và dùng `AutoPanel` để vẽ — **không viết tay input, không sửa
file panel này.** Thêm/bớt field trong schema → panel tự cập nhật theo.

## Bước 4 — Cập nhật `mock.ts` (dữ liệu mẫu để test ngay)

`metadata` phải khớp chính xác với schema đã viết ở Bước 3 (đúng field, đúng
nesting — vd `background: { color: '#FFFFFF' }` không phải `background:
'#FFFFFF'`). Bump `DESIGN_SCHEMA_VERSION` lên 1 số mỗi khi đổi shape metadata
— việc này tự động vô hiệu hoá autosave cũ trong trình duyệt (xem
`utils/autosave.ts`), tránh dữ liệu cũ đè lên schema mới.

## Bước 5 — Tự kiểm tra (BẮT BUỘC trước khi báo xong)

```bash
npx tsc --noEmit
```

Phải ra **0 lỗi**. Trước khi chạy, xoá 2 symlink gốc (`motion-config.ts`,
`motion-scene.tsx` ở root) nếu có, rồi tạo lại sau khi typecheck xong (Windows
PowerShell):

```powershell
New-Item -ItemType SymbolicLink -Path "motion-config.ts" -Target "src\features\editor\motion-config.ts"
New-Item -ItemType SymbolicLink -Path "motion-scene.tsx" -Target "src\features\editor\player\items\motion-scene.tsx"
```

Sau đó mở editor thật (`pnpm dev`), chọn track item, thử đổi vài field trên
panel xem canvas có phản hồi đúng không. Nếu có thể, dùng `renderStill`
(`@remotion/renderer`) để render vài frame cụ thể ra PNG và kiểm tra pixel —
đáng tin hơn chụp màn hình real-time (Player có thể chạy chậm hơn thời gian
thực trong headless Chrome, dễ gây hiểu nhầm là bug).

## Quy tắc chroma-key-safe (áp dụng cho MỌI motion)

Không đặt `box-shadow`/`filter` có blur ở cạnh **ngoài cùng** của cả
composition — dễ dính màu khi key nền. Xem comment đầu file `motion-scene.tsx`
để hiểu chi tiết + cách làm đúng (glow chỉ an toàn khi nằm trong 1 nền đục
khác, không chạm cạnh ngoài cùng).

## Những file KHÔNG BAO GIỜ cần sửa khi đổi ý tưởng motion

- `src/features/editor/player/sequence-item.tsx`
- `src/features/editor/control-item/control-item.tsx`
- `src/features/editor/control-item/basic-motion-scene.tsx`
- `src/features/editor/timeline/timeline.tsx`
- `src/features/editor/timeline/items/motion-scene.ts`
- `src/features/editor/player/items/index.ts`
- `src/features/editor/timeline/items/index.ts`

Các file này đã cố định type `"motionScene"` / class `MotionScene` — chỉ nội
dung bên trong 2 file ở Bước 2–3 thay đổi giữa các motion.
