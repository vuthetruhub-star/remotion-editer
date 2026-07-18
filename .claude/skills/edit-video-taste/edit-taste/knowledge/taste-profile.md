# Taste Profile — GU BIÊN TẬP của bạn (tài liệu sống)

```
version: 1            (tăng +1 mỗi đợt merge — xem Nhật ký học ở cuối)
scope:   Short 9:16 (1080×1920), repo remotion-editer
status:  ĐÃ HỌC 6 reel (1 creator dạy short-form). Gu nền = phong cách creator này; brand mặc định lime #00FF41.
nguồn:   DambEp1igDW · Daq-5E0jrYw · DaisEi-ihZb · Daf3iwtk7Wi · Daei0qakSON · DaQo05WAGTb
```

> Đây là "gu nền" bộ não đọc TRƯỚC khi dựng (SKILL.md). Chi tiết TỪNG kind (định lượng + khi nào) nằm ở
> `motion-edit-craft/knowledge/scene-catalog.md §K` (MẪU 12 mục). File này là gu XUYÊN SUỐT: nhịp, zoom,
> caption, SFX, màu. Số là ước lượng từ 6 reel, chốt khi test trên video thật.

---

## 1. CHỮ KÝ — thói quen làm nên "chất"
1. **Caption từng-từ LUÔN bật** (giữa màn, trắng, ~1 từ/nhịp) + **1 chữ tiêu đề LỚN** cho mỗi mục.
2. **Overlay ~100% thời lượng** — người ngồi gần như tĩnh, **đồ hoạ là "diễn viên chính"**.
3. **Edit tự minh hoạ nội dung**: scaffold "mục lục" + thanh progress thường trực khi dạy cấu trúc.
4. **Mã màu theo VAI TRÒ** (vàng chủ đạo; đỏ/vàng/xanh cho Hook/Lead/Body/CTA) — ngoại lệ "1 lime/frame".
5. **Bằng chứng ngoài liên tục**: chân dung lịch sử (viền tròn), ảnh AI/archival full-screen, screenshot social-proof, thẻ điện thoại ví dụ (viền màu).
6. **Doodle vẽ tay** (squiggle/khoanh vàng) để nhấn cảm xúc.
7. **Khung series + tab cấu trúc** thường trực; **luôn kết bằng CTA**.
8. **Zoom tiết chế** — cut+punch khi nói, drift khi b-roll, đứng yên khi overlay nặng.

## 2. NHỊP / PACING
| Chỉ số | Giá trị học | Ghi chú |
|---|---|---|
| Độ dài shot TB | ~1.5–3s | jump-cut liên tục giữ năng lượng |
| Shot dài nhất | ≤ ~4s | trừ b-roll takeover |
| Overlay coverage | ~100% | luôn có caption + ≥1 overlay |
| Caption cadence | 1 từ mỗi **0.2–0.45s** | đo từ transcript |

## 3. ZOOM (đặt `details.zoom{from,to}` trên item video)
| Loại | from→to | Thời lượng | Easing | DÙNG KHI |
|---|---|---|---|---|
| Jump-cut reframe | 1.00 / 1.05 / 1.03 (mỗi item TĨNH) | cả item | none | talking-head, mỗi cut 1–3s |
| Punch-in nhấn | 1.00→1.10–1.15 | 150–300ms, vào TRƯỚC từ | ease-out | câu chốt/emphasis/pivot |
| Ken Burns drift | 1.00→1.06–1.10 | cả shot 2–4s | ease-in-out | ảnh/screenshot b-roll takeover |
| Static hold | 1.00 (bỏ zoom) | — | — | khi overlay nặng (scaffold/diagram/dot-grid) |
**Luật:** zoom để *giữ nhịp & nhấn*, không trang trí.

## 4. CAPTION  (chi tiết + checklist học: `motion-edit-craft/knowledge/caption-rules.md §8`)
| Thuộc tính | Giá trị học |
|---|---|
| Kiểu / vị trí | word-by-word, **GIỮA màn y 57–60%** (biến thể "center", khác mặc định repo ở đáy) |
| Cỡ / màu | 46–52px/600–700, trắng `#FFFFFF`, viền tối 1px (cardless) |
| Cadence | 1 từ / **0.2–0.45s** (đo transcript) |
| Từ active | dòng giữ đồng nhất — creator này **không** đổi màu active rõ rệt |
| **Nhấn từ/câu quan trọng** | = **CÁCH A: overlay riêng** (word_pop / chữ vàng lớn / floating_stats / scaffold), KHÔNG restyle inline |
| Loại trừ | không để caption đè overlay nhiều chữ (chọn 1) — xem caption-rules §5 |
| Chưa hỗ trợ | nhấn INLINE per-word (kiểu B) — cần mở rộng renderer khi có video dùng nó |

