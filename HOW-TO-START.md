# HOW TO START — D1A Motion Editor

> Đọc file này trước khi làm bất cứ điều gì với repo này.
> Dành cho: người dùng mới, AI assistant (Claude, Cursor…), developer onboard.

---

## Nếu bạn là AI có terminal access

Chạy 3 lệnh này theo thứ tự — không cần đọc thêm:

```bash
pnpm install
pnpm dev
node src/scripts/test-zod-schema.mjs && node src/scripts/test-zod-reuse.mjs
```

Nếu `pnpm dev` chạy được và 62 tests pass → sẵn sàng. Editor tại `http://localhost:3000/edit`.

---

## Nếu bạn là người dùng — Cài bằng 1 lệnh tự động

### Windows

**Bước 1 — Mở PowerShell**

Có 2 cách:
- Nhấn `Win + X` trên bàn phím → chọn **"Windows PowerShell"** hoặc **"Terminal"**
- Hoặc nhấn `Win + S` → gõ `powershell` → nhấn Enter

Bạn sẽ thấy cửa sổ màu xanh đen với dấu nhắc `PS C:\Users\TênBạn>`

**Bước 2 — Cho phép chạy script (làm 1 lần duy nhất)**

Dán đoạn này vào cửa sổ PowerShell rồi nhấn Enter:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

PowerShell sẽ hỏi xác nhận — gõ chữ `Y` rồi nhấn Enter.

**Bước 3 — Chạy lệnh cài đặt**

Dán đoạn này vào PowerShell rồi nhấn Enter:

```powershell
iex (iwr "https://raw.githubusercontent.com/vuthetruhub-star/remotion-editer/main/scripts/setup.ps1").Content
```

Script sẽ tự động làm tất cả — chờ khoảng 2-5 phút.

Khi thấy chữ **READY** màu xanh lá → xong.

**Nếu gặp lỗi "iwr 404"**: chạy dòng này trước rồi thử lại Bước 3:
```powershell
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
```

---

### Mac / Linux

Mở **Terminal** rồi dán lệnh này:

```bash
curl -fsSL https://raw.githubusercontent.com/vuthetruhub-star/remotion-editer/main/scripts/setup.sh | bash
```

Chờ khoảng 2-5 phút. Khi thấy **READY** → xong.

---

## Script tự động làm gì?

```
Bước 1 — Kiểm tra git, node, pnpm đã cài chưa
Bước 2 — Clone repo vào thư mục Downloads
Bước 3 — Chạy pnpm install (cài toàn bộ dependencies)
Bước 4 — Chạy 62 Zod tests để kiểm tra codebase
Bước 5 — Kiểm tra 12 file quan trọng có đủ không
Bước 6 — In báo cáo READY + sơ đồ file
```

---

## Sau khi cài xong — Khởi động editor

Mở PowerShell (hoặc Terminal), dán từng dòng:

```powershell
cd ~/Downloads/d1a-motion-editor
```
```powershell
pnpm dev
```

Mở trình duyệt vào: **http://localhost:3000/edit**

---

## Cài thủ công (không dùng script)

Nếu không dùng script tự động, làm từng bước:

**1. Clone repo**
```bash
git clone https://github.com/vuthetruhub-star/remotion-editer.git d1a-motion-editor
```

**2. Vào thư mục**
```bash
cd d1a-motion-editor
```

**3. Cài dependencies**
```bash
pnpm install
```

**4. Chạy editor**
```bash
pnpm dev
```

**5. Mở trình duyệt vào:** http://localhost:3000/edit

---

## Kiểm thử Zod schema

Chạy trong PowerShell hoặc Terminal từ thư mục project:

```bash
# 32 unit tests — kiểm tra schema parse, validate, defaults
node src/scripts/test-zod-schema.mjs

# 30 reuse tests — kiểm tra dùng lại schema với asset tên khác
node src/scripts/test-zod-reuse.mjs
```

Kết quả đúng: `TOTAL: 32 | PASS: 32 | FAIL: 0`

---

## Sơ đồ file quan trọng

```
HOW-TO-START.md                                     ← File này
CLAUDE.md                                           ← Hướng dẫn cho AI assistant

src/
├── brand.ts                                        ← Màu sắc, font, spacing, motion tokens
├── brand-docs/
│   ├── BRAND.md                                    ← Tài liệu brand đầy đủ
│   ├── D1A-motion.md                               ← 12 motion recipes + animation rules
│   ├── D1A-motion-describe.md                      ← Dịch ý tưởng → Remotion code
│   └── EDITOR-integration.md                       ← Hướng dẫn tạo asset mới (đọc trước khi code)
│
├── features/editor/
│   ├── editor.tsx                                  ← Entry point của editor
│   ├── navbar.tsx                                  ← Nút Download, Quality (1080p/2K/4K), New Project
│   ├── mock.ts                                     ← Dữ liệu mặc định khi mở editor
│   │
│   ├── player/items/
│   │   ├── schemas/
│   │   │   ├── _shared.ts                          ← ZOD DÙNG CHUNG: LayerSchema (9 props) + TextStyleSchema
│   │   │   └── motion-scene.schema.ts              ← Zod schema riêng cho MotionScene
│   │   └── motion-scene.tsx                        ← Remotion composition (animation code)
│   │
│   ├── control-item/
│   │   └── basic-motion-scene.tsx                  ← Panel điều khiển bên phải
│   │
│   ├── store/
│   │   └── use-download-state.ts                   ← Quản lý export: scale, format, progress
│   │
│   └── utils/
│       └── autosave.ts                             ← Tự lưu vào localStorage
│
├── scripts/
│   ├── remotion-render.mjs                         ← Script render video (chạy riêng, tránh SSR lỗi)
│   ├── test-zod-schema.mjs                         ← 32 unit tests cho Zod schema
│   └── test-zod-reuse.mjs                          ← 30 tests kiểm tra tái sử dụng schema
│
└── app/
    ├── edit/
    │   ├── editor-client.tsx                       ← Bọc editor với "use client" + ssr:false
    │   └── page.tsx
    └── api/
        └── render-local/route.ts                   ← API nhận yêu cầu export → chạy render script
```

---

## Tạo asset mới

1. Đọc `src/brand-docs/EDITOR-integration.md`
2. Tạo file schema mới, import từ `_shared.ts`:

```ts
import { LayerSchema, LayerTextStyleSchema, DEFAULT_LAYER, zIdxOf, sanitizeZOrder }
  from './_shared';
```

3. Khai báo `ORDERABLE_KEYS` riêng cho asset của bạn → xong.

---

## Lỗi thường gặp

| Lỗi thấy | Nguyên nhân | Cách sửa |
|---|---|---|
| `iwr : 404 Not Found` | Code chưa push lên GitHub | `git push origin main` |
| `iwr not found` / lỗi TLS | PowerShell cần bật TLS 1.2 | Chạy: `[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12` |
| Port 3000 bị chiếm | App cũ chưa tắt | `pnpm dev` tự kill port qua predev script |
| Trang trắng / editor crash | Remotion SSR conflict | `editor-client.tsx` đã fix sẵn, không cần làm gì |
| Zod test fail | localStorage cũ không khớp schema mới | Xoá localStorage trong DevTools hoặc export JSON preset trước |
| `pnpm: command not found` | Chưa cài pnpm | Chạy: `npm install -g pnpm` |
