# HOW TO START — D1A Motion Editor

Clone, cài đặt và chạy editor trong 1 lệnh duy nhất.

---

## Yêu cầu trước khi cài

| Thứ cần có | Kiểm tra | Tải về |
|---|---|---|
| Git | `git --version` | https://git-scm.com |
| Node.js 18+ | `node --version` | https://nodejs.org |
| pnpm | `pnpm --version` | tự cài ở bước dưới |

---

## Cài đặt — Windows (PowerShell)

### Bước 1 — Mở PowerShell với quyền Admin

`Win + X` → **Windows PowerShell (Admin)**

### Bước 2 — Bỏ khoá script (làm 1 lần duy nhất)

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Gõ `Y` → Enter.

### Bước 3 — Chạy setup

```powershell
iex (iwr "https://raw.githubusercontent.com/vuthetruhub-star/remotion-editer/main/scripts/setup.ps1").Content
```

Script tự động:
- Clone repo vào `Downloads\d1a-motion-editor`
- Cài tất cả dependencies (`pnpm install`)
- Chạy Zod tests (62 tests)
- Kiểm tra 12 file quan trọng
- Báo **READY** nếu mọi thứ đúng

### Nếu gặp lỗi TLS / "iwr not found"

Chạy dòng này trước rồi thử lại Bước 3:

```powershell
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
```

---

## Cài đặt — Mac / Linux (Terminal)

```bash
curl -fsSL https://raw.githubusercontent.com/vuthetruhub-star/remotion-editer/main/scripts/setup.sh | bash
```

---

## Sau khi setup xong

```bash
cd ~/Downloads/d1a-motion-editor
pnpm dev
```

Mở trình duyệt: **http://localhost:3000/edit**

---

## Chạy thủ công (không dùng script)

```bash
git clone https://github.com/vuthetruhub-star/remotion-editer.git
cd remotion-editer
pnpm install
pnpm dev
```

---

## Kiểm thử Zod schema (tuỳ chọn)

```bash
# Unit tests — 32 tests
node src/scripts/test-zod-schema.mjs

# Reusability tests — 30 tests (MotionScene · LogoBanner · StatsCard)
node src/scripts/test-zod-reuse.mjs
```

---

## File map — Dành cho AI / Developer mới

```
src/
├── brand.ts                                        ← Design tokens (màu, font, spacing, radii, motion)
├── brand-docs/
│   ├── BRAND.md                                    ← Tài liệu brand đầy đủ
│   ├── D1A-motion.md                               ← 12 motion recipes + rules
│   ├── D1A-motion-describe.md                      ← Dịch plain language → Remotion code
│   └── EDITOR-integration.md                       ← Hướng dẫn tạo asset mới (đọc trước khi code)
│
├── features/editor/
│   ├── editor.tsx                                  ← Entry point của editor
│   ├── navbar.tsx                                  ← Download · Quality · New Project
│   ├── mock.ts                                     ← Design data mặc định khi khởi động
│   │
│   ├── player/items/
│   │   ├── schemas/
│   │   │   ├── _shared.ts                          ← ZOD SHARED: LayerSchema · TextStyleSchema · zIdxOf
│   │   │   └── motion-scene.schema.ts              ← Zod schema của MotionScene asset
│   │   └── motion-scene.tsx                        ← Remotion composition
│   │
│   ├── control-item/
│   │   └── basic-motion-scene.tsx                  ← Control panel (right sidebar)
│   │
│   ├── store/
│   │   └── use-download-state.ts                   ← Export state: scale · format · progress
│   │
│   └── utils/
│       └── autosave.ts                             ← localStorage autosave helpers
│
├── scripts/
│   ├── remotion-render.mjs                         ← Render script (child process, tránh SSR clash)
│   ├── test-zod-schema.mjs                         ← Zod unit tests (32 tests)
│   └── test-zod-reuse.mjs                          ← Zod reuse tests (30 tests)
│
└── app/
    ├── edit/
    │   ├── editor-client.tsx                       ← SSR fix: "use client" + ssr:false wrapper
    │   └── page.tsx
    └── api/
        └── render-local/route.ts                   ← API: nhận POST → spawn render script
```

---

## Khi tạo asset mới

1. Đọc `src/brand-docs/EDITOR-integration.md`
2. Tạo schema mới — import từ `_shared.ts`:

```ts
import { LayerSchema, LayerTextStyleSchema, DEFAULT_LAYER, zIdxOf, sanitizeZOrder }
  from './_shared';
```

3. Khai báo `ORDERABLE_KEYS` của asset → xong.

---

## Các lỗi thường gặp

| Lỗi | Nguyên nhân | Fix |
|---|---|---|
| `404 Not Found` khi chạy iwr | Chưa push code lên GitHub | `git push origin main` |
| `iwr not found` | PowerShell quá cũ hoặc lỗi TLS | Chạy lệnh TLS ở trên |
| Port 3000 đã bị chiếm | App cũ chưa tắt | `pnpm dev` tự kill port qua predev script |
| Editor trắng / crash | Remotion SSR conflict | editor-client.tsx đã fix, không cần làm gì thêm |
| Zod test fail sau đổi schema | localStorage data cũ không match | Xoá localStorage hoặc export JSON preset trước |
