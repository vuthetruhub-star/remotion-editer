# Motion Describe — Mô Tả Motion Bằng Ngôn Ngữ Thường

> Dùng file này khi muốn AI build motion scene.
> Mô tả bằng tiếng Việt thường → AI dịch sang code beat-based đúng pattern.

---

## 🔴 LUẬT CỨNG — KHÔNG BỊA, PHẢI HỎI

Nếu user chưa cung cấp đủ thông tin, AI **phải hỏi trước khi viết bất kỳ dòng code nào**.

**Những thứ PHẢI hỏi nếu chưa biết:**
- TIMING: bao nhiêu beats, tên beats, start/duration từng beat
- Animation: mỗi element chuyển động như thế nào (fade/slide/scale/bounce)
- Màu sắc: màu nền, màu text, màu accent
- Size: card/icon/text lớn nhỏ như thế nào
- Spacing: khoảng cách giữa các element
- Text content: nội dung cụ thể, fields nào user chỉnh được

**Không được:**
- Tự đặt tên TIMING key → runtime crash nếu key không tồn tại trong motion-config.ts
- Tự bịa màu sắc, size, spacing khi không có reference và chưa hỏi user
- Copy TIMING từ file gốc user upload nếu file đó dùng cấu trúc khác

**Format hỏi đúng — hỏi một lần, đầy đủ:**
```
Trước khi code, cần xác nhận:
1. TIMING: [liệt kê những gì đã biết] — còn thiếu [X, Y, Z]?
2. Animation: [element] xuất hiện theo kiểu gì?
3. Màu sắc: nền gì, text gì, accent gì?
4. Size & spacing: card bao nhiêu %, khoảng cách giữa các element?
5. Fields chỉnh được: ngoài [đã biết], còn field nào không?
```

---

## 🚨 NGUỒN SỰ THẬT CHO SIZE, LAYOUT & STYLE

Khi build motion, AI **phải** theo thứ tự này:

```
1. Reference image/video user gửi  → DÙNG ĐÂY. Copy y hệt: màu, size, spacing, style.
2. Không có reference              → PHẢI HỎI user trước khi implement
3. File code user upload           → CHỈ đọc để hiểu logic/structure, KHÔNG copy pixel values
```

**Khi có reference:**
- Copy màu sắc chính xác từ reference — không áp D1A palette lên
- Ước tính size theo tỷ lệ % so với canvas 1080×1920
- Copy spacing, căn lề, bố cục từ reference
- Copy easing feel từ reference (snappy, mượt, bouncy...)

**File code user upload thường chứa:**
- Size viết cho web 360–400px → không dùng được cho canvas 1080px
- Logic animation → CÓ THỂ tham khảo
- Màu sắc, icon, text content → CÓ THỂ tham khảo

---

## Cách mô tả scene với AI

Không cần viết code. Chỉ cần nói:

1. **Xuất hiện gì** — chữ, số, icon, card, background
2. **Khi nào xuất hiện** — đầu video, sau X giây, sau element khác
3. **Chuyển động như thế nào** — fade in, slide lên, zoom từ xa, bounce
4. **Cảm giác như thế nào** — mạnh, nhẹ, cinematic, bouncy, snappy

---

## Từ mô tả → Code beat-based

| Bạn nói | AI build |
|---|---|
| "chữ xuất hiện mờ dần" | fade in với easing phù hợp |
| "slide lên từ dưới" | `translateY(X * (1 - progress))` |
| "zoom từ xa ra" | `translateZ(-800 * (1 - progress))` |
| "bounce vào" | easing out-back |
| "xuất hiện rồi biến mất" | progress in × progress out |
| "số đếm từ 0 lên N" | `Math.floor(progress * N)` |
| "nhiều thứ xuất hiện lần lượt" | stagger: delay theo index |
| "thở — lên xuống liên tục" | `Math.sin((f / fps) * speed) * amplitude` |
| "glow nhấp nháy 1 lần" | in × out trong window ngắn |
| "typewriter" | `text.slice(0, Math.ceil(progress * text.length))` |

> Easing cụ thể (cubic, spring, linear...) → lấy từ reference hoặc hỏi user

---

## Timing vocabulary

| Bạn nói | Giây |
|---|---|
| "ngay lập tức" | 0.1s |
| "nhanh" | 0.2–0.3s |
| "bình thường" | 0.4–0.5s |
| "chậm / cinematic" | 0.6–1.0s |
| "rất chậm" | 1.0–2.0s |

---

## Cấu trúc scene phổ biến

### Pattern A — 1 element đơn
```
"Chữ TITLE fade in, giữ 2 giây, fade out"
→ Beat1: opacity = progressIn * progressOut
```

### Pattern B — Stagger nhiều items
```
"5 card xuất hiện lần lượt, mỗi cái delay 0.2s"
→ items.map((_, i) => progress(f, start + i * 0.2, start + i * 0.2 + 0.4))
```

### Pattern C — Counter + visual
```
"Số đếm từ 0 lên 18,472 trong 1.4 giây"
→ count = Math.floor(progress * 18472)
```

### Pattern D — Reveal sequence
```
"Beat 1: Hook text → Beat 2: Stats → Beat 3: Finale"
→ 3 Beat components, mỗi cái guard bằng frame range
```

---

## Template mô tả gửi AI

Copy và điền vào:

```
Làm motion scene:
- Tổng thời lượng: [X giây]
- Reference: [gửi ảnh/video hoặc mô tả visual style]
- Beat 1 (0–Xs): [mô tả — chữ gì, chuyển động ra sao, feel như nào]
- Beat 2 (Xs–Ys): [mô tả]
- Màu chính: [màu cụ thể hoặc "lấy từ reference"]
- Font: [tên font hoặc "lấy từ reference"]
```

---

*Motion Describe v3.0 — Reference-first · No hardcode · Ask when unsure*
