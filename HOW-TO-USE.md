# HƯỚNG DẪN SỬ DỤNG — từ script + video → video Short hoàn chỉnh

> Repo này là **editor motion-graphic (9:16)** + một **skill AI** (`.claude/skills/edit-video-taste/motion-edit-craft`) biết
> tự lên kịch bản motion và ráp thành bản dựng. Có 2 cách dùng: **để AI làm hộ** (chính) hoặc **tự dựng tay
> trong editor**. File này hướng dẫn cả hai.
>
> Cài đặt lần đầu: xem [HOW-TO-START.md](HOW-TO-START.md). Thêm motion mới (cho dev): xem
> [src/brand-docs/HOW-TO-ADD-MOTION.md](src/brand-docs/HOW-TO-ADD-MOTION.md).

---

## 0. Ý tưởng trong 30 giây

```
Script (text) + Video 1–2p (đã cắt CapCut)
        │
        ▼   (AI: transcribe → align → chọn kind → ghi design.json)
   design.json  ── Import ──▶  Editor (xem/chỉnh tay)  ──▶  Export MP4
        │
        └──────── render thẳng ───────────────────────▶  MP4/WebM
```
- **design.json** = một file JSON mô tả cả timeline: video nguồn + các "beat" motion (49 loại) + caption + SFX.
- **kind** = loại đồ hoạ hiện trên màn (số lớn, timeline, biểu đồ, quote, logo…). Có 49 loại — xem
  `.claude/skills/edit-video-taste/motion-edit-craft/knowledge/scene-catalog.md`.

---

## 1. CÁCH A — Để AI làm hộ (khuyến nghị)

Mở Claude Code **trong thư mục repo này** rồi làm theo:

### Bước 1 — Đưa nguyên liệu
Nói với Claude, ví dụ:
> "Dựng Short từ video này: `D:\videos\ep12.mp4`, script ở `D:\videos\ep12.txt`. Lên kịch bản motion giúp tôi."

Claude sẽ tự chạy (skill `motion-edit-craft` kích hoạt):
1. **Trích frame** để "thấy" nội dung màn hình — `python .claude/skills/edit-video-taste/motion-edit-craft/assets/extract_frames.py <video> <thư_mục_out>`
2. **Transcript** offline — `python .claude/skills/edit-video-taste/motion-edit-craft/assets/transcribe.py <video>` → `words.json` (mốc từng từ)
3. **Align script ↔ transcript** → biết mỗi câu ở giây nào
4. **Lên beat plan**: mỗi đoạn nội dung → chọn kind phù hợp (số → `stat_punch`, liệt kê → `vertical_timeline`, so sánh → `comparison_grid`…), canh timing, zoom nhấn, SFX
5. **Ghi `design.json`**

### Bước 2 — Duyệt
Claude trình kế hoạch (beat nào dùng kind gì, ở đâu). Bạn chỉnh: "beat 3 đổi sang bar_chart", "thêm zoom trước câu chốt", "gắn logo Stripe ở 0:12"… Claude cập nhật `design.json`.

### Bước 3 — Ra video (2 lựa chọn)
- **Mở trong editor để tinh chỉnh:** trong editor bấm nút **Import** (icon ⬆️, góc trái) → chọn `design.json` → chỉnh tay → **Download** (MP4).
- **Render thẳng ra file:** `node scripts/render-design.mjs <design.json>` → ra **MP4** (thêm `--transparent` nếu muốn WebM nền trong suốt để ghép ở CapCut).

---

## 2. CÁCH B — Tự dựng tay trong editor

```powershell
& "C:\Users\Admin\AppData\Roaming\npm\pnpm.cmd" dev   # hoặc: pnpm dev
```
Mở **http://localhost:3000/edit**.

- **Thêm motion:** trên timeline có sẵn một item **Motion Scene**. Chọn nó → panel bên phải có dropdown **Kind** (49 loại) → đổi kind → điền nội dung (title, value, các item…).
- **Nhiều motion:** kéo thả để có nhiều item Motion Scene trên timeline, mỗi cái một kind/timing khác nhau.
- **Video nguồn / caption / audio:** thêm qua menu bên trái như editor thường.
- **Zoom video (Ken Burns/punch-in):** đặt field `zoom` trên item video trong design.json (`{"from":1.0,"to":1.08}`), hoặc chỉnh JSON rồi Import lại.
- **Xuất:** nút **Download** (chọn MP4, chất lượng 1080p/2K/4K).

---

## 3. Bảng 49 kind — chọn cái gì cho nội dung gì

| Nội dung người nói… | Kind nên dùng |
|---|---|
| Một con số | `stat_punch` · `metric_reveal` (đếm lên) |
| Nhiều số cùng lúc | `stat_grid` · `dashboard_card` |
| So sánh giá trị | `bar_chart` · `bar_overlay` |
| Xu hướng tăng/giảm | `inline_chart` |
| Liệt kê bước | `vertical_timeline` · `progress_steps` · `list` · `bulleted_list` |
| Câu chốt / trích dẫn | `quote_pull` · `callout` · `kinetic_statement` |
| Bắn nhanh vài từ | `word_pop` · `bullet_burst` |
| So sánh A/B | `comparison_grid` (tránh `vs_split` trên Short) |
| "X trên Y" | `ratio_dots` |
| Nhắc brand/tool | `tool_logo_burst` |
| Nhắc người thật | `portrait_burst` |
| Sơ đồ/quy trình | `flow_diagram` · `network_diagram` · `concept_build` · `org_diagram` · `layer_stack` |
| Mở đầu (hook) | `hook_title` |
| Ảnh minh hoạ | `image_card` (short) · `ai_image_on_grid` (16:9) |
| Chat/tin nhắn | `chat_message` |
| Dashboard/metrics | `dashboard_card` |

