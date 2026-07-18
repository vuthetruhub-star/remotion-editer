---
name: edit-taste
description: "Học và áp dụng GU BIÊN TẬP (edit taste) của user cho video Short 9:16 trong repo remotion-editer. Đây là skill VÒNG LẶP TỰ HỌC: user gửi 1 video tham chiếu (hoặc bản dựng của chính user) → Claude BÓC TÁCH mọi nước đi biên tập kèm thông số cụ thể (timing, khoảng cách, hold, zoom, SFX, caption, cắt cảnh) → user duyệt → Claude ghi kiến thức vào knowledge/taste-profile.md → user gửi video test → Claude áp taste đã học để lên kịch bản/dựng → cùng test → tinh chỉnh thông số cho tới khi 'đúng gu'. TRIGGER khi user nói: 'edit taste', 'bóc tách video này', 'học gu edit', 'phân tích cách họ dựng', 'cập nhật taste', 'test lại taste', 'video này họ làm thế nào', 'áp gu của tôi vào'. Skill này lo phần GU (thế nào là hay/giống mình); phần CÁCH DỰNG (49 kind, chroma-safe, schema, render) do skill motion-edit-craft lo."
---

# Edit Taste — vòng lặp tự học gu biên tập của bạn

Skill này giữ **GU BIÊN TẬP cụ thể của bạn** (đúc từ các video bạn thích + bản dựng của chính bạn) dưới
dạng một tài liệu SỐNG là [`knowledge/taste-profile.md`](knowledge/taste-profile.md) — lớn dần qua mỗi
video. Nó **bổ sung**, không thay thế, skill `motion-edit-craft`:

| | Lo gì | Câu hỏi trả lời |
|---|---|---|
| **edit-taste** (skill này) | GU: nhịp, thói quen, thông số ưa dùng của BẠN | "Thế nào mới *giống gu mình*?" |
| **motion-edit-craft** | CÁCH DỰNG: 49 kind, chroma-safe, design.json, render | "Dựng cái đó *bằng gì, code sao*?" |

Khi lên kịch bản/dựng thật: **đọc `taste-profile.md` trước để biết gu → rồi dùng `motion-edit-craft` để thi công.**

---

## VÒNG LẶP (đây là phần lõi — làm đúng các trạng thái này)

```
   ┌─────────────────────────────────────────────────────────────────┐
   │  1.INGEST → 2.BÓC TÁCH → 3.ĐỀ XUẤT → [user duyệt] → 4.GHI SKILL   │
   │                                                          │        │
   │              6.TINH CHỈNH ← [cùng xem] ← 5.TEST ←────────┘        │
   │                    └──────────── lặp ─────────────► (giống gu)    │
   └─────────────────────────────────────────────────────────────────┘
```

Ở mỗi lượt, luôn nói rõ đang ở BƯỚC nào và chờ đúng tín hiệu của user trước khi sang bước ghi/ test.

### 1. INGEST — lấy video về máy
- **File sẵn:** user đưa đường dẫn → dùng luôn.
- **Link IG/YouTube/TikTok:** `yt-dlp` (đã cài) + cookies nếu cần (IG: `--cookies <cookies.txt>` hoặc
  `--cookies-from-browser <chrome|edge|firefox>`). Hỏi user cookies ở đâu nếu link riêng tư.
- Xác nhận: tỉ lệ (mong đợi 9:16), thời lượng, đây là **video tham chiếu** (học gu người khác) hay
  **bản dựng của user** (học gu chính user). Ghi rõ — hai loại vào cùng profile nhưng gắn nhãn khác.

### 2. BÓC TÁCH — xem kỹ, liệt kê mọi nước đi + THÔNG SỐ
Theo [`knowledge/analysis-method.md`](knowledge/analysis-method.md). Tóm tắt:
- **ĐỌC `motion-edit-craft` TRƯỚC** (`../motion-edit-craft/craft.md` + `knowledge/`: `scene-catalog.md`,
  `taste-rules.md`, `motion-taste.md`, `caption-rules.md`, `sfx-rules.md`) → **phân tích video THEO đúng khung
  khái niệm đó**: gọi tên mỗi nước đi bằng **49 kind + luật craft** (hook/mật độ/concept-viz/easing/caption
  cadence/SFX-theo-sự-kiện). KHÔNG bịa khung phân tích riêng. Craft là "ngôn ngữ"; bóc tách = phiên video sang ngôn ngữ đó.