## 5. SFX — palette + luật gắn (mỗi âm ↔ 1 sự kiện)
| Âm | Gắn vào |
|---|---|
| tick nhẹ | mỗi hàng scaffold / mỗi item list xuất hiện |
| pop/blip | badge số bay, chip pop |
| whoosh | chuyển mục / track tiến 1 bước / doodle vẽ |
| riser trầm | dồn tension khi open-loop stack chồng dòng |
| hit/2 nốt đối | divider antithesis vẽ xong (trầm→cao) |

## 6. MÀU / ACCENT
- Explainer/cấu trúc: **mã màu vai trò** — Hook `#FF3B30` · Lead `#FFCC00` · Body `#34AADC/#3B5BDB` · CTA `#34C759`; accent chung **vàng** `#FFD400`.
- Ngoài explainer: giữ **1 lime `#00FF41`/frame** (brand). Nền hero `#0A0B0A`; overlay `transparent`.
- Dịch brand khi cần: vàng reference → có thể map lime cho brand D1A (tuỳ beat).

## 7. CHUYỂN CẢNH
- **Jump-cut** giữa các mục (không transition đồ hoạ). Overlay là thứ "chuyển".

---

## 8. BẢNG TÌNH HUỐNG → TREATMENT  ⭐ (tra khi dựng; định lượng ở scene-catalog §K)
| Tình huống (trigger) | Treatment (kind) | Gu (thông số chính) |
|---|---|---|
| Dạy 1 khung có tên các phần | `structure_scaffold` | cột phải, màu vai trò, track đáy; hàng +0.4–0.7s |
| Teaser chưa giải quyết, giữ chân | `open_loop_stack` | khung bo góc trên, dòng +1.3–1.5s, kết "…" |
| Đối lập 2 vế ngắn | `antithesis_split` | divider đứt dọc, trái→phải +0.3s, tuỳ chọn 2 circle |
| Nhiều số "sống" rải ra | `floating_stats` | 4–6 badge né mặt, pop stagger 0.15–0.3s |
| Nhấn/khoanh cảm xúc | `doodle_scribble` | squiggle/circle vàng, vẽ 300–500ms, ≤1/beat |
| Tên mục / keyword | `word_pop`/`hook_title` | chữ lớn 150–210px, pop 180ms, hold 1.5–2.5s |
| Nhắc người thật/lịch sử | `portrait_burst` | tròn Ø140–170, viền vàng |
| Bằng chứng ảnh/screenshot | `ai_image_on_grid`/`annotated_screenshot` | full-bleed + Ken Burns drift |
| Ví dụ reel/UGC | `image_card`/`video overlay` | thẻ dọc viền màu, x55% y65% |
| Cấu trúc team/quan hệ | `network_diagram`/`org_diagram` | hub + spoke, node pop +0.3s |
| Liệt kê nhiệm vụ/lợi ích | `bulleted_list`/`bullet_burst` | chip ◆, item +0.5–0.8s |
| Con số + xu hướng | `dashboard_card`/`inline_chart` | card glass + line vẽ |
| Quy mô đám đông/tỉ lệ | `ratio_dots` | lưới chấm fill dần |

## 9. KHOẢNG TRỐNG còn lại (chưa dựng — ưu tiên thấp)
- **Look "chữ 3D vàng ép nổi"** cho tiêu đề (hiện dùng `word_pop` phẳng) — biến thể style, chưa gấp.
- **Thẻ điện thoại viền màu** (hiện `image_card` chưa có viền accent) — biến thể.
- **Badge glyph+keyword nhỏ dưới caption** ("team"👥) — biến thể `word_pop`+glyph.

---

## Nhật ký học
### 2026-07-18 — DambEp1igDW  [tham chiếu]
- Reel meta "perfect structure" tự minh hoạ cấu trúc → sinh `structure_scaffold` + `open_loop_stack`.
- Chốt: mã màu vai trò (bỏ 1-lime cho explainer), caption word-by-word, overlay-driven.

### 2026-07-18 — 5 reel (Daq/Dais/Daf/Daei/DaQo, cùng creator)  [tham chiếu]
- Xác nhận hệ hình nhất quán; sinh `antithesis_split`, `floating_stats`, `doodle_scribble`.
- Rút luật ZOOM (4 loại + khi nào), SFX palette, caption/màu xuyên suốt → điền §3–§8.
- Kho kind phủ ~85% move của creator; còn 3 gap nhỏ (§9).
