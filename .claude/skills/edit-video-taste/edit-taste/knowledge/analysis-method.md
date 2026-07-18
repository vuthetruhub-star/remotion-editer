# Phương pháp BÓC TÁCH một video → thông số

> Mục tiêu: biến 1 video thành **bảng thông số** đủ để tái tạo gu. Đọc từ frame + transcript, ước lượng —
> rồi tinh qua vòng test. Không cần chính xác mili-giây; cần đúng *tương quan* (cái nào nhanh/chậm/mạnh hơn).

## Bước 0 — NẠP KHUNG của motion-edit-craft (bắt buộc, trước khi xem video)
Đọc để có sẵn "ngôn ngữ" phân tích trong đầu — bóc tách = **phiên video sang các khái niệm này**, không tự chế khung khác:
- `../../motion-edit-craft/craft.md` — triết lý 2 trục + quy trình 7 bước + ràng buộc.
- `../../motion-edit-craft/knowledge/scene-catalog.md` — **49 kind** (mỗi nước đi overlay phải map về 1 kind, hoặc đánh dấu "chưa có → khoảng trống").
- `taste-rules.md` — luật chọn visual, hook, mật độ, "visual phải DẠY chứ không lặp lời".
- `motion-taste.md` — easing/dwell/entrance-exit/punch-in (đọc zoom & nhịp qua đây).
- `caption-rules.md` + `sfx-rules.md` — đọc caption cadence & SFX-theo-sự-kiện đúng thuật ngữ craft.

Mỗi dòng trong bảng bóc tách bên dưới phải dùng **tên kind/luật craft** — nếu video làm điều craft chưa gọi tên được → ghi vào mục **Khoảng trống** (ứng viên định nghĩa kind/luật mới cho motion-edit-craft).

## Chuẩn bị (2 lệnh, dùng helper của motion-edit-craft — KHÔNG copy script)
```bash
# 1) Trích frame để "thấy" từng khoảnh khắc (3 fps đủ bắt cut & pop; tăng --fps nếu cắt rất nhanh)
python ~/.claude/skills/edit-video-taste/motion-edit-craft/assets/extract_frames.py <video> frames --fps 3
# 2) Transcript word-level (biết mỗi từ ở giây nào → gán trigger cho từng nước đi)
python ~/.claude/skills/edit-video-taste/motion-edit-craft/assets/transcribe.py <video>   # → words.json
```
Nếu là link: tải trước bằng `yt-dlp <link> -o ref.mp4` (+ `--cookies`/`--cookies-from-browser` nếu riêng tư).

## Đi từng shot — với mỗi sự kiện biên tập, ghi 1 dòng
Một "sự kiện" = một cut, một overlay xuất hiện/biến mất, một cú zoom, một SFX, một đổi kiểu caption.

**Cột bắt buộc mỗi dòng:**
| Cột | Nghĩa | Ví dụ |
|---|---|---|
| `t_in→t_out` | giây vào→ra | `4.2→6.0` |
| `trigger` | cái gì trong lời/hình gọi nó ra | số "400 triệu" · liệt kê · từ nhấn · đổi cảnh · hook mở · CTA |
| `treatment` | map vào 1 trong 49 kind, HOẶC native | `stat_punch` · `word_pop` · native:cut · native:zoom · native:sfx · native:caption · b-roll |
| `entrance` | kiểu + thời lượng | `fade+rise 250ms` · `pop 120ms` · `cut (0)` |
| `hold` | giữ trên màn (s) | `1.4s` |
| `exit` | kiểu + thời lượng | `fade 200ms` · `cut` |
| `pos` | vị trí khung dọc | `center` · `lower-third` · `top 15%` |
| `zoom` | scale from→to / thời lượng / kiểu | `1.0→1.08 / cả shot / drift` · `1.0→1.15 / 300ms / punch trước câu chốt` |
| `sfx` | âm gì, khớp sự kiện nào | `whoosh @cut` · `tick @mỗi từ pop` · `boom @số hiện` |
| `caption` | cỡ tương đối, màu active, cadence, vị trí | `to, active #00FF41, word-by-word, đáy 18%` |
| `accent` | màu nhấn dùng ở đâu | `1 lime cho con số` |

> Không chắc con số? Ghi khoảng (`~200–300ms`) hoặc so sánh (`nhanh hơn beat trước`). Vòng test sẽ chốt.

## 7 trục cần "đọc ra" xuyên suốt video (để tổng hợp thành gu)
1. **Nhịp/pacing** — độ dài shot trung bình (s), số cut / 10s. Video càng nhanh, con số càng nhỏ.
2. **Mật độ overlay** — mỗi câu có đồ hoạ hay chỉ điểm nhấn? Bao nhiêu % thời lượng có overlay?
3. **Zoom** — có punch-in trước câu chốt không? drift nhẹ cả shot hay đứng yên? biên độ scale hay dùng.
4. **Caption** — style cố định? cỡ, màu active, word-by-word vs cụm, vị trí, có emphasis phóng to từ khoá?
5. **SFX** — palette (whoosh/tick/boom/click…) và luật gắn (mỗi âm ↔ 1 sự kiện). Dày hay thưa?
6. **Màu/accent** — mấy accent mỗi frame? màu nào cho vai trò gì (số/nhấn/nền)?
7. **Chuyển cảnh** — cut thẳng, whip/whoosh, hay có transition đồ hoạ? Tần suất?

## Chốt CHỮ KÝ (5–8 gạch đầu dòng)
Thói quen LẶP LẠI làm nên chất riêng. Ví dụ dạng cần rút ra:
- "Punch-in ~1.1× ngay trước mỗi câu chốt, kèm 1 boom trầm."
- "Con số luôn `stat_punch` lime, hold ~1.3s, whoosh khi vào."
- "Caption word-by-word cỡ lớn đáy màn, từ khoá phóng to 1.2×."
- "Cut trung bình 1.8s — không shot nào đứng quá 3s."

## Đầu ra bước BÓC TÁCH (đưa cho user duyệt)
1. **Bảng bóc tách** (các dòng ở trên) — gọn, có thể gộp shot giống nhau.
2. **7 trục** — mỗi trục 1 câu kết luận + con số.
3. **Chữ ký** — 5–8 gạch đầu dòng.
4. **Đề xuất ghi vào `taste-profile.md`** — thêm/sửa dòng nào (dạng gạch đầu dòng), nêu mâu thuẫn & khoảng trống với 49 kind.

→ Rồi CHỜ user duyệt trước khi ghi (bước 4 của vòng lặp trong SKILL.md).
