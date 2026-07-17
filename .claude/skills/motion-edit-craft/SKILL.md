---
name: motion-edit-craft
description: Nâng "taste" biên tập & làm motion cho repo remotion-editer (D1A Motion Editor — Next.js + designcombo + Remotion Player, pattern 2-file motion-config.ts + motion-scene.tsx). Đóng gói tri thức từ một pipeline edit video chuyên nghiệp: 50 loại overlay (stat_punch, word_pop, vertical_timeline, hook_title, bar_overlay, ratio_dots, concept_build...), luật chọn visual, concept-visualization (visual phải DẠY chứ không lặp lời), luật hook/mật độ/thứ bậc, caption cadence, SFX canh theo sự kiện motion, kỷ luật ảnh AI. TRIGGER khi làm việc trong repo remotion-editer hoặc khi user nói: "dựng scene X", "làm motion cho câu này", "thêm caption", "chọn visual cho đoạn này", "nâng taste", "beat này nên hiện gì", "thêm SFX cho motion", "làm hook", "cảnh này nên thể hiện thế nào". KHÔNG dùng để render hay setup remotion cơ bản.
---

# Motion Edit Craft — nâng tầm biên tập & motion cho D1A Motion Editor

Skill này **KHÔNG sửa code repo**. Nó là bộ **tri thức + phương pháp** để khi dựng scene / chọn visual /
làm caption / gắn SFX trong repo `remotion-editer`, kết quả có "taste" của một editor chuyên nghiệp —
nhưng vẫn theo đúng pattern, brand, và triết lý reference-first của repo bạn.

Nguồn gốc: chắt lọc từ một pipeline edit video YouTube thực chiến (~50 template overlay, hàng chục luật
biên tập đúc kết từ feedback thật), đã **dịch sang brand `#00FF41`/Geist + pattern beat-based** của repo này.

---

## 0. Đọc gì trước (bắt buộc, theo thứ tự)

Trước khi làm bất cứ scene/motion nào:

1. `CLAUDE.md` (repo) — luật ưu tiên & kiến trúc repo
2. `src/brand.ts` — colors / fonts / spacing / radii / motion tokens (NGUỒN của mọi giá trị visual)
3. `src/brand-docs/D1A-motion.md` — pattern kỹ thuật beat-based + easing
4. `src/brand-docs/EDITOR-integration.md` — cách thêm motion asset (schema, 5 điểm đăng ký)
5. **[knowledge/repo-constraints.md](knowledge/repo-constraints.md)** — 🔴 RÀNG BUỘC CỨNG của repo
   (chroma-key-safe, nền TRONG SUỐT/keyable, content field phải khai RawSchema). **ĐỌC TRƯỚC KHI VIẾT STYLE** —
   nó GHI ĐÈ kiến thức nguồn ở chỗ mâu thuẫn (vd skill nói "nền tối" nhưng repo mặc định trong suốt).
6. Khi dựng scene thật, mở [knowledge/worked-example.md](knowledge/worked-example.md) — khuôn code đầy đủ để chép.
7. Skill này: bắt đầu từ **§1 (triết lý 2 trục)** rồi **§2 (quy trình)**, sau đó mở file `knowledge/` liên quan.

---

## 1. TRIẾT LÝ LÕI — mô hình 2 trục (đọc kỹ, đây là thứ dễ làm sai nhất)

Reference và skill này **không tranh nhau** — chúng làm việc trên **hai trục khác nhau, áp dụng đồng thời**:

- **Trục A — "TRÔNG THẾ NÀO"** (asset & giá trị visual cụ thể): màu, size, spacing, radii, hình khối,
  bố cục pixel của từng element.
- **Trục B — "BIÊN TẬP / THỂ HIỆN THẾ NÀO"** (craft): chọn loại visual nào cho beat nội dung này, timing
  khớp voiceover, hook, mật độ, thứ bậc nguồn, concept-viz (visual phải DẠY chứ không lặp lời),
  easing/dwell/exit, caption cadence, SFX. **Đây là phần skill nâng tầm.**

**Nguyên tắc: reference có thẩm quyền cho ĐÚNG những gì nó thực sự thể hiện; skill dẫn mọi thứ còn lại
VÀ luôn nâng tầm trục B.**