- Trích frame để "thấy": `python ~/.claude/skills/edit-video-taste/motion-edit-craft/assets/extract_frames.py <video> frames --fps 3`
- Transcript word-level: `python ~/.claude/skills/edit-video-taste/motion-edit-craft/assets/transcribe.py <video>`
- Đi **từng shot**, lập **BẢNG BÓC TÁCH**: mỗi sự kiện = timecode, cái gì kích hoạt nó (số/liệt kê/nhấn/
  đổi cảnh/hook), treatment (map vào 1 trong 49 kind hoặc native: cut/zoom/caption/SFX/b-roll), và
  **thông số đo được**: entrance (kiểu+ms), hold (s), exit, vị trí, zoom (scale from→to + thời lượng),
  SFX (âm gì, đúng sự kiện nào), caption (cỡ, màu từ active, cadence), accent màu.
- Chốt **CHỮ KÝ**: 5–8 thói quen làm nên "chất" của video này (cái lặp lại xuyên suốt).

### 3. ĐỀ XUẤT — trình bóc tách + phần định ghi vào profile (CHƯA ghi)
- Trình BẢNG BÓC TÁCH gọn + đề xuất "sẽ thêm/sửa gì trong `taste-profile.md`" dạng gạch đầu dòng.
- Nêu rõ **mâu thuẫn** với profile hiện tại (nếu có) và **khoảng trống** với 49 kind (họ làm cái ta chưa dựng được).
- **Chờ user duyệt.** Không tự ghi.

### 4. GHI SKILL — merge vào taste-profile.md
Khi user OK ("cập nhật đi", "ghi vào skill"):
- Ghi 1 **entry có ngày** vào mục *Nhật ký học* của `taste-profile.md` (nguồn video + phát hiện chính).
- **Hợp nhất** vào các mục tổng hợp (Chữ ký / Nhịp / Bảng tình huống→treatment / Caption / SFX / Màu / Khoảng trống).
  Thông số mâu thuẫn giữa nhiều video → giữ khoảng (min–max) hoặc ghi "tùy loại nội dung", đừng ghi đè mù.
- Tăng `version` ở đầu file. Chỉ sửa `taste-profile.md` (và analysis-method nếu phương pháp cần bổ sung) —
  **không** đụng code repo ở bước này.

### 5. TEST — áp gu đã học lên video của user
Khi user gửi video test:
- Đọc `taste-profile.md` → chọn treatment theo **Bảng tình huống→treatment** đã học → dùng `motion-edit-craft`
  (`workflow.md` + `design-schema.md`) ghi `design.json` → `node scripts/render-design.mjs` (trong repo).
- Trình bản dựng + **map từng beat về dòng nào trong profile** (để user thấy gu được áp ở đâu).

### 6. TINH CHỈNH — so với gu, sửa thông số
- User nói "chỗ này chưa giống", "zoom mạnh hơn", "hold lâu hơn" → sửa **thông số trong `taste-profile.md`**
  (không chỉ sửa cái design.json lần này) rồi dựng lại. Đó là cách gu "ngấm" dần vào skill.
- Lặp tới khi user thấy **đúng gu**. Ghi lại giá trị chốt vào profile.

---

## Ràng buộc (kế thừa, không phá)
- **9:16 (1080×1920)** cứng. Mọi thông số đo/áp theo khung dọc.
- Khi dựng thật: theo `motion-edit-craft/knowledge/repo-constraints.md` (chroma-safe, nền trong suốt/keyable).
- Thông số bóc tách là **ƯỚC LƯỢNG** (đọc từ frame + nghe), tinh qua vòng test — **không** giả vờ chính xác ms.
- Bản dựng của user (bước 5) tin cậy hơn video người lạ cho việc học gu *của user* → ưu tiên nhãn `[của tôi]`.

## Khi KHÔNG dùng skill này
- Chỉ hỏi "dựng kind X thế nào / code sao" → đó là `motion-edit-craft`, không cần vòng học.
- Setup/render/fix bug editor thuần → theo HOW-TO-USE.md / CLAUDE.md của repo.
