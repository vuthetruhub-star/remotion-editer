# d1a-editor — Claude Instructions

This repo is `designcombo/react-video-editor` (Next.js video editor app with a
built-in Remotion player, timeline, and control panels) combined with the
D1AGENCY brand/design system.

## Nếu đây là lần đầu mở repo này (fresh clone)

**Đọc `HOW-TO-START.md` trước** — file đó có đủ:
- Lệnh cài đặt từng bước (Windows / Mac / Linux)
- Sơ đồ toàn bộ file quan trọng trong project
- Lệnh chạy Zod tests để kiểm tra sức khoẻ codebase

**AI có terminal access (Claude Code, Cursor…) tự cài theo thứ tự này:**

```bash
pnpm install
node src/scripts/test-zod-schema.mjs && node src/scripts/test-zod-reuse.mjs
```

Tạo 2 symlink ở thư mục gốc (Windows PowerShell):
```powershell
New-Item -ItemType SymbolicLink -Path "motion-config.ts" -Target "src\features\editor\motion-config.ts"
New-Item -ItemType SymbolicLink -Path "motion-scene.tsx" -Target "src\features\editor\player\items\motion-scene.tsx"
```

Mac / Linux:
```bash
ln -s src/features/editor/motion-config.ts motion-config.ts
ln -s src/features/editor/player/items/motion-scene.tsx motion-scene.tsx
```

Rồi khởi động (Windows — PowerShell không tự load PATH nên dùng full path):
```powershell
& "C:\Users\Admin\AppData\Roaming\npm\pnpm.cmd" dev
```
Mac / Linux:
```bash
pnpm dev
```

> Symlink này cho phép user sửa `motion-config.ts` ở thư mục gốc thay vì phải
> vào sâu `src/features/editor/`. Symlink không lên GitHub — **AI phải tự tạo
> lại mỗi lần clone mới**, không cần hỏi user.

## Running this project
- `pnpm install`
- `pnpm dev` — starts the Next.js editor at http://localhost:3000
- This is NOT a `npx remotion studio` project — there is no separate Remotion
  CLI workflow. Remotion runs inside the editor via `@remotion/player`.

## Design System (always read these first)
Before writing or styling any composition/element/control panel, read:
- `src/brand-docs/BRAND.md` — color, font, spacing, radii, motion token reference
- `src/brand-docs/D1A-motion.md` — D1AGENCY brand system, motion rules, 12 enhancement recipes
- `src/brand-docs/D1A-motion-describe.md` — how to translate plain language motion descriptions into Remotion code
- `src/brand-docs/EDITOR-integration.md` — **how to add a new motion asset** to the editor (composition → timeline → control panel → Zod schema)
- `src/brand.ts` — live design tokens (import these, never hardcode values)

## Token rules
When adding or editing elements, control panels, or compositions, import from
`src/brand.ts`:
- Colors → `colors.*`
- Fonts → `fonts.*`
- Spacing → `spacing.*`
- Radii → `radii.*`
- Motion timing → `motion.*` (all values in frames at 30fps)

## Remotion rules (apply inside player/composition code)
- CSS transitions and CSS animations are FORBIDDEN inside Remotion
  compositions/animated items — they will not render correctly when exported.
- Use `useCurrentFrame()` + `interpolate()` for all frame-based animation.
- Always get `fps` from `useVideoConfig()` — never hardcode 30.
- Use `<Sequence from={} durationInFrames={}>` to time elements.
- Use `staticFile()` for assets in the `public/` folder.
- Use `<Img>`, `<Video>`, `<Audio>` from remotion — not plain HTML tags.
- Never make implementation decisions on your own — follow only explicit
  instructions, and confirm before large refactors.

## Zod schema workflow (ZOD-FIRST — không làm lại)

Viết Zod schema **song song** với animation, không phải sau khi hoàn thành animation.

- Schema file: `src/features/editor/player/items/schemas/[name].schema.ts`
- Mọi asset đều dùng **LayerSchema** (9 props: x, y, scale, rotate, opacity, fromFrame, durationFrames, blur, brightness)
- Import từ `src/features/editor/player/items/schemas/_shared.ts` — không viết lại LayerSchema
- Zod **không** ảnh hưởng chất lượng Remotion — chỉ validate `item.metadata` JSON ở cửa vào
- Chi tiết đầy đủ: `src/brand-docs/EDITOR-integration.md`

## Kiến trúc layer (sibling wrappers — KHÔNG NEST)

Mọi sub-layer trong composition phải là **sibling** (cùng cấp), KHÔNG phải child của layer khác.

```
scene-root (position: relative)
  ├── background (AbsoluteFill, zIndex 0)
  ├── layer1 (position: absolute, zIndex từ zIdxOf())
  ├── layer2 (position: absolute, zIndex từ zIdxOf())   ← ĐÚNG
  └── text   (position: absolute, fully independent)
```

Nếu layer này nằm trong transform div của layer khác → scale/spin bị liên kết → KHÔNG chỉnh độc lập được.

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
