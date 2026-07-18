# Motion Editor — Claude Instructions

This repo is a Next.js video editor with a built-in Remotion player, timeline,
and control panels.

## Nếu đây là lần đầu mở repo này (fresh clone)

**Đọc `HOW-TO-START.md` trước** — file đó có đủ:
- Lệnh cài đặt từng bước (Windows / Mac / Linux)
- Sơ đồ toàn bộ file quan trọng trong project
- Lệnh chạy Zod tests để kiểm tra sức khoẻ codebase

**AI có terminal access tự cài theo thứ tự này:**

```bash
pnpm install
node src/scripts/test-zod-schema.mjs && node src/scripts/test-zod-reuse.mjs
```

`pnpm install` tự chạy `postinstall` (`scripts/setup-symlinks.mjs`) và tự tạo
2 symlink root (`motion-config.ts`, `motion-scene.tsx`) — không cần AI tự tạo
tay nữa. Nếu vì lý do gì đó (thường là Windows chưa bật Developer Mode) symlink
không tự tạo được, chạy tay:
```bash
node scripts/setup-symlinks.mjs
```

Khởi động (Windows — PowerShell không tự load PATH nên dùng full path):
```powershell
& "C:\Users\Admin\AppData\Roaming\npm\pnpm.cmd" dev
```
Mac / Linux:
```bash
pnpm dev
```

> Symlink không lên GitHub (xem `.gitignore`) — `postinstall` tự tái tạo mỗi lần
> clone mới. AI chỉ cần tự chạy `scripts/setup-symlinks.mjs` nếu bước tự động
> báo lỗi quyền, không cần hỏi user.

## Running this project
- `pnpm install`
- `pnpm dev` — starts the Next.js editor at http://localhost:3000
- This is NOT a `npx remotion studio` project — there is no separate Remotion
  CLI workflow. Remotion runs inside the editor via `@remotion/player`.

## Tài liệu kỹ thuật
Trước khi viết bất kỳ composition/element/control panel nào, đọc:
- `src/brand-docs/D1A-motion.md` — easing functions, motion pattern, beat-based rules
- `src/brand-docs/D1A-motion-describe.md` — cách mô tả motion bằng ngôn ngữ thường
- `src/brand-docs/EDITOR-integration.md` — **cách thêm motion asset mới** vào editor

## Biên tập & "taste" khi làm motion — đọc skill `motion-edit-craft`
Repo có sẵn một Claude Code skill tại `.claude/skills/edit-video-taste/motion-edit-craft/` (tự nạp khi mở repo bằng
Claude Code). Đây là NGUỒN kiến thức biên tập/craft — dùng khi **quyết định làm gì** (chọn visual cho
một beat nội dung, timing khớp voiceover, hook, mật độ, caption cadence, SFX), song song với các file
kỹ thuật ở trên (quyết định **làm thế nào**).
- `.claude/skills/edit-video-taste/motion-edit-craft/SKILL.md` — triết lý 2 trục (reference quyết "trông thế nào";
  skill dẫn "cách thể hiện") + quy trình 7 bước.
- `knowledge/taste-rules.md` — visual phải DẠY chứ không lặp lời; hook; mật độ; thứ bậc nguồn asset.
- `knowledge/scene-catalog.md` — 50 loại overlay → recipe map sang schema layer + TIMING của repo.
- `knowledge/motion-taste.md` · `caption-rules.md` · `sfx-rules.md` · `image-style.md`.
> Kiến thức trong skill và trong repo là MỘT — skill được commit thẳng vào repo để mọi bản clone +
> Claude Code đều hiểu đủ để làm. `D1A-motion.md` vẫn là nguồn kỹ thuật gốc cho easing/pattern; skill
> chỉ thêm lớp "taste" mà repo chưa có.

## Brand defaults — chỉ 2 thứ được giữ làm default
- **Accent color duy nhất**: `#00FF41` — dùng làm `accentColor` default trong schema
- **Font**: `Geist, system-ui, sans-serif` — dùng làm font mặc định

**Tất cả thứ khác** (màu phụ, spacing, radii, size, background) **KHÔNG được hardcode**.
Lấy từ reference hoặc hỏi user.

## Luật ưu tiên khi viết motion

1. **Có reference (ảnh/video)** → copy y hệt: màu, kích thước card/icon/text, khoảng cách, căn lề, bố cục. Không áp style mặc định lên.
2. **Không có reference** → **PHẢI hỏi user** trước khi implement. Hỏi đủ: màu nền, màu text, kích thước card, font size, khoảng cách giữa các asset, bố cục.
3. **Không được bịa** bất kỳ giá trị visual nào khi không có reference và chưa hỏi user.

## Motion Code Pattern (BEAT-BASED — bắt buộc)

**ĐÚNG:**
- Truyền `{ f, data }` prop vào mọi Beat component — KHÔNG dùng `useCurrentFrame()` bên trong
- Custom easing: `s4ei()`, `s4eo()`, `s4vis()`, `s4eb()` từ motion-config
- Timing theo **giây** trong TIMING object (không hardcode frame)
- `useCurrentFrame()` CHỈ trong wrapper entry point (`SceneContent`)

**SAI:**
- `useCurrentFrame()` bên trong Beat component
- `interpolate()` từ Remotion trong composition
- Tạo file schema riêng (`.schema.ts`) — schema phải nằm trong `motion-scene.tsx`
- Animate `width`, `height`, `top`, `left`

## Zod schema — LUÔN nhúng trong motion-scene.tsx

- Schema Zod **luôn có** — mọi scene đều có editable fields (màu, text, icon...)
- **KHÔNG tạo file schema riêng** — nhúng thẳng vào đầu `motion-scene.tsx`
- Chỉ 2 file cho mỗi motion: `motion-config.ts` + `motion-scene.tsx`
- Chi tiết: `src/brand-docs/EDITOR-integration.md`

## Template files

Khi tạo scene mới, dùng 2 file template đã có sẵn:
```
src/features/editor/motion-config.ts
src/features/editor/player/items/motion-scene.tsx
```

Điền vào các mục đánh dấu `← FILL`. Không copy giá trị từ scene cũ.

## Confirm trước khi implement

Khi user yêu cầu thay đổi, **phân tích và hỏi lại trước** — không implement ngay.
Trình bày: cách tiếp cận + tradeoff + ước tính phức tạp. Chờ xác nhận.

## Known gaps / roadmap (control-item panels)
The existing control panels in `src/features/editor/control-item/common/`
already cover: transform (position/scale/rotation), opacity, blur,
brightness, flip, shadow (glow), speed. Still missing, to be added later
following the same patterns:
- `contrast` (alongside `brightness.tsx`)
- `skewX` / `skewY` (alongside `transform.tsx`)
- Copy/paste of only the "effects" group between two different elements
- Group/ungroup (linked properties across multiple selected elements)