| Tình huống | Trục A (trông thế nào) | Trục B (thể hiện thế nào) |
|---|---|---|
| Reference **ảnh tĩnh** (1 card/layout) | Copy y hệt reference | Reference KHÔNG quy định → **skill dẫn** (nhịp, chọn beat, hook, concept-viz) |
| Reference **video** (có cả motion/pacing) | Copy y hệt | Copy nhịp reference cho thấy + **skill bổ khuyết & tinh chỉnh** phần còn thiếu |
| **Không** reference, user nói "tự quyết" | Lấy giá trị từ `src/brand.ts`, không bịa | **Skill dẫn** hoàn toàn |
| **Không** reference, user chưa nói gì | HỎI (kèm 1 đề xuất mặc định theo skill) | **Skill dẫn** (vẫn đề xuất cách thể hiện khi hỏi) |

Tóm gọn: **asset thì ưu tiên reference; còn "cách thể hiện" thì skill LUÔN áp dụng để nâng tầm.**

> Đây là bản mở rộng luật "reference-first, không bịa, phải hỏi" của `CLAUDE.md`: reference-first vẫn đúng
> cho trục A. Skill chỉ thêm một điều repo chưa nói rõ: **craft (trục B) không phải thứ để bịa hay bỏ trống —
> nó có luật, và luật đó là toàn bộ `knowledge/` dưới đây.**

---

## 2. QUY TRÌNH TUẦN TỰ (opinionated — làm đúng thứ tự này)

Khi user yêu cầu dựng scene / làm motion cho một đoạn nội dung:

```
1. HIỂU nội dung   → beat này nói về cái GÌ? Là process/contrast/magnitude/structure/metaphor/claim?
                     (knowledge/taste-rules.md §"detecting explanation beat")
2. QUYẾT visual    → chọn loại overlay đúng "shape of idea", KHÔNG mặc định text card.
                     (knowledge/scene-catalog.md — 50 kind + khi nào dùng)
                     Gate bắt buộc: "muted viewer nhìn frame này HIỂU thêm gì mà lời nói chưa cho?"
                     Nếu chỉ lặp lại câu nói → CHỌN LẠI hoặc bỏ beat.
3. LẤY giá trị     → Trục A: reference → copy. Không có → hỏi / brand.ts. KHÔNG bịa màu/size.
4. DỰNG 2 file     → motion-config.ts (CONFIG + TIMING beats) + motion-scene.tsx (schema + Beat components).
                     Craft theo knowledge/motion-taste.md (easing, dwell, entrance/exit, chống flicker).
5. CAPTION (nếu có voiceover) → knowledge/caption-rules.md: cadence word-punch, emphasis ~1/phút,
                     caption↔beat loại trừ nhau, closer im lặng. Dùng hệ caption sẵn có của repo.
6. SFX (nếu cần)   → knowledge/sfx-rules.md: mỗi SFX canh khớp MỘT sự kiện visual (appear→pop,
                     chuyển beat→whoosh, gõ chữ→tick, CTA→click). Gắn vào audio track editor.
7. KIỂM            → node src/scripts/test-motion-schema.mjs = 0 FAIL; mock.ts khớp schema; tsc 0 error.
```

**Ràng buộc cứng của repo (không bao giờ phá — trùng với CLAUDE.md):**
- Beat component nhận `{ f, data }` — KHÔNG `useCurrentFrame()` bên trong. `useCurrentFrame()` CHỈ ở `SceneContent`.
- KHÔNG CSS transition/animation. KHÔNG `interpolate()` của Remotion trong composition — dùng easing `s4ei/s4eo/s4vis/s4eb`.
- CHỈ animate `transform` + `opacity`. KHÔNG `width/height/top/left`.
- Timing theo GIÂY trong `TIMING`. Layer là sibling, không nest.
- Mọi màu/size/spacing lấy từ `src/brand.ts` — không hardcode trong JSX.
- Chỉ 2 file: `motion-config.ts` + `motion-scene.tsx` (+ `mock.ts` cho data). Schema nhúng trong motion-scene.tsx.

---

## 3. Bản đồ tri thức (`knowledge/`)

