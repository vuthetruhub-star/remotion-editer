# Motion Taste — cách animate cho có "taste" (theo pattern beat-based repo bạn)

> Nói về *nhịp, entrance/exit, dwell, chống flicker* — trục B. Dùng easing sẵn có của repo
> (`s4ei/s4eo/s4vis/s4eb` từ `motion-config.ts`). KHÔNG `interpolate()` Remotion, KHÔNG CSS animation.
> Chỉ animate `transform` + `opacity`.

---

## 1. Easing nào cho hiệu ứng nào (dùng của repo)

| Hiệu ứng | Công thức (repo) |
|---|---|
| Fade in | `s4ei(f, start, start+dur)` |
| Fade out | `s4eo(f, start, start+dur)` |
| Fade in → out (visible window) | `s4vis(f, inStart, inEnd, outStart, outEnd)` |
| Scale 0.92 → 1 (entrance mềm) | `0.92 + 0.08 * s4ei(f, start, end)` |
| Slide up từ offset | `offset * (1 - s4ei(f, start, end))` |
| Bounce in (dùng tiết chế) | `s4eb(f, start, end)` |

**Nguyên tắc chọn:**
- Entrance mặc định = **fade + rise nhẹ + settle**, KHÔNG bounce. `s4eb` chỉ cho khoảnh khắc cần "nảy" có
  chủ đích (một icon vui, một pop nhấn) — lạm dụng bounce = đọc "template rẻ".
- Exit = `s4eo` dissolve, KHÔNG hard cut giữa hai beat che nhau.
- Mọi opacity kẹp `Math.max(0, …)` — không để opacity âm (luật repo).

---

## 2. Entrance "cinematic", không "pop rẻ tiền"

- Entrance đẹp = **fade + rise nhỏ + blur tan dần** (defocus→focus), KHÔNG scale-bounce/pulse. Cái nhìn "rẻ"
  bị cấm rõ ràng trong skill gốc.
- Blur-settle: bắt đầu `blur(8px)` → `blur(0)` trong ~7 frame đầu, đi kèm opacity 0→1 và rise ~12px→0. Repo
  có `brightness/blur` trong LayerSchema — dùng để làm defocus→focus.
- Với chữ động (word_pop/kinetic): mỗi từ/item tự có entrance riêng, cross-fade sang cái sau; không cắt cứng.

---

## 3. Hook motion — cold open không bao giờ là frame tĩnh

- Video mở bằng **zoom-IN nhẹ rồi ease-OUT về 1.0** qua thời lượng hook (cubic ease-out: nhả nhanh, settle
  dài) — một cú "settle vào cảnh" như phim mở. KHÔNG pulse/bounce.
- Bắt đầu ~1.12–1.16× → 1.0×. Không đi dưới 1.0× (lộ viền đen).
- Ghép với flash accent nhẹ + (nếu có SFX) whoosh — xem [sfx-rules.md](sfx-rules.md). Giây đầu phải có
  chuyển động + impact, không phải talking-head đứng im.

---

## 4. Dwell — visual ở lại bao lâu

- **Tail dwell = ~0.8s** sau từ cuối được nói (đủ để ghi nhận beat như dấu câu, không đủ để chán).
- **Ceiling: một beat ≤5s trên màn hình** (visual >5s đọc thành frame tĩnh nhàm). Ngoại lệ: sequence kind
  (`vertical_timeline`, `bar_overlay` đếm, `list`, `word_pop`, `ticker_feed`) — `end` phủ hết enumeration,
  không bị kẹp 5s.
- **`quote_pull` dwell ≥2.0s sau khi gõ xong** — để đọc kịp; đó là cả ý nghĩa của nó.
- **Reading-time cho text takeover** (`vs_split`/`cinematic_title`/`stat_punch`/`quote_pull`/`headline_card`):
  `ideal ≈ max(3.5s, char_count/12 + 1.5s dwell)`. 12 ký tự/giây là tốc độ đọc thoải mái cho typography lớn
  (người xem SCAN, không đọc tuyến tính). Dưới 70% ideal = đọc không kịp; trên 1.8× = chữ lê thê.

