# SFX Rules — âm thanh cho motion

> **NGUYÊN TẮC LÕI: mỗi SFX canh khớp CHÍNH XÁC một sự kiện visual của motion.** Sound đi theo animation —
> element bật ra → pop; chuyển beat → whoosh; chữ gõ → tick; CTA click → click; timeline chạy → swell.
> Áp dụng chung cho MỌI motion, không gắn pipeline kênh gốc.
>
> Repo bạn có audio track (Remotion `<Audio>`, `audio.tsx`). File này quyết **sound nào, ở giây nào, to bao
> nhiêu** — bạn tự gắn file .wav vào audio track của editor, canh `display.from` khớp `TIMING`/`appear_sec`.
> KHÔNG port asset .wav hay ffmpeg mixing.

---

## 1. Bảng SFX ↔ sự kiện motion (canh theo TIMING/appear_sec)

| Sự kiện visual | SFX | Timing | Mức (so với 1.0) |
|---|---|---|---|
| Cold open (frame 0, hook) | flare/whoosh (+ boom sub-bass) | t ≈ 0.05–0.10s | 0.45–0.62 |
| Element/item xuất hiện (list, timeline, stat, callout entrance) | card-pop | tại mỗi `appear_sec` | 0.55–0.65 |
| Chuyển sang beat takeover / inset image | whoosh | tại `start_sec` của beat | 0.45–0.55 |
| Chữ emphasis (caption underline-wipe) | tick/write-stroke | `start_sec + 0.18s` | 0.50 |
| Timeline/rail đang chạy | swell (rise dài) | từ `appear_sec` item đầu, ~4.6s | 0.42 |
| CTA click (nút subscribe/CTA) | click | khớp frame click của animation (vd `F(1.1)`) | theo animation |
| Climax/payoff (quote/takeaway lands) | boom nhẹ | đúng lúc câu chốt xong | 0.55 |

**Quan trọng — SFX phải khớp NGHĨA visual:**
- whoosh = **chuyển động** (beat vào, camera move)
- pop = **xuất hiện rời rạc** (một item lands)
- tick/scratch = **gõ chữ** (typewriter, underline)
- click = **xác nhận UI** (nút bấm)
- swell = **tiến trình đang diễn ra** (rail vẽ, meter tăng)

Đặt sai nghĩa (whoosh cho một item pop, click cho một fade) → tai thấy "sai", dù nhỏ.

---

## 2. Năm luật thiết kế âm thanh (không phá)

1. **Subtle mặc định** — nếu bạn ngân nga được nó thì quá to. SFX là dấu câu, không phải nhạc.
2. **Không swoosh > 0.6s** — trừ swell gắn với animation đang chạy (rail/meter), và swell ≤0.45 vol.
3. **Không đuôi reverb** — reverb smear sang beat sau, làm nhoè nhịp. Cắt gọn (≤300ms cho SFX UI).
4. **SFX khớp nghĩa visual** — xem bảng §1. Đây là luật quan trọng nhất.
5. **Closer im lặng** — cụm emphasis/CTA CUỐI cùng KHÔNG có sting. Im lặng đọc "final" hơn "thêm tiếng gõ".
   (Trùng closer-suppression trong [caption-rules.md](caption-rules.md).)

---

## 3. Đồng bộ SFX với animation — canh theo frame, không "cảm giác"

- SFX phải trùng frame của sự kiện. Ví dụ nút CTA: nếu animation click ở frame `F(1.1)` (giây 1.1 của beat),
  đặt click.wav tại `beat_start + 1.1s`, và card-pop morph tại +1.28s. Đổi timing component thì đổi cả SFX.
- Đa-item: một pop cho MỖI `appear_sec`. Đừng một pop cho cả cụm.
- Vì repo bạn dựng bằng `TIMING` (giây) — đặt `display.from` của audio clip = `TIMING.<beat>.start` (× fps nếu
  cần frame). Giữ SFX và TIMING là một nguồn: đổi beat → đổi SFX theo.

---

## 4. Mix (khi có voiceover)

- SFX tổng ngồi ở mức ~0.7 trên từng vol per-event. Voice là trung tâm — SFX không bao giờ spike qua giọng.
- Trong repo: chỉnh `volume` của audio track SFX (0–100) sao cho nghe được như dấu câu, không lấn giọng.

---

## 5. Nhạc bed (tùy chọn — tóm tắt triết lý)

Nếu thêm nhạc nền cho một edit có voiceover:

- **Một signature track**, không rotation ngẫu nhiên — một track nhất quán = bản sắc âm thanh của kênh. Rải
  ngẫu nhiên không phải branding.
- **Royalty-free, KHÔNG bài hát chart** — không vì tiền mà vì REACH: label bật Content ID geo-block, một
  Short bị block ở US/EU mất audience + đẩy thuật toán. Trending audio để ở picker in-app của nền tảng
  (post-upload), không bake vào file.
- **Cảm nhận được, không vô hình** — mix để có năng lượng trong khoảng nghỉ, duck dưới giọng, nâng ở climax.
  Quá nhỏ = "nhạc chán"; nhưng track corny ở bất kỳ mức nào vẫn corny. Test: mô tả bằng lời nghe corny
  ("inspirational tech build-up") → loại.
- **Duck dưới giọng** (sidechain) — nhạc lùi ~10dB khi có tiếng nói, đầy lại trong khoảng nghỉ. Trong repo,
  làm bằng cách hạ `volume` music track ở các đoạn có voiceover, hoặc để engine mix của bạn lo.
- **Arc:** nhạc swell vào payoff (rise ~6s, hold qua câu chốt, fall ~3s), không chạy phẳng.

---

## 6. Self-check SFX

- [ ] Mỗi SFX khớp đúng MỘT sự kiện visual, đúng frame, đúng nghĩa (whoosh/pop/tick/click/swell).
- [ ] Subtle; không swoosh >0.6s; không đuôi reverb.
- [ ] Đa-item: một pop mỗi `appear_sec`, không gộp.
- [ ] Closer không có sting.
- [ ] SFX không spike qua giọng; nhạc bed (nếu có) duck dưới voice.