Chi tiết từng kind + khi nào dùng: `.claude/skills/edit-video-taste/motion-edit-craft/knowledge/scene-catalog.md`.
Field metadata chính xác của mỗi kind: mở `src/features/editor/player/items/motion-scenes/<kind>.tsx`, xem `defaultMeta`.

---

## 4. Chuẩn bị asset (ảnh, logo, stock)

Bỏ file vào `public/` rồi tham chiếu bằng đường dẫn tương đối (vd `logos/stripe.png`).

- **Logo brand:** `python .claude/skills/edit-video-taste/motion-edit-craft/assets/fetch_logo.py --out public/logos "Stripe" "Notion"`
- **Ảnh/video stock:** `python .claude/skills/edit-video-taste/motion-edit-craft/assets/fetch_stock.py "person at desk" public/stock` (cần `PEXELS_API_KEY` free trong `.env`)
- **Lưu ý:** `.gitignore` chặn `*.png` → logo tải về sẽ không tự commit; muốn commit: `git add -f public/logos/x.png`.
- **SFX/nhạc:** bỏ file `.wav`/`.mp3` vào `public/sfx/`, `public/music/` rồi thêm audio item trong design.json. (Skill chỉ có LUẬT dùng SFX, không kèm file — bản quyền.)
- **Ảnh AI:** chỉ dùng cho khái niệm trừu tượng; theo style khoá trong `knowledge/image-style.md`.

---

## 5. Nguyên tắc quan trọng

- **Khoá 9:16 (1080×1920)** — mọi kind tinh chỉnh cho khung dọc. Không đổi tỉ lệ.
- **Chroma-key-safe:** kind nền trong suốt để key ra ở CapCut → KHÔNG dùng blur/glow ở cạnh ngoài. (Đã tuân thủ sẵn trong mọi kind.)
- **Nền trong suốt vs baked:** overlay có `bgColor:"transparent"` để thấy video dưới; scene "hero" độc lập dùng nền tối `#0A0B0A`.
- **Punch-in zoom:** chỉ cho câu nhấn mạnh, phóng VÀO TRƯỚC khi câu đó tới. Xem `knowledge/motion-taste.md §8b`.
- **Caption ↔ overlay:** không để caption đè lên beat có nhiều chữ (chọn một). Xem `knowledge/caption-rules.md`.
- **7 kind tránh trên Short** (card/landscape): `vs_split`, `lower_third`, `chapter_bar`, `keyword_chips`, `side_panel`, `corner_stat`, `notification_toast` — có sẵn nhưng để cho landscape/longform.

---

## 6. Lệnh hay dùng

```bash
# Chạy editor
pnpm dev                                             # → http://localhost:3000/edit

# Render một design.json ra MP4 (video hoàn chỉnh)
node scripts/render-design.mjs my-design.json
node scripts/render-design.mjs my-design.json out.mp4 --scale 2      # 4K
node scripts/render-design.mjs my-design.json ov.webm --transparent # overlay keyable

# Transcript offline + trích frame (pha lên kịch bản)
python .claude/skills/edit-video-taste/motion-edit-craft/assets/transcribe.py video.mp4
python .claude/skills/edit-video-taste/motion-edit-craft/assets/extract_frames.py video.mp4 frames --fps 1

# Kiểm tra code (khi thêm kind)
npx tsc --noEmit                                     # phải 0 lỗi
node src/scripts/test-motion-schema.mjs
```

---

## 7. Lỗi thường gặp

| Triệu chứng | Cách xử lý |
|---|---|
| Import báo "not a design JSON" | Chọn nhầm file — phải là `design.json` có `trackItemsMap`+`tracks`, không phải package.json/tsconfig.json |
| Beat motion trông giống hệt nhau | Thiếu `kind` trong metadata → tất cả về `default`. Thêm `"kind":"..."` cho mỗi beat |
| Kind mới không hiện đúng | Field metadata sai — mở `motion-scenes/<kind>.tsx` xem `defaultMeta` để biết đúng field |
| Render ra WebM nền đen | Đó là nền transparent bị bake — bỏ `--transparent` để ra MP4 đục (luồng chính) |
| `localhost:3000` không vào được | Server chưa chạy — mở terminal riêng chạy `pnpm dev`, chờ dòng `✓ Ready` |
| `tsc` báo lỗi ở symlink gốc | Đã exclude trong tsconfig; nếu còn, xoá `motion-scene.tsx`/`motion-config.ts` symlink ở root rồi tạo lại |

---

*Xem thêm:* skill tri thức biên tập/taste ở `.claude/skills/edit-video-taste/motion-edit-craft/` (SKILL.md + knowledge/) —
AI đọc để lên kịch bản có "gu". Bạn cũng đọc được để hiểu vì sao chọn kind này/kia.