---

## 5. Chống flicker & coverage (khi có nhiều beat che nhau)

- **Không flicker giữa beat:** khi hai beat cách nhau 0.1–0.5s, lớp dưới (speaker/nền) lóe qua một phần giây =
  đọc như glitch. Hoặc nối back-to-back, hoặc để khoảng nghỉ ≥1s rõ ràng — không để khoảng giữa. (Bridge
  micro-gap ≤0.6s.)
- **Coverage underlay:** khi một chuỗi takeover chạy liên tiếp (gap ≤0.6s), đặt MỘT lớp nền tối đặc phía dưới
  cả chuỗi (từ `start−0.1s` đến `end+0.1s`), nằm GIỮA lớp speaker và lớp component. Vì mỗi component có
  entrance/exit fade riêng, không có underlay thì speaker lóe qua trong ~6–10 frame chuyển tiếp. Component
  intentionally-overlay (`icon`, `chapter_bar`, `lower_third`) không nằm trong nhóm underlay.
- **Hai bất biến cho mọi takeover mới:** (1) backdrop của component KHÔNG fade/transform — chỉ nội dung
  foreground animate; (2) đăng ký kind vào nhóm "takeover" để được underlay.

---

## 6. Progressive reveal — đa-item luôn so le theo lời

- Mọi template đa-item (`vertical_timeline.items`, `list.items`, `word_pop.items`, `bar_overlay.bars`,
  `org_diagram.nodes`…) mỗi phần tử PHẢI có `appear_sec` riêng, khớp lúc người nói gọi tên nó.
- `appear_sec` là **giây tuyệt đối của video**; component tự trừ `beat_start_sec` để ra offset trong Sequence
  (giống convention `words.json`). Copy thẳng timestamp từ transcript vào, không phải tính tay.
- Thiếu `appear_sec` → template auto-stagger đều trong ~60% đầu beat → tất cả hiện sớm khi người nói mới ở
  item #2 → spoil. Với đếm/enumerate, `appear_sec` per-item là BẮT BUỘC.

---

## 7. Living hold & choreographed exit (cho concept/hero)

- **Living hold:** canvas hero/concept giữ một drift chậm (translate/scale rất nhẹ theo `f`) để không bao giờ
  là frame đông cứng.
- **Choreographed exit:** thoát bằng dissolve-forward (`s4eo` + rise nhẹ), không hard cut. Với concept_build,
  các element có thể exit so le ngược thứ tự vào.

---

## 8. Follow-cam / zoom nhấn (nếu edit có talking head)

- Nếu bạn ghép talking-head làm lớp nền: camera mặc định là **follow-cam** — pan+zoom drift theo người nói
  mỗi frame (dáng handheld xã hội), KHÔNG phải zoom-punch rời rạc. Follow PARTIAL (strength ~0.7) + smooth
  mạnh; hard center-lock đọc robotic, soft lagging drift đọc "sống".
- Giữ **headroom**: khung đừng quá thấp (mất đỉnh đầu) hay quá cao. Bias khung xuống một chút để lộ đỉnh đầu.
- Pan kẹp trong cửa sổ crop an toàn để lớp scale không lộ viền đen.

---

## 9. Self-check motion

- [ ] Không CSS transition/animation; không `interpolate()`; chỉ `transform`+`opacity`.
- [ ] Entrance = fade+rise+settle (blur tan), không bounce/pulse trừ khi cố ý.
- [ ] Hook mở bằng zoom-in→settle, không frame tĩnh.
- [ ] Dwell hợp lý: tail ~0.8s, beat ≤5s (trừ sequence), quote dwell ≥2s, text takeover theo reading-time.
- [ ] Không flicker giữa beat (bridge ≤0.6s hoặc nghỉ ≥1s); có coverage underlay cho chuỗi takeover.
- [ ] Đa-item so le `appear_sec` (giây tuyệt đối), không dump cả cụm.