| File | Dùng khi | Nội dung |
|---|---|---|
| [taste-rules.md](knowledge/taste-rules.md) | Mọi lúc — đọc trước khi chọn visual | Lõi biên tập: "mọi visual phải có nghĩa" + "phải DẠY", detect explanation beat, thứ bậc nguồn asset (real→stock→AI), mật độ, hook, khi nào ĐỪNG thêm |
| [scene-catalog.md](knowledge/scene-catalog.md) | Bước 2 — chọn & dựng loại overlay | 50 "kind" → recipe đầy đủ: mô tả, khi nào dùng, map sang TextLayer/AssetLayer/Background + TIMING, ghi chú taste |
| [motion-taste.md](knowledge/motion-taste.md) | Bước 4 — viết animation | Easing nào cho hiệu ứng nào, entrance/exit, dwell time, chống flicker giữa beat, coverage, hook motion |
| [caption-rules.md](knowledge/caption-rules.md) | Bước 5 — có voiceover | Word-punch cadence, emphasis ~1/phút, caption↔beat loại trừ, current-word highlight, closer im lặng — map vào caption-presets của repo |
| [sfx-rules.md](knowledge/sfx-rules.md) | Bước 6 — gắn SFX | Mỗi SFX ↔ một sự kiện motion, timing theo TIMING/appear_sec, 5 luật thiết kế âm thanh, + nhạc bed (tùy chọn) |
| [image-style.md](knowledge/image-style.md) | Khi cần ảnh AI/asset minh hoạ | 1 style khoá, subject cụ thể (four-word test), 1-subject-per-frame, prompt prefix theo palette `#00FF41`/nền tối |
| [repo-constraints.md](knowledge/repo-constraints.md) | 🔴 Trước khi viết STYLE | Chroma-key-safe, nền trong suốt/keyable vs baked, content field vào RawSchema — lớp repo GHI ĐÈ kiến thức nguồn |
| [worked-example.md](knowledge/worked-example.md) | Khi dựng scene thật | Khuôn code đầy đủ (stat_punch + vertical_timeline): RawSchema mở rộng, Beat `{f,data}`, panel tabs, mock.ts — chép rồi nhân bản |
| [workflow.md](knowledge/workflow.md) | Khi có script + video → tự ráp | Quy trình 7 bước pha 1–2: trích frame → transcript → align → beat plan → ghi design.json → user duyệt → Import/render |
| [design-schema.md](knowledge/design-schema.md) | Khi ghi `design.json` | Shape JSON editor nạp được: motionScene theo 5 kind, video+zoom, caption, audio/SFX; timing MS vs appearSec |

**Helper (trong `assets/`):**
- `extract_frames.py <video> <out_dir> [--fps 1]` — trích frame để AI "thấy" nội dung màn hình (pha 1).
- `transcribe.py <video>` — transcript word-level OFFLINE (faster-whisper) → `words.json` (pha 1).
- `fetch_logo.py "Brand1" "Brand2"` — tải logo brand từ Wikipedia vào thư mục đích (không cần API key).
- `fetch_stock.py "<query>" <out_dir>` — tải stock video/ảnh từ Pexels (cần `PEXELS_API_KEY`, free).
- Dùng để đổ asset thật vào `public/` của repo — asset thật luôn đọc "credible" hơn ảnh AI (xem image-style.md).

---

## 4. Bảng dịch brand (skill gốc → repo bạn)

Khi đọc bất kỳ ghi chú nào trích từ skill gốc, tự dịch:

| Skill gốc | → Repo bạn (`src/brand.ts`) |
|---|---|
| Neo Lime `#CFFF05` (accent) | `colors.primary` `#00FF41` |
| Raisin Black `#0F121A` (nền) | `colors.background` `#0A0B0A` / `colors.surface` `#101211` |
| Silver text | `colors.text.primary/secondary/muted` |
| Space Grotesk | `fonts.display` = Geist / `fonts.mono` = Geist Mono |
| `interpolate()` trực tiếp | `s4ei / s4eo / s4vis / s4eb` (beat-based) |
| props.json theo "kind" | metadata theo `TextLayer/AssetLayer/Background` schema |
| kích thước tự do | canvas 1080×1920 (bảng minimum size trong EDITOR-integration.md) |
| "1 lime accent per frame" | 1 accent `#00FF41` mỗi frame — hai accent tranh nhau là sai |

---

## 5. Khi nào KHÔNG dùng skill này

- Setup/cài đặt repo, chạy dev server, render/export → theo HOW-TO-START.md của repo.
- Việc thuần code (fix bug editor, thêm control panel) không liên quan taste → làm theo CLAUDE.md.
- User đã đưa reference đầy đủ cả trục A lẫn trục B (video mẫu) → copy reference; skill chỉ lấp chỗ trống.
